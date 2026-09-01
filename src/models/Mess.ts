import mongoose, { Schema, Document } from 'mongoose';

export interface IMess extends Document {
  name: string;
  initialMonth: string;
  passwordHash: string; // "Mess Password (for other to join)"
  managerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  memberSettings?: {
    userId: mongoose.Types.ObjectId;
    role: 'Permanent' | 'Guest';
    activePeriods: { startMonth: string; endMonth?: string }[];
  }[];
  cookName?: string;
  cookPhone?: string;
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
    memberSettings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['Permanent', 'Guest'], default: 'Permanent' },
        activePeriods: [
          {
            startMonth: { type: String, required: true },
            endMonth: { type: String }
          }
        ]
      }
    ],
    cookName: { type: String, default: "" },
    cookPhone: { type: String, default: "" },
  },
  { timestamps: true }
);

// Force reload in development
if (mongoose.models.Mess) {
  delete mongoose.models.Mess;
}

export default mongoose.model<IMess>('Mess', MessSchema);
