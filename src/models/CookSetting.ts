import mongoose, { Schema, Document } from 'mongoose';

export interface ICookSetting extends Document {
  messId: mongoose.Types.ObjectId;
  month: string;
  monthDate: Date;
  salary: number;
  isPaid: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const CookSettingSchema: Schema = new Schema(
  {
    messId: { type: Schema.Types.ObjectId, ref: 'Mess', required: true },
    month: { type: String, required: true },
    monthDate: { type: Date, required: true },
    salary: { type: Number, default: 2500 },
    isPaid: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

CookSettingSchema.index({ messId: 1, month: 1 }, { unique: true });

export default mongoose.models.CookSetting || mongoose.model<ICookSetting>('CookSetting', CookSettingSchema);
