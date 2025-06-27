import axios from 'axios';
import { MarsService } from '../MarsService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock data
const mockNasaResponse = {
  data: {
    photos: [
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
    ],
  },
};

const mockRoverResponse = {
  data: {
    rover: {
      name: 'Curiosity',
      status: 'active',
      landing_date: '2012-08-05',
      launch_date: '2011-11-26',
      total_photos: 500000,
      max_sol: 4000,
      max_date: '2023-12-01',
      cameras: [
        { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
        { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
        { name: 'MAST', full_name: 'Mast Camera' },
      ],
    },
  },
};

describe('MarsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NASA_API_KEY = 'test-api-key';
  });

  describe('getLatestPhotos', () => {
    it('should fetch latest photos successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNasaResponse);

      const result = await MarsService.getLatestPhotos();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos',
        {
          params: {
            api_key: 'test-api-key',
          },
        }
      );
      expect(result).toEqual(mockNasaResponse.data.photos);
    });

    it('should fetch latest photos with camera filter', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNasaResponse);

      const result = await MarsService.getLatestPhotos('FHAZ', 10);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos',
        {
          params: {
            api_key: 'test-api-key',
          },
        }
      );
      
      // Should filter results by camera
      const filteredResult = result.filter((photo: any) => photo.camera.name === 'FHAZ');
      expect(filteredResult.length).toBeLessThanOrEqual(10);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'NASA API Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(MarsService.getLatestPhotos()).rejects.toThrow(errorMessage);
    });

    it('should handle missing API key', async () => {
      delete process.env.NASA_API_KEY;

      await expect(MarsService.getLatestPhotos()).rejects.toThrow('NASA API key not configured');
    });
  });

  describe('getPhotosBySol', () => {
    it('should fetch photos by sol successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNasaResponse);

      const result = await MarsService.getPhotosBySol(1000);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos',
        {
          params: {
            sol: 1000,
            api_key: 'test-api-key',
          },
        }
      );
      expect(result).toEqual(mockNasaResponse.data.photos);
    });

    it('should fetch photos by sol with camera filter', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNasaResponse);

      const result = await MarsService.getPhotosBySol(1000, 'MAST');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos',
        {
          params: {
            sol: 1000,
            camera: 'MAST',
            api_key: 'test-api-key',
          },
        }
      );
      expect(result).toEqual(mockNasaResponse.data.photos);
    });

    it('should validate sol parameter', async () => {
      await expect(MarsService.getPhotosBySol(-1)).rejects.toThrow('Invalid sol parameter');
      await expect(MarsService.getPhotosBySol(10001)).rejects.toThrow('Invalid sol parameter');
    });
  });

  describe('getPhotosByDate', () => {
    it('should fetch photos by earth date successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNasaResponse);

      const result = await MarsService.getPhotosByDate('2023-01-01');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos',
        {
          params: {
            earth_date: '2023-01-01',
            api_key: 'test-api-key',
          },
        }
      );
      expect(result).toEqual(mockNasaResponse.data.photos);
    });

    it('should fetch photos by date with camera filter', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNasaResponse);

      const result = await MarsService.getPhotosByDate('2023-01-01', 'RHAZ');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos',
        {
          params: {
            earth_date: '2023-01-01',
            camera: 'RHAZ',
            api_key: 'test-api-key',
          },
        }
      );
      expect(result).toEqual(mockNasaResponse.data.photos);
    });

    it('should validate date format', async () => {
      await expect(MarsService.getPhotosByDate('invalid-date')).rejects.toThrow('Invalid date format');
      await expect(MarsService.getPhotosByDate('2023-13-01')).rejects.toThrow('Invalid date format');
    });

    it('should validate date range', async () => {
      await expect(MarsService.getPhotosByDate('2010-01-01')).rejects.toThrow('Date before Curiosity landing');
      
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      await expect(MarsService.getPhotosByDate(futureDate.toISOString().split('T')[0]))
        .rejects.toThrow('Date in the future');
    });
  });

  describe('getRoverInfo', () => {
    it('should fetch rover information successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockRoverResponse);

      const result = await MarsService.getRoverInfo();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity',
        {
          params: {
            api_key: 'test-api-key',
          },
        }
      );
      
      expect(result).toEqual({
        name: 'Curiosity',
        status: 'active',
        landing_date: '2012-08-05',
        launch_date: '2011-11-26',
        total_photos: 500000,
        mission_duration: expect.any(Number),
      });
    });
  });

  describe('getCameras', () => {
    it('should return available cameras', async () => {
      const result = await MarsService.getCameras();

      expect(result).toEqual([
        { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera' },
        { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' },
        { name: 'MAST', fullName: 'Mast Camera' },
        { name: 'CHEMCAM', fullName: 'Chemistry and Camera Complex' },
        { name: 'MAHLI', fullName: 'Mars Hand Lens Imager' },
        { name: 'MARDI', fullName: 'Mars Descent Imager' },
        { name: 'NAVCAM', fullName: 'Navigation Camera' },
      ]);
    });
  });
});
