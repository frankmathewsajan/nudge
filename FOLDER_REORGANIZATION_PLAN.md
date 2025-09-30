# Folder Reorganization Plan

## Current Issues Identified
1. **Naming Inconsistency**: Mix of camelCase and other conventions
2. **Potential Duplication**: `aiService.ts` vs `firebaseAiService.ts` vs `geminiService.ts`
3. **Unused Files**: `aiService.ts` appears to have no imports
4. **Unclear Organization**: Some utils could be better categorized

## Proposed New Structure

### 📁 services/
**Purpose**: Business logic and external service integrations
**Naming Convention**: `[feature]Service.ts`

```
services/
├── auth/
│   ├── authService.ts          (current: authService.ts)
│   └── userProfileService.ts   (current: userProfileService.ts)
├── ai/
│   ├── firebaseAiService.ts    (current: firebaseAiService.ts) 
│   └── geminiService.ts        (current: geminiService.ts - evaluate if needed)
├── storage/
│   ├── storageService.ts       (current: storageService.ts)
│   └── userProgressService.ts  (current: userProgressService.ts)
└── index.ts                    (barrel export)
```

**Files to Remove**:
- `aiService.ts` (unused - no imports found)

### 📁 hooks/
**Purpose**: Reusable React hooks
**Naming Convention**: `use[Feature][Action].ts`
**Current Structure**: ✅ Already well organized

```
hooks/
├── app/
│   ├── useAppFlow.ts
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   ├── useThemeColor.ts
│   └── useUserData.ts
├── goals/                      (current: goals/ - keep as is)
├── onboarding/                 (current: onboarding/ - keep as is)
└── index.ts                    (barrel export)
```

### 📁 utils/
**Purpose**: Pure utility functions and helpers
**Naming Convention**: `[feature].utils.ts`

```
utils/
├── ai/
│   ├── gemini.utils.ts         (current: geminiServices.ts)
│   ├── geminiCache.utils.ts    (current: geminiCache.ts)
│   ├── geminiClient.utils.ts   (current: geminiClient.ts)
│   ├── geminiTypes.ts          (current: geminiTypes.ts - types stay as .ts)
│   └── geminiValidation.utils.ts (current: geminiValidation.ts)
├── data/
│   ├── activity.utils.ts       (current: activityData.ts)
│   ├── asyncStorage.utils.ts   (current: asyncStorage.ts)
│   └── sleepState.utils.ts     (current: sleepState.ts)
├── system/
│   ├── env.utils.ts            (current: env.ts)
│   ├── network.utils.ts        (current: networkUtils.ts)
│   └── notifications.utils.ts  (current: notifications.ts)
└── index.ts                    (barrel export)
```

## Migration Steps

### Step 1: Create New Folder Structure
- Create subdirectories in services/, hooks/, utils/
- Create barrel export files (index.ts)

### Step 2: Move and Rename Files
- Move files to new locations
- Rename following new convention
- Update internal file references

### Step 3: Update All Imports
- Update all import statements across the app
- Use barrel exports where possible
- Test after each major section

### Step 4: Remove Deprecated Files
- Delete `aiService.ts`
- Evaluate and potentially consolidate AI services

### Step 5: Validation
- Run TypeScript checks
- Test app functionality
- Update copilot instructions if needed

## Import Pattern Examples

### Before
```typescript
import { authService } from '@/services/authService';
import { AsyncStorageUtils } from '@/utils/asyncStorage';
import { geminiService } from '@/utils/geminiServices';
```

### After
```typescript
import { authService } from '@/services/auth';
import { AsyncStorageUtils } from '@/utils/data';
import { geminiService } from '@/utils/ai';
```

## Benefits
1. **Consistent Naming**: All files follow clear conventions
2. **Logical Grouping**: Related functionality grouped together
3. **Better Navigation**: Easier to find files by feature
4. **Cleaner Imports**: Barrel exports simplify import statements
5. **Reduced Confusion**: Clear separation between services, hooks, and utils