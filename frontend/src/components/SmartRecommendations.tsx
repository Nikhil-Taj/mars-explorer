import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Camera, 
  Calendar,
  MapPin,
  Star,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import type { MarsPhoto, MarsCamera } from '../types';
import { useFavorites } from '../hooks/useFavorites';

interface SmartRecommendationsProps {
  photos: MarsPhoto[];
  cameras: MarsCamera[];
  onPhotoSelect: (photo: MarsPhoto) => void;
  onSearchRecommendation: (filters: any) => void;
  className?: string;
}

interface Recommendation {
  id: string;
  type: 'photo' | 'search' | 'collection';
  title: string;
  description: string;
  confidence: number;
  data: any;
  icon: React.ComponentType<any>;
  action: string;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  photos,
  cameras,
  onPhotoSelect,
  onSearchRecommendation,
  className = '',
}) => {
  const { favorites, getStats } = useFavorites();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const favStats = getStats();

  // Generate recommendations based on user behavior
  const generateRecommendations = useMemo(() => {
    const recs: Recommendation[] = [];

    // 1. Recommend photos from favorite camera
    if (favStats.totalFavorites > 0) {
      const favoriteCamera = Object.entries(favStats.cameraStats)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (favoriteCamera) {
        const [cameraName] = favoriteCamera;
        const similarPhotos = photos.filter(p => 
          p.camera.name === cameraName && 
          !favorites.some(f => f.id === p.id)
        ).slice(0, 3);

        if (similarPhotos.length > 0) {
          recs.push({
            id: 'favorite-camera',
            type: 'photo',
            title: `More from ${cameraName}`,
            description: `Based on your ${favStats.cameraStats[cameraName]} favorites from this camera`,
            confidence: 0.9,
            data: similarPhotos,
            icon: Camera,
            action: 'View Photos',
          });
        }
      }
    }

    // 2. Recommend recent sols if user likes recent photos
    const recentFavorites = favorites.filter(f => {
      const favDate = new Date(f.favoriteDate);
      const daysSince = (Date.now() - favDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    if (recentFavorites.length >= 2) {
      const avgSol = recentFavorites.reduce((sum, f) => sum + f.sol, 0) / recentFavorites.length;
      const recentSolPhotos = photos.filter(p => 
        Math.abs(p.sol - avgSol) <= 50 && 
        !favorites.some(f => f.id === p.id)
      ).slice(0, 3);

      if (recentSolPhotos.length > 0) {
        recs.push({
          id: 'recent-sols',
          type: 'photo',
          title: 'Recent Mars Activity',
          description: `Photos from sols around ${Math.round(avgSol)}`,
          confidence: 0.8,
          data: recentSolPhotos,
          icon: Clock,
          action: 'Explore Timeline',
        });
      }
    }

    // 3. Recommend unexplored cameras
    const usedCameras = new Set(favorites.map(f => f.camera.name));
    const unusedCameras = cameras.filter(c => !usedCameras.has(c.name));

    if (unusedCameras.length > 0 && favStats.totalFavorites >= 5) {
      const randomCamera = unusedCameras[Math.floor(Math.random() * unusedCameras.length)];
      const cameraPhotos = photos.filter(p => p.camera.name === randomCamera.name).slice(0, 3);

      if (cameraPhotos.length > 0) {
        recs.push({
          id: 'unexplored-camera',
          type: 'search',
          title: `Discover ${randomCamera.name}`,
          description: `You haven't explored ${randomCamera.fullName} yet`,
          confidence: 0.7,
          data: { camera: randomCamera.name },
          icon: Sparkles,
          action: 'Explore Camera',
        });
      }
    }

    // 4. Recommend seasonal patterns
    const currentMonth = new Date().getMonth();
    const seasonalPhotos = photos.filter(p => {
      const photoMonth = new Date(p.earth_date).getMonth();
      return Math.abs(photoMonth - currentMonth) <= 1;
    }).slice(0, 3);

    if (seasonalPhotos.length > 0) {
      recs.push({
        id: 'seasonal',
        type: 'photo',
        title: 'Seasonal Mars Views',
        description: 'Photos from similar Earth seasons',
        confidence: 0.6,
        data: seasonalPhotos,
        icon: Calendar,
        action: 'View Season',
      });
    }

    // 5. Recommend high-activity sols
    const solCounts = photos.reduce((acc, photo) => {
      acc[photo.sol] = (acc[photo.sol] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const highActivitySols = Object.entries(solCounts)
      .filter(([, count]) => count >= 10)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (highActivitySols.length > 0) {
      const [sol] = highActivitySols[0];
      recs.push({
        id: 'high-activity',
        type: 'search',
        title: `Busy Day on Mars`,
        description: `Sol ${sol} had ${solCounts[parseInt(sol)]} photos taken`,
        confidence: 0.75,
        data: { sol: parseInt(sol) },
        icon: TrendingUp,
        action: 'Explore Sol',
      });
    }

    // 6. Recommend creating first collection
    if (favStats.totalFavorites >= 5 && favStats.totalCollections === 0) {
      recs.push({
        id: 'first-collection',
        type: 'collection',
        title: 'Create Your First Collection',
        description: 'Organize your favorites into themed collections',
        confidence: 0.85,
        data: { action: 'create-collection' },
        icon: Star,
        action: 'Create Collection',
      });
    }

    // Sort by confidence and return top 4
    return recs.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
  }, [photos, cameras, favorites, favStats]);

  useEffect(() => {
    setRecommendations(generateRecommendations);
    setLastUpdate(new Date());
  }, [generateRecommendations]);

  const refreshRecommendations = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRecommendations(generateRecommendations);
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    switch (rec.type) {
      case 'photo':
        if (rec.data.length > 0) {
          onPhotoSelect(rec.data[0]);
        }
        break;
      case 'search':
        onSearchRecommendation(rec.data);
        break;
      case 'collection':
        // Handle collection creation
        break;
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Smart Recommendations</h3>
        </div>
        <button
          onClick={refreshRecommendations}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="card p-4 cursor-pointer hover:bg-white/10 transition-colors group"
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white truncate">{rec.title}</h4>
                      <div className="flex items-center space-x-1 text-xs text-white/60">
                        <span>{Math.round(rec.confidence * 100)}%</span>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: rec.confidence > 0.8 ? '#22c55e' : 
                                           rec.confidence > 0.6 ? '#eab308' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">
                      {rec.description}
                    </p>
                    
                    {/* Preview for photo recommendations */}
                    {rec.type === 'photo' && rec.data.length > 0 && (
                      <div className="flex space-x-2 mb-3">
                        {rec.data.slice(0, 3).map((photo: MarsPhoto, i: number) => (
                          <div key={photo.id} className="relative">
                            <img
                              src={photo.img_src}
                              alt={`Mars photo ${photo.id}`}
                              className="w-12 h-12 object-cover rounded border border-white/20"
                            />
                            {i === 2 && rec.data.length > 3 && (
                              <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  +{rec.data.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-red-400 text-sm font-medium group-hover:text-red-300 transition-colors">
                        {rec.action}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Last Updated */}
      <p className="text-xs text-white/40 text-center">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </p>
    </div>
  );
};

export default SmartRecommendations;
