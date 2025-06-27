import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const cameras = {
    success: true,
    data: {
      cameras: [
        {
          name: 'FHAZ',
          full_name: 'Front Hazard Avoidance Camera',
          description: 'Mounted on the lower portion of the front of the rover',
        },
        {
          name: 'RHAZ',
          full_name: 'Rear Hazard Avoidance Camera',
          description: 'Mounted on the lower portion of the rear of the rover',
        },
        {
          name: 'MAST',
          full_name: 'Mast Camera',
          description: 'Mounted on the rover mast',
        },
        {
          name: 'CHEMCAM',
          full_name: 'Chemistry and Camera Complex',
          description: 'Mounted on the rover mast',
        },
        {
          name: 'MAHLI',
          full_name: 'Mars Hand Lens Imager',
          description: 'Mounted on the rover robotic arm',
        },
        {
          name: 'MARDI',
          full_name: 'Mars Descent Imager',
          description: 'Mounted on the rover chassis',
        },
        {
          name: 'NAVCAM',
          full_name: 'Navigation Camera',
          description: 'Mounted on the rover mast',
        },
      ],
      total: 7,
    },
    message: 'Camera information retrieved successfully',
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(cameras);
}
