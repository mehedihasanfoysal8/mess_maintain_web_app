import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import JoinRequest from '@/models/JoinRequest';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ managerId: userId });
    if (!mess) return NextResponse.json({ error: 'Only manager can approve requests' }, { status: 403 });

    const { requestId, action } = await req.json(); // action: 'approve' | 'reject'

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const request = await JoinRequest.findById(requestId);
    if (!request || request.messId.toString() !== mess._id.toString()) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      request.status = 'Approved';
      // Add member to mess
      if (!mess.members.includes(request.userId)) {
        mess.members.push(request.userId);
        await mess.save();
      }
    } else {
      request.status = 'Rejected';
    }

    await request.save();

    return NextResponse.json({ message: `Request ${action}d successfully` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
