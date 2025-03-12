import mongoose, { Schema, Document } from 'mongoose';

export interface IIncome extends Document {
  user: mongoose.Types.ObjectId;
  source: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    source: {
      type: String,
      required: [true, 'Income source is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create compound index for user and date for faster queries
IncomeSchema.index({ user: 1, date: -1 });

export default mongoose.models.Income || mongoose.model<IIncome>('Income', IncomeSchema);