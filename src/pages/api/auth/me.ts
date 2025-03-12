import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/utils/auth';
import { getCookie } from 'cookies-next';

// Set timeout for the API route
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get token from headers or cookies
    const token = 
      req.headers.authorization?.replace('Bearer ', '') || 
      getCookie('token', { req, res });

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Verify token
    const decodedToken = verifyToken(token.toString());
    
    if (!decodedToken) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Connect to the database with timeout
    const dbPromise = dbConnect();
    
    // Set a timeout for database connection
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([dbPromise, timeout]);

    // Find user in database
    const user = await User.findById(decodedToken.id).select('-password').exec();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error in /me endpoint:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user data',
    });
  }
}