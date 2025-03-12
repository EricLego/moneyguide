import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { IUser } from '../models/User';

// Get JWT secret from environment or throw an error
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set!');
}

export interface UserToken {
  id: string;
  email: string;
}

export function generateToken(user: IUser | { _id: string; email: string }): string {
  const payload: UserToken = {
    id: user._id.toString(),
    email: user.email,
  };

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): UserToken | null {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    return jwt.verify(token, JWT_SECRET) as UserToken;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export interface AuthRequest extends NextApiRequest {
  user?: UserToken;
}

export function authenticateUser(
  handler: (req: AuthRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthRequest, res: NextApiResponse) => {
    try {
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
      
      // Get token from headers or cookies
      const token = 
        req.headers.authorization?.replace('Bearer ', '') || 
        req.cookies?.token;

      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required',
          details: 'No token found in request'
        });
      }

      const decodedToken = verifyToken(token);
      
      if (!decodedToken) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token',
          details: 'Token verification failed'
        });
      }

      // Add user info to request
      req.user = decodedToken;
      
      // Call the original handler
      return handler(req, res);
    } catch (error: any) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error',
        details: error.message
      });
    }
  };
}