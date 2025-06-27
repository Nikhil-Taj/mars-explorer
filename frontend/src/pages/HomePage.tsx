import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Star, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Home Page Component
 * Landing page with hero section and navigation to main features
 */
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        {/* Main Title */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative mr-4"
            >
              <Rocket className="w-16 h-16 text-space-400" />
              <Sparkles className="w-6 h-6 text-cosmic-400 absolute -top-2 -right-2 animate-pulse" />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-bold text-gradient">
              Space Explorer
            </h1>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 mb-2"
          >
            Discover the Universe Through NASA's Eyes
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg text-white/60 max-w-2xl mx-auto"
          >
            Explore breathtaking astronomy pictures, fascinating stories, and cosmic wonders 
            from NASA's Astronomy Picture of the Day collection.
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/explore">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(14, 165, 233, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
            >
              <span>Start Exploring</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          
          <Link to="/favorites">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
            >
              <Star className="w-5 h-5" />
              <span>View Favorites</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {/* Feature 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="card p-6 text-center"
          >
            <div className="w-12 h-12 bg-space-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-space-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Daily Discoveries</h3>
            <p className="text-white/70 text-sm">
              Explore a new cosmic wonder every day with NASA's curated astronomy pictures.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="card p-6 text-center"
          >
            <div className="w-12 h-12 bg-cosmic-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-cosmic-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Rich Stories</h3>
            <p className="text-white/70 text-sm">
              Learn fascinating details and scientific explanations behind each cosmic image.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="card p-6 text-center"
          >
            <div className="w-12 h-12 bg-space-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6 text-space-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Clean Architecture</h3>
            <p className="text-white/70 text-sm">
              Built with modern technologies and clean code principles for optimal performance.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-white/40 text-sm"
        >
          <div className="flex flex-col items-center space-y-2">
            <span>Scroll to explore</span>
            <div className="w-1 h-8 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;
