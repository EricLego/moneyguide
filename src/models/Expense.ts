import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  user: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  currency: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExpenseModel extends Model<IExpense> {}

const ExpenseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
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
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ user: 1, date: -1 });

function getModel(): ExpenseModel {
  return (mongoose.models.Expense || mongoose.model<IExpense, ExpenseModel>('Expense', ExpenseSchema)) as ExpenseModel;
}

export default getModel();
