import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Eye, 
  Calendar, 
  Camera, 
  TrendingUp, 
  Award,
  Clock,
  Star,
  Download,
  Share2
} from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface PersonalDashboardProps {
  className?: string;
}

interface UserStats {
  totalViews: number;
  totalSearches: number;
  favoriteCamera: string;
  explorationStreak: number;
  lastVisit: string;
  timeSpent: number; // in minutes
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ className = '' }) => {
  const { favorites, getStats } = useFavorites();
  const [userStats, setUserStats] = useState<UserStats>({
    totalViews: 0,
    totalSearches: 0,
    favoriteCamera: 'MAST',
    explorationStreak: 0,
    lastVisit: new Date().toISOString(),
    timeSpent: 0,
  });

  const [sessionStartTime] = useState(Date.now());
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  const favStats = getStats();

  // Load user stats from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mars-explorer-user-stats');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserStats(parsed);
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    }
  }, []);

  // Update session time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSessionTime(Math.floor((Date.now() - sessionStartTime) / 1000 / 60));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Save stats when component unmounts
  useEffect(() => {
    const saveStats = () => {
      const updatedStats = {
        ...userStats,
        timeSpent: userStats.timeSpent + currentSessionTime,
        lastVisit: new Date().toISOString(),
      };
      localStorage.setItem('mars-explorer-user-stats', JSON.stringify(updatedStats));
    };

    window.addEventListener('beforeunload', saveStats);
    return () => {
      window.removeEventListener('beforeunload', saveStats);
      saveStats();
    };
  }, [userStats, currentSessionTime]);

  // Prepare chart data
  const cameraData = Object.entries(favStats.cameraStats).map(([camera, count]) => ({
    camera,
    count,
    percentage: Math.round((count / favStats.totalFavorites) * 100),
  }));

  const monthlyData = Object.entries(favStats.favoritesByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      favorites: count,
    }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  const achievements = [
    {
      id: 'first-favorite',
      title: 'First Favorite',
      description: 'Added your first favorite photo',
      icon: Heart,
      unlocked: favStats.totalFavorites >= 1,
      progress: Math.min(favStats.totalFavorites, 1),
      target: 1,
    },
    {
      id: 'collector',
      title: 'Collector',
      description: 'Saved 25 favorite photos',
      icon: Star,
      unlocked: favStats.totalFavorites >= 25,
      progress: Math.min(favStats.totalFavorites, 25),
      target: 25,
    },
    {
      id: 'curator',
      title: 'Curator',
      description: 'Created your first collection',
      icon: Award,
      unlocked: favStats.totalCollections >= 1,
      progress: Math.min(favStats.totalCollections, 1),
      target: 1,
    },
    {
      id: 'explorer',
      title: 'Mars Explorer',
      description: 'Spent 60 minutes exploring',
      icon: Clock,
      unlocked: userStats.timeSpent >= 60,
      progress: Math.min(userStats.timeSpent, 60),
      target: 60,
    },
  ];

  const exportStats = () => {
    const data = {
      userStats,
      favoriteStats: favStats,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mars-explorer-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareStats = async () => {
    const text = `I've explored Mars with ${favStats.totalFavorites} favorite photos and ${favStats.totalCollections} collections! 🚀 #MarsExplorer`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Mars Explorer Stats',
          text,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Mars Journey</h2>
          <p className="text-white/60">Personal exploration statistics and achievements</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportStats}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={shareStats}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 text-center"
        >
          <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{favStats.totalFavorites}</p>
          <p className="text-white/60 text-sm">Favorites</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 text-center"
        >
          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{favStats.totalCollections}</p>
          <p className="text-white/60 text-sm">Collections</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 text-center"
        >
          <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{userStats.timeSpent + currentSessionTime}</p>
          <p className="text-white/60 text-sm">Minutes Explored</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4 text-center"
        >
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{userStats.explorationStreak}</p>
          <p className="text-white/60 text-sm">Day Streak</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Distribution */}
        {cameraData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Favorite Cameras</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={cameraData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ camera, percentage }) => `${camera} (${percentage}%)`}
                >
                  {cameraData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Monthly Favorites */}
        {monthlyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Favorites Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <Line type="monotone" dataKey="favorites" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const progressPercentage = (achievement.progress / achievement.target) * 100;
            
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-colors ${
                  achievement.unlocked
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked ? 'bg-green-500' : 'bg-white/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      achievement.unlocked ? 'text-white' : 'text-white/60'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.unlocked ? 'text-green-400' : 'text-white'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-white/60 text-sm mb-2">{achievement.description}</p>
                    
                    {!achievement.unlocked && (
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-white/40 mt-1">
                      {achievement.unlocked ? 'Unlocked!' : `${achievement.progress}/${achievement.target}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalDashboard;
