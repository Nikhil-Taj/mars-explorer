import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff,
  Loader2,
  Lightbulb,
  X
} from 'lucide-react';
import { aiService, type NaturalLanguageQuery } from '../services/aiService';
import type { MarsPhoto, MarsCamera } from '../types';

interface NaturalLanguageSearchProps {
  onSearch: (query: NaturalLanguageQuery) => void;
  cameras: MarsCamera[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({
  onSearch,
  cameras,
  isOpen,
  onClose,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [parsedQuery, setParsedQuery] = useState<NaturalLanguageQuery | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sample suggestions for natural language queries
  const sampleQueries = [
    "Show me red rocks from Sol 1000",
    "Find photos with craters taken by MAST camera",
    "What did Curiosity see on Sol 2500?",
    "Show me morning photos from the last week",
    "Find images with interesting geological formations",
    "Show me photos similar to the ones I favorited",
    "What's the weather like in recent photos?",
    "Find photos taken during dust storms",
    "Show me close-up rock formations",
    "What cameras captured the most interesting photos?",
  ];

  useEffect(() => {
    // Load recent queries from localStorage
    const stored = localStorage.getItem('mars-explorer-recent-queries');
    if (stored) {
      try {
        setRecentQueries(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading recent queries:', error);
      }
    }

    // Set up speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Generate suggestions based on current query
    if (query.length > 2) {
      const filtered = sampleQueries.filter(sample => 
        sample.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().split(' ').some(word => 
          sample.toLowerCase().includes(word) && word.length > 2
        )
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions(sampleQueries.slice(0, 5));
    }
  }, [query]);

  const handleSubmit = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsProcessing(true);
    setParsedQuery(null);

    try {
      const parsed = await aiService.processNaturalLanguageQuery(searchQuery);
      setParsedQuery(parsed);
      
      // Save to recent queries
      const newRecentQueries = [searchQuery, ...recentQueries.filter(q => q !== searchQuery)].slice(0, 10);
      setRecentQueries(newRecentQueries);
      localStorage.setItem('mars-explorer-recent-queries', JSON.stringify(newRecentQueries));

      // Execute search
      onSearch(parsed);
      
      // Close after a delay to show the parsed query
      setTimeout(() => {
        onClose();
        setQuery('');
        setParsedQuery(null);
      }, 2000);
    } catch (error) {
      console.error('Natural language search failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
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
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-8 w-full max-w-3xl shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">AI Search</h2>
                <p className="text-white/70 text-base">Ask me anything about Mars photos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <div className="flex items-center space-x-3 p-5 bg-white/15 rounded-xl border-2 border-white/20 focus-within:border-purple-400 focus-within:bg-white/20 transition-all duration-200 shadow-lg">
              <MessageCircle className="w-6 h-6 text-white/70" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g., 'Show me red rocks from Sol 1000' or 'Find crater photos'"
                className="flex-1 bg-transparent text-white text-lg placeholder-white/50 focus:outline-none"
                disabled={isProcessing}
              />
              
              {/* Voice Input Button */}
              {recognitionRef.current && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg'
                      : 'bg-white/15 text-white/70 hover:text-white hover:bg-white/25 hover:scale-105'
                  }`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              {/* Submit Button */}
              <button
                onClick={() => handleSubmit()}
                disabled={!query.trim() || isProcessing}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-white/10 disabled:text-white/40 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Voice Listening Indicator */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
              >
                <div className="flex items-center space-x-2 text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-sm">Listening... Speak your search query</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Parsed Query Display */}
          {parsedQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">AI Understanding:</span>
              </div>
              <p className="text-white text-sm mb-2">
                Intent: <span className="text-green-400 capitalize">{parsedQuery.intent}</span>
                {parsedQuery.confidence && (
                  <span className="text-white/60 ml-2">
                    (Confidence: {Math.round(parsedQuery.confidence * 100)}%)
                  </span>
                )}
              </p>
              {Object.keys(parsedQuery.entities).length > 0 && (
                <div className="text-white/80 text-sm">
                  <span className="text-white/60">Detected: </span>
                  {Object.entries(parsedQuery.entities).map(([key, value]) => (
                    <span key={key} className="text-purple-400 mr-2">
                      {key}: {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Suggestions */}
          {!isProcessing && !parsedQuery && (
            <div className="space-y-4">
              {/* Quick Suggestions */}
              <div>
                <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Try asking:
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSubmit(suggestion)}
                      className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors text-sm"
                    >
                      "{suggestion}"
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Queries */}
              {recentQueries.length > 0 && (
                <div>
                  <h3 className="text-white/80 text-sm font-medium mb-3">Recent searches:</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentQueries.slice(0, 5).map((recent, index) => (
                      <motion.button
                        key={recent}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSubmit(recent)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white text-xs transition-colors"
                      >
                        {recent.length > 30 ? recent.substring(0, 30) + '...' : recent}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
              <p className="text-white/60">Processing your query with AI...</p>
            </motion.div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <h4 className="text-white/80 text-sm font-medium mb-2">💡 Tips for better results:</h4>
            <ul className="text-white/60 text-xs space-y-1">
              <li>• Be specific: "red rocks" instead of just "rocks"</li>
              <li>• Mention cameras: "MAST camera photos" or "FHAZ images"</li>
              <li>• Use sol numbers: "Sol 1000" or "recent sols"</li>
              <li>• Describe features: "craters", "ridges", "dust storms"</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NaturalLanguageSearch;
