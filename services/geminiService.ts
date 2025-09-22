/**
 * Gemini AI Service - Goal Analysis API Integration
 * 
 * Handles communication with Google's Gemini AI to analyze user goals
 * and provide structured recommendations.
 */


// API Configuration
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

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

// Load V2 instructions template with extended JSON and minute-level time context
const loadInstructionsTemplateV2 = async () => {
  try {
    const currentDateTime = new Date();
    const timeContext = {
      currentDate: currentDateTime.toLocaleDateString(),
      currentTime: currentDateTime.toLocaleTimeString(),
      currentMinute: currentDateTime.getMinutes(),
      currentHour: currentDateTime.getHours(),
      dayOfWeek: currentDateTime.toLocaleDateString('en-US', { weekday: 'long' }),
      month: currentDateTime.toLocaleDateString('en-US', { month: 'long' }),
      year: currentDateTime.getFullYear(),
      season: getSeason(currentDateTime.getMonth()),
      timeOfDay: currentDateTime.getHours() < 12 ? 'Morning' : currentDateTime.getHours() < 17 ? 'Afternoon' : 'Evening',
    };
    
    return `# Goal Analysis AI - V2 Enhanced Instructions with Time Block Management

You are an intelligent productivity assistant for the "Nudge" goal-tracking app with advanced time management capabilities. 
A user provides a freeform description of their goals, and you analyze it to create actionable, structured plans with precise time blocks and scheduling.

## CURRENT CONTEXT:
- **Date**: ${timeContext.currentDate} (${timeContext.dayOfWeek})
- **Time**: ${timeContext.currentTime} (${timeContext.timeOfDay})
- **Precise Time**: Hour ${timeContext.currentHour}, Minute ${timeContext.currentMinute}
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

Now analyze the following user input:
"""
{user_input}
"""`;
  } catch (error) {
    console.error('Error loading V2 instructions template:', error);
    throw new Error('Failed to load AI V2 instructions template');
  }
};

// Goal Analysis Response Interface V2 - Extended with time management
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
    
    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/gemini-2.0-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

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
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsedResponse: GoalAnalysisResponse = JSON.parse(cleanedText);
      console.log('Successfully parsed Gemini response');
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response:', generatedText);
      throw new Error('Failed to parse AI response. The response may not be valid JSON.');
    }

  } catch (error) {
    console.error('Error in analyzeGoalWithGemini:', error);
    
    // Return a fallback response to prevent app crashes
    return createFallbackResponse(userGoal);
  }
};

/**
 * Create a fallback response when the API fails
 */
const createFallbackResponse = (userGoal: string): GoalAnalysisResponse => {
  return {
    primary_goal: {
      name: userGoal,
      analysis: "This is a great goal that can significantly improve your skills and capabilities. Breaking it down into manageable steps will help you stay motivated and track progress.",
      smart_breakdown: [
        "Research and gather resources",
        "Create a structured learning plan", 
        "Practice consistently with real projects",
        "Track progress and celebrate milestones",
        "Seek feedback and iterate on your approach"
      ],
      time_recommendation: "I recommend dedicating 60-90 minutes daily for focused work sessions. This duration allows for meaningful progress while maintaining sustainability.",
      session_structure: "Start with 10 minutes of preparation, follow with 45-75 minutes of focused work, and end with 5 minutes of reflection and planning for next session.",
      difficulty: "intermediate",
      estimated_timeline: "With consistent daily practice, you should see significant progress within 3-6 months.",
      progress_milestones: [
        "Week 1: Complete initial research and setup",
        "Week 4: Build first working version or demonstrate basic competency",
        "Month 3: Achieve intermediate level proficiency",
        "Month 6: Complete goal or reach advanced level"
      ],
      motivation_tips: "Remember that progress isn't always linear. Celebrate small wins along the way, and don't be afraid to adjust your approach based on what you learn.",
      common_obstacles: [
        "Lack of time - Solution: Start with just 20-30 minutes daily and gradually increase",
        "Feeling overwhelmed - Solution: Break tasks into smaller, manageable chunks",
        "Loss of motivation - Solution: Track your progress visually and find an accountability partner"
      ],
      resources_needed: [
        "Dedicated learning time in your schedule",
        "Access to learning materials (books, courses, tutorials)",
        "Practice environment or tools",
        "Progress tracking system"
      ]
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
        duration: "30 minutes",
        type: "Quick wins",
        description: "Perfect for daily habits and quick practice sessions",
        best_for: ["skill practice", "habit building"]
      },
      {
        duration: "60 minutes",
        type: "Standard focus", 
        description: "Ideal for skill development and focused learning",
        best_for: ["skill learning", "project work"]
      },
      {
        duration: "90 minutes",
        type: "Deep work",
        description: "For complex projects and intensive learning sessions",
        best_for: ["complex projects", "intensive study"]
      }
    ],
    next_actions: [
      "Set up a dedicated learning environment",
      "Find and organize learning resources",
      "Schedule your first learning session for tomorrow"
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
      `${GEMINI_API_BASE_URL}/models/gemini-2.0-flash:generateContent`,
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