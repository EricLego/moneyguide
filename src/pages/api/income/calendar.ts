import { NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Income from '@/models/Income';
import { authenticateUser, AuthRequest } from '@/utils/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

async function handler(req: AuthRequest, res: NextApiResponse) {
  await dbConnect();
  
  const { 
    method,
    query: { month, year }
  } = req;

  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const userId = req.user.id;

  switch (method) {
    case 'GET':
      try {
        // Default to current month if not provided
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month as string, 10) - 1 : currentDate.getMonth();
        const targetYear = year ? parseInt(year as string, 10) : currentDate.getFullYear();
        
        // Create date range for the month
        const startDate = startOfMonth(new Date(targetYear, targetMonth));
        const endDate = endOfMonth(new Date(targetYear, targetMonth));
        
        // Find all income records within date range
        const incomes = await Income.find({
          user: userId,
          date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });
        
        // Format for calendar display
        const calendarEvents = incomes.map(income => ({
          id: income._id,
          title: income.source,
          amount: income.amount,
          currency: income.currency,
          date: income.date,
          frequency: income.frequency,
        }));
        
        return res.status(200).json({
          success: true,
          data: calendarEvents,
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error fetching calendar data',
        });
      }
    
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

export default authenticateUser(handler);