import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password, confirmPassword, phone, address } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      phone,
      address,
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
