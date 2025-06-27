import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  Zap,
  Target,
  Layers,
  Gauge,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import type { MarsPhoto, MarsCamera } from '../types';

interface MarsAnalyticsProps {
  photos: MarsPhoto[];
  cameras: MarsCamera[];
  loading?: boolean;
  className?: string;
}

interface AnalyticsData {
  efficiency: number;
  diversity: number;
  activity: number;
  coverage: number;
  consistency: number;
  productivity: number;
}

interface CameraPerformance {
  camera: string;
  photos: number;
  efficiency: number;
  lastActive: string;
  avgPerSol: number;
}

interface SolActivity {
  sol: number;
  photos: number;
  cameras: number;
  efficiency: number;
  date: string;
}

/**
 * Mars Analytics Component
 * Advanced analytics and performance metrics for Mars rover operations
 */
const MarsAnalytics: React.FC<MarsAnalyticsProps> = ({
  photos,
  cameras,
  loading = false,
  className = '',
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    efficiency: 0,
    diversity: 0,
    activity: 0,
    coverage: 0,
    consistency: 0,
    productivity: 0,
  });

  const [cameraPerformance, setCameraPerformance] = useState<CameraPerformance[]>([]);
  const [solActivity, setSolActivity] = useState<SolActivity[]>([]);

  // Calculate analytics metrics
  const metrics = useMemo(() => {
    if (photos.length === 0) return null;

    // Camera usage distribution
    const cameraUsage = photos.reduce((acc, photo) => {
      acc[photo.camera.name] = (acc[photo.camera.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sol distribution
    const solUsage = photos.reduce((acc, photo) => {
      if (!acc[photo.sol]) {
        acc[photo.sol] = {
          count: 0,
          cameras: new Set<string>(),
          date: photo.earth_date,
        };
      }
      acc[photo.sol].count++;
      acc[photo.sol].cameras.add(photo.camera.name);
      return acc;
    }, {} as Record<number, { count: number; cameras: Set<string>; date: string }>);

    // Calculate efficiency (photos per active camera)
    const activeCameras = Object.keys(cameraUsage).length;
    const efficiency = Math.round((photos.length / Math.max(activeCameras, 1)) * 10) / 10;

    // Calculate diversity (how evenly distributed photos are across cameras)
    const cameraValues = Object.values(cameraUsage);
    const avgPhotosPerCamera = photos.length / activeCameras;
    const variance = cameraValues.reduce((acc, count) => 
      acc + Math.pow(count - avgPhotosPerCamera, 2), 0) / activeCameras;
    const diversity = Math.max(0, 100 - Math.sqrt(variance));

    // Calculate activity (photos per sol)
    const activeSols = Object.keys(solUsage).length;
    const activity = Math.round((photos.length / Math.max(activeSols, 1)) * 10) / 10;

    // Calculate coverage (percentage of available cameras used)
    const coverage = Math.round((activeCameras / cameras.length) * 100);

    // Calculate consistency (how consistent photo taking is across sols)
    const solValues = Object.values(solUsage).map(s => s.count);
    const avgPhotosPerSol = photos.length / activeSols;
    const solVariance = solValues.reduce((acc, count) => 
      acc + Math.pow(count - avgPhotosPerSol, 2), 0) / activeSols;
    const consistency = Math.max(0, 100 - Math.sqrt(solVariance) * 2);

    // Calculate productivity (overall score)
    const productivity = Math.round((efficiency + diversity + coverage + consistency) / 4);

    return {
      efficiency: Math.round(efficiency),
      diversity: Math.round(diversity),
      activity: Math.round(activity),
      coverage,
      consistency: Math.round(consistency),
      productivity,
      cameraUsage,
      solUsage,
    };
  }, [photos, cameras]);

  // Update analytics data
  useEffect(() => {
    if (!metrics) return;

    setAnalyticsData({
      efficiency: metrics.efficiency,
      diversity: metrics.diversity,
      activity: metrics.activity,
      coverage: metrics.coverage,
      consistency: metrics.consistency,
      productivity: metrics.productivity,
    });

    // Calculate camera performance
    const performance: CameraPerformance[] = Object.entries(metrics.cameraUsage).map(([camera, count]) => {
      const cameraPhotos = photos.filter(p => p.camera.name === camera);
      const uniqueSols = new Set(cameraPhotos.map(p => p.sol)).size;
      const lastPhoto = cameraPhotos.sort((a, b) => b.sol - a.sol)[0];
      
      return {
        camera,
        photos: count,
        efficiency: Math.round((count / uniqueSols) * 10) / 10,
        lastActive: lastPhoto?.earth_date || 'Unknown',
        avgPerSol: Math.round((count / Math.max(uniqueSols, 1)) * 10) / 10,
      };
    }).sort((a, b) => b.photos - a.photos);

    setCameraPerformance(performance);

    // Calculate sol activity
    const activity: SolActivity[] = Object.entries(metrics.solUsage)
      .map(([sol, data]) => ({
        sol: parseInt(sol),
        photos: data.count,
        cameras: data.cameras.size,
        efficiency: Math.round((data.count / data.cameras.size) * 10) / 10,
        date: data.date,
      }))
      .sort((a, b) => a.sol - b.sol)
      .slice(-15); // Last 15 sols

    setSolActivity(activity);
  }, [metrics, photos]);

  const radarData = [
    { metric: 'Efficiency', value: analyticsData.efficiency, fullMark: 100 },
    { metric: 'Diversity', value: analyticsData.diversity, fullMark: 100 },
    { metric: 'Activity', value: analyticsData.activity, fullMark: 50 },
    { metric: 'Coverage', value: analyticsData.coverage, fullMark: 100 },
    { metric: 'Consistency', value: analyticsData.consistency, fullMark: 100 },
    { metric: 'Productivity', value: analyticsData.productivity, fullMark: 100 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (loading) {
    return (
      <div className={`card p-8 text-center ${className}`}>
        <div className="animate-spin w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white/60">Analyzing Mars data...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className={`card p-8 text-center ${className}`}>
        <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
        <p className="text-white/60">Load Mars photos to see advanced analytics</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent mb-2">
          🎯 Mission Analytics
        </h2>
        <p className="text-white/70">
          Advanced performance metrics and operational insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: 'efficiency', label: 'Efficiency', icon: Zap, suffix: '/cam' },
          { key: 'diversity', label: 'Diversity', icon: Layers, suffix: '%' },
          { key: 'activity', label: 'Activity', icon: TrendingUp, suffix: '/sol' },
          { key: 'coverage', label: 'Coverage', icon: Target, suffix: '%' },
          { key: 'consistency', label: 'Consistency', icon: Gauge, suffix: '%' },
          { key: 'productivity', label: 'Overall', icon: BarChart3, suffix: '%' },
        ].map(({ key, label, icon: Icon, suffix }) => {
          const value = analyticsData[key as keyof AnalyticsData];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`card p-4 text-center border ${getScoreBg(value)}`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(value)}`} />
              <p className={`text-2xl font-bold ${getScoreColor(value)}`}>
                {value}{suffix}
              </p>
              <p className="text-white/60 text-sm">{label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Radar */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#ffffff', fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#ffffff', fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#ef4444"
                fill="rgba(239, 68, 68, 0.3)"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white">
                        <p className="font-medium">{payload[0].payload.metric}</p>
                        <p className="text-red-400">
                          Score: <span className="font-bold">{payload[0].value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Sol Activity Trend */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Sol Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={solActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="sol" 
                stroke="#ffffff" 
                fontSize={12}
              />
              <YAxis stroke="#ffffff" fontSize={12} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white">
                        <p className="font-medium">Sol {label}</p>
                        <p className="text-blue-400">Photos: {data.photos}</p>
                        <p className="text-green-400">Cameras: {data.cameras}</p>
                        <p className="text-orange-400">Efficiency: {data.efficiency}</p>
                        <p className="text-white/60 text-sm">{data.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="photos" fill="rgba(59, 130, 246, 0.6)" radius={[2, 2, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Camera Performance Table */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Camera Performance Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4">Camera</th>
                <th className="text-right py-3 px-4">Photos</th>
                <th className="text-right py-3 px-4">Efficiency</th>
                <th className="text-right py-3 px-4">Avg/Sol</th>
                <th className="text-right py-3 px-4">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {cameraPerformance.map((camera, index) => (
                <motion.tr
                  key={camera.camera}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{camera.camera}</p>
                      <p className="text-white/60 text-sm">
                        {cameras.find(c => c.name === camera.camera)?.fullName || camera.camera}
                      </p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-mono">{camera.photos}</td>
                  <td className="text-right py-3 px-4 font-mono">{camera.efficiency}</td>
                  <td className="text-right py-3 px-4 font-mono">{camera.avgPerSol}</td>
                  <td className="text-right py-3 px-4 text-white/60 text-sm">{camera.lastActive}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default MarsAnalytics;
