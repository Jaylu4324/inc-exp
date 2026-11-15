import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ msg: "Jwt not verify" }, { status: 401 });
    }
    await connectDB();
    const user = await User.findById(authUser._id);
    if (user) {
      return NextResponse.json({ msg: "data finded", data: user });
    }
    return NextResponse.json({ msg: "data not found" }, { status: 404 });
  } catch (err) {
    console.error("findUser error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
