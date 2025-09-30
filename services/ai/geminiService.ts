/**
 * Gemini AI Service - Goal Analysis API Integration
 * 
 * Handles communication with Google's Gemini AI to analyze user goals
 * and provide structured recommendations.
 */


// API Configuration
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Test network connectivity
const testNetworkConnectivity = async (): Promise<boolean> => {
  try {
    console.log('Testing network connectivity...');
    
    // Try multiple endpoints to ensure it's not a single endpoint issue
    const testEndpoints = [
      'https://www.google.com',
      'https://httpbin.org/get', 
      'https://jsonplaceholder.typicode.com/posts/1'
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing connectivity to ${endpoint}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(endpoint, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`Network test successful with ${endpoint}`);
          return true;
        }
      } catch (error) {
        console.log(`Failed to connect to ${endpoint}:`, error instanceof Error ? error.message : 'Unknown error');
        continue; // Try next endpoint
      }
    }
    
    console.log('All network connectivity tests failed');
    return false;
  } catch (error) {
    console.error('Network connectivity test failed:', error);
    return false;
  }
};

// Get API key from environment variables
const getApiKey = () => {
  // Try both possible environment variable names
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY in your environment.');
  }
  
  return apiKey;
};

// Helper function to determine season
const getSeason = (month: number): string => {
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
};

