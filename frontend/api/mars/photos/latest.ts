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

    const { camera, limit = '25' } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 25, 100);

    // Get latest photos from Curiosity rover
    const response = await axios.get(`${NASA_API_BASE_URL}/mars-photos/api/v1/rovers/curiosity/latest_photos`, {
      params: {
        api_key: NASA_API_KEY,
      },
      timeout: 15000,
    });

    let photos = response.data.latest_photos || [];

    // Filter by camera if specified
    if (camera && camera !== 'ALL') {
      photos = photos.filter((photo: any) => 
        photo.camera.name.toUpperCase() === (camera as string).toUpperCase()
      );
    }

    // Limit results
    photos = photos.slice(0, limitNum);

    const result = {
      success: true,
      data: {
        photos: photos.map((photo: any) => ({
          id: photo.id,
          sol: photo.sol,
          camera: {
            id: photo.camera.id,
            name: photo.camera.name,
            rover_id: photo.camera.rover_id,
            full_name: photo.camera.full_name,
          },
          img_src: photo.img_src,
          earth_date: photo.earth_date,
          rover: {
            id: photo.rover.id,
            name: photo.rover.name,
            landing_date: photo.rover.landing_date,
            launch_date: photo.rover.launch_date,
            status: photo.rover.status,
            max_sol: photo.rover.max_sol,
            max_date: photo.rover.max_date,
            total_photos: photo.rover.total_photos,
          },
        })),
        total: photos.length,
        filters: {
          camera: camera || 'ALL',
          limit: limitNum,
        },
      },
      message: `Retrieved ${photos.length} latest Mars photos`,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('NASA API Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest photos',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    });
  }
}
