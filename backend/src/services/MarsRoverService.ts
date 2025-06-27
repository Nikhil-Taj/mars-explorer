import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../config';
import { MarsPhoto, MarsPhotosResponse, GetMarsPhotosRequest } from '../types';

/**
 * Mars Rover API Service
 * Handles all external API calls to NASA's Mars Rover Photo API
 */
export class MarsRoverService {
  private apiClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = config.nasaApiBaseUrl;
    this.apiKey = config.nasaApiKey;
    
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000, // 15 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NASA-Mars-Explorer/1.0',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        // Add API key to all requests
        config.params = {
          ...config.params,
          api_key: this.apiKey,
        };
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          throw new Error(`NASA Mars API Error (${status}): ${data.error?.message || data.errors || 'Unknown error'}`);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('NASA Mars API is not responding. Please try again later.');
        } else {
          // Something else happened
          throw new Error(`Request failed: ${error.message}`);
        }
      }
    );
  }

  /**
   * Get Mars Rover photos from Curiosity
   */
  async getCuriosityPhotos(params: GetMarsPhotosRequest = {}): Promise<MarsPhoto[]> {
    try {
      this.validateRequest(params);
      
      const response = await this.apiClient.get<MarsPhotosResponse>('/mars-photos/api/v1/rovers/curiosity/photos', {
        params: this.cleanParams(params),
      });

      return response.data.photos;
    } catch (error) {
      throw new Error(`Failed to fetch Mars photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get photos by Sol (Martian day)
   */
  async getPhotosBySol(sol: number, camera?: string, page: number = 1): Promise<MarsPhoto[]> {
    try {
      if (sol < 0 || sol > 4000) {
        throw new Error('Sol must be between 0 and 4000');
      }

      const params: GetMarsPhotosRequest = { sol, page };
      if (camera) {
        params.camera = camera;
      }

      return await this.getCuriosityPhotos(params);
    } catch (error) {
      throw new Error(`Failed to fetch photos for Sol ${sol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get photos by Earth date
   */
  async getPhotosByEarthDate(earthDate: string, camera?: string, page: number = 1): Promise<MarsPhoto[]> {
    try {
      this.validateEarthDate(earthDate);

      const params: GetMarsPhotosRequest = { earth_date: earthDate, page };
      if (camera) {
        params.camera = camera;
      }

      return await this.getCuriosityPhotos(params);
    } catch (error) {
      throw new Error(`Failed to fetch photos for date ${earthDate}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get latest photos (most recent Sol)
   */
  async getLatestPhotos(camera?: string, limit: number = 25): Promise<MarsPhoto[]> {
    try {
      // Get photos from recent sols
      const recentSol = 4000; // Start from a recent sol
      const params: GetMarsPhotosRequest = { sol: recentSol };
      if (camera) {
        params.camera = camera;
      }

      const photos = await this.getCuriosityPhotos(params);
      return photos.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to fetch latest photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available cameras
   */
  getAvailableCameras(): Array<{ name: string; fullName: string; description: string }> {
    return [
      { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera', description: 'Front-facing navigation camera' },
      { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera', description: 'Rear-facing navigation camera' },
      { name: 'MAST', fullName: 'Mast Camera', description: 'Color imaging system' },
      { name: 'CHEMCAM', fullName: 'Chemistry and Camera Complex', description: 'Laser spectrometer' },
      { name: 'MAHLI', fullName: 'Mars Hand Lens Imager', description: 'Close-up imaging' },
      { name: 'MARDI', fullName: 'Mars Descent Imager', description: 'Descent and landing imaging' },
      { name: 'NAVCAM', fullName: 'Navigation Camera', description: 'Black and white navigation' },
    ];
  }

  /**
   * Validate request parameters
   */
  private validateRequest(params: GetMarsPhotosRequest): void {
    if (params.sol !== undefined && (params.sol < 0 || params.sol > 4000)) {
      throw new Error('Sol must be between 0 and 4000');
    }

    if (params.earth_date) {
      this.validateEarthDate(params.earth_date);
    }

    if (params.page !== undefined && (params.page < 1 || params.page > 100)) {
      throw new Error('Page must be between 1 and 100');
    }
  }

  /**
   * Validate Earth date format and range
   */
  private validateEarthDate(date: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error(`Invalid date format: ${date}. Expected format: YYYY-MM-DD`);
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }

    // Curiosity landed on August 5, 2012
    const landingDate = new Date('2012-08-05');
    const today = new Date();

    if (parsedDate < landingDate) {
      throw new Error(`Date cannot be before Curiosity landing date (2012-08-05): ${date}`);
    }

    if (parsedDate > today) {
      throw new Error(`Date cannot be in the future: ${date}`);
    }
  }

  /**
   * Clean request parameters (remove undefined values)
   */
  private cleanParams(params: GetMarsPhotosRequest): Record<string, string | number> {
    const cleanedParams: Record<string, string | number> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanedParams[key] = value;
      }
    });

    return cleanedParams;
  }
}

export default MarsRoverService;
