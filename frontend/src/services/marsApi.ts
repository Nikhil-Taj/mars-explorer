import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse, MarsPhoto, MarsCamera, RoverInfo, GetMarsPhotosRequest } from '../types';

/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 15000; // 15 seconds

/**
 * Mars API Client Class
 * Handles all HTTP requests to the Mars rover backend API
 */
class MarsApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`🚀 Mars API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (import.meta.env.DEV) {
          console.log(`✅ Mars API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        // Log error in development
        if (import.meta.env.DEV) {
          console.error(`❌ Mars API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Transform error for consistent handling
        const transformedError = this.transformError(error);
        return Promise.reject(transformedError);
      }
    );
  }

  /**
   * Transform axios error to application error
   */
  private transformError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const errorData = data as any;
      
      return new Error(
        errorData?.message || 
        errorData?.error || 
        `HTTP ${status}: ${error.message}`
      );
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: Unable to connect to Mars server');
    } else {
      // Something else happened
      return new Error(`Request failed: ${error.message}`);
    }
  }

  /**
   * Generic GET request
   */
  private async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Mars API request failed');
    }
    
    return response.data.data as T;
  }

  // Mars API Methods

  /**
   * Get Mars rover photos
   */
  async getPhotos(params?: GetMarsPhotosRequest): Promise<MarsPhoto[]> {
    return this.get<MarsPhoto[]>('/mars/photos', params);
  }

  /**
   * Get photos by Sol (Martian day)
   */
  async getPhotosBySol(sol: number, camera?: string, page?: number): Promise<MarsPhoto[]> {
    const params: any = {};
    if (camera) params.camera = camera;
    if (page) params.page = page;
    
    return this.get<MarsPhoto[]>(`/mars/photos/sol/${sol}`, params);
  }

  /**
   * Get photos by Earth date
   */
  async getPhotosByDate(date: string, camera?: string, page?: number): Promise<MarsPhoto[]> {
    const params: any = {};
    if (camera) params.camera = camera;
    if (page) params.page = page;
    
    return this.get<MarsPhoto[]>(`/mars/photos/date/${date}`, params);
  }

  /**
   * Get latest photos
   */
  async getLatestPhotos(camera?: string, limit?: number): Promise<MarsPhoto[]> {
    const params: any = {};
    if (camera) params.camera = camera;
    if (limit) params.limit = limit;
    
    return this.get<MarsPhoto[]>('/mars/photos/latest', params);
  }

  /**
   * Get available cameras
   */
  async getCameras(): Promise<MarsCamera[]> {
    return this.get<MarsCamera[]>('/mars/cameras');
  }

  /**
   * Get rover information
   */
  async getRoverInfo(): Promise<RoverInfo> {
    return this.get<RoverInfo>('/mars/rover');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; uptime: number }> {
    return this.get<{ status: string; uptime: number }>('/mars/health');
  }
}

// Create and export singleton instance
export const marsApiClient = new MarsApiClient();

/**
 * Mars Service
 * High-level service methods for Mars operations
 */
export class MarsService {
  /**
   * Get photos for a random Sol
   */
  static async getRandomSolPhotos(): Promise<MarsPhoto[]> {
    const randomSol = Math.floor(Math.random() * 3000) + 1;
    return marsApiClient.getPhotosBySol(randomSol);
  }

  /**
   * Get photos with a specific camera
   */
  static async getPhotosWithCamera(camera: string, sol?: number): Promise<MarsPhoto[]> {
    if (sol) {
      return marsApiClient.getPhotosBySol(sol, camera);
    }
    return marsApiClient.getLatestPhotos(camera);
  }

  /**
   * Get recent photos (last few sols)
   */
  static async getRecentPhotos(limit: number = 25): Promise<MarsPhoto[]> {
    return marsApiClient.getLatestPhotos(undefined, limit);
  }

  /**
   * Validate Sol number
   */
  static validateSol(sol: number): boolean {
    return sol >= 0 && sol <= 4000 && Number.isInteger(sol);
  }

  /**
   * Validate Earth date
   */
  static validateEarthDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return false;
    }

    // Curiosity landed on August 5, 2012
    const landingDate = new Date('2012-08-05');
    const today = new Date();

    return parsedDate >= landingDate && parsedDate <= today;
  }

  /**
   * Format Sol for display
   */
  static formatSol(sol: number): string {
    return `Sol ${sol.toLocaleString()}`;
  }

  /**
   * Format Earth date for display
   */
  static formatEarthDate(date: string): string {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  }

  /**
   * Get camera display name
   */
  static getCameraDisplayName(cameraName: string): string {
    const cameraMap: Record<string, string> = {
      'FHAZ': 'Front Hazard Camera',
      'RHAZ': 'Rear Hazard Camera',
      'MAST': 'Mast Camera',
      'CHEMCAM': 'ChemCam',
      'MAHLI': 'Hand Lens Imager',
      'MARDI': 'Descent Imager',
      'NAVCAM': 'Navigation Camera',
    };
    return cameraMap[cameraName] || cameraName;
  }

  /**
   * Calculate mission duration
   */
  static calculateMissionDuration(landingDate: string): number {
    const landing = new Date(landingDate);
    const now = new Date();
    return Math.floor((now.getTime() - landing.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export default marsApiClient;
