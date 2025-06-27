import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Github, Star } from 'lucide-react';

/**
 * Footer Component
 * Application footer with credits and links
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 glass-effect">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gradient">
              The Red Planet
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Journey through Mars with NASA's Curiosity rover.
              Discover breathtaking photographs captured from the surface of the Red Planet.
            </p>
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span>for space enthusiasts</span>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="https://api.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-space-300 transition-colors text-sm group"
              >
                <span>NASA Open Data Portal</span>
                <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://apod.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-space-300 transition-colors text-sm group"
              >
                <span>Official APOD Website</span>
                <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://www.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-space-300 transition-colors text-sm group"
              >
                <span>NASA Official Website</span>
                <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Built With</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <div className="text-white/70">Frontend:</div>
                <div className="text-space-300">React + TypeScript</div>
                <div className="text-space-300">Tailwind CSS</div>
                <div className="text-space-300">Framer Motion</div>
              </div>
              <div className="space-y-1">
                <div className="text-white/70">Backend:</div>
                <div className="text-cosmic-300">Node.js + Express</div>
                <div className="text-cosmic-300">MongoDB</div>
                <div className="text-cosmic-300">Clean Architecture</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-white/60 text-sm">
              © {currentYear} NASA Space Explorer. Built for educational purposes.
            </div>

            {/* Credits */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-white/60">
                <span>Data provided by</span>
                <a
                  href="https://api.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-space-300 hover:text-space-200 transition-colors font-medium"
                >
                  NASA API
                </a>
              </div>
              
              {/* GitHub Link (if you want to add it) */}
              <motion.a
                href="#"
                className="flex items-center space-x-1 text-white/60 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-4 h-4" />
                <span>Source</span>
              </motion.a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-4 right-4 opacity-20">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Star className="w-6 h-6 text-space-400" />
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
