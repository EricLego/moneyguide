import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Expense from '@/models/Expense';
import { authenticateUser, AuthRequest } from '@/utils/auth';

async function handler(req: AuthRequest, res: NextApiResponse) {
  await dbConnect();

  const {
    method,
    query: { id },
  } = req;

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ success: false, message: 'Invalid expense ID' });
  }

  const userId = req.user.id;

  switch (method) {
    case 'GET':
      try {
        const expense = await Expense.findOne({ _id: id, user: userId });
        if (!expense) {
          return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        return res.status(200).json({ success: true, data: expense });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Error fetching expense' });
      }

    case 'PUT':
      try {
        const { category, amount, currency, date, notes } = req.body;
        const expense = await Expense.findOneAndUpdate(
          { _id: id, user: userId },
          { category, amount, currency, date, notes },
          { new: true, runValidators: true }
        );
        if (!expense) {
          return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        return res.status(200).json({ success: true, data: expense });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Error updating expense' });
      }

    case 'DELETE':
      try {
        const expense = await Expense.findOneAndDelete({ _id: id, user: userId });
        if (!expense) {
          return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        return res.status(200).json({ success: true, message: 'Expense deleted' });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Error deleting expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

export default authenticateUser(handler);
