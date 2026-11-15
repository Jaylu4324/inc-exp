import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Income from '@/lib/models/Income';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ msg: "Jwt not verify" }, { status: 401 });
    }
    await connectDB();
    const data = await Income.findOne({ UserID: authUser._id });
    return NextResponse.json({ data: data || { Income: [] } });
  } catch (err) {
    console.error("getIncome error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
