import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ msg: "Jwt not verify" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const updateData = {};
    if (body.FirstName) updateData.FirstName = body.FirstName;
    if (body.LastName) updateData.LastName = body.LastName;

    await User.findByIdAndUpdate(authUser._id, { $set: updateData });
    return NextResponse.json({ msg: "user upadeted success" });
  } catch (err) {
    console.error("updateUser error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
