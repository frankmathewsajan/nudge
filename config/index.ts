// Configuration file for the Nudge app
// Update these values when setting up the Gemini API

import ENV from '../utils/env';

export const config = {
  // Gemini API Configuration
  gemini: {
    apiKey: ENV.getGeminiKey(),
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    
    // Custom prompt template for goal analysis
    promptTemplate: (goals: string) => 
      `You are an expert life coach and goal-setting specialist. Analyze the following goals and provide a structured response:

Goals to analyze: "${goals}"

Please provide your response in the following JSON format:
{
  "motivation": "A powerful 2-3 sentence motivational message that inspires action",
  "suggestions": [
    "Practical suggestion 1",
    "Practical suggestion 2", 
    "Practical suggestion 3",
    "Practical suggestion 4"
  ],
  "steps": [
    "Specific actionable step 1",
    "Specific actionable step 2",
    "Specific actionable step 3",
    "Specific actionable step 4"
  ]
}

Make sure suggestions are practical and achievable, and steps are specific actions they can take immediately.`,
  },
  
  // App Configuration
  app: {
    name: 'Nudge',
    version: '1.0.0',
    mockMode: !ENV.hasGeminiKey(), // Automatically use mock mode if no API key
  },
};

export default config;
