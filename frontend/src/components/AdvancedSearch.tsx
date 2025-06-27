import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Camera, 
  MapPin, 
  Sliders,
  X,
  RotateCcw
} from 'lucide-react';
import type { MarsCamera } from '../types';

interface AdvancedSearchProps {
  cameras: MarsCamera[];
  onSearch: (filters: SearchFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface SearchFilters {
  searchTerm?: string;
  camera?: string;
  solRange?: { min: number; max: number };
  dateRange?: { start: string; end: string };
  location?: string;
  imageQuality?: 'all' | 'high' | 'medium';
  sortBy?: 'date' | 'sol' | 'camera' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  cameras,
  onSearch,
  isOpen,
  onClose,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    camera: '',
    solRange: { min: 0, max: 4000 },
    dateRange: { start: '2012-08-05', end: new Date().toISOString().split('T')[0] },
    imageQuality: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'sort'>('basic');

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      camera: '',
      solRange: { min: 0, max: 4000 },
      dateRange: { start: '2012-08-05', end: new Date().toISOString().split('T')[0] },
      imageQuality: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Search className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Advanced Search</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
            {[
              { id: 'basic', label: 'Basic Search', icon: Search },
              { id: 'advanced', label: 'Advanced Filters', icon: Filter },
              { id: 'sort', label: 'Sort & Display', icon: Sliders },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === id
                    ? 'bg-red-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Search Term */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Search Photos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      placeholder="Search by description, location, or features..."
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-400"
                    />
                  </div>
                </div>

                {/* Camera Selection */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Camera
                  </label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <select
                      value={filters.camera}
                      onChange={(e) => handleFilterChange('camera', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
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
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Sol Range */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Sol Range (Martian Days)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        value={filters.solRange?.min}
                        onChange={(e) => handleFilterChange('solRange', { 
                          ...filters.solRange, 
                          min: parseInt(e.target.value) 
                        })}
                        placeholder="Min Sol"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-400"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={filters.solRange?.max}
                        onChange={(e) => handleFilterChange('solRange', { 
                          ...filters.solRange, 
                          max: parseInt(e.target.value) 
                        })}
                        placeholder="Max Sol"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Earth Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="date"
                        value={filters.dateRange?.start}
                        onChange={(e) => handleFilterChange('dateRange', { 
                          ...filters.dateRange, 
                          start: e.target.value 
                        })}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="date"
                        value={filters.dateRange?.end}
                        onChange={(e) => handleFilterChange('dateRange', { 
                          ...filters.dateRange, 
                          end: e.target.value 
                        })}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Quality */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Image Quality
                  </label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'all', label: 'All Quality' },
                      { value: 'high', label: 'High Quality' },
                      { value: 'medium', label: 'Medium Quality' },
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="imageQuality"
                          value={value}
                          checked={filters.imageQuality === value}
                          onChange={(e) => handleFilterChange('imageQuality', e.target.value)}
                          className="w-4 h-4 text-red-500 bg-white/10 border-white/20 focus:ring-red-400"
                        />
                        <span className="text-white/80">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sort' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Sort By */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
                  >
                    <option value="date">Earth Date</option>
                    <option value="sol">Sol (Martian Day)</option>
                    <option value="camera">Camera Type</option>
                    <option value="relevance">Relevance</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Sort Order
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={filters.sortOrder === 'desc'}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        className="w-4 h-4 text-red-500 bg-white/10 border-white/20 focus:ring-red-400"
                      />
                      <span className="text-white/80">Newest First</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={filters.sortOrder === 'asc'}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        className="w-4 h-4 text-red-500 bg-white/10 border-white/20 focus:ring-red-400"
                      />
                      <span className="text-white/80">Oldest First</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={resetFilters}
              className="flex items-center space-x-2 px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdvancedSearch;
