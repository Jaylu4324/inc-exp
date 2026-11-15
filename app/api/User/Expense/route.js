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
    await connectDB();
    const body = await req.json();
    const { arr } = body;
    const UserID = authUser._id;

    let userExpense = await Expense.findOne({ UserID });
    if (userExpense) {
      const newId = (userExpense.Expense.length || 0) + 1;
      userExpense.Expense.push({ ...arr, id: newId });
      userExpense.markModified('Expense');
      const saved = await userExpense.save();
      return NextResponse.json({ msg: "obj Added success", data: saved });
    } else {
      const newExp = new Expense({
        UserID,
        Expense: [{ ...arr, id: 1 }]
      });
      const saved = await newExp.save();
      return NextResponse.json({ msg: "Expense Added", data: saved });
    }
  } catch (err) {
    console.error("Expense error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
