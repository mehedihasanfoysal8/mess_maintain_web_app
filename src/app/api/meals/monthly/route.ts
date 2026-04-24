import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import Meal from '@/models/Meal';
import User from '@/models/User';
import mongoose from 'mongoose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

// GET /api/meals/monthly?year=2026&month=4
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    const messObjectId = new mongoose.Types.ObjectId(mess._id.toString());

    // Build date range for the month: "2026-04-01" to "2026-04-30"
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const members = await User.find({ _id: { $in: mess.members } }).select('name _id');

    // Get all meals for this month
    const meals = await Meal.find({
      messId: messObjectId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Build grid: { [userId]: { [day]: total } }
    const grid: Record<string, Record<number, number>> = {};
    members.forEach((m: any) => {
      grid[m._id.toString()] = {};
    });

    meals.forEach((meal: any) => {
      const day = parseInt(meal.date.split('-')[2]);
      const uid = meal.userId.toString();
      if (!grid[uid]) grid[uid] = {};
      // Support old data: if breakfast/lunch/dinner all missing, fallback to mealCount
      const bld = (meal.breakfast || 0) + (meal.lunch || 0) + (meal.dinner || 0);
      grid[uid][day] = bld > 0 ? bld : (meal.mealCount || 0);
    });

    // Build daily totals (total mess meals per day)
    const dailyTotals: Record<number, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyTotals[d] = members.reduce((sum: number, m: any) => {
        return sum + (grid[m._id.toString()]?.[d] || 0);
      }, 0);
    }

    const overallTotal = Object.values(dailyTotals).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      members: members.map((m: any) => ({ _id: m._id.toString(), name: m.name })),
      grid,        // { userId: { day: totalMeals } }
      dailyTotals, // { day: totalMeals }
      daysInMonth,
      overallTotal,
      year,
      month,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
