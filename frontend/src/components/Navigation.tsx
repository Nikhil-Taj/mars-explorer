import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Heart, 
  Calendar, 
  Rocket, 
  Menu, 
  X,
  Star,
  Sparkles
} from 'lucide-react';
import type { NavItem } from '../types';

/**
 * Navigation Items Configuration
 */
const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Explore', path: '/explore', icon: Search },
  { label: 'Favorites', path: '/favorites', icon: Heart },
  { label: 'Calendar', path: '/calendar', icon: Calendar },
];

/**
 * Navigation Component
 * Responsive navigation bar with mobile menu support
 */
const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="relative z-50">
      {/* Desktop Navigation */}
      <div className="glass-effect border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
              onClick={closeMobileMenu}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Rocket className="w-8 h-8 text-space-400 group-hover:text-space-300 transition-colors" />
                <Sparkles className="w-4 h-4 text-cosmic-400 absolute -top-1 -right-1 animate-pulse" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gradient">
                  The Red Planet
                </span>
                <span className="text-xs text-space-300 -mt-1">
                  Mars Explorer
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon!;
                const isActive = isActivePath(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-space-500/20 text-space-300 glow-effect'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-space-300' : ''
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-space-400"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMobileMenu}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 glass-effect border-b border-white/10 z-50 md:hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon!;
                    const isActive = isActivePath(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-space-500/20 text-space-300 glow-effect'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-space-300' : ''
                        }`} />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <Star className="w-4 h-4 text-space-400 ml-auto animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
