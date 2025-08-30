// Environment configuration helper
// This file helps manage environment variables for development

export const ENV = {
  // Check if we're in development mode
  isDevelopment: __DEV__ || process.env.NODE_ENV === 'development',
  
  // Gemini API key from environment
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  
  // Helper to check if API key is configured
  hasGeminiKey(): boolean {
    return !!this.GEMINI_API_KEY && this.GEMINI_API_KEY.length > 10;
  },
  
  // Helper to get API key with validation
  getGeminiKey(): string {
    if (!this.hasGeminiKey()) {
      console.warn('Gemini API key not found. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
      return '';
    }
    return this.GEMINI_API_KEY!;
  }
};

export default ENV;
