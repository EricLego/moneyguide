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
    // Connect to the database with extended timeout
    const dbPromise = dbConnect();
    
    // Set a longer timeout for database connection (20 seconds)
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 20000)
    );
    
    try {
      await Promise.race([dbPromise, timeout]);
    } catch (error) {
      console.error('Database connection failed on first attempt. Retrying...');
      // Wait a moment before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Try again with an even longer timeout
      await Promise.race([
        dbConnect(), 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout on retry')), 30000))
      ]);
    }
    
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by the pre-save hook
    });

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
    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating user',
    });
  }
}