import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';

/**
 * Favorites Page Component
 * Display user's favorite APOD entries
 */
const FavoritesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Your Cosmic Favorites
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Your personal collection of the most amazing space discoveries
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-cosmic-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-cosmic-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-4">
              Save Your Favorites
            </h2>
            
            <p className="text-white/70 mb-6">
              Soon you'll be able to save your favorite astronomy pictures and 
              create your personal cosmic collection!
            </p>

            {/* Feature Preview */}
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Rate Pictures</p>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Save Favorites</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FavoritesPage;
