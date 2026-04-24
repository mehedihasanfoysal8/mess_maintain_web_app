import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import JoinRequest from '@/models/JoinRequest';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json({ error: 'Please provide mess name and password' }, { status: 400 });
    }

    const mess = await Mess.findOne({ name });
    if (!mess) {
      return NextResponse.json({ error: 'Mess not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, mess.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid mess password' }, { status: 400 });
    }

    // Check if already a member
    if (mess.members.includes(userId)) {
      return NextResponse.json({ error: 'You are already a member of this mess' }, { status: 400 });
    }

    // Check if there's already a pending request
    const existingRequest = await JoinRequest.findOne({ messId: mess._id, userId, status: 'Pending' });
    if (existingRequest) {
      return NextResponse.json({ error: 'Join request is already pending approval by manager' }, { status: 400 });
    }

    await JoinRequest.create({
      messId: mess._id,
      userId,
      status: 'Pending',
    });

    return NextResponse.json({ message: 'Join request sent successfully to manager' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
