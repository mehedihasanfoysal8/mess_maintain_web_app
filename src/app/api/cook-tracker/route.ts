import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import CookSetting from '@/models/CookSetting';
import CookMeal from '@/models/CookMeal';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

// GET /api/cook-tracker?month=August 2026
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    const isManager = mess.managerId.toString() === userId;

    let cookSetting = await CookSetting.findOne({ messId: mess._id, month });
    
    let salary = 0; // Empty/0 by default if first time
    let isPaid = false;
    let notes = "";

    if (cookSetting) {
      salary = cookSetting.salary;
      isPaid = cookSetting.isPaid || false;
      notes = cookSetting.notes || "";
    } else {
      // If no setting for this month, look for the most recent past salary
      const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const [mStr, yStr] = month.split(" ");
      const mIndex = monthsArr.indexOf(mStr);
      const parsedDate = new Date(parseInt(yStr), mIndex, 1);

      const prevSetting = await CookSetting.findOne({ 
        messId: mess._id, 
        monthDate: { $lte: parsedDate } 
      }).sort({ monthDate: -1 });

      if (prevSetting && prevSetting.salary) {
        salary = prevSetting.salary;
      }
    }

    const meals = await CookMeal.find({ messId: mess._id, month });

    return NextResponse.json({
      isManager,
      cookName: mess.cookName || "",
      cookPhone: mess.cookPhone || "",
      salary: salary,
      isPaid: isPaid,
      notes: notes,
      meals: meals.map(m => ({
        date: m.date,
        afternoonCooked: m.afternoonCooked,
        nightCooked: m.nightCooked,
      })),
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/cook-tracker
// Body: { month, date, afternoonCooked, nightCooked }
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    if (mess.managerId.toString() !== userId) {
      return NextResponse.json({ error: 'Only manager can update cook tracker' }, { status: 403 });
    }

    const { month, date, afternoonCooked, nightCooked } = await req.json();

    if (!month || !date) {
      return NextResponse.json({ error: 'Month and date are required' }, { status: 400 });
    }

    await CookMeal.findOneAndUpdate(
      { messId: mess._id, month, date },
      { afternoonCooked, nightCooked },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Meal updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
