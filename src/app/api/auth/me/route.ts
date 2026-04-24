import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || !payload.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