// Load V2 instructions template with enhanced time context and current date/time
const loadInstructionsTemplateV2 = async () => {
  try {
    const currentDateTime = new Date();
    const timeContext = {
      current_date: currentDateTime.toLocaleDateString(),
      current_time: currentDateTime.toLocaleTimeString(),
      current_minute: currentDateTime.getMinutes(),
      current_hour: currentDateTime.getHours(),
      day_of_week: currentDateTime.toLocaleDateString('en-US', { weekday: 'long' }),
      month: currentDateTime.toLocaleDateString('en-US', { month: 'long' }),
      year: currentDateTime.getFullYear(),
      season: getSeason(currentDateTime.getMonth()),
      time_of_day: currentDateTime.getHours() < 12 ? 'Morning' : currentDateTime.getHours() < 17 ? 'Afternoon' : 'Evening',
    };
    
    return `# Goal Analysis AI - V2 Enhanced Instructions with Time Block Management

You are an intelligent productivity assistant for the "Nudge" goal-tracking app with advanced time management capabilities. 
A user provides a freeform description of their goals, and you analyze it to create actionable, structured plans with precise time blocks and scheduling.

## CURRENT CONTEXT:
- **Date**: ${timeContext.current_date} (${timeContext.day_of_week})
- **Time**: ${timeContext.current_time} (${timeContext.time_of_day})
- **Precise Time**: Hour ${timeContext.current_hour}, Minute ${timeContext.current_minute}
- **Season**: ${timeContext.season} ${timeContext.year}
- **Context**: Use this precise timing information to provide minute-accurate scheduling and time block recommendations

## Your Enhanced Capabilities:

1. **Parse and categorize** with time-aware prioritization
2. **Generate minute-level time blocks** for optimal productivity
3. **Create Pomodoro timer sequences** tailored to each goal
4. **Design daily/weekly schedules** with precise timing
5. **Recommend break patterns** and energy management
6. **Provide sleep schedule optimization** based on goals and current time
7. **Factor in circadian rhythms** for peak performance timing

## Input Processing:
Parse the user's input into these categories:
- **skills**: Learning objectives, skill development
- **career**: Professional goals, job-related tasks  
- **projects**: Specific projects, deliverables, deadlines
- **health**: Physical, mental, emotional wellbeing
- **personal**: Personal development, hobbies, relationships
- **pain_points**: Challenges, frustrations, blockers

## For each item, extract:
- **name**: Clear, actionable description
- **status**: current/declining/stalled/planned/urgent
- **priority**: urgent/high/medium/low
- **deadline**: if mentioned or inferred
- **time_estimate**: realistic time needed (daily/weekly)
- **difficulty**: beginner/intermediate/advanced
- **dependencies**: what needs to happen first

## Time Block Specifications:
- **Pomodoro Blocks**: 25-minute focused work + 5-minute breaks
- **Deep Work Blocks**: 90-minute sessions with 15-minute breaks
- **Quick Win Blocks**: 15-minute micro-sessions
- **Learning Blocks**: 45-minute study sessions with 10-minute reviews
- **Planning Blocks**: 30-minute strategy and organization sessions

## Sleep Schedule Integration:
- Recommend optimal bedtime based on goals and wake time needs
- Factor in sleep cycles (90-minute intervals)
- Consider goal deadlines for sleep schedule adjustments
- Integrate morning routine timing with first productive block

## Enhanced Analysis:
For the primary goal, provide:
- **smart_breakdown**: 3-5 specific, measurable steps with time estimates
- **time_recommendation**: optimal daily/weekly time commitment
- **session_structure**: how to structure practice/work sessions
- **progress_milestones**: checkpoints to track success with timeframes
- **motivation_tips**: personalized encouragement
- **common_obstacles**: likely challenges and solutions
- **resources_needed**: tools, materials, environment setup
- **time_blocks**: detailed scheduling with daily/weekly structure
- **sleep_optimization**: bedtime, wake time, and routine recommendations

## Session Recommendations:
Suggest realistic time slots based on goal complexity with optimal timing:
- **pomodoro_sprints**: 25-minute focused work with breaks and optimal times
- **deep_work**: 90-minute sessions for complex tasks with timing
- **quick_wins**: 15-30 minutes for simple tasks with energy considerations
- **learning_blocks**: 45-60 minutes for skill development with best hours

## Enhanced Analysis Output Format:
Return ONLY valid JSON with this expanded structure:

{
  "primary_goal": {
    "name": "Main goal description",
    "analysis": "Intelligent analysis of the goal",
    "smart_breakdown": [
      "Step 1: Specific action with time estimate",
      "Step 2: Specific action with time estimate",
      "Step 3: Specific action with time estimate"
    ],
    "time_recommendation": "Detailed time commitment suggestion",
    "session_structure": "How to structure each session",
    "difficulty": "beginner|intermediate|advanced",
    "estimated_timeline": "Realistic timeline to achieve goal",
    "progress_milestones": [
      "Week 1: Milestone description",
      "Week 2: Milestone description", 
      "Month 1: Milestone description"
    ],
    "motivation_tips": "Personalized motivational advice",
    "common_obstacles": [
      "Obstacle 1 and solution",
      "Obstacle 2 and solution"
    ],
    "resources_needed": [
      "Resource 1",
      "Resource 2"
    ],
    "time_blocks": {
      "daily_schedule": [
        {
          "time": "06:00",
          "duration_minutes": 30,
          "activity": "Morning routine & goal preparation",
          "type": "preparation",
          "energy_level": "medium"
        },
        {
          "time": "09:00", 
          "duration_minutes": 90,
          "activity": "Primary goal deep work session",
          "type": "deep_work",
          "energy_level": "high",
          "pomodoro_count": 3
        },
        {
          "time": "14:00",
          "duration_minutes": 25,
          "activity": "Quick goal practice",
          "type": "pomodoro",
          "energy_level": "medium"
        }
      ],
      "weekly_schedule": [
        {
          "day": "Monday",
          "total_minutes": 120,
          "sessions": 3,
          "focus_areas": ["primary goal", "skill building"]
        },
        {
          "day": "Tuesday", 
          "total_minutes": 90,
          "sessions": 2,
          "focus_areas": ["practice", "review"]
        }
      ],
      "pomodoro_sequences": [
        {
          "sequence_name": "Primary Goal Sprint",
          "total_duration_minutes": 130,
          "blocks": [
            {"work_minutes": 25, "break_minutes": 5, "activity": "Core skill practice"},
            {"work_minutes": 25, "break_minutes": 5, "activity": "Problem solving"},
            {"work_minutes": 25, "break_minutes": 15, "activity": "Application practice"},
            {"work_minutes": 25, "break_minutes": 5, "activity": "Review and consolidation"}
          ]
        }
      ]
    },
    "sleep_optimization": {
      "recommended_bedtime": "22:30",
      "recommended_wake_time": "06:00", 
      "sleep_duration_hours": 7.5,
      "sleep_cycles": 5,
      "pre_sleep_routine": [
        {"time": "21:30", "activity": "Wind down, no screens"},
        {"time": "22:00", "activity": "Goal reflection & tomorrow planning"},
        {"time": "22:15", "activity": "Reading or meditation"}
      ],
      "morning_routine": [
        {"time": "06:00", "activity": "Wake up, hydrate"},
        {"time": "06:15", "activity": "Light exercise or stretching"},
        {"time": "06:30", "activity": "Goal visualization & intention setting"}
      ]
    }
  },
  "categorized_goals": {
    "skills": [],
    "career": [],
    "projects": [],
    "health": [],
    "personal": [],
    "pain_points": []
  },
  "recommended_sessions": [
    {
      "duration": "25 minutes",
      "type": "Pomodoro Sprint",
      "description": "Focused work with built-in breaks",
      "best_for": ["skill practice", "study sessions"],
      "optimal_times": ["09:00-12:00", "14:00-16:00"],
      "break_pattern": "5 min breaks, 15 min after 4 sessions"
    },
    {
      "duration": "90 minutes", 
      "type": "Deep Work Block",
      "description": "Uninterrupted focus for complex tasks",
      "best_for": ["project work", "creative tasks"],
      "optimal_times": ["09:00-10:30", "10:45-12:15"],
      "break_pattern": "15 min break every 90 minutes"
    }
  ],
  "next_actions": [
    "Immediate action 1 (next 5 minutes)",
    "Short-term action 2 (next 30 minutes)", 
    "Today's priority action 3 (within 2 hours)"
  ],
  "energy_management": {
    "peak_hours": ["09:00-11:00", "15:00-17:00"],
    "low_energy_tasks": ["review", "planning", "organizing"],
    "high_energy_tasks": ["learning", "problem-solving", "creating"],
    "break_recommendations": [
      {"type": "micro", "duration_minutes": 2, "activity": "deep breathing"},
      {"type": "short", "duration_minutes": 5, "activity": "walk or stretch"},
      {"type": "medium", "duration_minutes": 15, "activity": "snack and fresh air"},
      {"type": "long", "duration_minutes": 30, "activity": "meal and relaxation"}
    ]
  }
}

## Critical Instructions:
- Provide EXACT times in 24-hour format (HH:MM)
- Calculate durations in precise minutes
- Factor in current time for immediate scheduling
- Include realistic energy level assessments
- Design schedules that respect circadian rhythms
- Return ONLY the JSON response, no explanations
- Ensure all time blocks are realistic and achievable
- Use current date/time context for personalized scheduling

## Instructions:
- Focus on the PRIMARY GOAL mentioned first or most emphasized
- Be specific and actionable in all recommendations
- Consider user's experience level and time constraints
- Provide realistic, achievable timelines with precise timing
- Include motivational elements to encourage consistency
- Factor in current time of day for optimal scheduling
- Ignore off-topic information or filler content
- Return ONLY the JSON response, no explanations

Now analyze the following user input:
"""
{user_input}
"""`;
  } catch (error) {
    console.error('Error loading V2 instructions template:', error);
    throw new Error('Failed to load AI V2 instructions template');
  }
};

