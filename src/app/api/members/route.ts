import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import User from '@/models/User';

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

    const members = await User.find({ _id: { $in: mess.members } }).select('name email phone _id');

    return NextResponse.json({ 
      members: members.map(m => {
        const uId = m._id.toString();
        const settings = mess.memberSettings?.find((s: any) => s.userId.toString() === uId);
        
        let isActive = true;
        let leftMonth = null;
        if (settings && settings.activePeriods && settings.activePeriods.length > 0) {
           const lastPeriod = settings.activePeriods[settings.activePeriods.length - 1];
           if (lastPeriod.endMonth) {
             isActive = false;
             leftMonth = lastPeriod.endMonth;
           }
        }

        return {
          _id: m._id,
          name: m.name,
          email: m.email,
          phone: m.phone || 'N/A',
          isManager: mess.managerId.toString() === uId,
          role: settings?.role || 'Permanent',
          isActive,
          leftMonth
        };
      }),
      isCurrentUserManager: mess.managerId.toString() === userId
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
