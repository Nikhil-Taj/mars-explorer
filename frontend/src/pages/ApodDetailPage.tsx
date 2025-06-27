import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * APOD Detail Page Component
 * Detailed view for a specific APOD entry
 */
const ApodDetailPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back Button */}
        <Link 
          to="/explore"
          className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            APOD Details
          </h1>
          <p className="text-xl text-white/70">
            {date ? `Astronomy Picture for ${date}` : 'Loading...'}
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-cosmic-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-cosmic-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-4">
              Detailed View Coming Soon
            </h2>
            
            <p className="text-white/70 mb-6">
              We're building a beautiful detailed view for each astronomy picture 
              with high-resolution images, full descriptions, and sharing features.
            </p>

            {date && (
              <div className="glass-effect p-4 rounded-lg mt-6">
                <p className="text-sm text-white/60">
                  Requested date: <span className="text-space-300 font-medium">{date}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ApodDetailPage;
