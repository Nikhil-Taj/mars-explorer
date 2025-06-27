import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Calendar,
  Heart,
  Download,
  Maximize2,
  Info,
  MapPin,
  Clock,
  Brain
} from 'lucide-react';
import type { MarsPhoto } from '../types';
import { MarsService } from '../services/marsApi';

interface MarsPhotoCardProps {
  photo: MarsPhoto;
  onFavorite?: (photo: MarsPhoto) => void;
  isFavorite?: boolean;
  onImageClick?: (photo: MarsPhoto) => void;
  onSelect?: (photo: MarsPhoto) => void;
  isSelected?: boolean;
  viewMode?: 'grid' | 'list';
  onAIAnalysis?: (photo: MarsPhoto) => void;
  className?: string;
}

/**
 * Mars Photo Card Component
 * Beautiful card displaying Mars rover photos with animations
 */
const MarsPhotoCard: React.FC<MarsPhotoCardProps> = ({
  photo,
  onFavorite,
  isFavorite = false,
  onImageClick,
  onSelect,
  isSelected = false,
  viewMode = 'grid',
  onAIAnalysis,
  className = '',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(photo);
  };

  const handleImageClick = () => {
    onImageClick?.(photo);
  };

  const handleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(photo);
    }
  };

  const handleAIAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAIAnalysis) {
      onAIAnalysis(photo);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(photo.img_src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mars-${photo.rover.name}-sol${photo.sol}-${photo.camera.name}-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={`group relative card overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-slate-900' : ''
      } ${className}`}
      onClick={handleImageClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-red-900/20 to-orange-900/20 h-20 sm:h-24 md:h-28">
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-12 h-12 text-red-400/50 animate-pulse" />
            </div>
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-gray-900/30 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-red-400/70 mx-auto mb-2" />
              <p className="text-red-300/70 text-sm">Image unavailable</p>
            </div>
          </div>
        )}

        {/* Main Image */}
        <motion.img
          src={photo.img_src}
          alt={`Mars photo from ${photo.camera.full_name} on Sol ${photo.sol}`}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Selection Checkbox */}
        {onSelect && (
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSelection}
              className={`w-5 h-5 rounded border-2 backdrop-blur-md transition-all ${
                isSelected
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-white/20 border-white/40 text-white hover:border-red-400'
              }`}
              aria-label={isSelected ? 'Deselect photo' : 'Select photo for comparison'}
            >
              {isSelected && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </motion.button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-1 right-1 flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className={`p-1 rounded-full backdrop-blur-md transition-colors ${
              isFavorite
                ? 'bg-red-500/80 text-white'
                : 'bg-white/20 text-white hover:bg-red-500/80'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-2.5 h-2.5 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            className="p-1 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-blue-500/80 transition-colors"
            aria-label="Download image"
          >
            <Download className="w-2.5 h-2.5" />
          </motion.button>

          {/* AI Analysis Button */}
          {onAIAnalysis && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAIAnalysis}
              className="p-1 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-purple-500/80 transition-colors"
              aria-label="AI Analysis"
            >
              <Brain className="w-2.5 h-2.5" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="p-1 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-green-500/80 transition-colors"
            aria-label="Toggle details"
          >
            <Info className="w-2.5 h-2.5" />
          </motion.button>
        </div>

        {/* Expand Icon */}
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-1 rounded-full bg-white/20 backdrop-blur-md text-white"
          >
            <Maximize2 className="w-2.5 h-2.5" />
          </motion.div>
        </div>
      </div>

      {/* Photo Info */}
      <div className="p-1.5">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-medium text-white text-xs truncate">
            {MarsService.getCameraDisplayName(photo.camera.name)}
          </h3>
          <span className="text-red-400 text-xs font-medium">
            Sol {photo.sol}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center space-x-0.5">
            <Calendar className="w-2.5 h-2.5" />
            <span className="text-xs">{MarsService.formatEarthDate(photo.earth_date)}</span>
          </div>
          <div className="flex items-center space-x-0.5">
            <MapPin className="w-2.5 h-2.5" />
            <span className="text-xs">{photo.rover.name}</span>
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-white/10"
            >
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex justify-between">
                  <span>Photo ID:</span>
                  <span className="text-white/80">#{photo.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Camera:</span>
                  <span className="text-white/80">{photo.camera.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rover Status:</span>
                  <span className={`capitalize ${
                    photo.rover.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {photo.rover.status}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-xl" />
      </div>
    </motion.div>
  );
};

export default MarsPhotoCard;
