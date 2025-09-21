<div align="center">

# Nudge

Elegant, Android-first productivity and goals app. Track your day with a modern Google Calendar–inspired view, set and refine goals, and get gentle nudges through notifications. Built with Expo + React Native, using a floating, minimalist navigation.

</div>

## Table of Contents

- Overview and Purpose
- Architecture and Folder Map
- Modules and How They Fit Together
- Data Models and Data Flow
- Tech Stack and Rationale
- Developer Onboarding (Run, Add Features, Debug)
- Optimizations and Cleanup Opportunities
- Roadmap

---

## Overview and Purpose

Nudge helps you build consistent, healthy work habits.

- Track activity across your days with a smooth, compact calendar.
- Set and manage goals with a clean, modern UI.
- Get timely reminders; pause them when you sleep; resume when you wake.
- Review raw data for transparency and reset when you want a fresh start.

Primary screens (file-based routing via Expo Router):

- Home: a welcoming overview and entry point.
- Track: a Google Calendar–inspired monthly view with per‑day activity detail.
- Goals: create, manage, and visualize goal progress.
- Settings: inspect stored data, export placeholder, and reset all data.

Navigation is custom: a floating home button that expands into a vertical menu (Home, Track, Goals, Settings), replacing the default tab bar.

---

## Architecture and Folder Map

High-level layering

   UI (Screens + Components)
         ↓
   Navigation (Expo Router + Floating Navigation)
         ↓
   Application Services (notifications, sleep state, AI helpers)
         ↓
   Data Layer (AsyncStorage utilities, activity/goals stores, cache)

Key directories

- app/
   - _layout.tsx: App root. Sets providers (Tamagui, SafeArea), notification observers, and a Stack with the (tabs) group.
   - (tabs)/_layout.tsx: Defines the routed screens and hides the default tab bar (custom floating nav is used instead).
   - (tabs)/index.tsx: Home screen. Renders Today overview and floating navigation.
   - (tabs)/track.tsx: Calendar UI, month navigation, day details modal; reads activity data from storage.
   - (tabs)/goals.tsx: Manage goals list and add new goals; animated, modern cards.
   - (tabs)/settings.tsx: Raw data browser and “clear all data”.

- components/ui/
   - FloatingNavigation.tsx: Floating home button + expandable vertical menu.
   - TodayOverview.tsx: Home screen summary card.
   - ProductivityTracker.tsx, ProductivityDashboard.tsx: tracking/dash prototypes.
   - StartDay.tsx, SleepControl.tsx: UI for day start and sleep state control.
   - InteractiveGoalsInput.tsx, AdvancedGeminiDemo.tsx, AutoScheduler.tsx,
      SuccessPlan.tsx, SchedulingComplete.tsx, AILoadingScreen.tsx: AI/flow components and demos used to build future experiences.
   - StyledComponents.tsx: Shared styled pieces.

- utils/
   - asyncStorage.ts: Safe wrapper around @react-native-async-storage/async-storage.
   - activityData.ts: CRUD for per‑day activity; seed sample data; helpers.
   - notifications.ts: Expo Notifications setup, scheduling, and handlers.
   - sleepState.ts: Sleep/wake sessions persisted to storage; integrates with notifications.
   - geminiAI.ts: Gemini client with validation, safety checks, caching, and goal planning helpers.
   - insightCache.ts: In-memory cache for daily reports and activities.
   - env.ts: Environment variable helpers.

- hooks/
   - useThemeColor.ts: Theme color helper on top of Colors.ts.
   - useColorScheme.ts(.web.ts): Color scheme utilities.

- constants/
   - Colors.ts: Light/dark color tokens (base). Most current screens use inline palette tuned for a beige/lavender aesthetic.

Other noteworthy files

- package.json: Expo app entry, scripts, dependencies.
- android/: Native project for building a dev/bare Android app if needed.
- scripts/reset-project.js: Reset helper.

---

## Modules and How They Fit Together

### Navigation

- app/_layout.tsx
   - Wraps the app with SafeAreaProvider and TamaguiProvider.
   - Initializes: notification categories, sleep state, and sample activity data.
   - Observes notification responses and foreground notifications.
   - Renders a Stack with the (tabs) route group.

