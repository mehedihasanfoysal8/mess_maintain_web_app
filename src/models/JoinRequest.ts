import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinRequest extends Document {
  messId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const JoinRequestSchema: Schema = new Schema(
  {
    messId: { type: Schema.Types.ObjectId, ref: 'Mess', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.models.JoinRequest || mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);
