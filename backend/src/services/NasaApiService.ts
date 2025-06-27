import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../config';
import { ApodData, GetApodRequest } from '../types';

/**
 * NASA API Service
 * Handles all external API calls to NASA's services
 * Implements proper error handling and request validation
 */
export class NasaApiService {
  private apiClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = config.nasaApiBaseUrl;
    this.apiKey = config.nasaApiKey;
    
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NASA-Space-Explorer/1.0',
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
          throw new Error(`NASA API Error (${status}): ${data.error?.message || data.msg || 'Unknown error'}`);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('NASA API is not responding. Please try again later.');
        } else {
          // Something else happened
          throw new Error(`Request failed: ${error.message}`);
        }
      }
    );
  }

  /**
   * Get Astronomy Picture of the Day (APOD)
   */
  async getApod(params: GetApodRequest = {}): Promise<ApodData | ApodData[]> {
    try {
      this.validateApodRequest(params);
      
      const response = await this.apiClient.get<ApodData | ApodData[]>('/planetary/apod', {
        params: this.cleanParams(params),
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch APOD data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get APOD for a specific date
   */
  async getApodByDate(date: string): Promise<ApodData> {
    try {
      this.validateDate(date);
      
      const response = await this.apiClient.get<ApodData>('/planetary/apod', {
        params: { date },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch APOD for date ${date}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get APOD for a date range
   */
  async getApodByDateRange(startDate: string, endDate: string): Promise<ApodData[]> {
    try {
      this.validateDate(startDate);
      this.validateDate(endDate);
      this.validateDateRange(startDate, endDate);
      
      const response = await this.apiClient.get<ApodData[]>('/planetary/apod', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      throw new Error(`Failed to fetch APOD for date range ${startDate} to ${endDate}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get random APOD entries
   */
  async getRandomApod(count: number = 1): Promise<ApodData[]> {
    try {
      if (count < 1 || count > 100) {
        throw new Error('Count must be between 1 and 100');
      }
      
      const response = await this.apiClient.get<ApodData[]>('/planetary/apod', {
        params: { count },
      });

      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      throw new Error(`Failed to fetch random APOD entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate APOD request parameters
   */
  private validateApodRequest(params: GetApodRequest): void {
    if (params.date) {
      this.validateDate(params.date);
    }
    
    if (params.start_date) {
      this.validateDate(params.start_date);
    }
    
    if (params.end_date) {
      this.validateDate(params.end_date);
    }
    
    if (params.start_date && params.end_date) {
      this.validateDateRange(params.start_date, params.end_date);
    }
    
    if (params.count && (params.count < 1 || params.count > 100)) {
      throw new Error('Count must be between 1 and 100');
    }
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private validateDate(date: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error(`Invalid date format: ${date}. Expected format: YYYY-MM-DD`);
    }
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
    
    // APOD started on June 16, 1995
    const apodStartDate = new Date('1995-06-16');
    const today = new Date();
    
    if (parsedDate < apodStartDate) {
      throw new Error(`Date cannot be before APOD start date (1995-06-16): ${date}`);
    }
    
    if (parsedDate > today) {
      throw new Error(`Date cannot be in the future: ${date}`);
    }
  }

  /**
   * Validate date range
   */
  private validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      throw new Error(`Start date cannot be after end date: ${startDate} > ${endDate}`);
    }
    
    // Limit range to prevent excessive API calls
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      throw new Error('Date range cannot exceed 365 days');
    }
  }

  /**
   * Clean request parameters (remove undefined values)
   */
  private cleanParams(params: GetApodRequest): Record<string, string | number> {
    const cleanedParams: Record<string, string | number> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanedParams[key] = value;
      }
    });
    
    return cleanedParams;
  }
}

export default NasaApiService;
