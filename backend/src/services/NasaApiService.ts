import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../config';

/**
 * NASA API Service
 * Handles all external API calls to NASA's services
 * Implements proper error handling and request validation
 */
export class NasaApiService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: config.nasaApiBaseUrl,
      timeout: 30000,
      params: {
        api_key: config.nasaApiKey,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🚀 NASA API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🚨 NASA API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.apiClient.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ NASA API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('🚨 NASA API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message,
        });

        // Handle specific error cases
        if (error.response?.status === 429) {
          throw new Error('NASA API rate limit exceeded. Please try again later.');
        }

        if (error.response?.status === 403) {
          throw new Error('NASA API access forbidden. Please check your API key.');
        }

        if (error.response?.status === 404) {
          throw new Error('NASA API endpoint not found.');
        }

        if (error.code === 'ECONNABORTED') {
          throw new Error('NASA API request timeout. Please try again.');
        }

        if (!error.response) {
          throw new Error('NASA API is not responding. Please try again later.');
        }

        throw error;
      }
    );
  }

  /**
   * Health check for NASA API
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - try to access the API
      await this.apiClient.get('/mars-photos/api/v1/rovers', {
        timeout: 5000,
      });
      return true;
    } catch (error) {
      console.error('NASA API health check failed:', error);
      return false;
    }
  }
}

export default NasaApiService;
