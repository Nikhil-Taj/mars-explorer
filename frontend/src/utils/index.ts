import type { StorageKeys } from '../types';

/**
 * Date Utilities
 */
export class DateUtils {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  static getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date in YYYY-MM-DD format
   */
  static getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
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
   * Format date for input field
   */
  static formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date range for the past N days
   */
  static getDateRange(days: number): { start: string; end: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    return {
      start: this.formatDateForInput(start),
      end: this.formatDateForInput(end),
    };
  }

  /**
   * Check if date is valid APOD date
   */
  static isValidApodDate(date: string): boolean {
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
}

/**
 * Local Storage Utilities
 */
export class StorageUtils {
  /**
   * Save data to localStorage
   */
  static save<T>(key: keyof StorageKeys, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  }

  /**
   * Load data from localStorage
   */
  static load<T>(key: keyof StorageKeys): T | null {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Failed to load from localStorage:`, error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  static remove(key: keyof StorageKeys): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage:`, error);
    }
  }

  /**
   * Clear all app data from localStorage
   */
  static clearAll(): void {
    const keys: (keyof StorageKeys)[] = ['FAVORITES', 'THEME', 'LAST_VIEWED'];
    keys.forEach(key => this.remove(key));
  }
}



/**
 * URL Utilities
 */
export class UrlUtils {
  /**
   * Get share URL for APOD
   */
  static getShareUrl(date: string): string {
    return `${window.location.origin}/apod/${date}`;
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Share using Web Share API if available
   */
  static async share(data: { title: string; text: string; url: string }): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Failed to share:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Open URL in new tab
   */
  static openInNewTab(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Image Utilities
 */
export class ImageUtils {
  /**
   * Preload image
   */
  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Get image dimensions
   */
  static getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Check if image URL is valid
   */
  static async isValidImageUrl(url: string): Promise<boolean> {
    try {
      await this.preloadImage(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Performance Utilities
 */
export class PerformanceUtils {
  /**
   * Debounce function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Measure execution time
   */
  static measureTime<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
}

/**
 * Validation Utilities
 */
export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize HTML string
   */
  static sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
}

/**
 * Error Utilities
 */
export class ErrorUtils {
  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('Network')) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      if (error.message.includes('404')) {
        return 'The requested data was not found.';
      }
      if (error.message.includes('500')) {
        return 'Server error. Please try again later.';
      }
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Log error with context
   */
  static logError(error: unknown, context?: string): void {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error('🚨 Application Error:', errorInfo);
    
    // In production, you might want to send this to an error tracking service
    if (import.meta.env.PROD) {
      // Example: sendToErrorTrackingService(errorInfo);
    }
  }
}

// Export all utilities as a single object for convenience
export const Utils = {
  Date: DateUtils,
  Storage: StorageUtils,
  Url: UrlUtils,
  Image: ImageUtils,
  Performance: PerformanceUtils,
  Validation: ValidationUtils,
  Error: ErrorUtils,
};
