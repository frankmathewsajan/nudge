import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { initializeApp } from 'firebase/app';
import { v2Instructions } from '../instructions/v2Instructions';
import ENV from '../utils/env';
import {
    AnalysisStatus,
    GoalAnalysisRequest,
    GoalAnalysisResponse
} from '../utils/geminiTypes';

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID!
};

let firebaseApp: any = null;
let ai: any = null;
let model: any = null;

/**
 * Initialize Firebase AI services using Firebase AI SDK
 */
const initializeFirebaseAI = () => {
  try {
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
    }
    
    if (!ai) {
      // Initialize the Gemini Developer API backend service
      ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
    }
    
    if (!model) {
      // Create a GenerativeModel instance with Gemini 1.5 Flash
      model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });
    }
    
    return { model, ai, firebaseApp };
  } catch (error) {
    console.error('Firebase AI initialization error:', error);
    throw error;
  }
};

/**
 * Create V2 analysis prompt using instruction template
 */
const createV2Prompt = (request: GoalAnalysisRequest): string => {
  const { goals, userContext } = request;
  const goalsText = goals.join('\n');
  
  return `${v2Instructions}

USER CONTEXT:
${JSON.stringify(userContext, null, 2)}

GOALS TO ANALYZE:
${goalsText}

Please analyze these goals and return a JSON response following the V2 schema exactly.`;
};

/**
 * Validate V2 response structure
 */
