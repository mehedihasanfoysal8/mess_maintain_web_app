import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import Meal from '@/models/Meal';
import Expense from '@/models/Expense';
import User from '@/models/User';
import mongoose from 'mongoose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    
    const mess = await Mess.findOne({ members: userId }).lean();
    if (!mess) {
      return NextResponse.json({ error: 'No mess found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const requestedMonth = searchParams.get('month');
    const activeMonth = (requestedMonth || mess.initialMonth || "").trim(); 
    
    const messObjectId = new mongoose.Types.ObjectId(mess._id.toString());
    
    // Month prefix parsing for dates
    let monthPrefix = "";
    try {
      const parts = activeMonth.split(/\s+/);
      if (parts.length >= 2) {
        const monthName = parts[0];
        const yearName = parts[1];
        const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthNum = monthsArr.findIndex(m => m.toLowerCase() === monthName.toLowerCase()) + 1;
        if (monthNum > 0) {
          monthPrefix = `${yearName}-${monthNum.toString().padStart(2, '0')}`;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Fetch members
    const members = await User.find({ _id: { $in: mess.members } }).select('name _id').lean();

    // Fetch all meals for this month
    const meals = await Meal.find({
      messId: messObjectId,
      $or: [
        { month: activeMonth },
        ...(monthPrefix ? [{ date: { $regex: new RegExp(`^${monthPrefix}`) } }] : [])
      ]
    }).lean();

    // Fetch all expenses for this month
    const expenses = await Expense.find({
      messId: messObjectId,
      month: activeMonth
    }).populate('userId', 'name').lean();

    // Calculate Summary
    let totalDeposits = 0;
    let messMealCost = 0;
    let totalSharedCost = 0;
    let messIndividualCost = 0;

    const expensesByType = {
      'Deposit': [] as any[],
      'Bazar/Meal Cost': [] as any[],
      'Shared Cost': [] as any[],
      'Individual Cost': [] as any[]
    };

    expenses.forEach((exp: any) => {
      const userName = exp.userId?.name || 'Unknown';
      const formattedExp = {
        name: userName,
        date: exp.date,
        amount: exp.amount,
        remarks: exp.description || ''
      };
      
      if (exp.type === 'Deposit') {
        totalDeposits += exp.amount;
        expensesByType['Deposit'].push(formattedExp);
      } else if (exp.type === 'Bazar/Meal Cost') {
        messMealCost += exp.amount;
        expensesByType['Bazar/Meal Cost'].push(formattedExp);
      } else if (exp.type === 'Shared Cost') {
        totalSharedCost += exp.amount;
        expensesByType['Shared Cost'].push(formattedExp);
      } else if (exp.type === 'Individual Cost') {
        messIndividualCost += exp.amount;
        expensesByType['Individual Cost'].push(formattedExp);
      }
    });

    // Sort expenses by date (latest first)
    Object.keys(expensesByType).forEach(key => {
      expensesByType[key as keyof typeof expensesByType].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    let totalMeals = 0;
    const memberStats: Record<string, any> = {};

    members.forEach(m => {
      memberStats[m._id.toString()] = {
        name: m.name,
        meals: 0,
        deposit: 0,
        individualCost: 0,
        sharedCost: 0,
        mealCost: 0,
        balance: 0,
        dailyMeals: {} // key: day number, value: count
      };
    });

    meals.forEach(m => {
      const uId = m.userId.toString();
      if (memberStats[uId]) {
        const mealCount = Math.max(
          (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0),
          m.mealCount || 0
        );
        memberStats[uId].meals += mealCount;
        totalMeals += mealCount;
        
        // Extract day from YYYY-MM-DD
        const dayMatch = m.date.match(/-(\d{2})$/);
        if (dayMatch) {
          const dayNum = parseInt(dayMatch[1], 10);
          memberStats[uId].dailyMeals[dayNum] = mealCount;
        }
      }
    });

    const mealRate = totalMeals > 0 ? (messMealCost / totalMeals) : 0;
    const totalMembers = members.length;
    const sharedCostPerPerson = totalMembers > 0 ? (totalSharedCost / totalMembers) : 0;

    expenses.forEach((exp: any) => {
      const uId = exp.userId?._id?.toString() || exp.userId?.toString();
      if (memberStats[uId]) {
        if (exp.type === 'Deposit') {
          memberStats[uId].deposit += exp.amount;
        } else if (exp.type === 'Individual Cost') {
          memberStats[uId].individualCost += exp.amount;
        }
      }
    });

    const memberSummaries = Object.values(memberStats).map(stat => {
      stat.sharedCost = sharedCostPerPerson;
      stat.mealCost = stat.meals * mealRate;
      const totalCost = stat.mealCost + stat.sharedCost + stat.individualCost;
      stat.balance = stat.deposit - totalCost;
      return stat;
    });

    const totalAllCost = messMealCost + totalSharedCost + messIndividualCost;

    return NextResponse.json({
      mess: {
        name: mess.name,
        activeMonth,
      },
      summary: {
        totalMealCost: messMealCost,
        totalDeposit: totalDeposits,
        totalCost: totalAllCost,
        totalMeal: totalMeals,
        totalIndividualCost: messIndividualCost,
        totalSharedCost: totalSharedCost,
        totalMealRate: Number(mealRate.toFixed(2)),
        currentBalance: totalDeposits - totalAllCost,
      },
      memberSummaries,
      expensesByType
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
