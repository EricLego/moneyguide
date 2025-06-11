import { NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Expense from '@/models/Expense';
import { authenticateUser, AuthRequest } from '@/utils/auth';

async function handler(req: AuthRequest, res: NextApiResponse) {
  // Return static data for demo user without DB access
  if (req.user?.id === 'demo-user') {
    const demoExpenses = [
      { _id: 'e1', category: 'Groceries', amount: 120.45, currency: 'USD', date: new Date().toISOString(), notes: '' },
      { _id: 'e2', category: 'Utilities', amount: 80.0, currency: 'USD', date: new Date().toISOString(), notes: '' },
      { _id: 'e3', category: 'Entertainment', amount: 60.5, currency: 'USD', date: new Date().toISOString(), notes: '' },
    ];

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: demoExpenses });
    }

    // Pretend write success for POST
    if (req.method === 'POST') {
      const newExpense = { _id: `demo-${Date.now()}`, ...req.body };
      return res.status(201).json({ success: true, data: newExpense });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  await dbConnect();

  const { method } = req;

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const userId = req.user.id;

  switch (method) {
    case 'GET':
      try {
        const expenses = await Expense.find({ user: userId }).sort({ date: -1 }).limit(100);
        return res.status(200).json({ success: true, data: expenses });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Error fetching expenses' });
      }

    case 'POST':
      try {
        const { category, amount, currency, date, notes } = req.body;
        if (!category || amount === undefined) {
          return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const expense = await Expense.create({
          user: userId,
          category,
          amount,
          currency: currency || 'USD',
          date: date || new Date(),
          notes,
        });
        return res.status(201).json({ success: true, data: expense });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Error creating expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

export default authenticateUser(handler);
