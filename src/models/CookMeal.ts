import mongoose, { Schema, Document } from 'mongoose';

export interface ICookMeal extends Document {
  messId: mongoose.Types.ObjectId;
  month: string;
  date: string; // YYYY-MM-DD
  afternoonCooked: boolean;
  nightCooked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CookMealSchema: Schema = new Schema(
  {
    messId: { type: Schema.Types.ObjectId, ref: 'Mess', required: true },
    month: { type: String, required: true },
    date: { type: String, required: true },
    afternoonCooked: { type: Boolean, default: true },
    nightCooked: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CookMealSchema.index({ messId: 1, date: 1 }, { unique: true });

export default mongoose.models.CookMeal || mongoose.model<ICookMeal>('CookMeal', CookMealSchema);
