// Enhanced Material Design 3 theme with improved color theory and typography
export const materialTheme = {
  // Color palette based on Material Design 3 with psychological color theory
  colors: {
    // Primary - Blue for trust, reliability, and productivity
    primary: {
      0: '#000000',
      10: '#001D35',
      20: '#003258',
      25: '#003F6B',
      30: '#004C7E',
      35: '#005A92',
      40: '#0067A6',
      50: '#2196F3', // Main primary
      60: '#42A5F5',
      70: '#64B5F6',
      80: '#90CAF9',
      90: '#BBDEFB',
      95: '#E3F2FD',
      98: '#F1F8FF',
      99: '#FAFBFF',
      100: '#FFFFFF',
    },
    
    // Secondary - Teal for balance, clarity, and growth
    secondary: {
      0: '#000000',
      10: '#002117',
      20: '#00382B',
      25: '#004D37',
      30: '#006344',
      35: '#007A52',
      40: '#009061',
      50: '#009688', // Main secondary
      60: '#26A69A',
      70: '#4DB6AC',
      80: '#80CBC4',
      90: '#B2DFDB',
      95: '#E0F2F1',
      98: '#F0FDF9',
      99: '#F7FFFC',
      100: '#FFFFFF',
    },
    
    // Tertiary - Orange for energy, motivation, and call-to-action
    tertiary: {
      0: '#000000',
      10: '#2D1600',
      20: '#492900',
      25: '#573300',
      30: '#663D00',
      35: '#754700',
      40: '#855100',
      50: '#FF9800', // Main tertiary
      60: '#FFA726',
      70: '#FFB74D',
      80: '#FFCC80',
      90: '#FFE0B2',
      95: '#FFF3E0',
      98: '#FFFBF7',
      99: '#FFFDF8',
      100: '#FFFFFF',
    },
    
    // Error colors
    error: {
      0: '#000000',
      10: '#410E0B',
      20: '#601410',
      25: '#6F1A13',
      30: '#8C1D18',
      35: '#A8221C',
      40: '#B3261E',
      50: '#F44336',
      60: '#EF5350',
      70: '#E57373',
      80: '#EF9A9A',
      90: '#FFCDD2',
      95: '#FFEBEE',
      98: '#FFF8F7',
      99: '#FFFBFA',
      100: '#FFFFFF',
    },
    
    // Success colors for achievements and progress
    success: {
      0: '#000000',
      10: '#0F2711',
      20: '#1B4518',
      25: '#1F561A',
      30: '#25681E',
      35: '#2A7A22',
      40: '#2F8C26',
      50: '#4CAF50',
      60: '#66BB6A',
      70: '#81C784',
      80: '#A5D6A7',
      90: '#C8E6C9',
      95: '#E8F5E8',
      98: '#F1FCF1',
      99: '#F7FFF7',
      100: '#FFFFFF',
    },
    
    // Neutral colors for text and surfaces
    neutral: {
      0: '#000000',
      4: '#0F0F0F',
      6: '#161616',
      10: '#1C1B1F',
      12: '#211F26',
      17: '#2B2930',
      20: '#313033',
      22: '#34303A',
      24: '#37343C',
      25: '#39363F',
      30: '#484649',
      35: '#54515A',
      40: '#605D66',
      50: '#787579',
      60: '#919094',
      70: '#ACAAAF',
      80: '#C8C5CA',
      87: '#DDD8E0',
      90: '#E6E0E9',
      92: '#ECE6F0',
      94: '#F3EDF7',
      95: '#F5EFF7',
      96: '#F7F2FA',
      98: '#FEF7FF',
      99: '#FFFBFE',
      100: '#FFFFFF',
    },
    
    // Neutral variant for outlines and disabled states
    neutralVariant: {
      0: '#000000',
      10: '#1D1A22',
      20: '#322F37',
      25: '#3D3A42',
      30: '#49454F',
      35: '#54515A',
      40: '#605D66',
      50: '#787579',
      60: '#919094',
      70: '#ACAAAF',
      80: '#C8C5CA',
      90: '#E7E0EC',
      95: '#F5EFF7',
      98: '#FEF7FF',
      99: '#FFFBFE',
      100: '#FFFFFF',
    },
  },
  
  // Semantic color mapping for light theme
  lightTheme: {
    primary: '#2196F3',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E3F2FD',
    onPrimaryContainer: '#001D35',
    
    secondary: '#009688',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E0F2F1',
    onSecondaryContainer: '#002117',
    
    tertiary: '#FF9800',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFF3E0',
    onTertiaryContainer: '#2D1600',
    
    error: '#F44336',
    onError: '#FFFFFF',
    errorContainer: '#FFEBEE',
    onErrorContainer: '#410E0B',
    
    success: '#4CAF50',
    onSuccess: '#FFFFFF',
    successContainer: '#E8F5E8',
    onSuccessContainer: '#0F2711',
    
    background: '#FFFBFE',
    onBackground: '#1C1B1F',
    
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    
    shadow: '#000000',
    scrim: '#000000',
    
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#90CAF9',
  },
  
  // Typography scale based on Material Design 3
  typography: {
    // Display styles for hero sections
    displayLarge: {
      fontFamily: 'System',
      fontSize: 57,
      fontWeight: '400',
      lineHeight: 64,
      letterSpacing: -0.25,
    },
    displayMedium: {
      fontFamily: 'System',
      fontSize: 45,
      fontWeight: '400',
      lineHeight: 52,
      letterSpacing: 0,
    },
    displaySmall: {
      fontFamily: 'System',
      fontSize: 36,
      fontWeight: '400',
      lineHeight: 44,
      letterSpacing: 0,
    },
    
    // Headline styles for important sections
    headlineLarge: {
      fontFamily: 'System',
      fontSize: 32,
      fontWeight: '400',
      lineHeight: 40,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '400',
      lineHeight: 36,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '400',
      lineHeight: 32,
      letterSpacing: 0,
    },
    
    // Title styles for cards and sections
    titleLarge: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '400',
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    
    // Label styles for buttons and inputs
    labelLarge: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontFamily: 'System',
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    
    // Body styles for content
    bodyLarge: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.4,
    },
  },
  
  // Elevation and shadows
  elevation: {
    level0: {
      shadowOpacity: 0,
      elevation: 0,
    },
    level1: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    level2: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    level3: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.11,
      shadowRadius: 6,
      elevation: 3,
    },
    level4: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 8,
      elevation: 4,
    },
    level5: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 5,
    },
  },
  
  // Shape tokens
  shape: {
    corner: {
      none: 0,
      extraSmall: 4,
      small: 8,
      medium: 12,
      large: 16,
      extraLarge: 28,
      full: 9999,
    },
  },
  
  // Motion and animation
  motion: {
    easing: {
      standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
      accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
    },
    duration: {
      short1: 50,
      short2: 100,
      short3: 150,
      short4: 200,
      medium1: 250,
      medium2: 300,
      medium3: 350,
      medium4: 400,
      long1: 450,
      long2: 500,
      long3: 550,
      long4: 600,
      extraLong1: 700,
      extraLong2: 800,
      extraLong3: 900,
      extraLong4: 1000,
    },
  },
}

export default materialTheme
