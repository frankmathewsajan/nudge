# Nudge Codebase Instructions for AI Agents

This is a React Native Expo app for productivity and goal tracking with AI-powered insights. Understanding these patterns will help you be immediately productive.

## Project Architecture

### Core Structure
- **Expo Router** with file-based routing in `app/` directory
- **Feature-based organization** with clean architecture principles
- **Custom floating navigation** instead of standard tab bar
- **Dual theme system** (ThemeContext + Tamagui) for light/dark modes
- **Firebase + Gemini AI integration** for goal analysis

### Key Directories
```
app/                     # Expo Router screens (index.tsx is main goals screen)
components/              # Feature-organized components (goals/, onboarding/, ui/)
utils/                   # Core utilities (asyncStorage, gemini*, notifications)
services/                # Business logic (auth, AI, storage, user progress)
hooks/                   # Feature-specific hooks (goals/, onboarding/)
docs/                    # Extensive project documentation
```

## Critical Patterns

### Navigation
- Main app entry is `app/index.tsx` (goals screen, not home)
- Custom floating nav in `components/ui/FloatingNavigation.tsx`
- Modal routes use `app/modal/` directory
- Navigation state managed through custom hooks, not standard tab navigation

### Theme System
```tsx
// Always use ThemeContext for colors, not hardcoded values
const { theme } = useTheme();
// Tamagui config in tamagui.config.ts provides design tokens
```

### AI Integration
```tsx
// Use Firebase AI service, not direct Gemini calls
import { analyzeGoalsWithFirebaseAI } from '@/services/ai/firebaseAiService';
// V2 response format requires conversion in GoalCollectionScreen.tsx (see convertV2ToOldFormat)
```

### Storage Patterns
```tsx
// Always use AsyncStorageUtils wrapper, never direct AsyncStorage
import { AsyncStorageUtils } from '@/utils/data/asyncStorage.utils';
// Storage keys are constants in respective service files
```

## Development Workflow

### Essential Commands
```bash
npx expo run:android             # Run on Android device/emulator  
npx expo run:ios                 # Run on iOS device/simulator
npx expo run:web                 # Web development (limited support)
npx expo run:reset-project       # Reset project state (uses scripts/reset-project.js)
npx expo run:lint                # Expo-based linting
```

### Debugging
- Terminal shows last command in node terminal: `npx expo run:android`
- Check `utils/geminiServices.ts` for AI mock mode (`config.app.mockMode`)
- Use `utils/geminiCache.ts` for caching AI responses during development
- AsyncStorage debugging through storage service wrappers

### File Naming Conventions
- Screens: `ScreenName.tsx` (PascalCase)
- Components: `ComponentName.tsx` (PascalCase) 
- Hooks: `useFeatureName.ts` (camelCase with 'use' prefix)
- Utils: `utilityName.ts` (camelCase)
- Styles: `feature.styles.ts` (kebab-case + .styles suffix)

## Component Architecture

### Goals System (Primary Feature)
- `GoalCollectionScreen.tsx` - Main interface (907 lines, includes AI integration)
- `useGoalCollection.ts` - Goal state management
- `useKeyboardAware.ts` - Keyboard handling for input forms
- Response format conversion required for V2 AI responses

### Styling Approach
- Feature-specific styles in `assets/styles/[feature]/`
- Theme-aware dynamic styling functions
- Tamagui for design system tokens
- Custom color palettes override Tamagui defaults

### Authentication Flow
- Conditional rendering in `app/_layout.tsx` based on auth state
- `AuthScreen.tsx` and `EmailVerificationScreen.tsx` handle auth UI
- Auth state managed through `authService.ts`

## Integration Points

### Firebase Services
- Authentication via `@firebase/auth`
- AI processing through `firebaseAiService.ts` 
- Config in `config/firebase.ts`

### Notifications
- Expo Notifications with custom categories in `utils/notifications.ts`
- Sleep state integration for smart notification scheduling
- Notification response handling in root layout

### External Dependencies
- **Tamagui** for UI components and theming
- **Lottie** for animations (`assets/animations/`)
- **Zustand** for state management (minimal usage)
- **React Native Gesture Handler** for interactions

## Common Gotchas

1. **AI Response Format**: V2 responses need conversion in `GoalCollectionScreen.tsx`
2. **Navigation**: Custom floating nav, not standard tabs - modify `FloatingNavigation.tsx`
3. **Themes**: Two systems - use `ThemeContext` for app themes, Tamagui for tokens
4. **Storage**: Always use `AsyncStorageUtils`, never direct `AsyncStorage`
5. **Android Focus**: App optimized for Android-first with iOS as secondary

## Documentation
Extensive docs in `/docs` including architecture guides, AI integration patterns, and debugging reports. Check `docs/README.md` for complete project overview.