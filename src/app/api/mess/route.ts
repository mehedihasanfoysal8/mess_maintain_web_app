import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const { name, initialMonth, password } = await req.json();

    if (!name || !initialMonth || !password) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    const existingMess = await Mess.findOne({ name });
    if (existingMess) {
      return NextResponse.json({ error: 'Mess name already taken' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newMess = await Mess.create({
      name,
      initialMonth,
      passwordHash,
      managerId: userId,
      members: [userId], // Manager is automatically a member
    });

    return NextResponse.json({ message: 'Mess created successfully', mess: newMess }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
