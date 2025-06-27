import { ApodRepository } from '../repositories/ApodRepository';
import { NasaApiService } from './NasaApiService';
import { ApodData, GetApodRequest } from '../types';
import { IApodDocument } from '../models/ApodModel';

/**
 * APOD Service - Business Logic Layer
 * Orchestrates data flow between NASA API and local database
 * Implements caching strategy and business rules
 */
export class ApodService {
  private apodRepository: ApodRepository;
  private nasaApiService: NasaApiService;

  constructor() {
    this.apodRepository = new ApodRepository();
    this.nasaApiService = new NasaApiService();
  }

  /**
   * Get APOD data with intelligent caching
   * First checks local database, then fetches from NASA API if needed
   */
  async getApod(params: GetApodRequest = {}): Promise<ApodData | ApodData[]> {
    try {
      // Handle specific date request
      if (params.date) {
        return await this.getApodByDate(params.date);
      }

      // Handle date range request
      if (params.start_date && params.end_date) {
        return await this.getApodByDateRange(params.start_date, params.end_date);
      }

      // Handle random count request
      if (params.count) {
        return await this.getRandomApod(params.count);
      }

      // Default: get today's APOD
      const today = new Date().toISOString().split('T')[0];
      if (!today) {
        throw new Error('Failed to generate today\'s date');
      }
      return await this.getApodByDate(today);
    } catch (error) {
      throw new Error(`Failed to get APOD data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get APOD for a specific date with caching
   */
  async getApodByDate(date: string): Promise<ApodData> {
    try {
      // Try to get from local database first (if available)
      try {
        const cachedApod = await this.apodRepository.findByDate(date);

        if (cachedApod && this.isCacheValid(cachedApod)) {
          return this.documentToApodData(cachedApod);
        }
      } catch (dbError) {
        console.warn('Database not available, fetching directly from NASA API');
      }

      // Fetch from NASA API
      const apodData = await this.nasaApiService.getApodByDate(date);

      // Try to save to database for future requests (if available)
      try {
        await this.apodRepository.save(apodData);
      } catch (dbError) {
        console.warn('Could not save to database, continuing without caching');
      }

      return apodData;
    } catch (error) {
      // If NASA API fails, try to return cached data even if stale
      try {
        const cachedApod = await this.apodRepository.findByDate(date);
        if (cachedApod) {
          return this.documentToApodData(cachedApod);
        }
      } catch (dbError) {
        // Database not available
      }

      throw new Error(`Failed to get APOD for date ${date}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get APOD for a date range with intelligent caching
   */
  async getApodByDateRange(startDate: string, endDate: string): Promise<ApodData[]> {
    try {
      // Get cached data from database
      const cachedApods = await this.apodRepository.findByDateRange(startDate, endDate);
      const cachedDates = new Set(cachedApods.map(apod => apod.date));
      
      // Determine which dates need to be fetched from API
      const missingDates = this.getMissingDates(startDate, endDate, cachedDates);
      
      let newApods: ApodData[] = [];
      if (missingDates.length > 0) {
        // Fetch missing data from NASA API
        try {
          const firstDate = missingDates[0];
          const lastDate = missingDates[missingDates.length - 1];
          if (!firstDate || !lastDate) {
            throw new Error('Invalid date range for missing dates');
          }
          newApods = await this.nasaApiService.getApodByDateRange(firstDate, lastDate);
          
          // Save new data to database
          for (const apod of newApods) {
            await this.apodRepository.save(apod);
          }
        } catch (error) {
          console.warn(`Failed to fetch some APOD data from NASA API: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Combine cached and new data, sort by date descending
      const allApods = [
        ...cachedApods.map(doc => this.documentToApodData(doc)),
        ...newApods,
      ];

      return allApods
        .filter((apod, index, self) => 
          index === self.findIndex(a => a.date === apod.date)
        ) // Remove duplicates
        .sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      throw new Error(`Failed to get APOD for date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get random APOD entries
   */
  async getRandomApod(count: number): Promise<ApodData[]> {
    try {
      // For random requests, always fetch from NASA API
      const randomApods = await this.nasaApiService.getRandomApod(count);
      
      // Save to database for future caching
      for (const apod of randomApods) {
        try {
          await this.apodRepository.save(apod);
        } catch (error) {
          // Continue if individual save fails
          console.warn(`Failed to cache APOD for ${apod.date}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      return randomApods;
    } catch (error) {
      throw new Error(`Failed to get random APOD entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search APOD data in local database
   */
  async searchApod(query: string, limit: number = 20): Promise<ApodData[]> {
    try {
      const results = await this.apodRepository.search(query, limit);
      return results.map(doc => this.documentToApodData(doc));
    } catch (error) {
      throw new Error(`Failed to search APOD data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get latest APOD entries from database
   */
  async getLatestApod(limit: number = 10): Promise<ApodData[]> {
    try {
      const results = await this.apodRepository.findLatest(limit);
      return results.map(doc => this.documentToApodData(doc));
    } catch (error) {
      throw new Error(`Failed to get latest APOD entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get statistics about cached APOD data
   */
  async getStats(): Promise<{ totalEntries: number; latestDate: string | null }> {
    try {
      const totalEntries = await this.apodRepository.count();
      const latest = await this.apodRepository.findLatest(1);
      const latestDate = latest.length > 0 && latest[0] ? latest[0].date : null;
      
      return { totalEntries, latestDate };
    } catch (error) {
      throw new Error(`Failed to get APOD statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if cached data is still valid (within cache TTL)
   */
  private isCacheValid(document: IApodDocument): boolean {
    const cacheAgeMs = Date.now() - document.updatedAt.getTime();
    const cacheTtlMs = 24 * 60 * 60 * 1000; // 24 hours for APOD data
    return cacheAgeMs < cacheTtlMs;
  }

  /**
   * Convert Mongoose document to plain ApodData object
   */
  private documentToApodData(document: IApodDocument): ApodData {
    return {
      date: document.date,
      explanation: document.explanation,
      hdurl: document.hdurl || undefined,
      media_type: document.media_type,
      service_version: document.service_version,
      title: document.title,
      url: document.url,
      copyright: document.copyright || undefined,
    };
  }

  /**
   * Get array of missing dates between start and end date
   */
  private getMissingDates(startDate: string, endDate: string, existingDates: Set<string>): string[] {
    const missing: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      if (dateStr && !existingDates.has(dateStr)) {
        missing.push(dateStr);
      }
    }
    
    return missing;
  }
}

export default ApodService;
