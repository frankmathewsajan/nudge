/**
 * Application Flow Constants
 * 
 * Centralized constants for consistent naming across auth, onboarding, and goal components.
 * This ensures consistent data flow and storage keys throughout the application.
 */

// AsyncStorage Keys - Consistent naming pattern
export const STORAGE_KEYS = {
  // Authentication
  AUTH_USER_DATA: '@nudge_auth_user_data',
  AUTH_SESSION_TOKEN: '@nudge_auth_session_token',
  
  // Onboarding Flow
  ONBOARDING_COMPLETED: '@nudge_onboarding_completed',
  ONBOARDING_USER_NAME: '@nudge_onboarding_user_name',
  ONBOARDING_USER_PREFERENCES: '@nudge_onboarding_preferences',
  
  // Goal Management
  GOALS_COMPLETED: '@nudge_goals_completed',
  GOALS_USER_GOALS: '@nudge_goals_user_goals',
  GOALS_PROGRESS_DATA: '@nudge_goals_progress_data',
  
  // App Settings
  SETTINGS_THEME: '@nudge_settings_theme',
  SETTINGS_NOTIFICATIONS: '@nudge_settings_notifications',
} as const;

// Application Flow States - Enum-like constants
export const FLOW_STATES = {
  // Authentication States
  AUTH_LOADING: 'auth_loading',
  AUTH_UNAUTHENTICATED: 'auth_unauthenticated',
  AUTH_AUTHENTICATED: 'auth_authenticated',
  
  // Onboarding States
  ONBOARDING_REQUIRED: 'onboarding_required',
  ONBOARDING_IN_PROGRESS: 'onboarding_in_progress',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  
  // Goal States
  GOALS_REQUIRED: 'goals_required',
  GOALS_IN_PROGRESS: 'goals_in_progress',
  GOALS_COMPLETED: 'goals_completed',
  
  // Main App States
  MAIN_APP_READY: 'main_app_ready',
  SETTINGS_OVERLAY: 'settings_overlay',
} as const;

// Component Types for Smart/Dumb Pattern
export const COMPONENT_TYPES = {
  SMART: 'container', // Logic, state, data fetching
  DUMB: 'presentational', // UI only, props-driven
} as const;

// Error Types for Consistent Error Handling
export const ERROR_TYPES = {
  // Authentication Errors
  AUTH_EMAIL_ALREADY_IN_USE: 'auth_email_already_in_use',
  AUTH_WEAK_PASSWORD: 'auth_weak_password',
  AUTH_INVALID_EMAIL: 'auth_invalid_email',
  AUTH_USER_NOT_FOUND: 'auth_user_not_found',
  AUTH_WRONG_PASSWORD: 'auth_wrong_password',
  AUTH_TOO_MANY_REQUESTS: 'auth_too_many_requests',
  AUTH_NETWORK_ERROR: 'auth_network_error',
  
  // Onboarding Errors
  ONBOARDING_INVALID_NAME: 'onboarding_invalid_name',
  ONBOARDING_SAVE_FAILED: 'onboarding_save_failed',
  
  // Goal Errors
  GOALS_INVALID_INPUT: 'goals_invalid_input',
  GOALS_SAVE_FAILED: 'goals_save_failed',
  GOALS_ANALYSIS_FAILED: 'goals_analysis_failed',
} as const;

// User-Friendly Error Messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.AUTH_EMAIL_ALREADY_IN_USE]: '📧 This email is already registered. Try signing in instead.',
  [ERROR_TYPES.AUTH_WEAK_PASSWORD]: '🔒 Password should be at least 6 characters long.',
  [ERROR_TYPES.AUTH_INVALID_EMAIL]: '✉️ Please enter a valid email address.',
  [ERROR_TYPES.AUTH_USER_NOT_FOUND]: '❓ No account found with this email. Please sign up first.',
  [ERROR_TYPES.AUTH_WRONG_PASSWORD]: '🔑 Incorrect password. Please try again.',
  [ERROR_TYPES.AUTH_TOO_MANY_REQUESTS]: '⏰ Too many attempts. Please wait a few minutes before trying again.',
  [ERROR_TYPES.AUTH_NETWORK_ERROR]: '🌐 Network error. Please check your connection and try again.',
  [ERROR_TYPES.ONBOARDING_INVALID_NAME]: '👤 Please enter a valid name.',
  [ERROR_TYPES.ONBOARDING_SAVE_FAILED]: '💾 Failed to save onboarding data. Please try again.',
  [ERROR_TYPES.GOALS_INVALID_INPUT]: '🎯 Please enter valid goal information.',
  [ERROR_TYPES.GOALS_SAVE_FAILED]: '💾 Failed to save goals. Please try again.',
  [ERROR_TYPES.GOALS_ANALYSIS_FAILED]: '🤖 Failed to analyze goals. Please try again.',
} as const;

// Type exports for TypeScript
export type StorageKey = keyof typeof STORAGE_KEYS;
export type FlowState = typeof FLOW_STATES[keyof typeof FLOW_STATES];
export type ComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];
export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];