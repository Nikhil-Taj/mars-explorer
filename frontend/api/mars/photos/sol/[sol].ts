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

    const { sol } = req.query;
    const { camera, page = '1' } = req.query;

    if (!sol) {
      return res.status(400).json({
        success: false,
        error: 'Sol parameter is required',
        timestamp: new Date().toISOString(),
      });
    }

    const params: any = {
      sol: sol,
      api_key: NASA_API_KEY,
      page: page,
    };

    if (camera && camera !== 'ALL') {
      params.camera = camera;
    }

    const response = await axios.get(`${NASA_API_BASE_URL}/mars-photos/api/v1/rovers/curiosity/photos`, {
      params,
      timeout: 15000,
    });

    const photos = response.data.photos || [];

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
          sol: parseInt(sol as string),
          camera: camera || 'ALL',
          page: parseInt(page as string),
        },
      },
      message: `Retrieved ${photos.length} photos for Sol ${sol}`,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('NASA API Error:', error);
    
    res.status(500).json({
      success: false,
      error: `Failed to fetch photos for Sol ${req.query.sol}`,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    });
  }
}
