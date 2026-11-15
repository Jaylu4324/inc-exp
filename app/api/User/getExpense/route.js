import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Expense from '@/lib/models/Expense';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ msg: "Jwt not verify" }, { status: 401 });
    }
    await connectDB();
    const data = await Expense.findOne({ UserID: authUser._id });
    return NextResponse.json({ data: data || { Expense: [] } });
  } catch (err) {
    console.error("getExpense error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
