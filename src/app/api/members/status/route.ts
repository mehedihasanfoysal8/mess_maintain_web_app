import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import mongoose from 'mongoose';
import Meal from '@/models/Meal';
import Expense from '@/models/Expense';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const adminId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ managerId: adminId });
    if (!mess) return NextResponse.json({ error: 'Only managers can perform this action' }, { status: 403 });

    const { targetUserId, action, month, role } = await req.json();

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Missing target user ID or action' }, { status: 400 });
    }
    
    if (action === 'permanent_delete') {
      // Remove from members array
      mess.members = mess.members.filter((id: any) => id.toString() !== targetUserId);
      
      // Remove from memberSettings
      if (mess.memberSettings) {
        mess.memberSettings = mess.memberSettings.filter((s: any) => s.userId.toString() !== targetUserId);
      }
      
      // Delete all meals and expenses for this user in this mess
      await Meal.deleteMany({ messId: mess._id, userId: targetUserId });
      await Expense.deleteMany({ messId: mess._id, userId: targetUserId });
      
      mess.markModified('members');
      mess.markModified('memberSettings');
      await mess.save();
      
      return NextResponse.json({ message: 'Member permanently deleted' }, { status: 200 });
    }

    // Ensure memberSettings exists
    if (!mess.memberSettings) {
      mess.memberSettings = [];
    }

    let settingsIndex = mess.memberSettings.findIndex((s: any) => s.userId.toString() === targetUserId);
    
    // If not found, initialize based on initialMonth
    if (settingsIndex === -1) {
      mess.memberSettings.push({
        userId: new mongoose.Types.ObjectId(targetUserId),
        role: 'Permanent',
        activePeriods: [{ startMonth: mess.initialMonth }]
      });
      settingsIndex = mess.memberSettings.length - 1;
    }

    const settings = mess.memberSettings[settingsIndex];

    if (action === 'remove') {
      if (!month) return NextResponse.json({ error: 'Month is required to remove a member' }, { status: 400 });
      // Set endMonth on the last active period
      if (settings.activePeriods.length > 0) {
        settings.activePeriods[settings.activePeriods.length - 1].endMonth = month;
      } else {
        settings.activePeriods.push({ startMonth: mess.initialMonth, endMonth: month });
      }
    } else if (action === 'reactivate') {
      if (!month) return NextResponse.json({ error: 'Month is required to reactivate a member' }, { status: 400 });
      // Add a new active period starting from the given month
      settings.activePeriods.push({ startMonth: month });
    } else if (action === 'change_role') {
      if (!role) return NextResponse.json({ error: 'Role is required' }, { status: 400 });
      settings.role = role;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Force replacement of the array to guarantee mongoose detection
    mess.memberSettings = [...mess.memberSettings];
    mess.markModified('memberSettings');
    await mess.save();

    return NextResponse.json({ message: 'Member updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
