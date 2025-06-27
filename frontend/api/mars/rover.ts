import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const NASA_API_BASE_URL = 'https://api.nasa.gov';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const response = await axios.get(`${NASA_API_BASE_URL}/mars-photos/api/v1/rovers`, {
      params: {
        api_key: NASA_API_KEY,
      },
      timeout: 10000,
    });

    const rovers = response.data.rovers;
    
    // Transform the data to match our expected format
    const roverInfo = {
      success: true,
      data: {
        rovers: rovers.map((rover: any) => ({
          id: rover.id,
          name: rover.name,
          status: rover.status,
          landing_date: rover.landing_date,
          launch_date: rover.launch_date,
          max_sol: rover.max_sol,
          max_date: rover.max_date,
          total_photos: rover.total_photos,
          cameras: rover.cameras.map((camera: any) => ({
            name: camera.name,
            full_name: camera.full_name,
          })),
        })),
        total: rovers.length,
      },
      message: 'Rover information retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(roverInfo);
  } catch (error) {
    console.error('NASA API Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rover information',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    });
  }
}
