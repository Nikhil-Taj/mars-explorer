import { useState, useEffect, useCallback } from 'react';
import type { MarsPhoto } from '../types';

interface FavoritePhoto extends MarsPhoto {
  favoriteDate: string;
  tags?: string[];
  notes?: string;
}

interface FavoritesData {
  photos: FavoritePhoto[];
  collections: FavoriteCollection[];
}

interface FavoriteCollection {
  id: string;
  name: string;
  description: string;
  photoIds: number[];
  createdDate: string;
  color: string;
}

const STORAGE_KEY = 'mars-explorer-favorites';
const MAX_FAVORITES = 500; // Reasonable limit

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoritesData>({
    photos: [],
    collections: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  const saveFavorites = useCallback((newFavorites: FavoritesData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, []);

  // Add photo to favorites
  const addToFavorites = useCallback((photo: MarsPhoto, tags?: string[], notes?: string) => {
    setFavorites(prev => {
      // Check if already favorited
      if (prev.photos.some(fav => fav.id === photo.id)) {
        return prev;
      }

      // Check favorites limit
      if (prev.photos.length >= MAX_FAVORITES) {
        throw new Error(`Maximum ${MAX_FAVORITES} favorites allowed`);
      }

      const favoritePhoto: FavoritePhoto = {
        ...photo,
        favoriteDate: new Date().toISOString(),
        tags: tags || [],
        notes: notes || '',
      };

      const newFavorites = {
        ...prev,
        photos: [...prev.photos, favoritePhoto],
      };

      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Remove photo from favorites
  const removeFromFavorites = useCallback((photoId: number) => {
    setFavorites(prev => {
      const newFavorites = {
        ...prev,
        photos: prev.photos.filter(fav => fav.id !== photoId),
        collections: prev.collections.map(collection => ({
          ...collection,
          photoIds: collection.photoIds.filter(id => id !== photoId),
        })),
      };

      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Check if photo is favorited
  const isFavorite = useCallback((photoId: number) => {
    return favorites.photos.some(fav => fav.id === photoId);
  }, [favorites.photos]);

  // Toggle favorite status
  const toggleFavorite = useCallback((photo: MarsPhoto) => {
    if (isFavorite(photo.id)) {
      removeFromFavorites(photo.id);
    } else {
      addToFavorites(photo);
    }
  }, [isFavorite, removeFromFavorites, addToFavorites]);

  // Update favorite photo metadata
  const updateFavorite = useCallback((photoId: number, updates: Partial<Pick<FavoritePhoto, 'tags' | 'notes'>>) => {
    setFavorites(prev => {
      const newFavorites = {
        ...prev,
        photos: prev.photos.map(fav => 
          fav.id === photoId ? { ...fav, ...updates } : fav
        ),
      };

      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Create new collection
  const createCollection = useCallback((name: string, description: string, color: string = '#ef4444') => {
    const newCollection: FavoriteCollection = {
      id: Date.now().toString(),
      name,
      description,
      photoIds: [],
      createdDate: new Date().toISOString(),
      color,
    };

    setFavorites(prev => {
      const newFavorites = {
        ...prev,
        collections: [...prev.collections, newCollection],
      };

      saveFavorites(newFavorites);
      return newFavorites;
    });

    return newCollection.id;
  }, [saveFavorites]);

  // Add photo to collection
  const addToCollection = useCallback((photoId: number, collectionId: string) => {
    setFavorites(prev => {
      const newFavorites = {
        ...prev,
        collections: prev.collections.map(collection =>
          collection.id === collectionId && !collection.photoIds.includes(photoId)
            ? { ...collection, photoIds: [...collection.photoIds, photoId] }
            : collection
        ),
      };

      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Remove photo from collection
  const removeFromCollection = useCallback((photoId: number, collectionId: string) => {
    setFavorites(prev => {
      const newFavorites = {
        ...prev,
        collections: prev.collections.map(collection =>
          collection.id === collectionId
            ? { ...collection, photoIds: collection.photoIds.filter(id => id !== photoId) }
            : collection
        ),
      };

      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Delete collection
  const deleteCollection = useCallback((collectionId: string) => {
    setFavorites(prev => {
      const newFavorites = {
        ...prev,
        collections: prev.collections.filter(collection => collection.id !== collectionId),
      };

      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Get photos in collection
  const getCollectionPhotos = useCallback((collectionId: string): FavoritePhoto[] => {
    const collection = favorites.collections.find(c => c.id === collectionId);
    if (!collection) return [];

    return favorites.photos.filter(photo => collection.photoIds.includes(photo.id));
  }, [favorites]);

  // Search favorites
  const searchFavorites = useCallback((query: string): FavoritePhoto[] => {
    const lowercaseQuery = query.toLowerCase();
    return favorites.photos.filter(photo => 
      photo.camera.name.toLowerCase().includes(lowercaseQuery) ||
      photo.camera.full_name.toLowerCase().includes(lowercaseQuery) ||
      photo.earth_date.includes(lowercaseQuery) ||
      photo.sol.toString().includes(lowercaseQuery) ||
      (photo.tags && photo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))) ||
      (photo.notes && photo.notes.toLowerCase().includes(lowercaseQuery))
    );
  }, [favorites.photos]);

  // Get favorites statistics
  const getStats = useCallback(() => {
    const totalFavorites = favorites.photos.length;
    const totalCollections = favorites.collections.length;
    
    const cameraStats = favorites.photos.reduce((acc, photo) => {
      acc[photo.camera.name] = (acc[photo.camera.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoritesByMonth = favorites.photos.reduce((acc, photo) => {
      const month = photo.favoriteDate.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFavorites,
      totalCollections,
      cameraStats,
      favoritesByMonth,
      oldestFavorite: favorites.photos.length > 0 
        ? favorites.photos.reduce((oldest, photo) => 
            photo.favoriteDate < oldest.favoriteDate ? photo : oldest
          ).favoriteDate
        : null,
      newestFavorite: favorites.photos.length > 0
        ? favorites.photos.reduce((newest, photo) => 
            photo.favoriteDate > newest.favoriteDate ? photo : newest
          ).favoriteDate
        : null,
    };
  }, [favorites]);

  // Export favorites
  const exportFavorites = useCallback(() => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mars-explorer-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [favorites]);

  // Import favorites
  const importFavorites = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (imported.photos && imported.collections) {
            saveFavorites(imported);
            resolve();
          } else {
            reject(new Error('Invalid favorites file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [saveFavorites]);

  // Clear all favorites
  const clearAllFavorites = useCallback(() => {
    const emptyFavorites: FavoritesData = { photos: [], collections: [] };
    saveFavorites(emptyFavorites);
  }, [saveFavorites]);

  return {
    favorites: favorites.photos,
    collections: favorites.collections,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    updateFavorite,
    createCollection,
    addToCollection,
    removeFromCollection,
    deleteCollection,
    getCollectionPhotos,
    searchFavorites,
    getStats,
    exportFavorites,
    importFavorites,
    clearAllFavorites,
  };
};
