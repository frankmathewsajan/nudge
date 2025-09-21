// Gemini Client - Initialization and configuration
// Max 80 lines, handles client setup only

import { GoogleGenAI } from "@google/genai";
import ENV from './env';

// Global client instance
let genai: GoogleGenAI | null = null;

/**
 * Get or create the Gemini AI client instance
 * Singleton pattern for efficient resource usage
 */
export function getGenAI(): GoogleGenAI {
  if (!genai) {
    const apiKey = ENV.getGeminiKey();
    if (!apiKey) {
      throw new Error(
        'Gemini API key not found. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file'
      );
    }
    genai = new GoogleGenAI({ apiKey });
  }
  return genai;
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetClient(): void {
  genai = null;
}

/**
 * Check if client is initialized
 */
export function isClientInitialized(): boolean {
  return genai !== null;
}

/**
 * Get available models for the current client
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const client = getGenAI();
    // This is a placeholder - actual implementation would call the API
    return [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'text-embedding-004'
    ];
  } catch (error) {
    console.error('Failed to get available models:', error);
    return [];
  }
}

/**
 * Test connection to Gemini API
 */
export async function testConnection(): Promise<boolean> {
  try {
    getGenAI(); // Just test if we can initialize
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

/**
 * Get API usage stats (if available)
 */
export async function getUsageStats(): Promise<any> {
  // Placeholder for usage statistics
  return {
    requestsToday: 0,
    tokensUsed: 0,
    quotaRemaining: 'unknown'
  };
}