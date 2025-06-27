// First, let's create a simple date utility file to test
// This will be a common utility for date formatting in Mars applications

export const formatMarsDate = (earthDate: string): string => {
  try {
    const date = new Date(earthDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return earthDate;
  }
};

export const formatSol = (sol: number): string => {
  return `Sol ${sol.toLocaleString()}`;
};

export const calculateMissionDuration = (landingDate: string): number => {
  const landing = new Date(landingDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - landing.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isValidEarthDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isValidSol = (sol: number): boolean => {
  return Number.isInteger(sol) && sol >= 0 && sol <= 10000; // Reasonable range for Mars sols
};

export const convertSolToEarthDate = (sol: number, landingDate: string): string => {
  try {
    const landing = new Date(landingDate);
    // Mars sol is approximately 24 hours, 39 minutes, 35 seconds
    const marsDay = 24 * 60 * 60 * 1000 + 39 * 60 * 1000 + 35 * 1000;
    const earthDate = new Date(landing.getTime() + (sol * marsDay));
    return earthDate.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// Test file
describe('dateUtils', () => {
  describe('formatMarsDate', () => {
    it('formats valid date correctly', () => {
      const result = formatMarsDate('2023-01-15');
      expect(result).toBe('Jan 15, 2023');
    });

    it('handles invalid date gracefully', () => {
      const result = formatMarsDate('invalid-date');
      expect(result).toBe('invalid-date');
    });

    it('formats edge case dates', () => {
      const result = formatMarsDate('2012-08-05'); // Curiosity landing date
      expect(result).toBe('Aug 5, 2012');
    });
  });

  describe('formatSol', () => {
    it('formats sol number correctly', () => {
      const result = formatSol(1000);
      expect(result).toBe('Sol 1,000');
    });

    it('formats single digit sol', () => {
      const result = formatSol(1);
      expect(result).toBe('Sol 1');
    });

    it('formats large sol numbers', () => {
      const result = formatSol(4567);
      expect(result).toBe('Sol 4,567');
    });
  });

  describe('calculateMissionDuration', () => {
    it('calculates mission duration correctly', () => {
      const landingDate = '2012-08-05'; // Curiosity landing
      const result = calculateMissionDuration(landingDate);
      
      // Should be a positive number representing days
      expect(result).toBeGreaterThan(0);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('handles future dates', () => {
      const futureDate = '2030-01-01';
      const result = calculateMissionDuration(futureDate);
      
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('isValidEarthDate', () => {
    it('validates correct date format', () => {
      expect(isValidEarthDate('2023-01-15')).toBe(true);
      expect(isValidEarthDate('2012-08-05')).toBe(true);
    });

    it('rejects invalid dates', () => {
      expect(isValidEarthDate('invalid-date')).toBe(false);
      expect(isValidEarthDate('2023-13-01')).toBe(false);
      expect(isValidEarthDate('2023-01-32')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(isValidEarthDate('')).toBe(false);
      expect(isValidEarthDate('2023-02-29')).toBe(false); // Not a leap year
      expect(isValidEarthDate('2024-02-29')).toBe(true);  // Leap year
    });
  });

  describe('isValidSol', () => {
    it('validates correct sol numbers', () => {
      expect(isValidSol(0)).toBe(true);
      expect(isValidSol(1000)).toBe(true);
      expect(isValidSol(4567)).toBe(true);
    });

    it('rejects invalid sol numbers', () => {
      expect(isValidSol(-1)).toBe(false);
      expect(isValidSol(10001)).toBe(false);
      expect(isValidSol(1.5)).toBe(false);
      expect(isValidSol(NaN)).toBe(false);
    });
  });

  describe('convertSolToEarthDate', () => {
    it('converts sol to approximate earth date', () => {
      const landingDate = '2012-08-05';
      const result = convertSolToEarthDate(0, landingDate);
      expect(result).toBe('2012-08-05');
    });

    it('converts sol 1000 correctly', () => {
      const landingDate = '2012-08-05';
      const result = convertSolToEarthDate(1000, landingDate);
      
      // Should be a valid date string
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(isValidEarthDate(result)).toBe(true);
    });

    it('handles invalid landing date', () => {
      const result = convertSolToEarthDate(100, 'invalid-date');
      expect(result).toBe('');
    });
  });
});
