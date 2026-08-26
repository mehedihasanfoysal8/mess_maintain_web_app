import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Mess from '@/models/Mess';
import CookSetting from '@/models/CookSetting';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretjwtkey_for_mess_maintain_app');

// PUT /api/cook-tracker/settings
// Body: { month, salary, isPaid, notes, cookName, cookPhone }
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await dbConnect();
    const mess = await Mess.findOne({ members: userId });
    if (!mess) return NextResponse.json({ error: 'No mess found' }, { status: 404 });

    if (mess.managerId.toString() !== userId) {
      return NextResponse.json({ error: 'Only manager can update cook settings' }, { status: 403 });
    }

    const { month, salary, isPaid, notes, cookName, cookPhone } = await req.json();

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [mStr, yStr] = month.split(" ");
    const mIndex = monthsArr.indexOf(mStr);
    const monthDate = new Date(parseInt(yStr), mIndex, 1);

    // Update month-specific settings
    const updatePayload: any = { monthDate };
    if (salary !== undefined && salary !== "") updatePayload.salary = Number(salary);
    if (isPaid !== undefined) updatePayload.isPaid = Boolean(isPaid);
    if (notes !== undefined) updatePayload.notes = notes;

    await CookSetting.findOneAndUpdate(
      { messId: mess._id, month },
      { $set: updatePayload },
      { upsert: true, new: true }
    );

    // Update global mess profile if provided
    if (cookName !== undefined || cookPhone !== undefined) {
      if (cookName !== undefined) mess.cookName = cookName;
      if (cookPhone !== undefined) mess.cookPhone = cookPhone;
      await mess.save();
    }

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
