import { ApodModel, IApodDocument } from '../models/ApodModel';
import { ApodData } from '../types';

/**
 * APOD Repository - Data Access Layer
 * Handles all database operations for APOD data
 * Implements Repository Pattern for clean separation of concerns
 */
export class ApodRepository {
  /**
   * Save APOD data to database
   */
  async save(apodData: ApodData): Promise<IApodDocument> {
    try {
      const existingApod = await ApodModel.findOne({ date: apodData.date });
      
      if (existingApod) {
        // Update existing record
        Object.assign(existingApod, apodData);
        return await existingApod.save();
      }
      
      // Create new record
      const newApod = new ApodModel(apodData);
      return await newApod.save();
    } catch (error) {
      throw new Error(`Failed to save APOD data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find APOD data by date
   */
  async findByDate(date: string): Promise<IApodDocument | null> {
    try {
      return await ApodModel.findOne({ date });
    } catch (error) {
      throw new Error(`Failed to find APOD by date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find APOD data by date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<IApodDocument[]> {
    try {
      return await ApodModel.find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: -1 });
    } catch (error) {
      throw new Error(`Failed to find APOD by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find latest APOD entries
   */
  async findLatest(limit: number = 10): Promise<IApodDocument[]> {
    try {
      return await ApodModel.find()
        .sort({ date: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Failed to find latest APOD entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search APOD data by title or explanation
   */
  async search(query: string, limit: number = 20): Promise<IApodDocument[]> {
    try {
      return await ApodModel.find({
        $text: { $search: query },
      })
        .sort({ score: { $meta: 'textScore' }, date: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Failed to search APOD data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get total count of APOD entries
   */
  async count(): Promise<number> {
    try {
      return await ApodModel.countDocuments();
    } catch (error) {
      throw new Error(`Failed to count APOD entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete APOD data by date
   */
  async deleteByDate(date: string): Promise<boolean> {
    try {
      const result = await ApodModel.deleteOne({ date });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete APOD data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if APOD data exists for a specific date
   */
  async exists(date: string): Promise<boolean> {
    try {
      const count = await ApodModel.countDocuments({ date });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check APOD existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default ApodRepository;
