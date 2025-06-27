import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

/**
 * Calendar Page Component
 * Calendar view for browsing APOD by date
 */
const CalendarPage: React.FC = () => {
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
            Cosmic Calendar
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Browse astronomy pictures by date and discover what happened on any day
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-space-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-space-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-4">
              Time Travel Through Space
            </h2>
            
            <p className="text-white/70 mb-6">
              We're building an interactive calendar to help you explore the cosmos 
              through time. Pick any date and see what NASA discovered!
            </p>

            {/* Feature Preview */}
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-space-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Date Picker</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-cosmic-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Historical View</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarPage;
