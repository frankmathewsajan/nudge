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

// Load V1 instructions template
const loadInstructionsTemplate = async () => {
  try {
    const currentDateTime = new Date();
    const timeContext = {
      currentDate: currentDateTime.toLocaleDateString(),
      currentTime: currentDateTime.toLocaleTimeString(),
      dayOfWeek: currentDateTime.toLocaleDateString('en-US', { weekday: 'long' }),
      month: currentDateTime.toLocaleDateString('en-US', { month: 'long' }),
      year: currentDateTime.getFullYear(),
      season: getSeason(currentDateTime.getMonth()),
    };
    
    return `# Goal Analysis AI - V1 Enhanced Instructions

You are an intelligent productivity assistant for the "Nudge" goal-tracking app. 
A user provides a freeform description of their goals, and you analyze it to create actionable, structured plans.

## CURRENT CONTEXT:
- **Date**: ${timeContext.currentDate} (${timeContext.dayOfWeek})
- **Time**: ${timeContext.currentTime}
- **Season**: ${timeContext.season} ${timeContext.year}
- **Context**: Use this timing information to provide relevant, time-sensitive recommendations

## Your job is to:

1. **Parse and categorize** the input into structured categories
2. **Generate intelligent recommendations** for achieving each goal with time-aware context
3. **Create realistic timelines** and session structures considering current timing
4. **Identify potential obstacles** and solutions relevant to the current period
5. **Provide motivational insights** and progress tracking suggestions

## Input Processing:
Parse the user's input into these categories:
- **skills**: Learning objectives, skill development
- **career**: Professional goals, job-related tasks  
- **projects**: Specific projects, deliverables, deadlines (consider current date for urgency)
- **health**: Physical, mental, emotional wellbeing
- **personal**: Personal development, hobbies, relationships
- **pain_points**: Challenges, frustrations, blockers

## Time-Aware Recommendations:
- Consider if goals have deadlines approaching (e.g., "in 2 days", "next week")
- Adjust session recommendations based on current day/time
- Factor in seasonal considerations (e.g., New Year resolutions, summer goals)
- Provide urgency levels based on deadline proximity

## For each item, extract:
- **name**: Clear, actionable description
- **status**: current/declining/stalled/planned/urgent
- **priority**: urgent/high/medium/low
- **deadline**: if mentioned or inferred
- **time_estimate**: realistic time needed (daily/weekly)
- **difficulty**: beginner/intermediate/advanced
- **dependencies**: what needs to happen first

## Enhanced Analysis:
For the primary goal, provide:
- **smart_breakdown**: 3-5 specific, measurable steps
- **time_recommendation**: optimal daily/weekly time commitment
- **session_structure**: how to structure practice/work sessions
- **progress_milestones**: checkpoints to track success
- **motivation_tips**: personalized encouragement
- **common_obstacles**: likely challenges and solutions
- **resources_needed**: tools, materials, environment setup

## Session Recommendations:
Suggest realistic time slots based on goal complexity:
- **quick_wins**: 15-30 minutes for simple tasks
- **standard_focus**: 45-60 minutes for regular practice
- **deep_work**: 90-120 minutes for complex projects
- **marathon**: 2+ hours for intensive work

## Output Format:
Return ONLY valid JSON with this structure:

{
  "primary_goal": {
    "name": "Main goal description",
    "analysis": "Intelligent analysis of the goal",
    "smart_breakdown": [
      "Step 1: Specific action",
      "Step 2: Specific action",
      "Step 3: Specific action"
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
    ]
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
      "duration": "30 minutes",
      "type": "Quick wins",
      "description": "Perfect for daily habits and quick tasks",
      "best_for": ["specific goal types"]
    },
    {
      "duration": "60 minutes", 
      "type": "Standard focus",
      "description": "Ideal for skill practice and focused work",
      "best_for": ["specific goal types"]
    },
    {
      "duration": "90 minutes",
      "type": "Deep work", 
      "description": "For complex projects and learning",
      "best_for": ["specific goal types"]
    }
  ],
  "next_actions": [
    "Immediate action 1",
    "Immediate action 2", 
    "Immediate action 3"
  ]
}

## Instructions:
- Focus on the PRIMARY GOAL mentioned first or most emphasized
- Be specific and actionable in all recommendations
- Consider user's experience level and time constraints
- Provide realistic, achievable timelines
- Include motivational elements to encourage consistency
- Ignore off-topic information or filler content
- Return ONLY the JSON response, no explanations

Now analyze the following user input:
"""
{user_input}
"""`;
  } catch (error) {
    console.error('Error loading instructions template:', error);
    throw new Error('Failed to load AI instructions template');
  }
};

// Goal Analysis Response Interface
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
  }>;
  next_actions: string[];
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
    const instructionsTemplate = await loadInstructionsTemplate();
    
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