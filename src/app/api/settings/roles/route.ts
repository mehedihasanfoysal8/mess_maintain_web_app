import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import mongoose from 'mongoose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

// POST /api/settings/roles — promote or demote a member
export async function POST(req: Request) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();

    // Only the current manager can change roles
    const mess = await Mess.findOne({ managerId: userId });
    if (!mess) return NextResponse.json({ error: 'Only manager can change roles' }, { status: 403 });

    const { targetUserId, action } = await req.json();
    // action: 'promote' | 'demote'

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);

    // Make sure target is actually a member of this mess
    const isMember = mess.members.some((m: any) => m.toString() === targetUserId);
    if (!isMember) {
      return NextResponse.json({ error: 'User is not a member of this mess' }, { status: 404 });
    }

    if (action === 'promote') {
      mess.managerId = targetObjectId;
    } else if (action === 'demote') {
      // Manager can only demote themselves — revert to first non-manager member
      // OR allow manager to demote another manager (if you want).
      // Here we just promote the target as manager (flexible):
      // To demote, we just set managerId back to the current user (self) — let's keep it simple:
      // Actually "demote" means remove manager role from another user who is manager.
      // In a single-manager system this doesn't make much sense unless we transfer.
      // Let's just re-assign manager to the requester (current user) as a "demote" of target.
      mess.managerId = new mongoose.Types.ObjectId(userId);
    }

    await mess.save();

    return NextResponse.json({ message: `Role updated successfully` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
