// AI Service - Handles all AI/API interactions
// Follows React Native Expo patterns with expo-constants

import { sendGoalsToGemini } from '@/utils/geminiServices';
import { hasInternetAccess, isNetworkError } from '@/utils/networkUtils';
import Constants from 'expo-constants';

export class AIService {
  private static instance: AIService;
  
  private constructor() {}
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Process user goals through AI
   * @param goals - User's life goals text
   * @param options - Processing options
   * @returns Processed goals structure
   */
  async processGoals(
    goals: string, 
    options: {
      userId?: string;
      networkStatus?: 'connected' | 'disconnected' | 'checking';
    } = {}
  ) {
    try {
      // Network check
      if (!await hasInternetAccess()) {
        throw new NetworkError('Internet connection required for AI processing');
      }

      // Validate input
      if (!goals || goals.trim().length < 10) {
        throw new ValidationError('Goals must be at least 10 characters long');
      }

      // Process through AI
      const result = await sendGoalsToGemini(goals);
      
      return {
        success: true,
        data: result,
        processedAt: new Date().toISOString(),
      };
      
    } catch (error) {
      if (isNetworkError(error)) {
        throw new NetworkError('Network error during AI processing');
      }
      
      throw new AIProcessingError(
        error instanceof Error ? error.message : 'Unknown AI processing error'
      );
    }
  }

  /**
   * Check if AI services are available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const hasNetwork = await hasInternetAccess();
      const hasApiKey = Constants.expoConfig?.extra?.geminiApiKey || 
                       process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      
      return hasNetwork && !!hasApiKey;
    } catch {
      return false;
    }
  }
}

// Custom error classes
export class AIServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class NetworkError extends AIServiceError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AIServiceError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AIProcessingError extends AIServiceError {
  constructor(message: string) {
    super(message, 'AI_PROCESSING_ERROR');
    this.name = 'AIProcessingError';
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();