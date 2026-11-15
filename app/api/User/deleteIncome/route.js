import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Income from '@/lib/models/Income';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ msg: "Jwt not verify" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await connectDB();
    const userIncome = await Income.findOne({ UserID: authUser._id });
    if (userIncome) {
      const idx = userIncome.Income.findIndex(e => String(e.id) === String(id));
      if (idx !== -1) {
        userIncome.Income.splice(idx, 1);
        for (let i = idx; i < userIncome.Income.length; i++) {
          userIncome.Income[i].id -= 1;
        }
        userIncome.markModified('Income');
        await userIncome.save();
        return NextResponse.json({ msg: "data Deleted" });
      }
    }
    return NextResponse.json({ msg: "data not found" }, { status: 404 });
  } catch (err) {
    console.error("deleteIncome error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
