import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    
    // Find messes where user is a member
    const messes = await Mess.find({ members: userId }).lean();
    
    const formattedMesses = messes.map((m: any) => ({
      id: m._id,
      name: m.name,
      activeMonth: m.initialMonth, // In a real app this would be computed
      membersCount: m.members.length,
      role: m.managerId.toString() === userId ? 'Manager' : 'Member'
    }));

    return NextResponse.json({ messes: formattedMesses }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
