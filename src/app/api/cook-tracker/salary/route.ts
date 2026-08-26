import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import CookSetting from '@/models/CookSetting';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

// PUT /api/cook-tracker/salary
// Body: { month, salary }
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
      return NextResponse.json({ error: 'Only manager can update cook salary' }, { status: 403 });
    }

    const { month, salary } = await req.json();

    if (!month || salary === undefined) {
      return NextResponse.json({ error: 'Month and salary are required' }, { status: 400 });
    }

    await CookSetting.findOneAndUpdate(
      { messId: mess._id, month },
      { salary: Number(salary) },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Salary updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
