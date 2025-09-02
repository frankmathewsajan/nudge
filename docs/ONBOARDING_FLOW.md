# Onboarding Flow Implementation

## Overview
The app now has a complete onboarding flow that triggers when users clear all data or when there's no existing data in storage.

## Flow Components

### 1. Home Screen (`app/(tabs)/index.tsx`)
- **Data Check**: On load, checks for existing data in AsyncStorage
- **Conditional Rendering**: 
  - If no data exists → Shows `OnboardingFlow`
  - After onboarding → Shows `InteractiveGoalsInput`
  - With goals set → Shows main app UI
- **Goals Processing**: Captures user's goals text, refines grammar/punctuation using AI, and stores in AsyncStorage

### 2. Settings Screen (`app/(tabs)/settings.tsx`)
- **Clear All Data**: Button that permanently deletes all app data
- **Navigation**: After clearing data, navigates to home screen to trigger onboarding
- **Developer Mode**: Shows raw and structured data for debugging

### 3. OnboardingFlow Component (`components/ui/OnboardingFlow.tsx`)
- **Animated Steps**: Welcome screens with smooth animations
- **Completion Handler**: Calls `onComplete` when user finishes onboarding

### 4. InteractiveGoalsInput Component (`components/ui/InteractiveGoalsInput.tsx`)
- **Text Input**: Captures user's goals as plain text
- **Submission**: Triggers goals refinement and storage process

## Data Flow

```
App Launch → Check Storage → Empty? → OnboardingFlow → GoalsInput → Main App
                          ↓
                      Has Data → Main App

Settings → Clear Data → Navigate to Home → OnboardingFlow → GoalsInput → Main App
```

## Storage Integration

### Goals Storage (`utils/goalsStorage.ts`)
- `formatGoalsText()`: Refines grammar and punctuation
- `saveGoals()`: Stores refined goals in AsyncStorage
- Goals are accessible in the Goals tab

### AsyncStorage Utils (`utils/asyncStorage.ts`)
- `clear()`: Removes all app data
- Used by Settings screen for data reset

## AI Integration

### Gemini AI (`utils/geminiAI.ts`)
- `sendGoalsToGemini()`: Processes goals text for refinement
- Improves grammar, punctuation, and clarity
- Returns refined goals for storage

## User Experience

1. **First Launch**: User sees onboarding → enters goals → uses app
2. **Data Reset**: User clears data → automatically returns to onboarding
3. **Goals Refinement**: AI improves user's goals text before storage
4. **Seamless Flow**: Smooth transitions between onboarding, goals input, and main app

## Developer Features

- **Developer Mode**: In Settings, view raw and structured data
- **Data Inspection**: See exactly what's stored in AsyncStorage
- **Debug Tools**: Verify storage schema and data integrity
