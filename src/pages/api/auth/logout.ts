import { NextApiRequest, NextApiResponse } from 'next';
import { deleteCookie } from 'cookies-next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Delete the auth cookie
    deleteCookie('token', { req, res });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error logging out',
    });
  }
}