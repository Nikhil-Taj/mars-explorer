import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse, ApodData, GetApodRequest, MarsPhoto, MarsCamera, RoverInfo } from '../types';

/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * API Client Class
 * Handles all HTTP requests to the backend API
 */
class ApiClient {
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
        // Add timestamp to prevent caching
        config.params = {
          ...config.params,
          _t: Date.now(),
        };

        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
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
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        // Log error in development
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
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
      return new Error('Network error: Unable to connect to server');
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
      throw new Error(response.data.error || 'API request failed');
    }
    
    return response.data.data as T;
  }



  // APOD API Methods

  /**
   * Get APOD data with various options
   */
  async getApod(params?: GetApodRequest): Promise<ApodData | ApodData[]> {
    return this.get<ApodData | ApodData[]>('/apod', params);
  }

  /**
   * Get APOD for specific date
   */
  async getApodByDate(date: string): Promise<ApodData> {
    return this.get<ApodData>(`/apod/${date}`);
  }

  /**
   * Get latest APOD entries
   */
  async getLatestApod(limit: number = 10): Promise<ApodData[]> {
    return this.get<ApodData[]>('/apod/latest', { limit });
  }

  /**
   * Get random APOD entries
   */
  async getRandomApod(count: number = 1): Promise<ApodData[]> {
    return this.get<ApodData[]>('/apod/random', { count });
  }

  /**
   * Search APOD data
   */
  async searchApod(query: string, limit: number = 20): Promise<ApodData[]> {
    return this.get<ApodData[]>('/apod/search', { q: query, limit });
  }

  /**
   * Get APOD statistics
   */
  async getApodStats(): Promise<{ totalEntries: number; latestDate: string | null }> {
    return this.get<{ totalEntries: number; latestDate: string | null }>('/apod/stats');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; uptime: number }> {
    return this.get<{ status: string; uptime: number }>('/apod/health');
  }

  // Mars Rover API Methods

  /**
   * Get Mars rover information
   */
  async getMarsRoverInfo(): Promise<RoverInfo> {
    return this.get<RoverInfo>('/mars/rover');
  }

  /**
   * Get available Mars rover cameras
   */
  async getMarsRoverCameras(): Promise<MarsCamera[]> {
    return this.get<MarsCamera[]>('/mars/cameras');
  }

  /**
   * Get Mars photos with various options
   */
  async getMarsPhotos(params: {
    sol?: number;
    earth_date?: string;
    camera?: string;
    page?: number;
  }): Promise<MarsPhoto[]> {
    return this.get<MarsPhoto[]>('/mars/photos', params);
  }

  /**
   * Get latest Mars photos
   */
  async getLatestMarsPhotos(params?: {
    camera?: string;
    limit?: number;
  }): Promise<MarsPhoto[]> {
    return this.get<MarsPhoto[]>('/mars/photos/latest', params);
  }

  /**
   * Get Mars photos by Sol (Martian day)
   */
  async getMarsPhotosBySol(sol: number, params?: {
    camera?: string;
    page?: number;
  }): Promise<MarsPhoto[]> {
    return this.get<MarsPhoto[]>(`/mars/photos/sol/${sol}`, params);
  }

  /**
   * Get Mars photos by Earth date
   */
  async getMarsPhotosByDate(date: string, params?: {
    camera?: string;
    page?: number;
  }): Promise<MarsPhoto[]> {
    return this.get<MarsPhoto[]>(`/mars/photos/date/${date}`, params);
  }

  /**
   * Mars service health check
   */
  async marsHealthCheck(): Promise<{ status: string; uptime: number }> {
    return this.get<{ status: string; uptime: number }>('/mars/health');
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

/**
 * APOD Service
 * High-level service methods for APOD operations
 */
export class ApodService {
  /**
   * Get today's APOD
   */
  static async getTodaysApod(): Promise<ApodData> {
    const today = new Date().toISOString().split('T')[0];
    return apiClient.getApodByDate(today);
  }

  /**
   * Get APOD for date range
   */
  static async getApodRange(startDate: string, endDate: string): Promise<ApodData[]> {
    const result = await apiClient.getApod({ start_date: startDate, end_date: endDate });
    return Array.isArray(result) ? result : [result];
  }

  /**
   * Get random APOD entries
   */
  static async getRandomApods(count: number = 5): Promise<ApodData[]> {
    return apiClient.getRandomApod(count);
  }

  /**
   * Search APOD by query
   */
  static async searchApods(query: string, limit: number = 20): Promise<ApodData[]> {
    if (!query.trim()) {
      return [];
    }
    return apiClient.searchApod(query.trim(), limit);
  }

  /**
   * Get latest APOD entries
   */
  static async getLatestApods(limit: number = 10): Promise<ApodData[]> {
    return apiClient.getLatestApod(limit);
  }

  /**
   * Validate date format and range
   */
  static validateDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return false;
    }

    // APOD started on June 16, 1995
    const apodStartDate = new Date('1995-06-16');
    const today = new Date();

    return parsedDate >= apodStartDate && parsedDate <= today;
  }

  /**
   * Get date range validation
   */
  static validateDateRange(startDate: string, endDate: string): boolean {
    if (!this.validateDate(startDate) || !this.validateDate(endDate)) {
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return false;
    }

    // Limit range to prevent excessive requests
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 365;
  }

  /**
   * Format date for display
   */
  static formatDate(date: string): string {
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
   * Get APOD URL for sharing
   */
  static getShareUrl(date: string): string {
    return `${window.location.origin}/apod/${date}`;
  }
}

/**
 * Mars Rover Service
 * High-level service methods for Mars rover operations
 */
export class MarsService {
  /**
   * Get rover information
   */
  static async getRoverInfo(): Promise<RoverInfo> {
    return apiClient.getMarsRoverInfo();
  }

  /**
   * Get available cameras
   */
  static async getCameras(): Promise<MarsCamera[]> {
    return apiClient.getMarsRoverCameras();
  }

  /**
   * Get latest Mars photos
   */
  static async getLatestPhotos(camera?: string, limit: number = 25): Promise<MarsPhoto[]> {
    return apiClient.getLatestMarsPhotos({ camera, limit });
  }

  /**
   * Get Mars photos by Sol
   */
  static async getPhotosBySol(sol: number, camera?: string): Promise<MarsPhoto[]> {
    return apiClient.getMarsPhotosBySol(sol, { camera });
  }

  /**
   * Get Mars photos by Earth date
   */
  static async getPhotosByDate(date: string, camera?: string): Promise<MarsPhoto[]> {
    return apiClient.getMarsPhotosByDate(date, { camera });
  }

  /**
   * Get Mars photos with flexible parameters
   */
  static async getPhotos(params: {
    sol?: number;
    earth_date?: string;
    camera?: string;
  }): Promise<MarsPhoto[]> {
    return apiClient.getMarsPhotos(params);
  }

  /**
   * Validate Sol number (0-4000 range for Curiosity)
   */
  static validateSol(sol: number): boolean {
    return Number.isInteger(sol) && sol >= 0 && sol <= 4000;
  }

  /**
   * Validate Earth date format
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
    return `Sol ${sol}`;
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
  static getCameraDisplayName(camera: MarsCamera): string {
    return camera.fullName || camera.name;
  }
}

export default apiClient;
