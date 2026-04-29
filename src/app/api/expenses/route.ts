import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import Expense from '@/models/Expense';
import User from '@/models/User';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    const expenses = await Expense.find({ messId: mess._id }).populate('userId', 'name').sort({ date: -1 });

    const members = await User.find({ _id: { $in: mess.members } }).select('name _id');

    return NextResponse.json({ 
      expenses: expenses.map(e => ({
        _id: e._id,
        userName: (e.userId as any)?.name || 'Unknown',
        userId: (e.userId as any)?._id,
        type: e.type,
        amount: e.amount,
        date: e.date,
        description: e.description
      })),
      members: members,
      isManager: mess.managerId.toString() === userId
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    // Only manager can add expenses normally, but we'll check manager role
    if (mess.managerId.toString() !== userId) {
      return NextResponse.json({ error: 'Only manager can add expenses' }, { status: 403 });
    }

    const { targetUserId, type, amount, date, description } = await req.json();

    if (!targetUserId || !type || !amount || !date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const [y, m, d] = date.split('-');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const calculatedMonth = `${months[parseInt(m, 10) - 1]} ${y}`;

    const expense = await Expense.create({
      messId: mess._id,
      userId: targetUserId,
      type,
      amount: Number(amount),
      date,
      description,
      month: calculatedMonth
    });

    return NextResponse.json({ message: 'Expense added successfully', expense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
