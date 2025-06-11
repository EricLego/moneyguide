import { NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Expense from '@/models/Expense';
import { authenticateUser, AuthRequest } from '@/utils/auth';
import { startOfMonth, subMonths, format } from 'date-fns';

async function handler(req: AuthRequest, res: NextApiResponse) {
  // Return static demo data without DB access
  if (req.user?.id === 'demo-user') {
    const demoMonthlyStats = [
      { month: 'Aug 2023', total: 400.12 },
      { month: 'Sep 2023', total: 450.5 },
      { month: 'Oct 2023', total: 475.9 },
      { month: 'Nov 2023', total: 500.0 },
      { month: 'Dec 2023', total: 520.3 },
      { month: 'Jan 2024', total: 540.75 },
    ];

    return res.status(200).json({
      success: true,
      data: {
        totalMonthlyExpense: 540.75,
        monthlyStats: demoMonthlyStats,
      },
    });
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
        const now = new Date();
        const sixMonthsAgo = subMonths(now, 5);
        const startDate = startOfMonth(sixMonthsAgo);

        const expenses = await Expense.find({
          user: userId,
          date: { $gte: startDate, $lte: now }
        });

        const monthlyData: Record<string, { month: string, total: number }> = {};
        for (let i = 0; i < 6; i++) {
          const monthDate = subMonths(now, i);
          const key = format(monthDate, 'yyyy-MM');
          const label = format(monthDate, 'MMM yyyy');
          monthlyData[key] = { month: label, total: 0 };
        }

        expenses.forEach(exp => {
          const key = format(new Date(exp.date), 'yyyy-MM');
          if (monthlyData[key]) {
            monthlyData[key].total += exp.amount;
          }
        });

        const monthlyStats = Object.values(monthlyData).reverse();
        const totalMonthlyExpense = Object.values(monthlyData)[0]?.total || 0;

        return res.status(200).json({ success: true, data: { totalMonthlyExpense, monthlyStats } });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Error fetching expense stats' });
      }

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

export default authenticateUser(handler);
