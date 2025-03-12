import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Income from '@/models/Income';
import { authenticateUser, AuthRequest } from '@/utils/auth';

async function handler(req: AuthRequest, res: NextApiResponse) {
  await dbConnect();
  
  const { 
    method,
    query: { id },
  } = req;

  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ success: false, message: 'Invalid income ID' });
  }

  const userId = req.user.id;

  switch (method) {
    case 'GET':
      try {
        // Get specific income record
        const income = await Income.findOne({ 
          _id: id,
          user: userId
        });
        
        if (!income) {
          return res.status(404).json({
            success: false,
            message: 'Income record not found',
          });
        }

        return res.status(200).json({
          success: true,
          data: income,
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error fetching income record',
        });
      }
    
    case 'PUT':
      try {
        const { source, amount, currency, frequency, date, description } = req.body;
        
        // Find and update income record
        const income = await Income.findOneAndUpdate(
          { _id: id, user: userId },
          {
            source,
            amount,
            currency,
            frequency,
            date,
            description,
          },
          { new: true, runValidators: true }
        );
        
        if (!income) {
          return res.status(404).json({
            success: false,
            message: 'Income record not found',
          });
        }
        
        return res.status(200).json({
          success: true,
          data: income,
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error updating income record',
        });
      }
    
    case 'DELETE':
      try {
        // Delete income record
        const income = await Income.findOneAndDelete({ _id: id, user: userId });
        
        if (!income) {
          return res.status(404).json({
            success: false,
            message: 'Income record not found',
          });
        }
        
        return res.status(200).json({
          success: true,
          message: 'Income record deleted successfully',
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error deleting income record',
        });
      }
    
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

export default authenticateUser(handler);