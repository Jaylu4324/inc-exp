import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { Email, Password } = body;

    const user = await User.findOne({ Email });
    if (!user) {
      return NextResponse.json({ msg: "Register First" });
    }

    const isValid = bcrypt.compareSync(Password, user.Password);
    if (!isValid) {
      return NextResponse.json({ msg: "Enter Valid Password" });
    }

    const token = signToken(user);
    return NextResponse.json({ msg: "Login Success", token });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
