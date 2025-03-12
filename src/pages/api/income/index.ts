import { NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Income from '@/models/Income';
import { authenticateUser, AuthRequest } from '@/utils/auth';

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
        // Get income records for the authenticated user
        const incomes = await Income.find({ user: userId })
          .sort({ date: -1 })
          .limit(100);
        
        return res.status(200).json({
          success: true,
          data: incomes,
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error fetching income records',
        });
      }
    
    case 'POST':
      try {
        const { source, amount, currency, frequency, date, description } = req.body;
        
        // Validation
        if (!source || amount === undefined || !frequency) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields',
          });
        }

        // Create income record
        const income = await Income.create({
          user: userId,
          source,
          amount,
          currency: currency || 'USD',
          frequency,
          date: date || new Date(),
          description,
        });
        
        return res.status(201).json({
          success: true,
          data: income,
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error creating income record',
        });
      }
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

export default authenticateUser(handler);