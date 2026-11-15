import mongoose from 'mongoose';

const chartSchema = new mongoose.Schema({
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true }
});

export const User = mongoose.models.chartSchema || mongoose.model("chartSchema", chartSchema);
export default User;