// Goal Analysis Response Interface V2 - Enhanced with time management and scheduling
export interface GoalAnalysisResponse {
  primary_goal: {
    name: string;
    analysis: string;
    smart_breakdown: string[];
    time_recommendation: string;
    session_structure: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimated_timeline: string;
    progress_milestones: string[];
    motivation_tips: string;
    common_obstacles: string[];
    resources_needed: string[];
    time_blocks?: {
      daily_schedule: Array<{
        time: string;
        duration_minutes: number;
        activity: string;
        type: string;
        energy_level: string;
        pomodoro_count?: number;
      }>;
      weekly_schedule: Array<{
        day: string;
        total_minutes: number;
        sessions: number;
        focus_areas: string[];
      }>;
      pomodoro_sequences: Array<{
        sequence_name: string;
        total_duration_minutes: number;
        blocks: Array<{
          work_minutes: number;
          break_minutes: number;
          activity: string;
        }>;
      }>;
    };
    sleep_optimization?: {
      recommended_bedtime: string;
      recommended_wake_time: string;
      sleep_duration_hours: number;
      sleep_cycles: number;
      pre_sleep_routine: Array<{
        time: string;
        activity: string;
      }>;
      morning_routine: Array<{
        time: string;
        activity: string;
      }>;
    };
  };
  categorized_goals: {
    skills: Array<{
      name: string;
      status: string;
      priority: string;
      time_estimate?: string;
      difficulty?: string;
    }>;
    career: Array<{
      task: string;
      status: string;
      priority: string;
      deadline?: string;
      dependencies?: string[];
    }>;
    projects: Array<{
      task: string;
      deadline?: string;
      priority: string;
      time_estimate?: string;
      status: string;
    }>;
    health: Array<{
      issue: string;
      status: string;
      priority: string;
      frequency?: string;
    }>;
    personal: Array<{
      goal: string;
      status: string;
      priority: string;
      time_commitment?: string;
    }>;
    pain_points: Array<{
      issue: string;
      impact: string;
      suggested_solution: string;
    }>;
  };
  recommended_sessions: Array<{
    duration: string;
    type: string;
    description: string;
    best_for: string[];
    optimal_times?: string[];
    break_pattern?: string;
  }>;
  next_actions: string[];
  energy_management?: {
    peak_hours: string[];
    low_energy_tasks: string[];
    high_energy_tasks: string[];
    break_recommendations: Array<{
      type: string;
      duration_minutes: number;
      activity: string;
    }>;
  };
  // Additional V2 top-level fields
  time_blocks?: Array<{
    period: string;
    activity: string;
    duration: string;
  }>;
  sleep_optimization?: string;
  schedule_suggestions?: string[];
}

