import type { MarsPhoto } from '../types';

// AI Service Configuration
const AI_CONFIG = {
  // Using a mock AI service for demonstration
  // In production, you'd use services like OpenAI, Google Vision, etc.
  mockMode: true,
  apiKey: 'demo-key', // Simplified for now
  endpoints: {
    imageAnalysis: '/api/ai/analyze-image',
    naturalLanguageSearch: '/api/ai/search',
    contentGeneration: '/api/ai/generate',
    chatAssistant: '/api/ai/chat',
  }
};

// AI Analysis Results
export interface AIImageAnalysis {
  tags: string[];
  description: string;
  geologicalFeatures: GeologicalFeature[];
  confidence: number;
  colors: ColorAnalysis;
  composition: string[];
  weatherConditions?: string;
  timeOfDay?: 'morning' | 'midday' | 'afternoon' | 'evening';
}

export interface GeologicalFeature {
  type: 'rock' | 'sand' | 'crater' | 'ridge' | 'valley' | 'outcrop' | 'debris';
  confidence: number;
  description: string;
  coordinates?: { x: number; y: number; width: number; height: number };
}

export interface ColorAnalysis {
  dominant: string[];
  palette: string[];
  mood: 'warm' | 'cool' | 'neutral';
  saturation: 'high' | 'medium' | 'low';
}

export interface NaturalLanguageQuery {
  query: string;
  intent: 'search' | 'filter' | 'question' | 'comparison';
  entities: {
    camera?: string;
    sol?: number;
    date?: string;
    features?: string[];
    colors?: string[];
    weather?: string;
  };
  confidence: number;
}

export interface AIGeneratedContent {
  title: string;
  description: string;
  story: string;
  scientificContext: string;
  interestingFacts: string[];
  relatedTopics: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    photos?: MarsPhoto[];
    analysis?: AIImageAnalysis;
    suggestions?: string[];
  };
}

class AIService {
  private analysisCache = new Map<string, AIImageAnalysis>();
  private chatHistory: ChatMessage[] = [];

