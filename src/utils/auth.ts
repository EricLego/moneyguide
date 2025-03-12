import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { IUser } from '../models/User';

// Use a default secret for development and demo purposes
const JWT_SECRET = process.env.JWT_SECRET || 'demo-development-secret-key-for-jwt-signing';

export interface UserToken {
  id: string;
  email: string;
}

export function generateToken(user: IUser | { _id: string; email: string }): string {
  const payload: UserToken = {
    id: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // Extended validity for demo
  });
}

export function verifyToken(token: string): UserToken | null {
  try {
    // Handle demo token
    if (token === 'demo-token-123456789') {
      return {
        id: 'demo123',
        email: 'demo@example.com'
      };
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

      // Handle demo token
      if (token === 'demo-token-123456789') {
        req.user = {
          id: 'demo123',
          email: 'demo@example.com'
        };
        return handler(req, res);
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