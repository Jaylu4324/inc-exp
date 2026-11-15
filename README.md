# Smart Income & Expense Management System (Next.js Full-Stack)

A modern, full-stack personal finance application built with **Next.js 14 (App Router)**, **Material UI (MUI v6)**, **MongoDB (Mongoose)**, and **Recharts**.

---

## 🚀 Features

- **Authentication & Security**: Secure User Registration and Login with JWT and bcrypt password hashing.
- **Financial Dashboard**: Real-time KPI summary cards (Total Income, Total Expense, Net Balance) with category charts.
- **Income & Expense Tracking**: Full CRUD (Add, Edit, Delete, Real-time Search Filter).
- **Analytics & Profit/Loss**: Dynamic period filtering (Day, Month, Year) with responsive Bar charts.
- **Data Export**: Export your financial statements directly to Microsoft Excel (`.xlsx`).
- **Profile Management**: View and modify user profile information.
- **Responsive Design**: Optimized across Mobile, Tablet, and Desktop screens.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router & API Routes)
- **Frontend**: React 18, Material UI (MUI v6), Recharts, Emotion
- **Backend & Database**: Next.js Serverless Route Handlers, MongoDB, Mongoose
- **Security & Utils**: JSON Web Tokens (JWT), bcryptjs, Dayjs, XLSX

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (or configure them in Vercel):

```env
# Database Connection (MongoDB Atlas for Production / Vercel)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/income_expense?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=supersecret_jwt_key_12345

# Nodemailer / Email Service (Optional: for password recovery)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run Next.js development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository (`inc-exp`).
4. In the **Environment Variables** section, add:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Any secure random secret string
   - `EMAIL_USER`: (Optional) Gmail address
   - `EMAIL_PASS`: (Optional) Gmail app password
5. Click **Deploy**. Vercel will automatically build and deploy both the Next.js frontend and serverless API route handlers!
