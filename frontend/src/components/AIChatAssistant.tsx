import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  X,
  Loader2,
  Sparkles,
  Camera,
  Calendar,
  MapPin
} from 'lucide-react';
import { aiService, type ChatMessage } from '../services/aiService';
import type { MarsPhoto } from '../types';

interface AIChatAssistantProps {
  currentPhotos?: MarsPhoto[];
  currentView?: string;
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelect?: (photo: MarsPhoto) => void;
  className?: string;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  currentPhotos = [],
  currentView = 'gallery',
  isOpen,
  onClose,
  onPhotoSelect,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm your AI Mars exploration assistant. I can help you understand the photos, explain geological features, suggest interesting discoveries, and answer questions about Mars exploration. What would you like to know?`,
        timestamp: new Date(),
        metadata: {
          suggestions: [
            'What am I looking at in this photo?',
            'Tell me about Mars geology',
            'Show me interesting rock formations',
            'Explain how the rovers work',
            'What makes this photo scientifically important?',
          ],
        },
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await aiService.chatWithAssistant(inputMessage, {
        photos: currentPhotos,
        currentView,
      });

      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl border border-white/10 ${
          isMinimized ? 'w-80 h-16' : 'w-full max-w-4xl h-[700px]'
        } transition-all duration-300 ${className}`}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">Mars AI Assistant</h3>
            <p className="text-white/70 text-sm">Online • Ready to help</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 hover:scale-105"
          >
            {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-red-500' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/70' : 'text-white/50'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </p>

                    {/* Suggestions */}
                    {message.metadata?.suggestions && (
                      <div className="mt-3 space-y-1">
                        {message.metadata.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white/80 hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Photo attachments */}
                    {message.metadata?.photos && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {message.metadata.photos.slice(0, 4).map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => onPhotoSelect?.(photo)}
                            className="relative group"
                          >
                            <img
                              src={photo.img_src}
                              alt={`Mars photo ${photo.id}`}
                              className="w-full h-16 object-cover rounded border border-white/20 group-hover:border-white/40 transition-colors"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <span className="text-white text-xs">View</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white/10 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me about Mars exploration..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors"
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/40 text-white rounded-xl transition-colors"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center space-x-4 mt-3">
              <button
                onClick={() => handleSuggestionClick('Analyze this photo')}
                className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white text-xs transition-colors"
              >
                <Camera className="w-3 h-3" />
                <span>Analyze</span>
              </button>
              <button
                onClick={() => handleSuggestionClick('Tell me about Mars geology')}
                className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white text-xs transition-colors"
              >
                <MapPin className="w-3 h-3" />
                <span>Geology</span>
              </button>
              <button
                onClick={() => handleSuggestionClick('Show me recent discoveries')}
                className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white text-xs transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Discover</span>
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
    </div>
  );
};

export default AIChatAssistant;
