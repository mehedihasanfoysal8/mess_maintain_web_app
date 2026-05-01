import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import Meal from '@/models/Meal';
import Expense from '@/models/Expense';
import mongoose from 'mongoose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    
    // Find active mess for user
    const mess = await Mess.findOne({ members: userId }).lean();
    if (!mess) {
      return NextResponse.json({ mess: null }, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const requestedMonth = searchParams.get('month'); // e.g. "April 2026"
    const activeMonth = (requestedMonth || mess.initialMonth || "").trim(); 
    
    // Convert IDs to ObjectId for proper aggregation matching
    const messObjectId = new mongoose.Types.ObjectId(mess._id.toString());
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Robust month prefix calculation
    let monthPrefix = "";
    try {
      const parts = activeMonth.split(/\s+/);
      if (parts.length >= 2) {
        // Handle "April 2026"
        const monthName = parts[0];
        const yearName = parts[1];
        const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthNum = monthsArr.findIndex(m => m.toLowerCase() === monthName.toLowerCase()) + 1;
        if (monthNum > 0) {
          monthPrefix = `${yearName}-${monthNum.toString().padStart(2, '0')}`;
        }
      } else if (activeMonth.includes('/')) {
        // Handle "21/8/2006" fallback
        const dateParts = activeMonth.split('/');
        if (dateParts.length === 3) {
          // Assuming DD/MM/YYYY
          monthPrefix = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}`;
        }
      }
    } catch (e) {
      console.error("Month parsing error:", e);
    }

    // =============================================
    // PERSONAL STATS - filtered by userId AND month
    // =============================================
    const userDeposits = await Expense.aggregate([
      { 
        $match: { 
          messId: messObjectId, 
          userId: userObjectId, 
          type: 'Deposit',
          month: activeMonth
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const myDeposit = userDeposits.length > 0 ? userDeposits[0].total : 0;

    const mealSumExpression = {
      $sum: {
        $max: [
          { $add: [{ $ifNull: ["$breakfast", 0] }, { $ifNull: ["$lunch", 0] }, { $ifNull: ["$dinner", 0] }] },
          { $ifNull: ["$mealCount", 0] }
        ]
      }
    };

    const userMeals = await Meal.aggregate([
      { 
        $match: { 
          messId: messObjectId, 
          userId: userObjectId,
          $or: [
            { month: activeMonth },
            ...(monthPrefix ? [{ date: { $regex: new RegExp(`^${monthPrefix}`) } }] : [])
          ]
        } 
      },
      { $group: { _id: null, total: mealSumExpression } }
    ]);
    const myMeals = userMeals.length > 0 ? userMeals[0].total : 0;

    // =============================================
    // MESS SUMMARY - filtered by month
    // =============================================
    const messMeals = await Meal.aggregate([
      { 
        $match: { 
          messId: messObjectId,
          $or: [
            { month: activeMonth },
            ...(monthPrefix ? [{ date: { $regex: new RegExp(`^${monthPrefix}`) } }] : [])
          ]
        } 
      },
      { $group: { _id: null, total: mealSumExpression } }
    ]);
    const totalMeals = messMeals.length > 0 ? messMeals[0].total : 0;

    const expensesSummary = await Expense.aggregate([
      { $match: { messId: messObjectId, month: activeMonth } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    let totalDeposits = 0;
    let messMealCost = 0;
    let totalSharedCost = 0;
    let messIndividualCost = 0;

    expensesSummary.forEach((item) => {
      if (item._id === 'Deposit') totalDeposits += item.total;
      if (item._id === 'Bazar/Meal Cost') messMealCost += item.total;
      if (item._id === 'Shared Cost') totalSharedCost += item.total;
      if (item._id === 'Individual Cost') messIndividualCost += item.total;
    });

    const mealRate = totalMeals > 0 ? (messMealCost / totalMeals) : 0;
    const totalMembers = mess.members.length;
    const sharedCostPerPerson = totalMembers > 0 ? (totalSharedCost / totalMembers) : 0;

    // My personal individual cost for this month
    const myIndivCostAgg = await Expense.aggregate([
      { 
        $match: { 
          messId: messObjectId, 
          userId: userObjectId, 
          type: 'Individual Cost',
          month: activeMonth
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const myIndividualCost = myIndivCostAgg.length > 0 ? myIndivCostAgg[0].total : 0;

    const myMealCost = myMeals * mealRate;
    const myTotalCost = myMealCost + sharedCostPerPerson + myIndividualCost;
    const myBalance = myDeposit - myTotalCost;

    const totalAllCost = messMealCost + totalSharedCost + messIndividualCost;
    const messBalance = totalDeposits - totalAllCost;

    return NextResponse.json({
      mess: {
        id: mess._id,
        name: mess.name,
        activeMonth,
        role: mess.managerId.toString() === userId ? 'Manager' : 'Member',
        membersCount: totalMembers
      },
      personal: {
        myDeposit,
        myMeals,
        mealRate: Number(mealRate.toFixed(2)),
        balance: Number(myBalance.toFixed(2)),
        individualCost: Number(myIndividualCost.toFixed(2))
      },
      summary: {
        totalMeals,
        totalDeposits,
        messMealCost,
        totalSharedCost,
        messIndividualCost,
        totalAllCost,
        messBalance: Number(messBalance.toFixed(2)),
        totalMembers
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
