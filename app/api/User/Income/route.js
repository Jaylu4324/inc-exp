import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Income from '@/lib/models/Income';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ msg: "Jwt not verify" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const { arr } = body;
    const UserID = authUser._id;

    let userIncome = await Income.findOne({ UserID });
    if (userIncome) {
      const newId = (userIncome.Income.length || 0) + 1;
      userIncome.Income.push({ ...arr, id: newId });
      userIncome.markModified('Income');
      const saved = await userIncome.save();
      return NextResponse.json({ msg: "obj Added success", data: saved });
    } else {
      const newIncome = new Income({
        UserID,
        Income: [{ ...arr, id: 1 }]
      });
      const saved = await newIncome.save();
      return NextResponse.json({ msg: "Income Added", data: saved });
    }
  } catch (err) {
    console.error("Income error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
