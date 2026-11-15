import mongoose from 'mongoose';

const IncomeSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, required: true },
  Income: { type: Array, default: [] }
});

export const Income = mongoose.models.IncomeSchema || mongoose.model("IncomeSchema", IncomeSchema);
export default Income;
