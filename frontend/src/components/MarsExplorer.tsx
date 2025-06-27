import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  Camera,
  Calendar,
  MapPin,
  Activity,
  Zap,
  Globe,
  Clock,
  Loader2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Grid3X3,
  Search,
  Heart,
  User,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import MarsPhotoGallery from './MarsPhotoGallery';
import MarsStatsDashboard from './MarsStatsDashboard';
import MarsAnalytics from './MarsAnalytics';
import AdvancedSearch from './AdvancedSearch';
import PersonalDashboard from './PersonalDashboard';
import SmartRecommendations from './SmartRecommendations';
import PhotoComparison from './PhotoComparison';
import NaturalLanguageSearch from './NaturalLanguageSearch';
import AIChatAssistant from './AIChatAssistant';
import AIPhotoAnalysis from './AIPhotoAnalysis';
import type { MarsPhoto, MarsCamera, RoverInfo, MarsState } from '../types';
import type { SearchFilters } from './AdvancedSearch';
import type { NaturalLanguageQuery } from '../services/aiService';
import { marsApiClient, MarsService } from '../services/marsApi';
import { aiService } from '../services/aiService';
import { useFavorites } from '../hooks/useFavorites';
import { useServiceWorker } from '../hooks/useServiceWorker';

/**
 * Mars Explorer Main Component
 * Beautiful Mars rover photo exploration interface
 */