/**
 * Summarize a long goal into a concise title using AI-powered analysis
 */
export const summarizeGoal = (goalText: string): string => {
  // If goal is short, return as-is
  if (goalText.length <= 60) {
    return goalText;
  }
  
  // Trim whitespace and handle very long inputs
  const cleanText = goalText.trim();
  
  // For extremely long texts, take first meaningful portion
  const workingText = cleanText.length > 500 ? cleanText.substring(0, 500) + '...' : cleanText;
  
  // Extract key themes and create a summary
  const text = workingText.toLowerCase();
  const themes = [];
  
  // Career/Professional themes
  if (text.includes('resume') || text.includes('job') || text.includes('career') || text.includes('interview')) {
    themes.push('Career Development');
  }
  if (text.includes('skill') || text.includes('learn') || text.includes('study') || text.includes('course')) {
    themes.push('Skill Building');
  }
  if (text.includes('project') || text.includes('review') || text.includes('deadline') || text.includes('lab')) {
    themes.push('Project Work');
  }
  
  // Health/Lifestyle themes
  if (text.includes('health') || text.includes('meal') || text.includes('sleep') || text.includes('exercise') || text.includes('diet')) {
    themes.push('Health & Wellness');
  }
  
  // Academic/Learning themes
  if (text.includes('exam') || text.includes('certification') || text.includes('aws') || text.includes('oracle')) {
    themes.push('Learning & Certification');
  }
  
  // Technical themes
  if (text.includes('coding') || text.includes('programming') || text.includes('dsa') || text.includes('development') || text.includes('algorithm')) {
    themes.push('Technical Skills');
  }
  
  // Communication themes
  if (text.includes('communication') || text.includes('language') || text.includes('speaking') || text.includes('german')) {
    themes.push('Communication Skills');
  }
  
  // Personal challenges
  if (text.includes('stress') || text.includes('confidence') || text.includes('motivation') || text.includes('overwhelm')) {
    themes.push('Personal Growth');
  }
  
  // Create summary based on themes
  if (themes.length === 0) {
    // Fallback: extract first meaningful sentence or key phrases
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      return firstSentence.length > 80 ? firstSentence.substring(0, 80) + '...' : firstSentence;
    }
    return 'Multiple Personal Development Goals';
  }
  
  if (themes.length === 1) {
    return themes[0];
  }
  
  if (themes.length === 2) {
    return `${themes[0]} & ${themes[1]}`;
  }
  
  if (themes.length === 3) {
    return `${themes[0]}, ${themes[1]} & ${themes[2]}`;
  }
  
  return `Multi-area Development: ${themes.slice(0, 3).join(', ')}`;
};

