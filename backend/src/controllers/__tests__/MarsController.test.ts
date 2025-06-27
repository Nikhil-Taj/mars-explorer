import request from 'supertest';
import express from 'express';
import { MarsController } from '../MarsController';
import { MarsService } from '../../services/MarsService';

// Mock the MarsService
jest.mock('../../services/MarsService');
const mockMarsService = MarsService as jest.Mocked<typeof MarsService>;

const app = express();
app.use(express.json());

// Setup routes
const marsController = new MarsController();
app.get('/api/mars/photos/latest', marsController.getLatestPhotos.bind(marsController));
app.get('/api/mars/photos', marsController.getPhotos.bind(marsController));
app.get('/api/mars/rover', marsController.getRoverInfo.bind(marsController));
app.get('/api/mars/cameras', marsController.getCameras.bind(marsController));

// Mock data
const mockPhotos = [
  {
    id: 1,
    img_src: 'https://example.com/photo1.jpg',
    earth_date: '2023-01-01',
    sol: 1000,
    camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
    rover: { name: 'Curiosity' },
  },
  {
    id: 2,
    img_src: 'https://example.com/photo2.jpg',
    earth_date: '2023-01-01',
    sol: 1000,
    camera: { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
    rover: { name: 'Curiosity' },
  },
];

const mockCameras = [
  { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera' },
  { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' },
  { name: 'MAST', fullName: 'Mast Camera' },
];

const mockRoverInfo = {
  name: 'Curiosity',
  status: 'active',
  landing_date: '2012-08-05',
  launch_date: '2011-11-26',
  total_photos: 500000,
  mission_duration: 4000,
};

describe('MarsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/mars/photos/latest', () => {
    it('should return latest photos successfully', async () => {
      mockMarsService.getLatestPhotos.mockResolvedValue(mockPhotos);

      const response = await request(app)
        .get('/api/mars/photos/latest')
        .expect(200);

      expect(response.body).toEqual({ photos: mockPhotos });
      expect(mockMarsService.getLatestPhotos).toHaveBeenCalledWith(undefined, 25);
    });

    it('should handle camera filter parameter', async () => {
      mockMarsService.getLatestPhotos.mockResolvedValue(mockPhotos);

      const response = await request(app)
        .get('/api/mars/photos/latest?camera=FHAZ&limit=10')
        .expect(200);

      expect(response.body).toEqual({ photos: mockPhotos });
      expect(mockMarsService.getLatestPhotos).toHaveBeenCalledWith('FHAZ', 10);
    });

    it('should handle service errors', async () => {
      const errorMessage = 'Service unavailable';
      mockMarsService.getLatestPhotos.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/mars/photos/latest')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch latest photos',
        message: errorMessage,
      });
    });

    it('should validate limit parameter', async () => {
      const response = await request(app)
        .get('/api/mars/photos/latest?limit=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/mars/photos', () => {
    it('should return photos by sol', async () => {
      mockMarsService.getPhotosBySol.mockResolvedValue(mockPhotos);

      const response = await request(app)
        .get('/api/mars/photos?sol=1000')
        .expect(200);

      expect(response.body).toEqual({ photos: mockPhotos });
      expect(mockMarsService.getPhotosBySol).toHaveBeenCalledWith(1000, undefined);
    });

    it('should return photos by earth date', async () => {
      mockMarsService.getPhotosByDate.mockResolvedValue(mockPhotos);

      const response = await request(app)
        .get('/api/mars/photos?earth_date=2023-01-01')
        .expect(200);

      expect(response.body).toEqual({ photos: mockPhotos });
      expect(mockMarsService.getPhotosByDate).toHaveBeenCalledWith('2023-01-01', undefined);
    });

    it('should handle camera filter with sol', async () => {
      mockMarsService.getPhotosBySol.mockResolvedValue(mockPhotos);

      const response = await request(app)
        .get('/api/mars/photos?sol=1000&camera=MAST')
        .expect(200);

      expect(response.body).toEqual({ photos: mockPhotos });
      expect(mockMarsService.getPhotosBySol).toHaveBeenCalledWith(1000, 'MAST');
    });

    it('should return 400 when neither sol nor earth_date provided', async () => {
      const response = await request(app)
        .get('/api/mars/photos')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate sol parameter', async () => {
      const response = await request(app)
        .get('/api/mars/photos?sol=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate earth_date format', async () => {
      const response = await request(app)
        .get('/api/mars/photos?earth_date=invalid-date')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/mars/rover', () => {
    it('should return rover information', async () => {
      mockMarsService.getRoverInfo.mockResolvedValue(mockRoverInfo);

      const response = await request(app)
        .get('/api/mars/rover')
        .expect(200);

      expect(response.body).toEqual(mockRoverInfo);
      expect(mockMarsService.getRoverInfo).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const errorMessage = 'Failed to fetch rover info';
      mockMarsService.getRoverInfo.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/mars/rover')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch rover information',
        message: errorMessage,
      });
    });
  });

  describe('GET /api/mars/cameras', () => {
    it('should return available cameras', async () => {
      mockMarsService.getCameras.mockResolvedValue(mockCameras);

      const response = await request(app)
        .get('/api/mars/cameras')
        .expect(200);

      expect(response.body).toEqual({ cameras: mockCameras });
      expect(mockMarsService.getCameras).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const errorMessage = 'Failed to fetch cameras';
      mockMarsService.getCameras.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/mars/cameras')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch cameras',
        message: errorMessage,
      });
    });
  });
});