const validateV2Response = (response: any): GoalAnalysisResponse => {
  // Basic structure validation
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response structure');
  }

  // Required fields validation
  const required = ['status', 'goalAnalysis', 'timeEstimation', 'personalizedSchedule', 'progressTracking'];
  for (const field of required) {
    if (!(field in response)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate status
  if (!['success', 'partial', 'error'].includes(response.status)) {
    response.status = 'partial';
  }

  return response as GoalAnalysisResponse;
};

/**
 * Development mode fallback with V2 schema
 */
const createDevFallbackResponse = (request: GoalAnalysisRequest): GoalAnalysisResponse => {
  const { goals, userContext } = request;
  
  return {
    status: 'success' as AnalysisStatus,
    goalAnalysis: {
      primaryGoals: goals.map((goal: string) => ({
        goal: goal,
        status: 'planned',
        priority: 'high',
        difficulty: 'medium',
        time_estimate: '30-60 minutes daily',
        resources_needed: ['Time', 'Focus']
      })),
      subGoals: goals.map((goal: string) => ([
        `Step 1 for: ${goal.substring(0, 30)}...`,
        `Step 2 for: ${goal.substring(0, 30)}...`,
        `Step 3 for: ${goal.substring(0, 30)}...`
      ])).flat(),
      dependencies: [],
      successMetrics: goals.map((goal: string) => `Completion metric for: ${goal.substring(0, 40)}...`)
    },
    timeEstimation: {
      totalDuration: '3-6 months',
      milestones: [
        { name: 'Initial Setup', duration: '1-2 weeks', description: 'Getting started' },
        { name: 'Mid Progress', duration: '6-8 weeks', description: 'Building momentum' },
        { name: 'Final Push', duration: '2-4 weeks', description: 'Achieving goals' }
      ],
      dailyCommitment: '30-60 minutes',
      weeklyReview: 'Sundays, 30 minutes'
    },
    personalizedSchedule: {
      preferredTimes: userContext?.availability || ['morning'],
      weeklyStructure: {
        monday: ['Goal planning session'],
        tuesday: ['Focused work time'],
        wednesday: ['Progress review'],
        thursday: ['Skill development'],
        friday: ['Weekly wrap-up'],
        saturday: ['Rest and reflection'],
        sunday: ['Planning for next week']
      },
      adaptiveRecommendations: [
        'Start with small, manageable tasks',
        'Build consistency before intensity',
        'Regular progress reviews are key'
      ]
    },
    progressTracking: {
      checkpoints: [
        { week: 1, focus: 'Establish routine', metrics: ['Daily completion rate'] },
        { week: 4, focus: 'Build momentum', metrics: ['Consistency score', 'Quality improvement'] },
        { week: 8, focus: 'Optimize approach', metrics: ['Efficiency gains', 'Goal refinement'] },
        { week: 12, focus: 'Achieve milestones', metrics: ['Final outcomes', 'Skill mastery'] }
      ],
      adjustmentTriggers: [
        'If consistency drops below 60%',
        'If stress levels become too high',
        'If progress stalls for 2+ weeks'
      ],
      celebrationMoments: [
        'First week of consistency',
        'Completing first major milestone',
        'Achieving 80% of primary goals'
      ]
    },
    metadata: {
      analysisTimestamp: new Date().toISOString(),
      modelVersion: 'firebase-ai-v2-dev-fallback',
      userSegment: 'development_user',
      confidenceScore: 0.85,
      processingTime: '< 1s (dev mode)'
    }
  };
};

/**
 * Main Firebase AI analysis function
 */
export const analyzeGoalsWithFirebaseAI = async (
  request: GoalAnalysisRequest
): Promise<GoalAnalysisResponse> => {
  console.log('🔥 Firebase AI: Starting goal analysis...', { 
    goalCount: request.goals.length, 
    hasContext: !!request.userContext 
  });

  // Development bypass
  if (ENV.isDevelopment) {
    console.log('🚀 Development mode: Using fallback response');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return createDevFallbackResponse(request);
  }

  try {
    // Initialize Firebase AI
    const { model } = initializeFirebaseAI();
    
    // Create V2 prompt
    const prompt = createV2Prompt(request);
    console.log('📝 Generated V2 prompt for Firebase AI');

    // Make API call using Firebase AI SDK
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    
    // Extract response text from Firebase AI
    const response = result.response;
    const text = response.text();
    if (!text) {
      throw new Error('No text content in Firebase AI response');
    }
    
    const processingTime = Date.now() - startTime;

    console.log('✅ Firebase AI response received', { 
      responseLength: text.length,
      processingTime: `${processingTime}ms`
    });

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      throw new Error('Invalid JSON response from Firebase AI');
    }

    // Validate V2 schema
    const validatedResponse = validateV2Response(parsedResponse);
    
    // Add metadata
    validatedResponse.metadata = {
      ...validatedResponse.metadata,
      analysisTimestamp: new Date().toISOString(),
      modelVersion: 'firebase-ai-gemini-1.5-flash-v2',
      processingTime: `${processingTime}ms`
    };

    console.log('🎯 Firebase AI analysis completed successfully');
    return validatedResponse;

  } catch (error: any) {
    console.error('💥 Firebase AI analysis failed:', error);
    
    // Return error response with V2 structure
    return {
      status: 'error' as AnalysisStatus,
      goalAnalysis: {
        primaryGoals: [],
        subGoals: [],
        dependencies: [],
        successMetrics: []
      },
      timeEstimation: {
        totalDuration: 'Unable to estimate',
        milestones: [],
        dailyCommitment: 'To be determined',
        weeklyReview: 'To be scheduled'
      },
      personalizedSchedule: {
        preferredTimes: [],
        weeklyStructure: {},
        adaptiveRecommendations: []
      },
      progressTracking: {
        checkpoints: [],
        adjustmentTriggers: [],
        celebrationMoments: []
      },
      error: {
        message: error.message || 'Firebase AI analysis failed',
        code: error.code || 'FIREBASE_AI_ERROR',
        timestamp: new Date().toISOString()
      },
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        modelVersion: 'firebase-ai-v2-error-fallback',
        userSegment: 'error_recovery',
        confidenceScore: 0,
        processingTime: 'N/A'
      }
    };
  }
};

/**
 * Network connectivity check for Firebase
 */
export const testFirebaseAIConnectivity = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testing Firebase AI connectivity...');
    
    const { model } = initializeFirebaseAI();
    const result = await model.generateContent('Test connectivity. Respond with "OK".');
    const response = result.response;
    const text = response.text();
    
    console.log('✅ Firebase AI connectivity test passed');
    return text?.toLowerCase().includes('ok') ?? false;
  } catch (error) {
    console.error('❌ Firebase AI connectivity test failed:', error);
    return false;
  }
};

export default {
  analyzeGoalsWithFirebaseAI,
  testFirebaseAIConnectivity
};