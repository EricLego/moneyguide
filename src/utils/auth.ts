import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable');
}

export interface UserToken {
  id: string;
  email: string;
}

export function generateToken(user: IUser): string {
  const payload: UserToken = {
    id: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): UserToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserToken;
  } catch (error) {
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
      // Get token from headers or cookies
      const token = 
        req.headers.authorization?.replace('Bearer ', '') || 
        req.cookies.token;

      if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const decodedToken = verifyToken(token);
      
      if (!decodedToken) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }

      // Add user info to request
      req.user = decodedToken;
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Authentication error' });
    }
  };
}