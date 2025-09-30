import { config } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'

// Enhanced color palette following Google Material Design 3 and color theory
const colors = {
  // Primary colors - Golden for elegance and warmth
  primary50: '#FFFBF0',
  primary100: '#FFF3C4', 
  primary200: '#FFE082',
  primary300: '#FFCC02',
  primary400: '#FFB300',
  primary500: '#D4AF37', // Main primary - Classic gold
  primary600: '#B8860B',
  primary700: '#996515',
  primary800: '#7A4F0E',
  primary900: '#5C3A08',

  // Secondary colors - Warm browns to complement gold
  secondary50: '#F5F5DC',
  secondary100: '#F0E68C',
  secondary200: '#DDD6C1', 
  secondary300: '#D2B48C',
  secondary400: '#BC9A6A',
  secondary500: '#A0824A', // Main secondary - Warm brown
  secondary600: '#8B7355',
  secondary700: '#654321',
  secondary800: '#583C1F',
  secondary900: '#4A2C2A',

  // Accent colors - Golden glow for highlights and energy
  accent50: '#FFFBF0',
  accent100: '#FFF3C4',
  accent200: '#FFEB9C',
  accent300: '#FFE082',
  accent400: '#FFD54F',
  accent500: '#FFD700', // Main accent - Bright gold
  accent600: '#FFA500',
  accent700: '#FF8C00',
  accent800: '#DAA520',
  accent900: '#B8860B',

  // Success colors - Green for achievements
  success50: '#E8F5E8',
  success100: '#C8E6C9',
  success200: '#A5D6A7',
  success300: '#81C784',
  success400: '#66BB6A',
  success500: '#4CAF50', // Main success
  success600: '#43A047',
  success700: '#388E3C',
  success800: '#2E7D32',
  success900: '#1B5E20',

  // Error colors
  error50: '#FFEBEE',
  error100: '#FFCDD2',
  error200: '#EF9A9A',
  error300: '#E57373',
  error400: '#EF5350',
  error500: '#F44336', // Main error
  error600: '#E53935',
  error700: '#D32F2F',
  error800: '#C62828',
  error900: '#B71C1C',

  // Warning colors
  warning50: '#FFF8E1',
  warning100: '#FFECB3',
  warning200: '#FFE082',
  warning300: '#FFD54F',
  warning400: '#FFCA28',
  warning500: '#FFC107', // Main warning
  warning600: '#FFB300',
  warning700: '#FFA000',
  warning800: '#FF8F00',
  warning900: '#FF6F00',

  // Neutral colors for backgrounds and text
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#EEEEEE',
  neutral300: '#E0E0E0',
  neutral400: '#BDBDBD',
  neutral500: '#9E9E9E',
  neutral600: '#757575',
  neutral700: '#616161',
  neutral800: '#424242',
  neutral900: '#212121',

  // Surface colors
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  background: '#FAFAFA',
  outline: '#E0E0E0',
}

const customConfig = createTamagui({
  ...config,
  themes: {
    light: {
      background: colors.background,
      surface: colors.surface,
      primary: colors.primary500,
      primaryContainer: colors.primary100,
      onPrimary: '#FFFFFF',
      onPrimaryContainer: colors.primary900,
      secondary: colors.secondary500,
      secondaryContainer: colors.secondary100,
      onSecondary: '#FFFFFF',
      onSecondaryContainer: colors.secondary900,
      tertiary: colors.accent500,
      tertiaryContainer: colors.accent100,
      onTertiary: '#FFFFFF',
      onTertiaryContainer: colors.accent900,
      error: colors.error500,
      errorContainer: colors.error100,
      onError: '#FFFFFF',
      onErrorContainer: colors.error900,
      outline: colors.outline,
      outlineVariant: colors.neutral200,
      surfaceVariant: colors.surfaceVariant,
      onSurface: colors.neutral900,
      onSurfaceVariant: colors.neutral700,
      inverseSurface: colors.neutral800,
      inverseOnSurface: colors.neutral100,
      inversePrimary: colors.primary200,
      shadow: colors.neutral900,
      success: colors.success500,
      successContainer: colors.success100,
      onSuccess: '#FFFFFF',
      warning: colors.warning500,
      warningContainer: colors.warning100,
      onWarning: colors.warning900,
    },
    dark: {
      background: '#121212',
      surface: '#1E1E1E',
      primary: colors.primary300,
      primaryContainer: colors.primary800,
      onPrimary: colors.primary900,
      onPrimaryContainer: colors.primary100,
      secondary: colors.secondary300,
      secondaryContainer: colors.secondary800,
      onSecondary: colors.secondary900,
      onSecondaryContainer: colors.secondary100,
      tertiary: colors.accent300,
      tertiaryContainer: colors.accent800,
      onTertiary: colors.accent900,
      onTertiaryContainer: colors.accent100,
      error: colors.error300,
      errorContainer: colors.error800,
      onError: colors.error900,
      onErrorContainer: colors.error100,
      outline: colors.neutral600,
      outlineVariant: colors.neutral700,
      surfaceVariant: '#2A2A2A',
      onSurface: colors.neutral100,
      onSurfaceVariant: colors.neutral300,
      inverseSurface: colors.neutral100,
      inverseOnSurface: colors.neutral800,
      inversePrimary: colors.primary600,
      shadow: '#000000',
      success: colors.success300,
      successContainer: colors.success800,
      onSuccess: colors.success900,
      warning: colors.warning300,
      warningContainer: colors.warning800,
      onWarning: colors.warning900,
    },
  },
  fonts: {
    ...config.fonts,
    body: {
      family: 'Inter',
      size: {
        1: 11,
        2: 12, 
        3: 13,
        4: 14,
        5: 16,
        6: 18,
        7: 20,
        8: 22,
        9: 30,
        10: 42,
        11: 52,
        12: 62,
      },
      lineHeight: {
        1: 16,
        2: 17,
        3: 18,
        4: 20,
        5: 24,
        6: 26,
        7: 28,
        8: 30,
        9: 38,
        10: 50,
        11: 60,
        12: 70,
      },
      weight: {
        1: '400',
        2: '500',
        3: '600',
        4: '700',
        5: '800',
        6: '900',
      },
    },
    heading: {
      family: 'Inter',
      size: {
        1: 14,
        2: 16,
        3: 18,
        4: 20,
        5: 24,
        6: 28,
        7: 32,
        8: 36,
        9: 42,
        10: 48,
        11: 56,
        12: 64,
      },
      weight: {
        1: '600',
        2: '700',
        3: '800',
        4: '900',
      },
    },
  },
})

export default customConfig
export type TamaguiConfig = typeof customConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
