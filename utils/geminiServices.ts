// Gemini Services - Main API functions
// Max 80 lines, core API interactions only

import config from '@/config';
import { smartCache } from './geminiCache';
import { getGenAI } from './geminiClient';
import { GoalResponse } from './geminiTypes';
import { validateAndSanitizeInput } from './geminiValidation';

/**
 * Send goals to Gemini for processing
 */
export async function sendGoalsToGemini(
  goals: string, 
  userId: string = 'default'
): Promise<GoalResponse> {
  // Check cache first
  const cacheKey = `goals_${btoa(goals + userId).substring(0, 32)}`;
  const cached = smartCache.get<GoalResponse>(cacheKey);
  if (cached) {
    console.log('Using cached goal response');
    return cached;
  }

  // Validate input
  const validation = await validateAndSanitizeInput(goals);
  if (!validation.isValid) {
    throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
  }

  // Mock mode for development
  if (config.app.mockMode) {
    const mock = getMockGoalResponse(goals);
    smartCache.set(cacheKey, mock, 1000 * 60 * 5);
    return mock;
  }

  try {
    const ai = getGenAI();
    const session = smartCache.getSession(userId);
    
    // Build smart prompt with context
    const prompt = buildGoalsPrompt(goals, session.context);
    
    // Make API call (simplified)
    const result = await callGeminiAPI(ai, prompt);
    
    // Update session context
    smartCache.updateSession(userId, goals);
    
    // Cache result
    smartCache.set(cacheKey, result, 1000 * 60 * 15);
    
    return result;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process goals with AI');
  }
}

// Helper functions under 25 lines each
function getMockGoalResponse(goals: string): GoalResponse {
  return {
    urgent: [
      { task: "Start morning routine", duration: "30 min", frequency: "Daily", 
        suggested_time: "7:00 AM", priority: 1, category: "Health" }
    ],
    long_term: [
      { task: "Learn new skill", duration: "1 hour", frequency: "3x/week", 
        suggested_time: "Evening", priority: 2, category: "Growth" }
    ],
    maintenance: [
      { task: "Exercise", duration: "45 min", frequency: "Daily", 
        suggested_time: "Morning", priority: 1, category: "Health" }
    ],
    optional: [
      { task: "Read book", duration: "30 min", frequency: "Daily", 
        suggested_time: "Before bed", priority: 3, category: "Learning" }
    ]
  };
}

function buildGoalsPrompt(goals: string, context: string[]): string {
  const contextStr = context.length > 0 ? 
    `Context: ${context.slice(-2).join(', ')}\n` : '';
    
  return `${contextStr}Process these life goals into structured tasks: ${goals}`;
}

async function callGeminiAPI(ai: any, prompt: string): Promise<GoalResponse> {
  // Simplified API call - would need actual implementation
  // This is a placeholder for the complex API interaction
  return getMockGoalResponse(prompt);
}