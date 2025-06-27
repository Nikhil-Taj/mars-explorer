import React from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Shuffle } from 'lucide-react';

/**
 * Explore Page Component
 * Main exploration interface for APOD data
 */
const ExplorePage: React.FC = () => {
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
            Explore the Cosmos
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Discover amazing astronomy pictures and learn about the wonders of our universe
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-space-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-space-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-4">
              Coming Soon!
            </h2>
            
            <p className="text-white/70 mb-6">
              We're building an amazing exploration experience with search, filtering, 
              and discovery features. Stay tuned!
            </p>

            {/* Feature Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="glass-effect p-4 rounded-lg">
                <Search className="w-6 h-6 text-space-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Smart Search</p>
              </div>
              <div className="glass-effect p-4 rounded-lg">
                <Calendar className="w-6 h-6 text-cosmic-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Date Picker</p>
              </div>
              <div className="glass-effect p-4 rounded-lg">
                <Shuffle className="w-6 h-6 text-space-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Random Discovery</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExplorePage;
