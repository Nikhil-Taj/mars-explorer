import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Camera,
  Calendar,
  Activity
} from 'lucide-react';
import type { MarsPhoto, MarsCamera } from '../types';

interface MarsStatsDashboardProps {
  photos: MarsPhoto[];
  cameras: MarsCamera[];
  className?: string;
}

interface CameraStats {
  name: string;
  fullName: string;
  count: number;
  percentage: number;
  color: string;
}

interface SolStats {
  sol: number;
  count: number;
  date: string;
}

interface DateStats {
  date: string;
  count: number;
  month: string;
  year: number;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

/**
 * Mars Statistics Dashboard Component
 * Displays comprehensive data visualizations for Mars rover photos
 */
const MarsStatsDashboard: React.FC<MarsStatsDashboardProps> = ({
  photos,
  cameras,
  className = '',
}) => {
  const [activeChart, setActiveChart] = useState<'camera' | 'sol' | 'date' | 'timeline'>('camera');
  const [cameraStats, setCameraStats] = useState<CameraStats[]>([]);
  const [solStats, setSolStats] = useState<SolStats[]>([]);
  const [dateStats, setDateStats] = useState<DateStats[]>([]);
  const [timelineStats, setTimelineStats] = useState<DateStats[]>([]);

  // Process camera statistics
  useEffect(() => {
    if (photos.length === 0) return;

    const cameraCount = photos.reduce((acc, photo) => {
      const cameraName = photo.camera.name;
      acc[cameraName] = (acc[cameraName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPhotos = photos.length;
    const stats: CameraStats[] = Object.entries(cameraCount).map(([name, count], index) => {
      const camera = cameras.find(c => c.name === name);
      return {
        name,
        fullName: camera?.fullName || name,
        count,
        percentage: Math.round((count / totalPhotos) * 100),
        color: COLORS[index % COLORS.length],
      };
    }).sort((a, b) => b.count - a.count);

    setCameraStats(stats);
  }, [photos, cameras]);

  // Process Sol statistics
  useEffect(() => {
    if (photos.length === 0) return;

    const solCount = photos.reduce((acc, photo) => {
      const sol = photo.sol;
      if (!acc[sol]) {
        acc[sol] = {
          count: 0,
          date: photo.earth_date,
        };
      }
      acc[sol].count++;
      return acc;
    }, {} as Record<number, { count: number; date: string }>);

    const stats: SolStats[] = Object.entries(solCount)
      .map(([sol, data]) => ({
        sol: parseInt(sol),
        count: data.count,
        date: data.date,
      }))
      .sort((a, b) => a.sol - b.sol)
      .slice(-20); // Show last 20 sols

    setSolStats(stats);
  }, [photos]);

  // Process date statistics
  useEffect(() => {
    if (photos.length === 0) return;

    const dateCount = photos.reduce((acc, photo) => {
      const date = photo.earth_date;
      const dateObj = new Date(date);
      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
      const year = dateObj.getFullYear();
      
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stats: DateStats[] = Object.entries(dateCount)
      .map(([date, count]) => {
        const dateObj = new Date(date);
        return {
          date,
          count,
          month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
          year: dateObj.getFullYear(),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setDateStats(stats);

    // Create timeline stats (monthly aggregation)
    const monthlyCount = stats.reduce((acc, item) => {
      const key = `${item.month} ${item.year}`;
      acc[key] = (acc[key] || 0) + item.count;
      return acc;
    }, {} as Record<string, number>);

    const timelineData: DateStats[] = Object.entries(monthlyCount).map(([monthYear, count]) => ({
      date: monthYear,
      count,
      month: monthYear.split(' ')[0],
      year: parseInt(monthYear.split(' ')[1]),
    }));

    setTimelineStats(timelineData);
  }, [photos]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white">
          <p className="font-medium">{label}</p>
          <p className="text-red-400">
            Photos: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'camera':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cameraStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#ffffff" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#ffffff" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]}>
                {cameraStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'sol':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={solStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="sol" 
                stroke="#ffffff" 
                fontSize={12}
              />
              <YAxis stroke="#ffffff" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'date':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Photos by Camera</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cameraStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {cameraStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dateStats.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#ffffff" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#ef4444" 
                    fill="rgba(239, 68, 68, 0.3)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timelineStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#ffffff" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#ef4444" 
                fill="rgba(239, 68, 68, 0.3)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (photos.length === 0) {
    return (
      <div className={`card p-8 text-center ${className}`}>
        <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
        <p className="text-white/60">Load some Mars photos to see statistics and visualizations</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent mb-2">
          📊 Mars Data Analytics
        </h2>
        <p className="text-white/70">
          Comprehensive statistics and visualizations for {photos.length} Mars rover photos
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="card p-4 text-center">
          <Camera className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{photos.length}</p>
          <p className="text-white/60 text-sm">Total Photos</p>
        </div>
        <div className="card p-4 text-center">
          <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{cameraStats.length}</p>
          <p className="text-white/60 text-sm">Active Cameras</p>
        </div>
        <div className="card p-4 text-center">
          <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{solStats.length}</p>
          <p className="text-white/60 text-sm">Sol Days</p>
        </div>
        <div className="card p-4 text-center">
          <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">
            {Math.max(...cameraStats.map(s => s.count))}
          </p>
          <p className="text-white/60 text-sm">Max per Camera</p>
        </div>
      </motion.div>

      {/* Chart Navigation */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'camera', label: 'Camera Distribution', icon: Camera },
          { key: 'sol', label: 'Sol Timeline', icon: TrendingUp },
          { key: 'date', label: 'Overview', icon: PieChartIcon },
          { key: 'timeline', label: 'Monthly Trend', icon: BarChart3 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveChart(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeChart === key
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* Chart Container */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">
            {activeChart === 'camera' && 'Photos by Camera Type'}
            {activeChart === 'sol' && 'Photos by Sol (Martian Day)'}
            {activeChart === 'date' && 'Data Overview'}
            {activeChart === 'timeline' && 'Monthly Photo Timeline'}
          </h3>
          <p className="text-white/60 text-sm mt-1">
            {activeChart === 'camera' && 'Distribution of photos across different rover cameras'}
            {activeChart === 'sol' && 'Photo activity across recent Martian days'}
            {activeChart === 'date' && 'Camera distribution and recent activity patterns'}
            {activeChart === 'timeline' && 'Photo collection trends over time'}
          </p>
        </div>
        {renderChart()}
      </motion.div>
    </motion.div>
  );
};

export default MarsStatsDashboard;
