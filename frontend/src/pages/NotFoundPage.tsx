import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found Page Component
 * Displayed when user navigates to a non-existent route
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full card p-8 text-center"
      >
        {/* 404 Animation */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-space-500/20 rounded-full flex items-center justify-center">
            <Rocket className="w-10 h-10 text-space-400 transform rotate-45" />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Lost in Space
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Looks like this page drifted into a black hole! 
            Don't worry, we'll help you navigate back to familiar territory.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link to="/" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </motion.button>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="flex-1 btn-secondary flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </motion.button>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 p-4 bg-cosmic-500/10 border border-cosmic-500/20 rounded-lg"
        >
          <p className="text-xs text-white/60">
            🌌 Fun fact: There are over 100 billion galaxies in the observable universe, 
            but sadly, this page isn't in any of them!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
