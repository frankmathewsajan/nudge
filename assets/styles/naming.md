# React Native Expo - Naming & Architecture Convention

## Project Structure Philosophy

### File Size Discipline
- **Max 80 lines per file** - Split larger files into smaller, focused modules
- **Max 25 lines per function** - Break down complex functions into smaller utilities
- **Single Responsibility** - Each file should have one clear purpose

### Folder Structure
```
/app                    # Expo Router screens (file-based routing)
/assets                 # Static assets
  /fonts               # Custom fonts
  /images              # Images, icons
  /styles              # StyleSheet files
/components             # Reusable UI components
/hooks                  # Custom React hooks
/services               # API calls, business logic
/stores                 # Zustand stores (global state)
/utils                  # Pure utility functions
/constants              # App constants, configs
```

## Naming Conventions

### Files & Folders
- **PascalCase**: Components, Screens, Types
  - `UserProfile.tsx`, `OnboardingFlow.tsx`
- **camelCase**: Hooks, services, utilities
  - `useAuth.ts`, `apiService.ts`, `formatDate.ts`
- **kebab-case**: Style files, constants
  - `user-profile.styles.ts`, `api-constants.ts`
- **lowercase**: Folders
  - `components/`, `services/`, `hooks/`

### React Native Expo Specific

#### Screens (in /app)
```typescript
// app/onboarding.tsx
export default function OnboardingScreen() {
  // Max 80 lines, presentation only
  // No business logic, only UI + navigation
}
```

#### Components (in /components)
```typescript
// components/UserCard.tsx
interface UserCardProps {
  user: User;
  onPress?: () => void;
}

export function UserCard({ user, onPress }: UserCardProps) {
  // Max 80 lines, pure UI component
  // If reused 2+ times, move to /components
}
```

#### Hooks (in /hooks)
```typescript
// hooks/useAuth.ts
export function useAuth() {
  // Business logic, state management
  // Max 25 lines per function
}
```

#### Services (in /services)
```typescript
// services/authService.ts
export const authService = {
  login: async (credentials: Credentials) => {
    // All API calls go here
    // Use expo-constants for API keys
  }
};
```

#### Stores (in /stores - Zustand)
```typescript
// stores/userStore.ts
interface UserState {
  user: User | null;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## Style Conventions

### File Naming
- **Pattern**: `[component-name].styles.ts`
- **Location**: `/assets/styles/`
- **Examples**:
  - `OnboardingFlow.tsx` → `onboarding-flow.styles.ts`
  - `UserProfile.tsx` → `user-profile.styles.ts`
  - `app/index.tsx` → `home-screen.styles.ts`

### Style Structure
```typescript
// assets/styles/user-card.styles.ts
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    // Max 3 inline properties, otherwise use StyleSheet
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});
```

### Import Convention
```typescript
// components/UserCard.tsx
import styles from '@/assets/styles/user-card.styles';
```

## Architecture Patterns

### UI vs Logic Separation
```typescript
// ❌ Wrong - Logic in UI component
export function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/user').then(setUser); // API call in component
  }, []);
  
  return <View>{/* UI */}</View>;
}

// ✅ Correct - Separated concerns
export function UserProfile() {
  const { user, loading } = useUser(); // Logic in hook
  
  if (loading) return <LoadingSpinner />;
  return <View>{/* Pure UI */}</View>;
}
```

### State Management Rules
- **Local state**: React hooks (`useState`, `useReducer`)
- **Shared state**: Zustand stores
- **No prop-drilling** beyond 2 levels
- **Global state**: User data, app settings, schedule data

### Expo-Specific Guidelines

#### Configuration
```typescript
// constants/config.ts
import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3000';
```

#### Navigation
```typescript
// Use Expo Router (file-based)
// app/(tabs)/index.tsx - Tab navigation
// app/modal.tsx - Modal presentation
// app/[id].tsx - Dynamic routes
```

#### Native Features
```typescript
// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { SecureStore } from 'expo-secure-store';

// Leverage Expo's built-in modules
```

## Component Patterns

### Functional Components Only
```typescript
// ✅ Always use functional components
export function UserCard({ user }: UserCardProps) {
  return <View>{/* UI */}</View>;
}

// ❌ No class components
export class UserCard extends Component {
  // Don't use
}
```

### Hook Composition
```typescript
// hooks/useUserProfile.ts
export function useUserProfile(userId: string) {
  const { user } = useUserStore();
  const { data, loading } = useQuery(['user', userId], () => 
    userService.getProfile(userId)
  );
  
  return { user: data, loading };
}
```

## Error Handling

### Service Layer
```typescript
// services/apiService.ts
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiCall<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new ApiError(response.status, response.statusText);
    return response.json();
  } catch (error) {
    // Centralized error handling
    throw error;
  }
}
```

## Testing Patterns

### Component Testing
```typescript
// __tests__/UserCard.test.tsx
import { render } from '@testing-library/react-native';
import { UserCard } from '@/components/UserCard';

test('renders user name', () => {
  const user = { name: 'John Doe' };
  const { getByText } = render(<UserCard user={user} />);
  expect(getByText('John Doe')).toBeTruthy();
});
```

This convention ensures:
- ✅ Scalable architecture
- ✅ Clear separation of concerns  
- ✅ Expo-optimized patterns
- ✅ Maintainable codebase
- ✅ Performance best practices