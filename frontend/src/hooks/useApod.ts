import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ApodData, LoadingState } from '../types';
import { ApodService, apiClient } from '../services/api';
import { Utils } from '../utils';

/**
 * Hook for managing APOD data fetching and state
 */
export const useApod = (date?: string) => {
  const {
    data: apod,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['apod', date],
    queryFn: () => {
      if (date) {
        return apiClient.getApodByDate(date);
      }
      return ApodService.getTodaysApod();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    apod,
    isLoading,
    error: error ? Utils.Error.getUserFriendlyMessage(error) : null,
    refetch,
  };
};

/**
 * Hook for managing multiple APOD entries
 */
export const useApodList = () => {
  const [apods, setApods] = useState<ApodData[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const loadLatest = useCallback(async (limit: number = 10) => {
    setLoadingState({ isLoading: true, error: null });
    try {
      const data = await ApodService.getLatestApods(limit);
      setApods(data);
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: Utils.Error.getUserFriendlyMessage(error),
      });
      return;
    }
    setLoadingState({ isLoading: false, error: null });
  }, []);

  const loadRandom = useCallback(async (count: number = 5) => {
    setLoadingState({ isLoading: true, error: null });
    try {
      const data = await ApodService.getRandomApods(count);
      setApods(data);
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: Utils.Error.getUserFriendlyMessage(error),
      });
      return;
    }
    setLoadingState({ isLoading: false, error: null });
  }, []);

  const loadDateRange = useCallback(async (startDate: string, endDate: string) => {
    if (!ApodService.validateDateRange(startDate, endDate)) {
      setLoadingState({
        isLoading: false,
        error: 'Invalid date range. Please check your dates.',
      });
      return;
    }

    setLoadingState({ isLoading: true, error: null });
    try {
      const data = await ApodService.getApodRange(startDate, endDate);
      setApods(data);
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: Utils.Error.getUserFriendlyMessage(error),
      });
      return;
    }
    setLoadingState({ isLoading: false, error: null });
  }, []);

  const addApod = useCallback((apod: ApodData) => {
    setApods(prev => {
      const exists = prev.some(item => item.date === apod.date);
      if (exists) return prev;
      return [apod, ...prev];
    });
  }, []);

  const removeApod = useCallback((date: string) => {
    setApods(prev => prev.filter(item => item.date !== date));
  }, []);

  const clearApods = useCallback(() => {
    setApods([]);
    setLoadingState({ isLoading: false, error: null });
  }, []);

  return {
    apods,
    ...loadingState,
    loadLatest,
    loadRandom,
    loadDateRange,
    addApod,
    removeApod,
    clearApods,
  };
};

/**
 * Hook for APOD search functionality
 */
export const useApodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApodData[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const search = useCallback(async (searchQuery: string, limit: number = 20) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoadingState({ isLoading: true, error: null });
    setQuery(searchQuery);

    try {
      const data = await ApodService.searchApods(searchQuery, limit);
      setResults(data);
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: Utils.Error.getUserFriendlyMessage(error),
      });
      return;
    }
    setLoadingState({ isLoading: false, error: null });
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setLoadingState({ isLoading: false, error: null });
  }, []);

  return {
    query,
    results,
    ...loadingState,
    search,
    clearSearch,
  };
};

/**
 * Hook for managing favorites
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<ApodData[]>([]);

  useEffect(() => {
    setFavorites(Utils.Favorites.getFavorites());
  }, []);

  const addFavorite = useCallback((apod: ApodData) => {
    Utils.Favorites.addFavorite(apod);
    setFavorites(Utils.Favorites.getFavorites());
  }, []);

  const removeFavorite = useCallback((date: string) => {
    Utils.Favorites.removeFavorite(date);
    setFavorites(Utils.Favorites.getFavorites());
  }, []);

  const toggleFavorite = useCallback((apod: ApodData) => {
    const isFavorite = Utils.Favorites.toggleFavorite(apod);
    setFavorites(Utils.Favorites.getFavorites());
    return isFavorite;
  }, []);

  const isFavorite = useCallback((date: string) => {
    return Utils.Favorites.isFavorite(date);
  }, []);

  const clearFavorites = useCallback(() => {
    Utils.Storage.remove('FAVORITES');
    setFavorites([]);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  };
};

/**
 * Hook for image preloading
 */
export const useImagePreload = (src?: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setIsLoaded(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    Utils.Image.preloadImage(src)
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load image');
        setIsLoading(false);
      });
  }, [src]);

  return { isLoaded, isLoading, error };
};

/**
 * Hook for debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for local storage
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};