- app/(tabs)/_layout.tsx
   - Declares the four screens and hides the native tab bar.
   - The UI uses FloatingNavigation instead.

- components/ui/FloatingNavigation.tsx
   - Floating home button with an expanding vertical menu (Track, Goals, Settings).
   - Uses Animated for springy in/out; expo-router’s `useRouter()` for navigation.
   - Props: `currentRoute?: 'index' | 'track' | 'goals' | 'settings'` for active highlighting.

How it connects: Each screen includes `<FloatingNavigation currentRoute="..." />`. The native tab bar stays hidden; routes are pushed via router.

### Screens

- app/(tabs)/index.tsx (Home)
   - Greets the user; renders `TodayOverview` in a “bento” layout.
   - Elegant beige/lavender palette; StatusBar in light mode.
   - Dependencies: FloatingNavigation, TodayOverview, react-native-safe-area-context.

- app/(tabs)/track.tsx (Track)
   - Monthly calendar with compact typography and clean cards.
   - Pulls from `utils/activityData.ts` (`getAllActivityData`, `formatDateKey`).
   - Day press shows a modal with activities for that day, if any.
   - Includes quick stats and a floating add button (UI), ready for wiring to `logProductivityCheckin` or custom input.
   - Dependencies: AsyncStorageUtils via activityData, Animated, expo-linear-gradient (backgrounds), FloatingNavigation.

- app/(tabs)/goals.tsx (Goals)
   - Displays a list of goal cards with category/priority styling and progress bars.
   - Add goal form (animated entry) with category and priority selectors.
   - Persists to AsyncStorage under key `user_goals` (note: separate from `utils/goalsStorage.ts`, see “Cleanup”).
   - Dependencies: AsyncStorageUtils, LinearGradient, FloatingNavigation.

- app/(tabs)/settings.tsx (Settings)
   - Inspects all AsyncStorage keys/values.
   - “Clear all data” calls AsyncStorageUtils.clear().
   - Placeholder “Export” action.
   - Dependencies: AsyncStorageUtils, LinearGradient, FloatingNavigation.

### Utilities and Services

- utils/asyncStorage.ts (AsyncStorageUtils)
   - Safe wrappers: setString, setObject, getString, getObject<T>, removeItem, hasKey, getAllKeys, clear, multiGet/multiSet/multiRemove, isAvailable.
   - Used across screens and services to serialize/deserialize JSON and guard failures.

- utils/activityData.ts
   - Model
      - DayActivity: `{ date: string; hourlyActivities: { [hour: number]: string[] }; totalActivities: number; lastUpdated: Date }`
   - Storage key: `daily_activity_data` (object keyed by YYYY-MM-DD).
   - API
      - getDayActivity(date)
      - addHourlyActivity(date, hour, activity)
      - getAllActivityData()
      - getActivityCount(date)
      - getMonthActivityDates(year, month)
      - logProductivityCheckin(activity, hour?)
      - initializeSampleData()
      - formatDateKey(date) / parseDateKey(key)
   - Used by Track screen and notifications handler.

- utils/notifications.ts
   - Configures notification handler and action categories (Quick Log, Remind Later, Mark Productive).
   - Schedules test or hourly reminders (Android uses time-interval trigger; iOS uses calendar trigger when applicable).
   - Helpers: registerForPushNotificationsAsync, scheduleTestNotification, scheduleHourlyReminders, handleNotificationResponse, cancelAllNotifications, getScheduledNotificationsCount, getBadgeCount/setBadgeCount, clear/get delivered notifications.
   - Integrates with activityData.logProductivityCheckin.
   - Reads EXPO_PUBLIC_PROJECT_ID when fetching an Expo push token.

- utils/sleepState.ts
   - Model
      - SleepState: `{ isAsleep: boolean; currentSession?: { id; startTime; endTime?; duration?; isActive }; lastWakeTime?; lastSleepTime?; sleepHistory: SleepSession[] }`
   - Storage key: `sleep_state`.
   - API
      - getSleepState(), startSleep(), wakeUp(), isUserAsleep(), getCurrentSleepSession(), getSleepHistory(), getSleepStats(), initializeSleepState().
   - Behavior: starting sleep cancels productivity notifications; waking schedules them for remaining hours.