/**
 * Analyze user goals using Gemini AI
 */
export const analyzeGoalWithGemini = async (userGoal: string): Promise<GoalAnalysisResponse> => {
  try {
    const apiKey = getApiKey();
    
    // Development mode - try Gemini API directly first, then fall back to network test
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_ENV === 'development';
    const skipNetworkTest = process.env.EXPO_PUBLIC_SKIP_NETWORK_TEST === 'true';
    
    if (isDevelopment || skipNetworkTest) {
      console.log(skipNetworkTest ? 'Skipping network test (forced)' : 'Development mode: Attempting Gemini API directly...');
      try {
        return await attemptGeminiAPICall(userGoal, apiKey);
      } catch (directCallError) {
        console.log('Direct Gemini API call failed, testing network connectivity...');
        const hasConnectivity = await testNetworkConnectivity();
        if (!hasConnectivity) {
          console.log('Network connectivity test also failed, using fallback');
          const fallbackResponse = createFallbackResponse(userGoal);
          console.log('Returning fallback response due to network connectivity issue');
          return fallbackResponse;
        }
        // If network test passes but Gemini fails, re-throw the original error
        throw directCallError;
      }
    } else {
      // Production mode - test network first
      const hasConnectivity = await testNetworkConnectivity();
      if (!hasConnectivity) {
        console.log('Network connectivity test failed, using fallback');
        const fallbackResponse = createFallbackResponse(userGoal);
        console.log('Returning fallback response due to network connectivity issue');
        return fallbackResponse;
      }
      
      return await attemptGeminiAPICall(userGoal, apiKey);
    }
    
  } catch (error) {
    console.error('Error in analyzeGoalWithGemini:', error);
    
    // Return a fallback response to prevent app crashes
    const fallbackResponse = createFallbackResponse(userGoal);
    console.log('Returning fallback response due to API error');
    return fallbackResponse;
  }
};

