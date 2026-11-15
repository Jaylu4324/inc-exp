require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./Routes/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Model } = require("./Model/RegisterModel");
require("./dbconfig");

const app = express();

// Enable CORS for all origins and methods (including preflight)
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure the email transporter using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "oknothing156@gmail.com",
    pass: process.env.EMAIL_PASS || "Ok_Nothing@156",
  },
});

// Function to generate a secure random password
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

// Email template to send to the user
function generateEmailTemplate(password) {
  return `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 500px; margin: auto;">
          <h2 style="color: #2C3E50;">Your New Temporary Password</h2>
          <p style="font-size: 16px; color: #333;">Here is your randomly generated password:</p>
          <p style="font-size: 18px; font-weight: bold; color: #E74C3C;">${password}</p>
          <p style="font-size: 14px; color: #555;">Please change your password after logging in for security purposes.</p>
          <p style="font-size: 14px; color: #777;">Best Regards,<br>Your Company Team</p>
      </div>
  `;
}

// API endpoint to send random password and update the database
app.post("/send-random-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await Model.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const randomPassword = generateSecurePassword();
    const hashedPassword = bcrypt.hashSync(randomPassword, 10);

    user.Password = hashedPassword;
    await user.save();

    const emailContent = generateEmailTemplate(randomPassword);

    const mailOptions = {
      from: process.env.EMAIL_USER || "oknothing156@gmail.com",
      to: email,
      subject: "Your Temporary Password",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Random password sent to your email, and password updated in the database",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing request", error: error.message });
  }
});

app.use("/User", userRoutes);

// Root health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Income & Expense Management API is running", status: "OK" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
