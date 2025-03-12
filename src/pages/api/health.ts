import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
  uptime: number;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  const startTime = process.uptime();
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: startTime
  });
}