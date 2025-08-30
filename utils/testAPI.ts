// Test utility for Gemini API
// Run this to verify your API key and connection work

import ENV from './env';
import { sendGoalsToGeminiAPI } from './geminiAPI';

export async function testGeminiConnection(): Promise<void> {
  console.log('🧪 Testing Gemini API Connection...');
  
  // Check API key
  if (!ENV.hasGeminiKey()) {
    console.error('❌ No Gemini API key found');
    console.log('💡 Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
    return;
  }
  
  console.log('✅ API key found');
  
  // Test API call
  try {
    console.log('📡 Making test API call...');
    const response = await sendGoalsToGeminiAPI('I want to learn React Native and build amazing apps');
    
    console.log('✅ API call successful!');
    console.log('📝 Response:', {
      motivation: response.motivation.substring(0, 50) + '...',
      suggestionsCount: response.suggestions.length,
      stepsCount: response.steps.length
    });
    
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.log('💡 Check your API key and internet connection');
  }
}

// Uncomment the line below to run the test
// testGeminiConnection();
