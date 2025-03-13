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

    // Connect to the database with improved error handling
    try {
      // First attempt with 30 second timeout
      const dbPromise = dbConnect();
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout (30s)')), 30000)
      );
      
      await Promise.race([dbPromise, timeout]);
      
      console.log('Database connected successfully on first attempt');
    } catch (error) {
      console.error('Database connection failed on first attempt. Waiting 2s before retry...');
      
      // Log detailed error information
      console.error('Connection error details:', error instanceof Error ? error.message : 'Unknown error');
      
      // Wait a moment before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try again with an even longer timeout (45 seconds)
      try {
        const retryPromise = dbConnect();
        const retryTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout on retry (45s)')), 45000)
        );
        
        await Promise.race([retryPromise, retryTimeout]);
        console.log('Database connected successfully on retry attempt');
      } catch (retryError) {
        console.error('Database connection failed on retry attempt');
        console.error('Retry error details:', retryError instanceof Error ? retryError.message : 'Unknown error');
        
        // Throw a user-friendly error that will be caught by the outer try/catch
        throw new Error('Unable to connect to the database after multiple attempts. Please try again later.');
      }
    }

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
    
    // Determine the appropriate status code based on the error type
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    
    if (error.message?.includes('Database connection timeout') || error.message?.includes('Unable to connect to the database')) {
      statusCode = 504; // Gateway Timeout
      errorMessage = 'Database connection timeout. Please try again later.';
    } else if (error.name === 'MongooseError' || error.name === 'MongoError') {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Database service currently unavailable. Please try again later.';
    } else if (error.name === 'JsonWebTokenError' || error.message?.includes('jwt')) {
      statusCode = 401; // Unauthorized
      errorMessage = 'Invalid authentication token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401; // Unauthorized
      errorMessage = 'Authentication token expired';
    }
    
    // Log detailed information for troubleshooting
    console.error(`Auth/me error (${statusCode}): ${errorMessage}`);
    console.error('Error details:', error.message || 'No error message available');
    
    // Return a user-friendly response
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}