import mongoose, { Schema, Document } from 'mongoose';

export interface IMess extends Document {
  name: string;
  initialMonth: string;
  passwordHash: string; // "Mess Password (for other to join)"
  managerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    initialMonth: { type: String, required: true },
    passwordHash: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.models.Mess || mongoose.model<IMess>('Mess', MessSchema);
