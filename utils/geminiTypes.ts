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

// V2 Schema Types - Enhanced Goal Analysis
export type AnalysisStatus = 'success' | 'partial' | 'error';

export interface GoalAnalysisRequest {
  goals: string[];
  userContext?: {
    availability?: string[];
    preferences?: Record<string, any>;
    currentTime?: string;
  };
}

export interface TimeBlock {
  time: string;
  duration_minutes: number;
  activity: string;
  type: 'preparation' | 'deep_work' | 'pomodoro' | 'review' | 'break';
  energy_level: 'high' | 'medium' | 'low';
  pomodoro_count?: number;
}

export interface WeeklySession {
  day: string;
  total_minutes: number;
  sessions: number;
  focus_areas: string[];
}

export interface PomodoroBlock {
  work_minutes: number;
  break_minutes: number;
  activity: string;
}

export interface PomodoroSequence {
  sequence_name: string;
  total_duration_minutes: number;
  blocks: PomodoroBlock[];
}

export interface TimeBlocks {
  daily_schedule: TimeBlock[];
  weekly_schedule: WeeklySession[];
  pomodoro_sequences: PomodoroSequence[];
}

export interface GoalItem {
  goal: string;
  status: string;
  priority: string;
  deadline?: string;
  time_estimate?: string;
  difficulty?: string;
  resources_needed?: string[];
  time_blocks?: TimeBlocks;
}

export interface GoalAnalysis {
  primaryGoals: GoalItem[];
  subGoals: string[];
  dependencies: string[];
  successMetrics: string[];
}

export interface Milestone {
  name: string;
  duration: string;
  description: string;
}

export interface TimeEstimation {
  totalDuration: string;
  milestones: Milestone[];
  dailyCommitment: string;
  weeklyReview: string;
}

export interface WeeklyStructure {
  [day: string]: string[];
}

export interface PersonalizedSchedule {
  preferredTimes: string[];
  weeklyStructure: WeeklyStructure;
  adaptiveRecommendations: string[];
}

export interface Checkpoint {
  week: number;
  focus: string;
  metrics: string[];
}

export interface ProgressTracking {
  checkpoints: Checkpoint[];
  adjustmentTriggers: string[];
  celebrationMoments: string[];
}

export interface AnalysisMetadata {
  analysisTimestamp: string;
  modelVersion: string;
  userSegment?: string;
  confidenceScore?: number;
  processingTime?: string;
}

export interface AnalysisError {
  message: string;
  code: string;
  timestamp: string;
}

export interface GoalAnalysisResponse {
  status: AnalysisStatus;
  goalAnalysis: GoalAnalysis;
  timeEstimation: TimeEstimation;
  personalizedSchedule: PersonalizedSchedule;
  progressTracking: ProgressTracking;
  metadata?: AnalysisMetadata;
  error?: AnalysisError;
}