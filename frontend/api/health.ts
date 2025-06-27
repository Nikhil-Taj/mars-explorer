import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthData = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Mars Explorer API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
    },
    message: 'Service is running normally',
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(healthData);
}