const MarsExplorer: React.FC = () => {
  const [state, setState] = useState<MarsState>({
    photos: [],
    selectedPhoto: null,
    currentSol: 1000,
    selectedCamera: null,
    roverInfo: null,
    cameras: [],
    favorites: [],
    isLoading: false,
    error: null,
  });

  const [activeTab, setActiveTab] = useState<'latest' | 'sol' | 'date'>('latest');
  const [activeView, setActiveView] = useState<'gallery' | 'stats' | 'analytics' | 'favorites' | 'dashboard'>('gallery');
  const [solInput, setSolInput] = useState('1000');
  const [dateInput, setDateInput] = useState('');

  // Enhanced features state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPhotos, setComparisonPhotos] = useState<[MarsPhoto, MarsPhoto] | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<MarsPhoto[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  // AI features state
  const [showNLSearch, setShowNLSearch] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisPhoto, setAIAnalysisPhoto] = useState<MarsPhoto | null>(null);

  // Hooks for enhanced features
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites
  } = useFavorites();

  const {
    isRegistered: isServiceWorkerRegistered,
    isOffline
  } = useServiceWorker();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Set page title
  useEffect(() => {
    document.title = 'The Red Planet - Mars Explorer';
  }, []);



  const loadInitialData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🚀 Loading initial Mars data...');
      console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL);

      // Load rover info, cameras, and initial photos in parallel
      const [roverInfo, cameras, photos] = await Promise.all([
        marsApiClient.getRoverInfo(),
        marsApiClient.getCameras(),
        marsApiClient.getLatestPhotos(undefined, 25),
      ]);

      console.log('📡 Loaded initial data:', {
        roverInfo,
        cameras: cameras.length,
        photos: photos.length
      });

      setState(prev => ({
        ...prev,
        roverInfo,
        cameras,
        photos,
        loading: false,
      }));
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load Mars data',
        loading: false,
      }));
    }
  };

  const loadLatestPhotos = async (camera?: string | null) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const selectedCamera = camera !== undefined ? camera : state.selectedCamera;
      console.log('🔍 Loading latest photos with camera:', selectedCamera);
      console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL);

      const photos = await marsApiClient.getLatestPhotos(selectedCamera || undefined, 25);
      console.log('📸 Received photos:', photos.length, photos);
      setState(prev => ({
        ...prev,
        photos,
        loading: false,
      }));
    } catch (error) {
      console.error('❌ Error loading photos:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load photos',
        loading: false,
      }));
    }
  };

  const loadPhotosBySol = async (sol: number) => {
    if (!MarsService.validateSol(sol)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Sol must be between 0 and 4000',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const photos = await marsApiClient.getPhotosBySol(sol, state.selectedCamera || undefined);
      setState(prev => ({ 
        ...prev, 
        photos, 
        currentSol: sol,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load photos',
        loading: false,
      }));
    }
  };

  const loadPhotosByDate = async (date: string) => {
    if (!MarsService.validateEarthDate(date)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Please enter a valid date between 2012-08-05 and today',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const photos = await marsApiClient.getPhotosByDate(date, state.selectedCamera || undefined);
      setState(prev => ({ 
        ...prev, 
        photos, 
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load photos',
        loading: false,
      }));
    }
  };

  const handleTabChange = (tab: 'latest' | 'sol' | 'date') => {
    setActiveTab(tab);
    setState(prev => ({ ...prev, error: null }));

    switch (tab) {
      case 'latest':
        loadLatestPhotos();
        break;
      case 'sol':
        if (solInput) {
          loadPhotosBySol(parseInt(solInput));
        }
        break;
      case 'date':
        if (dateInput) {
          loadPhotosByDate(dateInput);
        }
        break;
    }
  };

  const handleSolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sol = parseInt(solInput);
    if (!isNaN(sol)) {
      loadPhotosBySol(sol);
    }
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateInput) {
      loadPhotosByDate(dateInput);
    }
  };

  const handleCameraChange = (camera: string | null) => {
    setState(prev => ({ ...prev, selectedCamera: camera }));

    // Reload current view with new camera filter
    switch (activeTab) {
      case 'latest':
        loadLatestPhotos(camera);
        break;
      case 'sol':
        if (solInput) {
          loadPhotosBySol(parseInt(solInput));
        }
        break;
      case 'date':
        if (dateInput) {
          loadPhotosByDate(dateInput);
        }
        break;
    }
  };

  // Enhanced feature handlers
  const handleAdvancedSearch = async (filters: SearchFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let photos: MarsPhoto[] = [];

      if (filters.solRange) {
        // Search by sol range
        const promises = [];
        for (let sol = filters.solRange.min; sol <= filters.solRange.max; sol += 100) {
          promises.push(marsApiClient.getPhotosBySol(sol, filters.camera));
        }
        const results = await Promise.all(promises);
        photos = results.flat();
      } else if (filters.dateRange) {
        // Search by date range - simplified to start date
        photos = await marsApiClient.getPhotosByDate(filters.dateRange.start, filters.camera);
      } else {
        // Default to latest photos with filters
        photos = await marsApiClient.getLatestPhotos(filters.camera);
      }

      // Apply additional filters
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        photos = photos.filter(photo =>
          photo.camera.name.toLowerCase().includes(term) ||
          photo.camera.full_name.toLowerCase().includes(term) ||
          photo.earth_date.includes(term)
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        photos.sort((a, b) => {
          let aValue: any, bValue: any;

          switch (filters.sortBy) {
            case 'date':
              aValue = new Date(a.earth_date);
              bValue = new Date(b.earth_date);
              break;
            case 'sol':
              aValue = a.sol;
              bValue = b.sol;
              break;
            case 'camera':
              aValue = a.camera.name;
              bValue = b.camera.name;
              break;
            default:
              return 0;
          }

          if (filters.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      setState(prev => ({
        ...prev,
        photos,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false,
      }));
    }
  };

  const handlePhotoSelection = (photo: MarsPhoto) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.some(p => p.id === photo.id);
      if (isSelected) {
        return prev.filter(p => p.id !== photo.id);
      } else if (prev.length < 2) {
        return [...prev, photo];
      } else {
        return [prev[1], photo]; // Replace first with new selection
      }
    });
  };

  // AI feature handlers
  const handleNaturalLanguageSearch = async (query: NaturalLanguageQuery) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let photos: MarsPhoto[] = [];

      // Apply search based on AI understanding
      if (query.entities.sol) {
        photos = await marsApiClient.getPhotosBySol(query.entities.sol, query.entities.camera);
      } else if (query.entities.date) {
        photos = await marsApiClient.getPhotosByDate(query.entities.date, query.entities.camera);
      } else if (query.entities.camera) {
        photos = await marsApiClient.getLatestPhotos(query.entities.camera);
      } else {
        photos = await marsApiClient.getLatestPhotos();
      }

      // Apply additional AI-based filtering
      if (query.entities.features && query.entities.features.length > 0) {
        // In a real implementation, you'd use AI to filter by visual features
        // For now, we'll filter by camera type as a proxy
        const featureKeywords = query.entities.features.join(' ').toLowerCase();
        if (featureKeywords.includes('rock') || featureKeywords.includes('geology')) {
          photos = photos.filter(p => ['MAST', 'CHEMCAM', 'MAHLI'].includes(p.camera.name));
        }
      }

      setState(prev => ({
        ...prev,
        photos,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'AI search failed',
        loading: false,
      }));
    }
  };

  const handleAIPhotoAnalysis = (photo: MarsPhoto) => {
    setAIAnalysisPhoto(photo);
    setShowAIAnalysis(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-orange-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.3),transparent_50%)]" />
        </div>

        <div className="relative container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-32"
          >
            <div className="relative flex items-center justify-center mb-6">
              {/* Revolving Rocket Animation */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-32 h-32 md:w-40 md:h-40"
                style={{
                  transformOrigin: 'center',
                }}
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-lg shadow-red-500/30"
                >
                  <Rocket className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>

              {/* Title with proper visibility */}
              <h1 className="relative z-10 text-5xl md:text-7xl font-bold text-red-400 drop-shadow-2xl shadow-red-500/50 animate-pulse">
                The Red Planet
              </h1>
            </div>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-24">
              Journey through the Red Planet with NASA's Curiosity rover. Explore breathtaking 
              photographs captured from the surface of Mars, filtered by camera, date, and Martian day.
            </p>

            {/* Rover Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-6xl mx-auto"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '2rem'
                }}
              >
                <div
                  className="card text-center"
                  style={{
                    padding: '1.5rem',
                    minWidth: '160px',
                    flex: '1',
                    maxWidth: '200px'
                  }}
                >
                  <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">{state.roverInfo?.status || 'Active'}</p>
                  <p className="text-white/60 text-sm font-medium">Status</p>
                </div>

                <div
                  className="card text-center"
                  style={{
                    padding: '1.5rem',
                    minWidth: '160px',
                    flex: '1',
                    maxWidth: '200px'
                  }}
                >
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">
                    {state.roverInfo?.mission_duration?.toLocaleString() || '4,700'}
                  </p>
                  <p className="text-white/60 text-sm font-medium">Days on Mars</p>
                </div>

                <div
                  className="card text-center"
                  style={{
                    padding: '1.5rem',
                    minWidth: '160px',
                    flex: '1',
                    maxWidth: '200px'
                  }}
                >
                  <Camera className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">{state.cameras.length || 7}</p>
                  <p className="text-white/60 text-sm font-medium">Cameras</p>
                </div>

                <div
                  className="card text-center"
                  style={{
                    padding: '1.5rem',
                    minWidth: '160px',
                    flex: '1',
                    maxWidth: '200px'
                  }}
                >
                  <Globe className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">Gale Crater</p>
                  <p className="text-white/60 text-sm font-medium">Location</p>
                </div>
              </motion.div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 mb-20"
          >
            {/* Tab Buttons */}
            <div className="modern-tab-container">
              <button
                onClick={() => handleTabChange('latest')}
                className={`modern-tab-button ${activeTab === 'latest' ? 'active' : ''}`}
              >
                <Zap className={`modern-tab-icon ${activeTab === 'latest' ? 'pulse' : ''}`} />
                <span>Latest Photos</span>
              </button>

              <button
                onClick={() => handleTabChange('sol')}
                className={`modern-tab-button ${activeTab === 'sol' ? 'active' : ''}`}
              >
                <Clock className={`modern-tab-icon ${activeTab === 'sol' ? 'spin' : ''}`} />
                <span>By Sol</span>
              </button>

              <button
                onClick={() => handleTabChange('date')}
                className={`modern-tab-button ${activeTab === 'date' ? 'active' : ''}`}
              >
                <Calendar className={`modern-tab-icon ${activeTab === 'date' ? 'bounce' : ''}`} />
                <span>By Date</span>
              </button>
            </div>

            {/* Search Forms */}
            <div className="flex flex-col sm:flex-row gap-4">
              {activeTab === 'sol' && (
                <form onSubmit={handleSolSubmit} className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Enter Sol (0-4000)"
                    value={solInput}
                    onChange={(e) => setSolInput(e.target.value)}
                    min="0"
                    max="4000"
                    className="input w-40"
                  />
                  <button type="submit" className="btn-primary">
                    Search
                  </button>
                </form>
              )}

              {activeTab === 'date' && (
                <form onSubmit={handleDateSubmit} className="flex gap-2">
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    min="2012-08-05"
                    max={new Date().toISOString().split('T')[0]}
                    className="input w-40"
                  />
                  <button type="submit" className="btn-primary">
                    Search
                  </button>
                </form>
              )}

              {/* Camera Filter */}
              <select
                value={state.selectedCamera || ''}
                onChange={(e) => handleCameraChange(e.target.value || null)}
                className="input w-48"
              >
                <option value="">All Cameras</option>
                {state.cameras.map((camera) => (
                  <option key={camera.name} value={camera.name}>
                    {camera.fullName}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Modern View Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex justify-center mb-20"
          >
            <div className="flex gap-3">
              {/* Photo Gallery Button */}
              <button
                onClick={() => setActiveView('gallery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  border: activeView === 'gallery' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: activeView === 'gallery' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  color: activeView === 'gallery' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  boxShadow: activeView === 'gallery' ? '0 10px 25px rgba(239, 68, 68, 0.5)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'gallery') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'gallery') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                <Grid3X3 style={{ width: '20px', height: '20px' }} />
                <span>Photo Gallery</span>
              </button>

              {/* Statistics Button */}
              <button
                onClick={() => setActiveView('stats')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  border: activeView === 'stats' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: activeView === 'stats' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  color: activeView === 'stats' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  boxShadow: activeView === 'stats' ? '0 10px 25px rgba(239, 68, 68, 0.5)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'stats') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'stats') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                <BarChart3 style={{ width: '20px', height: '20px' }} />
                <span>Statistics</span>
              </button>

              {/* Analytics Button */}
              <button
                onClick={() => setActiveView('analytics')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  border: activeView === 'analytics' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: activeView === 'analytics' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  color: activeView === 'analytics' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  boxShadow: activeView === 'analytics' ? '0 10px 25px rgba(239, 68, 68, 0.5)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'analytics') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'analytics') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                <TrendingUp style={{ width: '20px', height: '20px' }} />
                <span>Analytics</span>
              </button>

              {/* Favorites Button */}
              <button
                onClick={() => setActiveView('favorites')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  border: activeView === 'favorites' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: activeView === 'favorites' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  color: activeView === 'favorites' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  boxShadow: activeView === 'favorites' ? '0 10px 25px rgba(239, 68, 68, 0.5)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'favorites') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'favorites') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                <Heart style={{ width: '20px', height: '20px' }} />
                <span>Favorites ({favorites.length})</span>
              </button>

              {/* Personal Dashboard Button */}
              <button
                onClick={() => setActiveView('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  border: activeView === 'dashboard' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: activeView === 'dashboard' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  color: activeView === 'dashboard' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  boxShadow: activeView === 'dashboard' ? '0 10px 25px rgba(239, 68, 68, 0.5)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'dashboard') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'dashboard') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                <User style={{ width: '20px', height: '20px' }} />
                <span>Dashboard</span>
              </button>

              {/* AI Search Button */}
              <button
                onClick={() => setShowNLSearch(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  background: 'rgba(147, 51, 234, 0.2)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.3)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
                }}
              >
                <Sparkles style={{ width: '20px', height: '20px' }} />
                <span>AI Search</span>
              </button>

              {/* AI Chat Button */}
              <button
                onClick={() => setShowAIChat(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
              >
                <MessageCircle style={{ width: '20px', height: '20px' }} />
                <span>AI Chat</span>
              </button>

              {/* Advanced Search Button */}
              <button
                onClick={() => setShowAdvancedSearch(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                }}
              >
                <Search style={{ width: '20px', height: '20px' }} />
                <span>Advanced Search</span>
              </button>
            </div>
          </motion.div>



          {/* Error Display */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{state.error}</p>
            </motion.div>
          )}

          {/* Content Views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {activeView === 'gallery' && (
              <MarsPhotoGallery
                photos={state.photos}
                cameras={state.cameras}
                loading={state.isLoading}
                onPhotoSelect={(photo) => {
                  setState(prev => ({ ...prev, selectedPhoto: photo }));
                }}
                onFavorite={toggleFavorite}
                favorites={favorites}
                selectedPhotos={selectedPhotos}
                onPhotoSelection={handlePhotoSelection}
                onAIAnalysis={handleAIPhotoAnalysis}
              />
            )}

            {activeView === 'stats' && (
              <MarsStatsDashboard
                photos={state.photos}
                cameras={state.cameras}
              />
            )}

            {activeView === 'analytics' && (
              <MarsAnalytics
                photos={state.photos}
                cameras={state.cameras}
                loading={state.isLoading}
              />
            )}

            {activeView === 'favorites' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Your Favorite Mars Photos</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60">{favorites.length} favorites</span>
                    {isOffline && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        Offline Mode
                      </span>
                    )}
                  </div>
                </div>

                <MarsPhotoGallery
                  photos={favorites}
                  cameras={state.cameras}
                  loading={false}
                  onPhotoSelect={(photo) => {
                    setState(prev => ({ ...prev, selectedPhoto: photo }));
                  }}
                  onFavorite={toggleFavorite}
                  favorites={favorites}
                />
              </div>
            )}

            {activeView === 'dashboard' && (
              <PersonalDashboard />
            )}
          </motion.div>

          {/* Smart Recommendations */}
          {activeView === 'gallery' && state.photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-12"
            >
              <SmartRecommendations
                photos={state.photos}
                cameras={state.cameras}
                onPhotoSelect={(photo) => {
                  setState(prev => ({ ...prev, selectedPhoto: photo }));
                }}
                onSearchRecommendation={(filters) => {
                  setSearchFilters(filters);
                  setShowAdvancedSearch(true);
                }}
              />
            </motion.div>
          )}


        </div>
      </div>

      {/* Enhanced Feature Modals */}
      <AdvancedSearch
        cameras={state.cameras}
        onSearch={(filters) => {
          setSearchFilters(filters);
          // Apply search filters to photos
          handleAdvancedSearch(filters);
        }}
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
      />

      {comparisonPhotos && (
        <PhotoComparison
          photos={comparisonPhotos}
          isOpen={showComparison}
          onClose={() => {
            setShowComparison(false);
            setComparisonPhotos(null);
          }}
        />
      )}

      {/* AI Feature Modals */}
      <NaturalLanguageSearch
        cameras={state.cameras}
        onSearch={handleNaturalLanguageSearch}
        isOpen={showNLSearch}
        onClose={() => setShowNLSearch(false)}
      />

      <AIChatAssistant
        currentPhotos={state.photos}
        currentView={activeView}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        onPhotoSelect={(photo) => {
          setState(prev => ({ ...prev, selectedPhoto: photo }));
        }}
      />

      {aiAnalysisPhoto && (
        <AIPhotoAnalysis
          photo={aiAnalysisPhoto}
          isOpen={showAIAnalysis}
          onClose={() => {
            setShowAIAnalysis(false);
            setAIAnalysisPhoto(null);
          }}
        />
      )}
    </div>
  );
};

export default MarsExplorer;