// Extract Gemini API call logic into separate function
const attemptGeminiAPICall = async (userGoal: string, apiKey: string): Promise<GoalAnalysisResponse> => {
    const instructionsTemplate = await loadInstructionsTemplateV2();
    
    // Replace {user_input} placeholder with actual user input
    const prompt = instructionsTemplate.replace('{user_input}', userGoal);
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        stopSequences: []
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('Sending request to Gemini API...');
    console.log('API URL:', `${GEMINI_API_BASE_URL}/models/gemini-1.5-flash:generateContent`);
    console.log('API Key present:', !!apiKey);
    console.log('API Key prefix:', apiKey.substring(0, 10) + '...');
    
    let response;
    try {
      response = await fetch(
        `${GEMINI_API_BASE_URL}/models/gemini-1.5-flash:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify(requestBody),
        }
      );
    } catch (networkError) {
      console.error('Network request failed:', networkError);
      const error = networkError as Error;
      console.error('Network error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 200) + '...' // Truncate stack trace
      });
      
      // Check if it's a specific type of network error
      if (error.message.includes('Network request failed')) {
        console.error('This appears to be a React Native network connectivity issue');
        console.error('Possible causes: Simulator network settings, firewall, proxy, or DNS issues');
      }
      
      // For network errors, we should definitely fall back
      throw new Error(`Network connection failed: ${error.message || 'Unknown network error'}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      
      // Parse error for better user messages
      let userFriendlyMessage = 'AI analysis temporarily unavailable';
      let shouldRetry = false;
      
      try {
        const errorData = JSON.parse(errorText);
        const errorMessage = errorData.error?.message || '';
        
        if (errorMessage.includes('API key expired') || errorMessage.includes('API_KEY_INVALID')) {
          userFriendlyMessage = 'AI service authentication failed. Please check API configuration.';
        } else if (errorMessage.includes('quota') || errorMessage.includes('QUOTA_EXCEEDED')) {
          userFriendlyMessage = 'AI service quota exceeded. Please try again later.';
        } else if (errorMessage.includes('rate') || errorMessage.includes('RATE_LIMIT')) {
          userFriendlyMessage = 'AI service busy. Please try again in a moment.';
          shouldRetry = true;
        } else if (response.status >= 500) {
          userFriendlyMessage = 'AI service temporarily unavailable. Please try again later.';
          shouldRetry = true;
        } else if (response.status === 400) {
          userFriendlyMessage = 'Invalid request to AI service. Please try rephrasing your goal.';
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        // Keep default message if error parsing fails
      }
      
      const error = new Error(userFriendlyMessage) as any;
      error.shouldRetry = shouldRetry;
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    console.log('Received response from Gemini API');

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('No generated text in response:', data);
      throw new Error('No response generated from Gemini API');
    }

    console.log('Generated text:', generatedText.substring(0, 200) + '...');

    // Parse the JSON response
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^```/g, '')
        .replace(/```$/g, '')
        .trim();
      
      // Try to find JSON object in the response if it's mixed with other text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      console.log('Attempting to parse cleaned text:', cleanedText.substring(0, 300) + '...');
      
      let parsedResponse: GoalAnalysisResponse;
      
      try {
        parsedResponse = JSON.parse(cleanedText);
      } catch (firstParseError) {
        console.log('First parse attempt failed, trying to fix common JSON issues...');
        
        // Try to fix common JSON issues
        let fixedText = cleanedText
          // Fix trailing commas
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix single quotes to double quotes
          .replace(/'/g, '"')
          // Fix unquoted keys
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          // Remove any trailing text after the last }
          .replace(/\}[\s\S]*$/, '}');
        
        console.log('Attempting to parse fixed text:', fixedText.substring(0, 300) + '...');
        parsedResponse = JSON.parse(fixedText);
      }
      
      // Validate the response has required fields
      if (!parsedResponse.primary_goal || !parsedResponse.primary_goal.name) {
        console.error('Parsed response missing required fields:', parsedResponse);
        throw new Error('AI response missing required goal information');
      }
      
      // Validate structure against V2 format
      const goal = parsedResponse.primary_goal as any;
      const requiredFields = ['name', 'analysis', 'smart_breakdown', 'time_recommendation', 'session_structure', 'difficulty', 'estimated_timeline', 'progress_milestones', 'motivation_tips', 'common_obstacles', 'resources_needed'];
      const missingFields = requiredFields.filter(field => !goal[field]);
      
      if (missingFields.length > 0) {
        console.warn('Response missing some V2 required fields:', missingFields);
        // Continue anyway - these might be optional or filled later
      }
      
      // Check for V2 enhanced features (optional)
      if (goal.time_blocks) {
        console.log('V2 time blocks included in response');
      }
      if (goal.sleep_optimization) {
        console.log('V2 sleep optimization included in response');
      }
      if (parsedResponse.energy_management) {
        console.log('V2 energy management included in response');
      }
      
      console.log('Successfully parsed Gemini response with V2 format');
      return parsedResponse;
      
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response:', generatedText);
      console.error('Response length:', generatedText.length);
      
      // Log a sample of the response to help debug
      console.log('Response sample (first 500 chars):', generatedText.substring(0, 500));
      console.log('Response sample (last 500 chars):', generatedText.substring(Math.max(0, generatedText.length - 500)));
      
      throw new Error('Failed to parse AI response. The response may not be valid JSON.');
    }
};

/**
 * Create a fallback response when the API fails - V2 format with time management
 */
