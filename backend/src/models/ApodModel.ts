import mongoose, { Schema, Document } from 'mongoose';
import { ApodData } from '../types';

/**
 * APOD (Astronomy Picture of the Day) Database Model
 * Extends the base ApodData interface with Mongoose Document
 */
export interface IApodDocument extends ApodData, Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * APOD Schema Definition
 * Includes validation, indexing, and timestamps
 */
const ApodSchema = new Schema<IApodDocument>(
  {
    date: {
      type: String,
      required: [true, 'Date is required'],
      unique: true,
      index: true,
      validate: {
        validator: (value: string) => {
          // Validate YYYY-MM-DD format
          return /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        message: 'Date must be in YYYY-MM-DD format',
      },
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
      maxlength: [5000, 'Explanation cannot exceed 5000 characters'],
    },
    hdurl: {
      type: String,
      validate: {
        validator: (value: string) => {
          if (!value) return true; // Optional field
          return /^https?:\/\/.+/.test(value);
        },
        message: 'HD URL must be a valid HTTP/HTTPS URL',
      },
    },
    media_type: {
      type: String,
      required: [true, 'Media type is required'],
      enum: {
        values: ['image', 'video'],
        message: 'Media type must be either "image" or "video"',
      },
    },
    service_version: {
      type: String,
      required: [true, 'Service version is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      validate: {
        validator: (value: string) => {
          return /^https?:\/\/.+/.test(value);
        },
        message: 'URL must be a valid HTTP/HTTPS URL',
      },
    },
    copyright: {
      type: String,
      trim: true,
      maxlength: [200, 'Copyright cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'apod_data',
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
ApodSchema.index({ date: -1 });
ApodSchema.index({ createdAt: -1 });
ApodSchema.index({ title: 'text', explanation: 'text' });

/**
 * Static methods for the model
 */
ApodSchema.statics = {
  /**
   * Find APOD data by date range
   */
  findByDateRange: function (startDate: string, endDate: string) {
    return this.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 });
  },

  /**
   * Find latest APOD entries
   */
  findLatest: function (limit: number = 10) {
    return this.find().sort({ date: -1 }).limit(limit);
  },
};

export const ApodModel = mongoose.model<IApodDocument>('Apod', ApodSchema);
export default ApodModel;
