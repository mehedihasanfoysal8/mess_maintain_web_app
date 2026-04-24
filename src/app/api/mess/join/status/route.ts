import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import JoinRequest from '@/models/JoinRequest';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

// GET - check if user has a pending join request
export async function GET(req: Request) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();

    // Check if user already belongs to a mess
    const existingMess = await Mess.findOne({ members: userId });
    if (existingMess) {
      return NextResponse.json({ status: 'member', messName: existingMess.name }, { status: 200 });
    }

    // Check for pending join request
    const pendingRequest = await JoinRequest.findOne({ userId, status: 'Pending' }).populate('messId', 'name');
    if (pendingRequest) {
      return NextResponse.json({ 
        status: 'pending', 
        messName: (pendingRequest.messId as any)?.name || 'Unknown Mess'
      }, { status: 200 });
    }

    // Check for rejected request
    const rejectedRequest = await JoinRequest.findOne({ userId, status: 'Rejected' }).populate('messId', 'name');
    if (rejectedRequest) {
      return NextResponse.json({ 
        status: 'rejected', 
        messName: (rejectedRequest.messId as any)?.name || 'Unknown Mess'
      }, { status: 200 });
    }

    return NextResponse.json({ status: 'none' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
