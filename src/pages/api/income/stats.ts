import { NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Income from '@/models/Income';
import { authenticateUser, AuthRequest } from '@/utils/auth';
import { startOfMonth, subMonths, format, endOfMonth } from 'date-fns';

async function handler(req: AuthRequest, res: NextApiResponse) {
  await dbConnect();
  
  const { method } = req;

  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const userId = req.user.id;

  switch (method) {
    case 'GET':
      try {
        // Get monthly totals for the last 6 months
        const now = new Date();
        const sixMonthsAgo = subMonths(now, 5); // For 6 months including current
        const startDate = startOfMonth(sixMonthsAgo);
        
        // Find all income records within date range
        const incomes = await Income.find({
          user: userId,
          date: { $gte: startDate, $lte: now }
        });
        
        // Group by month and calculate totals
        const monthlyData: Record<string, { month: string, total: number }> = {};
        
        // Initialize with all 6 months (with zero values)
        for (let i = 0; i < 6; i++) {
          const monthDate = subMonths(now, i);
          const monthKey = format(monthDate, 'yyyy-MM');
          const monthLabel = format(monthDate, 'MMM yyyy');
          monthlyData[monthKey] = { month: monthLabel, total: 0 };
        }
        
        // Calculate actual totals from income records
        incomes.forEach(income => {
          const monthKey = format(new Date(income.date), 'yyyy-MM');
          if (monthlyData[monthKey]) {
            // Apply multiplier based on frequency to get monthly equivalent
            let multiplier = 1;
            switch (income.frequency) {
              case 'daily': multiplier = 30; break;
              case 'weekly': multiplier = 4; break;
              case 'biweekly': multiplier = 2; break;
              case 'monthly': multiplier = 1; break;
              case 'quarterly': multiplier = 1/3; break;
              case 'annually': multiplier = 1/12; break;
            }
            monthlyData[monthKey].total += income.amount * multiplier;
          }
        });
        
        // Convert to array sorted by date
        const monthlyStats = Object.values(monthlyData).reverse();
        
        // Calculate total monthly income
        const totalMonthlyIncome = Object.values(monthlyData)[0]?.total || 0;
        
        return res.status(200).json({
          success: true,
          data: {
            totalMonthlyIncome,
            monthlyStats,
          },
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error fetching income statistics',
        });
      }
    
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

export default authenticateUser(handler);