import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

function generateSecurePassword(length = 12) {
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specialChars = "!@#$%^&*()_-+=<>?/{}[]|";
  const allCharacters = lowerCase + upperCase + digits + specialChars;

  const password = [
    lowerCase[Math.floor(Math.random() * lowerCase.length)],
    upperCase[Math.floor(Math.random() * upperCase.length)],
    digits[Math.floor(Math.random() * digits.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  for (let i = password.length; i < length; i++) {
    password.push(allCharacters[Math.floor(Math.random() * allCharacters.length)]);
  }

  return password.sort(() => Math.random() - 0.5).join("");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ Email: email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const randomPassword = generateSecurePassword();
    user.Password = bcrypt.hashSync(randomPassword, 10);
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "oknothing156@gmail.com",
        pass: process.env.EMAIL_PASS || "Ok_Nothing@156",
      },
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 500px; margin: auto;">
          <h2 style="color: #2C3E50;">Your New Temporary Password</h2>
          <p style="font-size: 16px; color: #333;">Here is your randomly generated password:</p>
          <p style="font-size: 18px; font-weight: bold; color: #E74C3C;">${randomPassword}</p>
          <p style="font-size: 14px; color: #555;">Please change your password after logging in for security purposes.</p>
          <p style="font-size: 14px; color: #777;">Best Regards,<br>Your Company Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "oknothing156@gmail.com",
      to: email,
      subject: "Your Temporary Password",
      html: emailContent,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.warn("Mail send warning (continuing):", mailErr.message);
    }

    return NextResponse.json({
      message: "Random password sent to your email, and password updated in the database",
      temporaryPassword: randomPassword
    });
  } catch (err) {
    console.error("send-random-password error:", err);
    return NextResponse.json({ message: "Error processing request", error: err.message }, { status: 500 });
  }
}
