import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { Email, Password, FirstName, LastName } = body;

    if (!Email || !Password || !FirstName || !LastName) {
      return NextResponse.json({ msg: "All fields are required" }, { status: 400 });
    }

    const existing = await User.findOne({ Email });
    if (existing) {
      return NextResponse.json({ msg: "User Already Exist" });
    }

    const hashedPassword = bcrypt.hashSync(Password, 10);
    const newUser = new User({
      Email,
      Password: hashedPassword,
      FirstName,
      LastName
    });

    const saved = await newUser.save();
    return NextResponse.json({ msg: "data Added", data: saved });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
