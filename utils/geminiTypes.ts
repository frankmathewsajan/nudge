// Gemini Types - All interfaces and type definitions
// Max 80 lines, types only

export interface CacheEntry {
  key: string;
  result: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface UserSession {
  userId: string;
  context: string[];
  lastInteraction: number;
  preferences: {
    workStyle?: string;
    priorities?: string[];
    timeSlots?: string[];
  };
  validationCache: Map<string, boolean>; // Cache validation results
}

export interface SafetyCheckResult {
  isSafe: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface Task {
  task: string;
  duration: string;
  frequency: string;
  suggested_time: string;
  priority: number;
  category: string;
  deadline?: string;
}

export interface GoalResponse {
  urgent: Task[];
  long_term: Task[];
  maintenance: Task[];
  optional: Task[];
}

export interface EmbeddingResponse {
  embedding: number[];
  text: string;
}

export interface VisionAnalysis {
  description: string;
  objects: string[];
  confidence: number;
}

export interface ThinkingResponse {
  thoughts: string;
  reasoning: string;
  conclusion: string;
  confidence: number;
}

export interface HourlyActivity {
  hour: number;
  activity: string;
  focus_level: number;
  completed: boolean;
  notes?: string;
}

export interface ProductivityFeedback {
  score: number; // 1-10
  insights: string[];
  suggestions: string[];
}

export interface DailyReport {
  date: string;
  activities_completed: number;
  total_activities: number;
  productivity_score: number;
  highlights: string[];
  improvements: string[];
  tomorrow_focus: string[];
}

export interface StreakUpdate {
  current_streak: number;
  longest_streak: number;
  motivation_message: string;
  achievement?: string;
}

export interface AdaptiveSchedule {
  morning: HourlyActivity[];
  afternoon: HourlyActivity[];
  evening: HourlyActivity[];
  total_focused_hours: number;
  energy_optimization: string[];
  break_suggestions: string[];
  flexibility_buffer: number; // minutes
}