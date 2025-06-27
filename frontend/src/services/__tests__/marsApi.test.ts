import axios from 'axios';
import { marsApiClient, MarsService } from '../marsApi';
import type { MarsPhoto, MarsCamera, RoverInfo } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock data
const mockPhotosResponse = {
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

const mockCamerasResponse = {
  data: [
    { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera' },
    { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' },
    { name: 'MAST', fullName: 'Mast Camera' },
  ],
};

const mockRoverInfoResponse = {
  data: {
    name: 'Curiosity',
    status: 'active',
    landing_date: '2012-08-05',
    launch_date: '2011-11-26',
    total_photos: 500000,
    mission_duration: 4000,
  },
};

describe('marsApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLatestPhotos', () => {
    it('fetches latest photos successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockPhotosResponse);

      const result = await marsApiClient.getLatestPhotos();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mars/photos/latest', {
        params: { limit: 25 },
      });
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });

    it('fetches latest photos with camera filter', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockPhotosResponse);

      const result = await marsApiClient.getLatestPhotos('FHAZ', 10);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mars/photos/latest', {
        params: { camera: 'FHAZ', limit: 10 },
      });
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });

    it('handles API errors', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(marsApiClient.getLatestPhotos()).rejects.toThrow(errorMessage);
    });
  });

  describe('getPhotosBySol', () => {
    it('fetches photos by sol successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockPhotosResponse);

      const result = await marsApiClient.getPhotosBySol(1000);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mars/photos', {
        params: { sol: 1000 },
      });
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });

    it('fetches photos by sol with camera filter', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockPhotosResponse);

      const result = await marsApiClient.getPhotosBySol(1000, 'MAST');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mars/photos', {
        params: { sol: 1000, camera: 'MAST' },
      });
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });
  });

  describe('getPhotosByDate', () => {
    it('fetches photos by date successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockPhotosResponse);

      const result = await marsApiClient.getPhotosByDate('2023-01-01');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mars/photos', {
        params: { earth_date: '2023-01-01' },
      });
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });

    it('fetches photos by date with camera filter', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockPhotosResponse);

      const result = await marsApiClient.getPhotosByDate('2023-01-01', 'RHAZ');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mars/photos', {
        params: { earth_date: '2023-01-01', camera: 'RHAZ' },
      });
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });
  });

  describe('getCameras', () => {
    it('fetches cameras successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockCamerasResponse);

      const result = await marsApiClient.getCameras();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mars/cameras');
      expect(result).toEqual(mockCamerasResponse.data);
    });
  });

  describe('getRoverInfo', () => {
    it('fetches rover info successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockRoverInfoResponse);

      const result = await marsApiClient.getRoverInfo();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mars/rover');
      expect(result).toEqual(mockRoverInfoResponse.data);
    });
  });
});

describe('MarsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLatestPhotos', () => {
    it('calls marsApiClient.getLatestPhotos', async () => {
      const spy = jest.spyOn(marsApiClient, 'getLatestPhotos').mockResolvedValueOnce(mockPhotosResponse.data.photos);

      const result = await MarsService.getLatestPhotos();

      expect(spy).toHaveBeenCalledWith(undefined, 25);
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });

    it('passes parameters correctly', async () => {
      const spy = jest.spyOn(marsApiClient, 'getLatestPhotos').mockResolvedValueOnce(mockPhotosResponse.data.photos);

      await MarsService.getLatestPhotos('FHAZ', 10);

      expect(spy).toHaveBeenCalledWith('FHAZ', 10);
    });
  });

  describe('getPhotosBySol', () => {
    it('calls marsApiClient.getPhotosBySol', async () => {
      const spy = jest.spyOn(marsApiClient, 'getPhotosBySol').mockResolvedValueOnce(mockPhotosResponse.data.photos);

      const result = await MarsService.getPhotosBySol(1000);

      expect(spy).toHaveBeenCalledWith(1000, undefined);
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });
  });

  describe('getPhotosByDate', () => {
    it('calls marsApiClient.getPhotosByDate', async () => {
      const spy = jest.spyOn(marsApiClient, 'getPhotosByDate').mockResolvedValueOnce(mockPhotosResponse.data.photos);

      const result = await MarsService.getPhotosByDate('2023-01-01');

      expect(spy).toHaveBeenCalledWith('2023-01-01', undefined);
      expect(result).toEqual(mockPhotosResponse.data.photos);
    });
  });
});