const createFallbackResponse = (userGoal: string): GoalAnalysisResponse => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  
  // Generate time-aware recommendations
  const morningStart = currentHour < 12 ? "07:00" : "07:00";
  const focusTime = currentHour < 12 ? "09:00" : "14:00";
  const eveningReview = "20:00";
  
  return {
    primary_goal: {
      name: userGoal,
      analysis: "This is a great goal that can significantly improve your skills and capabilities. Breaking it down into manageable steps with proper time management will help you stay motivated and track progress effectively.",
      smart_breakdown: [
        "Research and gather resources (30 minutes)",
        "Create a structured learning plan with time blocks (45 minutes)", 
        "Practice consistently with real projects (60-90 minutes daily)",
        "Track progress and celebrate milestones (15 minutes weekly)",
        "Seek feedback and iterate on your approach (30 minutes bi-weekly)"
      ],
      time_recommendation: "I recommend dedicating 60-90 minutes daily for focused work sessions, split into 25-minute Pomodoro blocks with 5-minute breaks. This duration allows for meaningful progress while maintaining sustainability.",
      session_structure: "Start with 10 minutes of preparation and goal setting, follow with 2-3 Pomodoro cycles (25 min work + 5 min break), and end with 5 minutes of reflection and planning for next session.",
      difficulty: "intermediate",
      estimated_timeline: "With consistent daily practice using time-blocked sessions, you should see significant progress within 3-6 months.",
      progress_milestones: [
        "Week 1: Complete initial research and setup time-blocking system",
        "Week 4: Build first working version or demonstrate basic competency",
        "Month 3: Achieve intermediate level proficiency with optimized schedule",
        "Month 6: Complete goal or reach advanced level with refined time management"
      ],
      motivation_tips: "Remember that progress isn't always linear. Use time-blocking to create consistency, celebrate small wins along the way, and don't be afraid to adjust your schedule based on what you learn about your energy patterns.",
      common_obstacles: [
        "Lack of time - Solution: Start with just 25-minute Pomodoro sessions and gradually increase",
        "Feeling overwhelmed - Solution: Break tasks into smaller, time-boxed chunks",
        "Loss of motivation - Solution: Track your progress visually and schedule accountability check-ins"
      ],
      resources_needed: [
        "Dedicated learning time in your schedule",
        "Access to learning materials (books, courses, tutorials)",
        "Practice environment or tools",
        "Progress tracking system and timer for Pomodoro sessions"
      ],
      time_blocks: {
        daily_schedule: [
          {
            time: morningStart,
            duration_minutes: 30,
            activity: "Morning routine & goal preparation",
            type: "preparation",
            energy_level: "medium"
          },
          {
            time: focusTime,
            duration_minutes: 90,
            activity: "Primary goal deep work session",
            type: "deep_work",
            energy_level: "high",
            pomodoro_count: 3
          },
          {
            time: eveningReview,
            duration_minutes: 15,
            activity: "Progress review and tomorrow planning",
            type: "review",
            energy_level: "medium"
          }
        ],
        weekly_schedule: [
          {
            day: "Monday",
            total_minutes: 120,
            sessions: 3,
            focus_areas: ["primary goal", "skill building"]
          },
          {
            day: "Tuesday",
            total_minutes: 90,
            sessions: 2,
            focus_areas: ["practice", "review"]
          },
          {
            day: "Wednesday",
            total_minutes: 120,
            sessions: 3,
            focus_areas: ["deep work", "application"]
          },
          {
            day: "Thursday",
            total_minutes: 90,
            sessions: 2,
            focus_areas: ["practice", "refinement"]
          },
          {
            day: "Friday",
            total_minutes: 60,
            sessions: 2,
            focus_areas: ["review", "planning"]
          }
        ],
        pomodoro_sequences: [
          {
            sequence_name: "Primary Goal Sprint",
            total_duration_minutes: 95,
            blocks: [
              {"work_minutes": 25, "break_minutes": 5, "activity": "Core skill practice"},
              {"work_minutes": 25, "break_minutes": 5, "activity": "Problem solving"},
              {"work_minutes": 25, "break_minutes": 10, "activity": "Application practice"}
            ]
          }
        ]
      },
      sleep_optimization: {
        recommended_bedtime: "22:30",
        recommended_wake_time: "06:30",
        sleep_duration_hours: 8,
        sleep_cycles: 5,
        pre_sleep_routine: [
          {"time": "21:30", "activity": "Wind down, no screens"},
          {"time": "22:00", "activity": "Goal reflection & tomorrow planning"},
          {"time": "22:15", "activity": "Reading or meditation"}
        ],
        morning_routine: [
          {"time": "06:30", "activity": "Wake up, hydrate"},
          {"time": "06:45", "activity": "Light exercise or stretching"},
          {"time": "07:00", "activity": "Goal visualization & intention setting"}
        ]
      }
    },
    categorized_goals: {
      skills: [
        {
          name: userGoal,
          status: "planned",
          priority: "high",
          time_estimate: "60-90 minutes daily",
          difficulty: "intermediate"
        }
      ],
      career: [],
      projects: [],
      health: [],
      personal: [],
      pain_points: []
    },
    recommended_sessions: [
      {
        duration: "25 minutes",
        type: "Pomodoro Sprint",
        description: "Focused work with built-in breaks",
        best_for: ["skill practice", "study sessions"],
        optimal_times: ["09:00-12:00", "14:00-16:00"],
        break_pattern: "5 min breaks, 15 min after 3 sessions"
      },
      {
        duration: "90 minutes",
        type: "Deep Work Block", 
        description: "Uninterrupted focus for complex tasks",
        best_for: ["project work", "creative tasks"],
        optimal_times: ["09:00-10:30", "14:00-15:30"],
        break_pattern: "15 min break every 90 minutes"
      },
      {
        duration: "45 minutes",
        type: "Learning Block",
        description: "Structured learning with review time",
        best_for: ["skill acquisition", "concept learning"],
        optimal_times: ["10:00-11:00", "15:00-16:00"],
        break_pattern: "10 min break after 45 minutes"
      }
    ],
    next_actions: [
      "Set up time-blocking system in your calendar (next 15 minutes)",
      "Schedule your first Pomodoro session for tomorrow (next 10 minutes)", 
      "Gather learning resources and set up workspace (within 2 hours)"
    ],
    energy_management: {
      peak_hours: ["09:00-11:00", "15:00-17:00"],
      low_energy_tasks: ["review", "planning", "organizing", "administrative tasks"],
      high_energy_tasks: ["learning", "problem-solving", "creating", "complex analysis"],
      break_recommendations: [
        {"type": "micro", "duration_minutes": 2, "activity": "deep breathing or stretching"},
        {"type": "short", "duration_minutes": 5, "activity": "walk or light movement"},
        {"type": "medium", "duration_minutes": 15, "activity": "snack, hydration, and fresh air"},
        {"type": "long", "duration_minutes": 30, "activity": "meal and complete mental reset"}
      ]
    },
    // V2 Top-level fields
    time_blocks: [
      { period: "Morning", activity: "Preparation and planning", duration: "30 minutes" },
      { period: "Mid-Morning", activity: "Deep work session 1", duration: "90 minutes" },
      { period: "Afternoon", activity: "Review and practice", duration: "60 minutes" },
      { period: "Evening", activity: "Reflection and planning", duration: "15 minutes" }
    ],
    sleep_optimization: "Maintain consistent sleep schedule: 10:30 PM - 6:30 AM for optimal learning and energy management. Create pre-sleep routine 30 minutes before bed.",
    schedule_suggestions: [
      "Schedule deep work during your peak energy hours (9-11 AM or 3-5 PM)",
      "Use Pomodoro technique for sustained focus sessions",
      "Plan weekly review sessions to track progress and adjust schedule",
      "Block time for reflection and goal adjustment every Sunday"
    ]
  };
};

/**
 * Create AI-powered goal summary using Gemini (with fallback)
 */
export const createSmartGoalSummary = async (goalText: string): Promise<string> => {
  // For short goals, use local summarization
  if (goalText.length <= 100) {
    return summarizeGoal(goalText);
  }
  
  try {
    const apiKey = getApiKey();
    
    const summaryPrompt = `Create a concise, professional title (max 60 characters) that captures the essence of this goal:

"${goalText}"

Requirements:
- Maximum 60 characters
- Professional and clear
- Capture main themes
- Avoid redundancy
- Return ONLY the title, nothing else

Examples:
- Long text about multiple skills → "Multi-Skill Development Plan"
- Text about career + coding → "Career & Technical Skills"
- Health + productivity issues → "Health & Productivity Improvement"`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: summaryPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 100,
      }
    };

    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/gemini-1.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (generatedText && generatedText.length <= 80) {
        return generatedText;
      }
    }
  } catch (error) {
    console.log('AI summarization failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Fallback to local summarization
  return summarizeGoal(goalText);
};

export default {
  analyzeGoalWithGemini,
  createSmartGoalSummary,
};