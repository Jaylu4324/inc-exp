import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Expense from '@/lib/models/Expense';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ msg: "Jwt not verify" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    await connectDB();
    const userExpense = await Expense.findOne({ UserID: authUser._id });
    if (userExpense) {
      const idx = userExpense.Expense.findIndex(e => String(e.id) === String(id));
      if (idx !== -1) {
        userExpense.Expense[idx] = { ...body.arr, id: Number(id) };
        userExpense.markModified('Expense');
        await userExpense.save();
        return NextResponse.json({ msg: "Data Update" });
      }
    }
    return NextResponse.json({ msg: "data not found" }, { status: 404 });
  } catch (err) {
    console.error("updateExpense error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
