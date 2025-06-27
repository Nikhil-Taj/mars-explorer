import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Eye, 
  Palette, 
  Mountain, 
  Tag,
  Loader2,
  Sparkles,
  X,
  Download,
  Share2,
  Zap,
  Target
} from 'lucide-react';
import { aiService, type AIImageAnalysis, type AIGeneratedContent } from '../services/aiService';
import type { MarsPhoto } from '../types';

interface AIPhotoAnalysisProps {
  photo: MarsPhoto;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const AIPhotoAnalysis: React.FC<AIPhotoAnalysisProps> = ({
  photo,
  isOpen,
  onClose,
  className = '',
}) => {
  const [analysis, setAnalysis] = useState<AIImageAnalysis | null>(null);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'content' | 'features'>('analysis');

  useEffect(() => {
    if (isOpen && photo) {
      analyzePhoto();
    }
  }, [isOpen, photo]);

  const analyzePhoto = async () => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeImage(photo);
      setAnalysis(result);
    } catch (error) {
      console.error('Photo analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateContent = async () => {
    if (!analysis) return;
    
    setIsGenerating(true);
    try {
      const content = await aiService.generateContent(photo, analysis);
      setGeneratedContent(content);
      setActiveTab('content');
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAnalysis = () => {
    const data = {
      photo: {
        id: photo.id,
        sol: photo.sol,
        earthDate: photo.earth_date,
        camera: photo.camera,
        rover: photo.rover,
      },
      analysis,
      generatedContent,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mars-photo-analysis-${photo.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareAnalysis = async () => {
    const text = `AI Analysis of Mars Photo from Sol ${photo.sol}: ${analysis?.description || 'Fascinating Martian terrain'} 🚀 #MarsExplorer #AI`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mars Photo AI Analysis',
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Photo Analysis</h2>
                <p className="text-white/60">Sol {photo.sol} • {photo.camera.full_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {analysis && (
                <>
                  <button
                    onClick={downloadAnalysis}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                    title="Download Analysis"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={shareAnalysis}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                    title="Share Analysis"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Photo */}
            <div className="w-1/2 p-6">
              <div className="relative h-full bg-black rounded-lg overflow-hidden">
                <img
                  src={photo.img_src}
                  alt={`Mars photo ${photo.id}`}
                  className="w-full h-full object-contain"
                />
                
                {/* Feature Overlays */}
                {analysis?.geologicalFeatures.map((feature, index) => (
                  feature.coordinates && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className="absolute border-2 border-red-400 bg-red-400/20 rounded"
                      style={{
                        left: `${feature.coordinates.x}px`,
                        top: `${feature.coordinates.y}px`,
                        width: `${feature.coordinates.width}px`,
                        height: `${feature.coordinates.height}px`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {feature.type} ({Math.round(feature.confidence * 100)}%)
                      </div>
                    </motion.div>
                  )
                ))}
              </div>
            </div>

            {/* Analysis Panel */}
            <div className="w-1/2 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {[
                  { id: 'analysis', label: 'Analysis', icon: Eye },
                  { id: 'content', label: 'AI Story', icon: Sparkles },
                  { id: 'features', label: 'Features', icon: Target },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center space-x-2 px-4 py-3 transition-colors ${
                      activeTab === id
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
                      <p className="text-white/60">Analyzing image with AI...</p>
                    </div>
                  </div>
                ) : analysis ? (
                  <AnimatePresence mode="wait">
                    {activeTab === 'analysis' && (
                      <motion.div
                        key="analysis"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-purple-400" />
                            AI Description
                          </h3>
                          <p className="text-white/80 leading-relaxed">{analysis.description}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-sm text-white/60">Confidence:</span>
                            <div className="flex-1 bg-white/10 rounded-full h-2">
                              <div
                                className="bg-purple-400 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${analysis.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-purple-400">{Math.round(analysis.confidence * 100)}%</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <Tag className="w-5 h-5 mr-2 text-purple-400" />
                            AI Tags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {analysis.tags.map((tag, index) => (
                              <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                              >
                                {tag}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        {/* Color Analysis */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <Palette className="w-5 h-5 mr-2 text-purple-400" />
                            Color Analysis
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-white/60 text-sm">Dominant Colors:</span>
                              <div className="flex space-x-2 mt-1">
                                {analysis.colors.dominant.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-8 h-8 rounded border border-white/20"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-white/60">Mood:</span>
                                <span className="text-white ml-2 capitalize">{analysis.colors.mood}</span>
                              </div>
                              <div>
                                <span className="text-white/60">Saturation:</span>
                                <span className="text-white ml-2 capitalize">{analysis.colors.saturation}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Composition */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <Mountain className="w-5 h-5 mr-2 text-purple-400" />
                            Composition
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {analysis.composition.map((component, index) => (
                              <div key={component} className="flex items-center justify-between p-2 bg-white/5 rounded">
                                <span className="text-white/80 capitalize">{component}</span>
                                <div className="w-16 bg-white/10 rounded-full h-2">
                                  <div
                                    className="bg-purple-400 h-2 rounded-full"
                                    style={{ width: `${Math.random() * 80 + 20}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'content' && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {!generatedContent ? (
                          <div className="text-center py-8">
                            <button
                              onClick={generateContent}
                              disabled={isGenerating}
                              className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg transition-colors mx-auto"
                            >
                              {isGenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Zap className="w-5 h-5" />
                              )}
                              <span>{isGenerating ? 'Generating...' : 'Generate AI Story'}</span>
                            </button>
                            <p className="text-white/60 text-sm mt-3">
                              Create an AI-generated story and scientific context for this photo
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">{generatedContent.title}</h3>
                              <p className="text-white/80 leading-relaxed">{generatedContent.story}</p>
                            </div>

                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">Scientific Context</h4>
                              <p className="text-white/70">{generatedContent.scientificContext}</p>
                            </div>

                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">Interesting Facts</h4>
                              <ul className="space-y-2">
                                {generatedContent.interestingFacts.map((fact, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-white/70">
                                    <span className="text-purple-400 mt-1">•</span>
                                    <span>{fact}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'features' && (
                      <motion.div
                        key="features"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-purple-400" />
                          Detected Features
                        </h3>
                        
                        {analysis.geologicalFeatures.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium capitalize">{feature.type}</h4>
                              <span className="text-purple-400 text-sm">
                                {Math.round(feature.confidence * 100)}% confidence
                              </span>
                            </div>
                            <p className="text-white/70 text-sm">{feature.description}</p>
                            <div className="mt-2 w-full bg-white/10 rounded-full h-1">
                              <div
                                className="bg-purple-400 h-1 rounded-full transition-all duration-1000"
                                style={{ width: `${feature.confidence * 100}%` }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white/60">Failed to analyze image</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIPhotoAnalysis;
