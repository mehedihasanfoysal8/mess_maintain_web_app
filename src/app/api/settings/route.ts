import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import User from '@/models/User';
import JoinRequest from '@/models/JoinRequest';
import bcrypt from 'bcryptjs';

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

    const isManager = mess.managerId.toString() === userId;

    const members = await User.find({ _id: { $in: mess.members } }).select('name email _id');
    
    let joinRequests = [];
    if (isManager) {
      joinRequests = await JoinRequest.find({ messId: mess._id, status: 'Pending' })
        .populate('userId', 'name email');
    }

    return NextResponse.json({ 
      mess: {
        id: mess._id,
        name: mess.name,
        activeMonth: mess.initialMonth
      },
      members: members.map(m => ({
        _id: m._id,
        name: m.name,
        email: m.email,
        isManager: mess.managerId.toString() === m._id.toString(),
        isCurrentUser: m._id.toString() === userId
      })),
      joinRequests: joinRequests.map(r => ({
        _id: r._id,
        userName: (r.userId as any)?.name,
        userEmail: (r.userId as any)?.email,
        userId: (r.userId as any)?._id,
        createdAt: r.createdAt
      })),
      isManager
    }, { status: 200 });

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
    const mess = await Mess.findOne({ managerId: userId });
    if (!mess) return NextResponse.json({ error: 'Only manager can update settings' }, { status: 403 });

    const { name, activeMonth, password } = await req.json();

    if (name) mess.name = name;
    if (activeMonth) mess.initialMonth = activeMonth;
    if (password) {
      mess.passwordHash = await bcrypt.hash(password, 10);
    }

    await mess.save();

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