  // Image Analysis using AI
  async analyzeImage(photo: MarsPhoto): Promise<AIImageAnalysis> {
    const cacheKey = `${photo.id}-${photo.img_src}`;
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    if (AI_CONFIG.mockMode) {
      // Mock AI analysis for demonstration
      const analysis = this.generateMockAnalysis(photo);
      this.analysisCache.set(cacheKey, analysis);
      return analysis;
    }

    try {
      // In production, you'd call a real AI service
      const response = await fetch(AI_CONFIG.endpoints.imageAnalysis, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          imageUrl: photo.img_src,
          metadata: {
            sol: photo.sol,
            camera: photo.camera.name,
            earthDate: photo.earth_date,
            rover: photo.rover.name,
          },
        }),
      });

      const analysis = await response.json();
      this.analysisCache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('AI image analysis failed:', error);
      // Fallback to mock analysis
      const analysis = this.generateMockAnalysis(photo);
      this.analysisCache.set(cacheKey, analysis);
      return analysis;
    }
  }

  // Natural Language Search
  async processNaturalLanguageQuery(query: string): Promise<NaturalLanguageQuery> {
    if (AI_CONFIG.mockMode) {
      return this.parseMockQuery(query);
    }

    try {
      const response = await fetch(AI_CONFIG.endpoints.naturalLanguageSearch, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify({ query }),
      });

      return await response.json();
    } catch (error) {
      console.error('Natural language processing failed:', error);
      return this.parseMockQuery(query);
    }
  }

  // AI Content Generation
  async generateContent(photo: MarsPhoto, analysis?: AIImageAnalysis): Promise<AIGeneratedContent> {
    if (AI_CONFIG.mockMode) {
      return this.generateMockContent(photo, analysis);
    }

    try {
      const response = await fetch(AI_CONFIG.endpoints.contentGeneration, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          photo,
          analysis,
          type: 'comprehensive',
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Content generation failed:', error);
      return this.generateMockContent(photo, analysis);
    }
  }

  // AI Chat Assistant
  async chatWithAssistant(message: string, context?: {
    photos?: MarsPhoto[];
    currentView?: string;
  }): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    this.chatHistory.push(userMessage);

    if (AI_CONFIG.mockMode) {
      const response = this.generateMockChatResponse(message, context);
      this.chatHistory.push(response);
      return response;
    }

    try {
      const response = await fetch(AI_CONFIG.endpoints.chatAssistant, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          message,
          context,
          history: this.chatHistory.slice(-10), // Last 10 messages for context
        }),
      });

      const assistantMessage = await response.json();
      this.chatHistory.push(assistantMessage);
      return assistantMessage;
    } catch (error) {
      console.error('Chat assistant failed:', error);
      const response = this.generateMockChatResponse(message, context);
      this.chatHistory.push(response);
      return response;
    }
  }

  // Smart Photo Recommendations using ML
  async getSmartRecommendations(
    photos: MarsPhoto[],
    userPreferences: {
      favoriteCamera?: string;
      preferredFeatures?: string[];
      viewingHistory?: MarsPhoto[];
    }
  ): Promise<{
    photo: MarsPhoto;
    reason: string;
    confidence: number;
  }[]> {
    // Simulate ML-based recommendations
    const recommendations = photos
      .map(photo => {
        let score = Math.random() * 0.4 + 0.3; // Base score 0.3-0.7

        // Boost score based on user preferences
        if (userPreferences.favoriteCamera && photo.camera.name === userPreferences.favoriteCamera) {
          score += 0.2;
        }

        // Boost based on sol diversity
        const avgSol = userPreferences.viewingHistory?.reduce((sum, p) => sum + p.sol, 0) / 
                      (userPreferences.viewingHistory?.length || 1);
        const solDifference = Math.abs(photo.sol - avgSol);
        if (solDifference > 100 && solDifference < 500) {
          score += 0.15;
        }

        return {
          photo,
          confidence: Math.min(score, 0.95),
          reason: this.generateRecommendationReason(photo, userPreferences, score),
        };
      })
      .filter(rec => rec.confidence > 0.6)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    return recommendations;
  }

  // Mock implementations for demonstration
  private generateMockAnalysis(photo: MarsPhoto): AIImageAnalysis {
    const features = ['rock', 'sand', 'crater', 'ridge', 'outcrop'] as const;
    const colors = ['#8B4513', '#CD853F', '#D2691E', '#A0522D', '#F4A460'];
    
    return {
      tags: this.generateMockTags(photo),
      description: this.generateMockDescription(photo),
      geologicalFeatures: [
        {
          type: features[Math.floor(Math.random() * features.length)],
          confidence: 0.7 + Math.random() * 0.25,
          description: 'Sedimentary rock formation with visible layering',
          coordinates: { x: 100, y: 150, width: 200, height: 100 },
        },
      ],
      confidence: 0.8 + Math.random() * 0.15,
      colors: {
        dominant: colors.slice(0, 3),
        palette: colors,
        mood: 'warm',
        saturation: 'medium',
      },
      composition: ['iron oxide', 'silicate minerals', 'dust particles'],
      weatherConditions: Math.random() > 0.5 ? 'clear' : 'dusty',
      timeOfDay: ['morning', 'midday', 'afternoon', 'evening'][Math.floor(Math.random() * 4)] as any,
    };
  }

  private generateMockTags(photo: MarsPhoto): string[] {
    const baseTags = ['mars', 'rover', photo.rover.name.toLowerCase(), photo.camera.name.toLowerCase()];
    const contextTags = ['red planet', 'geology', 'exploration', 'space', 'nasa'];
    const featureTags = ['rocks', 'terrain', 'surface', 'landscape', 'martian'];
    
    return [...baseTags, ...contextTags.slice(0, 2), ...featureTags.slice(0, 2)];
  }

  private generateMockDescription(photo: MarsPhoto): string {
    const descriptions = [
      `Fascinating Martian terrain captured by ${photo.rover.name} on Sol ${photo.sol}`,
      `Detailed view of Mars surface showing geological formations and rock structures`,
      `High-resolution image revealing the unique landscape of the Red Planet`,
      `Scientific documentation of Martian geology through robotic exploration`,
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private parseMockQuery(query: string): NaturalLanguageQuery {
    const lowerQuery = query.toLowerCase();
    const entities: any = {};
    
    // Extract camera mentions
    const cameras = ['fhaz', 'rhaz', 'mast', 'chemcam', 'mahli', 'mardi', 'navcam'];
    cameras.forEach(camera => {
      if (lowerQuery.includes(camera)) {
        entities.camera = camera.toUpperCase();
      }
    });

    // Extract sol mentions
    const solMatch = lowerQuery.match(/sol\s*(\d+)/);
    if (solMatch) {
      entities.sol = parseInt(solMatch[1]);
    }

    // Extract features
    const features = ['rock', 'sand', 'crater', 'ridge', 'dust'];
    entities.features = features.filter(feature => lowerQuery.includes(feature));

    return {
      query,
      intent: lowerQuery.includes('?') ? 'question' : 'search',
      entities,
      confidence: 0.8,
    };
  }

  private generateMockContent(photo: MarsPhoto, analysis?: AIImageAnalysis): AIGeneratedContent {
    return {
      title: `Mars Sol ${photo.sol}: ${photo.camera.full_name} Perspective`,
      description: `This remarkable image from ${photo.rover.name} rover showcases the diverse Martian landscape on Sol ${photo.sol}.`,
      story: `On this Martian day, ${photo.rover.name} positioned its ${photo.camera.full_name} to capture this stunning view. The image reveals the ancient geological processes that shaped Mars billions of years ago.`,
      scientificContext: `The ${photo.camera.name} camera provides crucial data for understanding Martian geology and potential past habitability.`,
      interestingFacts: [
        `This photo was taken ${Math.floor(Math.random() * 4000)} sols into the mission`,
        `The camera used has a resolution capable of detecting objects as small as ${Math.random() * 2 + 0.5}mm`,
        `Mars receives only 43% of the sunlight that Earth does`,
      ],
      relatedTopics: ['Martian geology', 'Rover technology', 'Space exploration', 'Planetary science'],
    };
  }

  private generateMockChatResponse(message: string, context?: any): ChatMessage {
    const responses = [
      "That's a fascinating question about Mars exploration! Based on the images you're viewing, I can see some interesting geological features.",
      "The Martian landscape is truly remarkable. What you're seeing here represents billions of years of geological history.",
      "Great observation! The rover's cameras are designed to capture these details for scientific analysis.",
      "This type of terrain is common in this region of Mars. Would you like to know more about the geological processes involved?",
    ];

    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      metadata: {
        suggestions: [
          'Tell me more about this geological formation',
          'Show me similar photos',
          'What camera was used for this image?',
          'Explain the scientific significance',
        ],
      },
    };
  }

  private generateRecommendationReason(
    photo: MarsPhoto,
    preferences: any,
    score: number
  ): string {
    const reasons = [
      `Similar to your favorite ${preferences.favoriteCamera} camera photos`,
      `Unique geological features detected in this Sol ${photo.sol} image`,
      `High-quality capture from ${photo.camera.full_name}`,
      `Interesting terrain variation from your recent viewing history`,
      `Scientifically significant formation worth exploring`,
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  // Utility methods
  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }

  getAnalysisCache(): Map<string, AIImageAnalysis> {
    return this.analysisCache;
  }
}

export const aiService = new AIService();
