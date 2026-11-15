import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, required: true },
  Expense: { type: Array, default: [] }
});

export const Expense = mongoose.models.ExpenseSchema || mongoose.model("ExpenseSchema", ExpenseSchema);
export default Expense;
