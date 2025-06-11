import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/utils/auth';
import { setCookie } from 'cookies-next';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // If demo credentials are provided, bypass the DB connection entirely
    if (email === 'demo@example.com' && password === 'password123') {
      const demoUser = { _id: 'demo-user', name: 'Demo User', email };
      const token = generateToken(demoUser);

      // Set cookie with token
      setCookie('token', token, {
        req,
        res,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      return res.status(200).json({
        success: true,
        data: {
          id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
        }
      });
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

    // Find user in MongoDB
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie with token
    setCookie('token', token, { 
      req, 
      res, 
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Using lax for better compatibility
      path: '/'
    });

    // Return user data (without password)
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Determine the appropriate status code based on the error type
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred during login';
    
    if (error.message?.includes('Database connection timeout') || error.message?.includes('Unable to connect to the database')) {
      statusCode = 504; // Gateway Timeout
      errorMessage = 'Database connection timeout. Please try again later.';
    } else if (error.name === 'MongooseError' || error.name === 'MongoError') {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Database service currently unavailable. Please try again later.';
    } else if (error.message?.includes('Invalid credentials')) {
      statusCode = 401; // Unauthorized
      errorMessage = 'Invalid credentials';
    }
    
    // Log detailed information for troubleshooting
    console.error(`Login error (${statusCode}): ${errorMessage}`);
    console.error('Error details:', error.message || 'No error message available');
    
    // Return a user-friendly response
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}