- utils/geminiAI.ts
   - Initializes `GoogleGenAI` using ENV.getGeminiKey().
   - SmartCache: memoizes validation and model results; session memory with user preferences.
   - Safety: `geminiSafetyCheck()` screens input via model (with robust fallbacks).
   - Validation: normalize/limit input; uses safety check; caches results.
   - Goal planning: `sendGoalsToGemini(goals, userId, preferences?)` → structured plan `{ urgent, long_term, maintenance, optional }`.
   - Additional helpers for long-context, vision, embeddings, and thinking (see file for full APIs).
   - Depends on: `@google/genai` and `utils/env.ts`.

- utils/insightCache.ts
   - In-memory cache for DailyReport and activity snapshots with TTL.
   - Helpers to generate input hashes, set/get reports, and prune expired entries.

- utils/env.ts
   - Reads `GEMINI_API_KEY` (or `EXPO_PUBLIC_GEMINI_API_KEY`) and exposes helpers.
   - `hasGeminiKey()` and `getGeminiKey()` with developer-friendly warnings.

### Hooks and Constants

- hooks/useThemeColor.ts
   - Simple theme token lookup layered over constants/Colors.ts.

- constants/Colors.ts
   - Baseline light/dark tokens. Most current screens apply a custom beige/lavender palette inline; consider centralizing (see “Optimizations”).

---

## Data Models and Data Flow

Storage keys

- daily_activity_data → `{ [YYYY-MM-DD]: DayActivity }`
- sleep_state → `SleepState`
- user_goals → array of goal objects used by Goals screen
- (goal history alt API) `@nudge_user_goals` / `@nudge_goals_history` → defined in utils/goalsStorage.ts but not currently used by the Goals screen

Day lifecycle (simplified)

1) User lives their day → optionally gets hourly notifications.
2) A notification action or UI entry calls `logProductivityCheckin()`/`addHourlyActivity()`.
3) `activityData` writes to `daily_activity_data` via AsyncStorageUtils.
4) Track screen reads `getAllActivityData()` and renders the month grid and modal detail.

Goals lifecycle

1) User adds a goal in Goals screen.
2) Goal is serialized to `user_goals` in AsyncStorage.
3) Goals list renders from local storage; users can complete/delete and see progress.
4) Future: Use `utils/geminiAI.ts` to refine/expand goals.

Sleep/notifications lifecycle

1) On app start, `initializeSleepState()` validates storage and auto-wakes if a session is stale.
2) If user starts sleep (via UI), `startSleep()` persists session and cancels hourly notifications.
3) When waking, `wakeUp()` persists, computes duration, and schedules remaining notifications for awake hours.

ASCII flow

   [UI input]
       ├─ Goals screen → AsyncStorageUtils.setString('user_goals', ...)
       ├─ Track screen (plus button) → activityData.addHourlyActivity(...)
       └─ Notification action → notifications.handleNotificationResponse → activityData.logProductivityCheckin
   [Storage]
       └─ AsyncStorage: daily_activity_data, user_goals, sleep_state
   [Review]
       ├─ Track screen reads getAllActivityData
       ├─ Goals screen reads user_goals
       └─ Settings screen enumerates keys/values

---

## Tech Stack and Rationale

- Expo + React Native
   - Fast iteration, OTA updates, and strong Android support.

- Expo Router
   - File-based routing keeps screens discoverable. Hidden tab bar with custom floating nav achieves a premium look.

- AsyncStorage (@react-native-async-storage/async-storage)
   - Simple, reliable local persistence with our wrapper for safer reads/writes.

- Expo Notifications
   - Cross-platform scheduling with Android channels; used for hourly nudges and quick actions.

- Styling
   - expo-linear-gradient for subtle backgrounds.
   - Inline palette tuned for a luxurious beige/lavender aesthetic. Colors.ts provides baseline tokens.

- Animation
   - React Native Animated for menu/menu items and screen transitions. Reanimated is installed and can be adopted for higher-performance interactions as needed.

