import mongoose, { Schema, Document } from 'mongoose';

export interface IMeal extends Document {
  messId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  breakfast: number;
  lunch: number;
  dinner: number;
  mealCount: number; // total = breakfast + lunch + dinner
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema: Schema = new Schema(
  {
    messId: { type: Schema.Types.ObjectId, ref: 'Mess', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    breakfast: { type: Number, default: 0 },
    lunch: { type: Number, default: 0 },
    dinner: { type: Number, default: 0 },
    mealCount: { type: Number, default: 0 }, // auto-computed total
  },
  { timestamps: true }
);

MealSchema.index({ messId: 1, userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Meal || mongoose.model<IMeal>('Meal', MealSchema);
