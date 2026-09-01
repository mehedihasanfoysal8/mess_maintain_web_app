import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import Expense from '@/models/Expense';
import User from '@/models/User';
import { isUserActiveInMonth } from '@/lib/messUtils';

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

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    const query: any = { messId: mess._id };
    if (month) {
      query.month = month;
    }

    const expenses = await Expense.find(query).populate('userId', 'name').sort({ updatedAt: -1 });

    let targetMonthStr = month;
    if (!targetMonthStr) {
      const now = new Date();
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      targetMonthStr = `${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    const activeMemberIds = mess.members.filter((uId: any) => {
      const settings = mess.memberSettings?.find((s: any) => s.userId.toString() === uId.toString());
      return isUserActiveInMonth(settings, targetMonthStr as string);
    });

    const members = await User.find({ _id: { $in: activeMemberIds } }).select('name _id');

    const membersWithRole = members.map(m => {
      const settings = mess.memberSettings?.find((s: any) => s.userId.toString() === m._id.toString());
      return {
        _id: m._id,
        name: m.name,
        role: settings?.role || 'Permanent'
      };
    });

    return NextResponse.json({ 
      expenses: expenses.map(e => {
        const uId = (e.userId as any)?._id?.toString();
        const settings = mess.memberSettings?.find((s: any) => s.userId.toString() === uId);
        return {
          _id: e._id,
          userName: (e.userId as any)?.name || 'Unknown',
          userId: uId,
          role: settings?.role || 'Permanent',
          type: e.type,
          amount: e.amount,
          date: e.date,
          description: e.description,
          updatedAt: e.updatedAt || e.createdAt
        };
      }),
      members: membersWithRole,
      isManager: mess.managerId.toString() === userId,
      currentUser: userId
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
    
    // date might come as DD/MM/YYYY or YYYY-MM-DD.
    // Let's standardise the parsing
    let y, m, d;
    if (date.includes('/')) {
      [d, m, y] = date.split('/');
    } else {
      [y, m, d] = date.split('-');
    }
    
    const standardDate = `${y}-${m}-${d}`;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const calculatedMonth = `${months[parseInt(m, 10) - 1]} ${y}`;

    const expense = await Expense.create({
      messId: mess._id,
      userId: targetUserId,
      type,
      amount: Number(amount),
      date: standardDate,
      description,
      month: calculatedMonth
    });

    return NextResponse.json({ message: 'Expense added successfully', expense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: 'Only manager can update expenses' }, { status: 403 });
    }

    const { id, targetUserId, type, amount, date, description } = await req.json();

    if (!id || !targetUserId || !type || !amount || !date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    let y, m, d;
    if (date.includes('/')) {
      [d, m, y] = date.split('/');
    } else {
      [y, m, d] = date.split('-');
    }
    const standardDate = `${y}-${m}-${d}`;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const calculatedMonth = `${months[parseInt(m, 10) - 1]} ${y}`;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, messId: mess._id },
      {
        userId: targetUserId,
        type,
        amount: Number(amount),
        date: standardDate,
        description,
        month: calculatedMonth
      },
      { new: true }
    );

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense updated successfully', expense }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    if (mess.managerId.toString() !== userId) {
      return NextResponse.json({ error: 'Only manager can delete expenses' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing expense ID' }, { status: 400 });
    }

    const expense = await Expense.findOneAndDelete({ _id: id, messId: mess._id });
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
