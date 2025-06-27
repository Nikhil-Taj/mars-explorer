import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Heart, 
  Share2, 
  Info, 
  Calendar,
  Camera,
  MapPin,
  Clock,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import type { MarsPhoto } from '../types';
import { MarsService } from '../services/marsApi';

interface MarsPhotoModalProps {
  photo: MarsPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onFavorite?: (photo: MarsPhoto) => void;
  isFavorite?: boolean;
}

/**
 * Mars Photo Modal Component
 * Full-screen modal for viewing Mars photos with detailed information
 */
const MarsPhotoModal: React.FC<MarsPhotoModalProps> = ({
  photo,
  isOpen,
  onClose,
  onFavorite,
  isFavorite = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setZoom(1);
      setRotation(0);
      setShowInfo(false);
    }
  }, [isOpen, photo]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'i':
        case 'I':
          setShowInfo(!showInfo);
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 0.25, 3));
          break;
        case '-':
          setZoom(prev => Math.max(prev - 0.25, 0.5));
          break;
        case 'r':
        case 'R':
          setRotation(prev => (prev + 90) % 360);
          break;
        case '0':
          setZoom(1);
          setRotation(0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showInfo]);

  const handleDownload = async () => {
    if (!photo) return;
    
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

  const handleShare = async () => {
    if (!photo) return;

    const shareData = {
      title: `Mars Photo - ${photo.camera.full_name}`,
      text: `Check out this amazing Mars photo taken by ${photo.rover.name} on Sol ${photo.sol}!`,
      url: photo.img_src,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(photo.img_src);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  if (!photo) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-7xl max-h-[90vh] w-full mx-4 bg-gray-900/95 backdrop-blur-md rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-white">
                    {MarsService.getCameraDisplayName(photo.camera.name)}
                  </h2>
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                    {MarsService.formatSol(photo.sol)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Action Buttons */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onFavorite?.(photo)}
                    className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                      isFavorite 
                        ? 'bg-red-500/80 text-white' 
                        : 'bg-white/20 text-white hover:bg-red-500/80'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-blue-500/80 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-green-500/80 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowInfo(!showInfo)}
                    className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                      showInfo 
                        ? 'bg-blue-500/80 text-white' 
                        : 'bg-white/20 text-white hover:bg-blue-500/80'
                    }`}
                  >
                    <Info className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-red-500/80 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Image Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2">
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-1 text-white hover:text-red-400 transition-colors"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                
                <span className="text-white text-sm min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                  className="p-1 text-white hover:text-red-400 transition-colors"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                
                <div className="w-px h-4 bg-white/30 mx-2" />
                
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1 text-white hover:text-red-400 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                  }}
                  className="px-2 py-1 text-xs text-white hover:text-red-400 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex h-full">
              {/* Image Container */}
              <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-16 overflow-hidden">
                <motion.img
                  src={photo.img_src}
                  alt={`Mars photo from ${photo.camera.full_name} on Sol ${photo.sol}`}
                  className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease',
                  }}
                  onLoad={() => setImageLoaded(true)}
                  drag
                  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                />
              </div>

              {/* Info Panel */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-80 bg-gray-800/95 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">Photo Details</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Camera className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-white font-medium">{photo.camera.full_name}</p>
                          <p className="text-white/60 text-sm">{photo.camera.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">
                            {MarsService.formatEarthDate(photo.earth_date)}
                          </p>
                          <p className="text-white/60 text-sm">Earth Date</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-white font-medium">Sol {photo.sol}</p>
                          <p className="text-white/60 text-sm">Martian Day</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">{photo.rover.name}</p>
                          <p className="text-white/60 text-sm">Mars Rover</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <h4 className="text-white font-medium mb-2">Technical Info</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Photo ID:</span>
                            <span className="text-white">#{photo.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Rover Status:</span>
                            <span className={`capitalize ${
                              photo.rover.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                              {photo.rover.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Landing Date:</span>
                            <span className="text-white">
                              {MarsService.formatEarthDate(photo.rover.landing_date)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Mission Duration:</span>
                            <span className="text-white">
                              {MarsService.calculateMissionDuration(photo.rover.landing_date)} days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="absolute bottom-4 right-4 text-xs text-white/40">
              Press 'i' for info, '+/-' to zoom, 'r' to rotate, 'Esc' to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MarsPhotoModal;
