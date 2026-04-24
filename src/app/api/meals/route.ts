import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import Meal from '@/models/Meal';
import User from '@/models/User';
import mongoose from 'mongoose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

// GET /api/meals?date=YYYY-MM-DD  — daily entry data
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    const members = await User.find({ _id: { $in: mess.members } }).select('name _id');

    let meals: any[] = [];
    if (date) {
      meals = await Meal.find({ messId: mess._id, date });
    }

    return NextResponse.json({
      members,
      meals: meals.map(m => ({
        userId: m.userId.toString(),
        breakfast: m.breakfast || 0,
        lunch: m.lunch || 0,
        dinner: m.dinner || 0,
        mealCount: m.mealCount || 0,
      })),
      isManager: mess.managerId.toString() === userId
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/meals  — save daily entry
export async function POST(req: Request) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    if (mess.managerId.toString() !== userId) {
      return NextResponse.json({ error: 'Only manager can update meals' }, { status: 403 });
    }

    const { date, mealData } = await req.json();
    // mealData = [{ userId, mealCount }] or [{ userId, breakfast, lunch, dinner }]

    if (!date || !Array.isArray(mealData)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const messObjectId = new mongoose.Types.ObjectId(mess._id.toString());

    const bulkOps = mealData.map((md: any) => {
      // Support both formats
      const mealCount = md.mealCount != null
        ? Number(md.mealCount)
        : (Number(md.breakfast || 0) + Number(md.lunch || 0) + Number(md.dinner || 0));
      return {
        updateOne: {
          filter: { messId: messObjectId, userId: new mongoose.Types.ObjectId(md.userId), date },
          update: { $set: { mealCount, breakfast: md.breakfast || 0, lunch: md.lunch || 0, dinner: md.dinner || 0 } },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      await Meal.bulkWrite(bulkOps);
    }

    return NextResponse.json({ message: 'Meals saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
