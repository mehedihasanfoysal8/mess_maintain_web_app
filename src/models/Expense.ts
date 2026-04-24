import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  messId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // The member related to the expense (for deposits or individual cost)
  type: 'Deposit' | 'Bazar/Meal Cost' | 'Shared Cost' | 'Individual Cost';
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  month: string; // e.g. "April 2026"
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    messId: { type: Schema.Types.ObjectId, ref: 'Mess', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      required: true,
      enum: ['Deposit', 'Bazar/Meal Cost', 'Shared Cost', 'Individual Cost'],
    },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String },
    month: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
