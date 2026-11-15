require('./bn/node_modules/dotenv').config({ path: './bn/.env' });
const mongoose = require('./bn/node_modules/mongoose');
const bcrypt = require('./bn/node_modules/bcrypt');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/income_expense";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  const collection = mongoose.connection.collection('chartschemas');
  const user = await collection.findOne({ Email: 'jaygurjar3045@gmail.com' });
  const hashedPassword = bcrypt.hashSync('Jay4324', 10);

  if (!user) {
    await collection.insertOne({
      Email: 'jaygurjar3045@gmail.com',
      Password: hashedPassword,
      FirstName: 'Jay',
      LastName: 'Gurjar'
    });
    console.log("User jaygurjar3045@gmail.com created successfully with password Jay4324");
  } else {
    await collection.updateOne(
      { Email: 'jaygurjar3045@gmail.com' },
      { $set: { Password: hashedPassword } }
    );
    console.log("User jaygurjar3045@gmail.com password verified/updated to Jay4324");
  }

  // Also ensure some sample Income and Expense data exists for nice charts/overview screenshots!
  const incomeColl = mongoose.connection.collection('incomes');
  const expenseColl = mongoose.connection.collection('expenses');

  const incomesCount = await incomeColl.countDocuments();
  if (incomesCount === 0) {
    await incomeColl.insertMany([
      { arr: { Amount: "50000", Description: "Monthly Salary", Category: "Salary", Date: new Date().toLocaleDateString() } },
      { arr: { Amount: "15000", Description: "Freelance Project", Category: "Freelance", Date: new Date().toLocaleDateString() } },
      { arr: { Amount: "5000", Description: "Investment Dividends", Category: "Investment", Date: new Date().toLocaleDateString() } }
    ]);
    console.log("Sample incomes added");
  }

  const expensesCount = await expenseColl.countDocuments();
  if (expensesCount === 0) {
    await expenseColl.insertMany([
      { arr: { Amount: "12000", Description: "Apartment Rent", Category: "Housing", Date: new Date().toLocaleDateString() } },
      { arr: { Amount: "4500", Description: "Grocery Shopping", Category: "Groceries", Date: new Date().toLocaleDateString() } },
      { arr: { Amount: "2000", Description: "Internet & Utilities", Category: "Utilities", Date: new Date().toLocaleDateString() } },
      { arr: { Amount: "3500", Description: "Dining Out", Category: "Entertainment", Date: new Date().toLocaleDateString() } }
    ]);
    console.log("Sample expenses added");
  }

  await mongoose.disconnect();
  console.log("Database setup complete!");
}

main().catch(console.error);
