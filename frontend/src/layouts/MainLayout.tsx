import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Star } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

/**
 * Main Layout Component
 * Provides the overall structure and navigation for the application
 */
const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-space-gradient star-field">
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-8"
        >
          <Outlet />
        </motion.div>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating Stars */}
        <div className="absolute top-20 left-10 animate-float">
          <Star className="w-4 h-4 text-yellow-300 opacity-70" />
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <Star className="w-3 h-3 text-blue-300 opacity-60" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float" style={{ animationDelay: '2s' }}>
          <Star className="w-5 h-5 text-purple-300 opacity-50" />
        </div>
        <div className="absolute top-60 left-1/2 animate-float" style={{ animationDelay: '3s' }}>
          <Star className="w-2 h-2 text-white opacity-80" />
        </div>
        <div className="absolute bottom-60 right-10 animate-float" style={{ animationDelay: '4s' }}>
          <Star className="w-4 h-4 text-cyan-300 opacity-70" />
        </div>
        
        {/* Floating Rocket */}
        <div className="absolute top-1/3 right-10 animate-float" style={{ animationDelay: '2.5s' }}>
          <Rocket className="w-8 h-8 text-space-400 opacity-30 transform rotate-45" />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
