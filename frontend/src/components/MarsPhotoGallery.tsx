import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, 
  List, 
  Filter, 
  Search, 
  Calendar,
  Camera,
  Shuffle,
  Download,
  Heart,
  Loader2
} from 'lucide-react';
import MarsPhotoCard from './MarsPhotoCard';
import MarsPhotoModal from './MarsPhotoModal';
import type { MarsPhoto, MarsCamera } from '../types';
import { MarsService } from '../services/marsApi';

interface MarsPhotoGalleryProps {
  photos: MarsPhoto[];
  cameras: MarsCamera[];
  loading?: boolean;
  onLoadMore?: () => void;
  onFilterChange?: (filters: GalleryFilters) => void;
  onPhotoSelect?: (photo: MarsPhoto) => void;
  onFavorite?: (photo: MarsPhoto) => void;
  favorites?: MarsPhoto[];
  selectedPhotos?: MarsPhoto[];
  onPhotoSelection?: (photo: MarsPhoto) => void;
  onAIAnalysis?: (photo: MarsPhoto) => void;
  className?: string;
}

interface GalleryFilters {
  camera?: string;
  sol?: number;
  earthDate?: string;
  searchTerm?: string;
}

/**
 * Mars Photo Gallery Component
 * Beautiful grid layout for displaying Mars rover photos
 */
const MarsPhotoGallery: React.FC<MarsPhotoGalleryProps> = ({
  photos,
  cameras,
  loading = false,
  onLoadMore,
  onFilterChange,
  onPhotoSelect,
  onFavorite,
  favorites: externalFavorites = [],
  selectedPhotos = [],
  onPhotoSelection,
  onAIAnalysis,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<MarsPhoto | null>(null);
  const [filters, setFilters] = useState<GalleryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filteredPhotos, setFilteredPhotos] = useState<MarsPhoto[]>(photos);

  // Convert external favorites to Set for quick lookup
  const favoriteIds = new Set(externalFavorites.map(fav => fav.id));

  // Update filtered photos when photos or filters change
  useEffect(() => {
    let filtered = [...photos];

    // Apply camera filter
    if (filters.camera) {
      filtered = filtered.filter(photo => photo.camera.name === filters.camera);
    }

    // Apply sol filter
    if (filters.sol !== undefined) {
      filtered = filtered.filter(photo => photo.sol === filters.sol);
    }

    // Apply earth date filter
    if (filters.earthDate) {
      filtered = filtered.filter(photo => photo.earth_date === filters.earthDate);
    }

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(photo => 
        photo.camera.name.toLowerCase().includes(searchLower) ||
        photo.camera.full_name.toLowerCase().includes(searchLower) ||
        photo.rover.name.toLowerCase().includes(searchLower) ||
        photo.earth_date.includes(searchLower) ||
        photo.sol.toString().includes(searchLower)
      );
    }

    setFilteredPhotos(filtered);
  }, [photos, filters]);

  const handleFilterChange = (newFilters: Partial<GalleryFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleFavorite = (photo: MarsPhoto) => {
    if (onFavorite) {
      onFavorite(photo);
    }
  };

  const handlePhotoClick = (photo: MarsPhoto) => {
    if (onPhotoSelect) {
      onPhotoSelect(photo);
    } else {
      setSelectedPhoto(photo);
    }
  };

  const handlePhotoSelection = (photo: MarsPhoto) => {
    if (onPhotoSelection) {
      onPhotoSelection(photo);
    }
  };

  const handleRandomize = () => {
    const randomSol = Math.floor(Math.random() * 3000) + 1;
    handleFilterChange({ sol: randomSol });
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
            🚀 Mars Photo Gallery
          </h2>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-16">
          {/* Photo Count Badge */}
          <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl border border-red-500/30 shadow-lg shadow-red-500/10">
            <Camera className="w-4 h-4 text-red-300" />
            <span className="text-red-200 font-semibold text-sm">
              {filteredPhotos.length}
            </span>
            <span className="text-red-300/80 text-sm">
              {filteredPhotos.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)',
              border: showFilters ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
              background: showFilters ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: showFilters ? '#fca5a5' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: showFilters ? '0 10px 25px rgba(239, 68, 68, 0.1)' : 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!showFilters) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilters) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            <span>Filters</span>
          </button>

          <button
            onClick={handleRandomize}
            title="Random Sol"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <Shuffle style={{ width: '16px', height: '16px' }} />
          </button>

          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '4px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(4px)'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                border: 'none',
                background: viewMode === 'grid' ? '#ef4444' : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                boxShadow: viewMode === 'grid' ? '0 10px 25px rgba(239, 68, 68, 0.25)' : 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'grid') {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'grid') {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Grid style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                border: 'none',
                background: viewMode === 'list' ? '#ef4444' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                boxShadow: viewMode === 'list' ? '0 10px 25px rgba(239, 68, 68, 0.25)' : 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'list') {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'list') {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <List style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search photos..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Camera Filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Camera
                </label>
                <div className="relative">
                  <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select
                    value={filters.camera || ''}
                    onChange={(e) => handleFilterChange({ camera: e.target.value || undefined })}
                    className="input pl-10 appearance-none"
                  >
                    <option value="">All Cameras</option>
                    {cameras.map((camera) => (
                      <option key={camera.name} value={camera.name}>
                        {camera.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sol Filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Sol (Martian Day)
                </label>
                <input
                  type="number"
                  placeholder="Enter Sol..."
                  min="0"
                  max="4000"
                  value={filters.sol || ''}
                  onChange={(e) => handleFilterChange({
                    sol: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="input"
                />
              </div>

              {/* Earth Date Filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Earth Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="date"
                    min="2012-08-05"
                    max={new Date().toISOString().split('T')[0]}
                    value={filters.earthDate || ''}
                    onChange={(e) => handleFilterChange({ earthDate: e.target.value || undefined })}
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={() => {
                  // Trigger a search with current filters
                  onFilterChange?.(filters);
                }}
                className="btn-primary text-sm"
              >
                Search Photos
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-red-400 animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading Mars photos...</p>
            </div>
          </motion.div>
        ) : filteredPhotos.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Camera className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No photos found</h3>
            <p className="text-white/60 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-3 ${
              viewMode === 'grid'
                ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'
                : 'grid-cols-1'
            }`}
          >
            {filteredPhotos.map((photo) => (
              <motion.div key={photo.id} variants={itemVariants}>
                <MarsPhotoCard
                  photo={photo}
                  onFavorite={handleFavorite}
                  isFavorite={favoriteIds.has(photo.id)}
                  onImageClick={handlePhotoClick}
                  onSelect={handlePhotoSelection}
                  isSelected={selectedPhotos.some(p => p.id === photo.id)}
                  viewMode={viewMode}
                  onAIAnalysis={onAIAnalysis}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More Button */}
      {onLoadMore && filteredPhotos.length > 0 && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Photos'
            )}
          </button>
        </div>
      )}

      {/* Photo Modal */}
      <MarsPhotoModal
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onFavorite={handleFavorite}
        isFavorite={selectedPhoto ? favoriteIds.has(selectedPhoto.id) : false}
      />
    </div>
  );
};

export default MarsPhotoGallery;
