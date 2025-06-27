/**
 * Date utility functions for Mars Explorer application
 */

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