- Tamagui
   - Provider is configured; offers a path to a design system. Current screens primarily use StyleSheet + inline styles.

Note on Tailwind / Zustand

- Tailwind/NativeWind and Zustand are not used in this codebase. If desired:
   - NativeWind can centralize visual primitives and speed up iteration.
   - Zustand can hold cross-screen state (sleep status, feature flags, settings) with a lightweight API.

---

## Developer Onboarding

### Prerequisites

- Node.js LTS
- Git, Expo CLI (installed on-demand by `npx expo`)
- Android: Android Studio + an emulator, or a physical device with Expo Go

### Setup

1) Install dependencies

```powershell
npm install
```

2) Environment variables

Create a `.env` file at the project root (Expo will inline variables prefixed with `EXPO_PUBLIC_`).

```dotenv
# Needed for notifications token on device
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id

# Gemini (optional for AI features in utils/geminiAI.ts)
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

3) Run the app (Expo)

```powershell
npx expo start
```

Then:

- Press a for Android emulator, or
- Scan the QR in Expo Go on your device.

### Adding a new screen

1) Create a file under `app/(tabs)/your-screen.tsx` and export a default React component.
2) Add `<FloatingNavigation currentRoute="your-screen" />` at the bottom for consistent nav.
3) If you want it in the floating menu, add a menu item in `components/ui/FloatingNavigation.tsx` (the `menuItems` array) and update its `navigateTo` function.

### Working with activity data

```ts
import { addHourlyActivity, formatDateKey } from '@/utils/activityData';

await addHourlyActivity(new Date(), 14, 'Read 10 pages');
```

### Notifications quick test

```ts
import { scheduleTestNotification, setupNotificationCategories } from '@/utils/notifications';

await setupNotificationCategories();
await scheduleTestNotification();
```

### Debugging common issues

- Notifications token is null in Expo Go
   - Ensure `EXPO_PUBLIC_PROJECT_ID` is set; physical devices require a project ID for getExpoPushToken.

- No notifications arriving on Android
   - Verify channels are created (notifications.ts sets `default` and `productivity`).
   - App must be running for foreground handlers; background delivery depends on device OS settings.

- AsyncStorage not persisting (web)
   - Web behavior varies; use `AsyncStorageUtils.isAvailable()` and handle fallback.

- Reanimated/metro build warnings
   - If you start using Reanimated APIs, ensure Babel plugin is configured (Expo SDK usually handles it). Clear caches if needed:
      - `npx expo start -c`

- “Activity data already exists, skipping sample data”
   - `initializeSampleData()` is conservative. Clear all in Settings to re-seed.

---

## Optimizations and Cleanup Opportunities

- Unify goals storage
   - The Goals screen uses `user_goals`, while `utils/goalsStorage.ts` provides `@nudge_user_goals` and `@nudge_goals_history`. Consolidate on a single module and key set.

- Centralize theme
   - Many colors are inline to achieve the beige/lavender look. Extract tokens into `constants/Colors.ts` or a dedicated theme file and adopt `useThemeColor()` for consistency.

- Componentize calendar internals
   - Extract DayCell, WeekHeader, and StatsCard into small components; memoize to reduce re-renders.

- Wire FAB and AI refinements
   - Connect the floating add button in Track to a quick add flow. Integrate `geminiAI.ts` for goal refinement in Goals.

- State management
   - Consider adding Zustand or Context for app-wide state (sleep status, notification settings, user preferences).

- Testing and CI
   - Add unit tests for utils (activityData, sleepState, notifications) and light snapshot tests for screens. Configure EAS/CI as needed.

---

## Roadmap

- Quick-add activity sheet with smart defaults.
- AI-assisted daily summary using geminiAI + insightCache.
- True theme system (light only for now; night mode optional).
- Deeper notification actions (log specific tasks directly from notification).
- Optional cloud sync.

---

## Scripts

From package.json

- `npm run start` → expo start
- `npm run android` → expo run:android
- `npm run ios` → expo run:ios
- `npm run web` → expo start --web
- `npm run lint` → expo lint
- `npm run reset-project` → runs `scripts/reset-project.js`

---

## License

Private. All rights reserved.