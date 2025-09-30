// Theme Context - Light and Dark theme management
// Provides theme switching functionality throughout the app

import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Accent colors - Enhanced with vibrant life
  accent: string;
  accentSecondary: string;
  accentVibrant: string;      // NEW: Vibrant accent for life
  accentSoft: string;         // NEW: Soft accent for subtle highlights
  
  // UI element colors
  buttonBackground: string;
  buttonText: string;
  buttonActiveBackground: string;
  buttonActiveText: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputFocusBackground: string;  // NEW: Dedicated focus background
  inputPlaceholder: string;      // NEW: Dedicated placeholder color
  border: string;                // NEW: General border color
  
  // Animation colors
  animationPrimary: string;
  animationSecondary: string;
  animationTertiary: string;
  
  // NEW: Gradient colors for life
  gradientStart: string;
  gradientEnd: string;
  gradientVibrant: string;
}

export interface Theme {
  name: 'light' | 'dark';
  colors: ThemeColors;
}

// Light Theme - Vogue/Claude inspired elegant colors
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Background colors - Pure, elegant whites and subtle grays
    background: '#FEFEFE',                // Near-white with warmth
    backgroundSecondary: '#F9FAFB',       // Subtle gray for surfaces
    backgroundTertiary: '#F3F4F6',        // Card backgrounds
    
    // Text colors - Sophisticated grays
    textPrimary: '#1F2937',               // Deep charcoal
    textSecondary: '#6B7280',             // Medium gray
    textTertiary: '#9CA3AF',              // Light gray
    
    // Accent colors - Golden elegance
    accent: '#D4AF37',                    // Classic gold
    accentSecondary: '#FFD700',           // Bright gold
    accentVibrant: '#FFA500',             // Orange gold
    accentSoft: '#FFF8DC',                // Cornsilk for highlights
    
    // UI element colors
    buttonBackground: '#F9FAFB',
    buttonText: '#6B7280',
    buttonActiveBackground: '#D4AF37',
    buttonActiveText: '#FFFFFF',
    inputBackground: '#FEFEFE',
    inputBorder: '#E5E7EB',
    inputText: '#1F2937',
    inputFocusBackground: '#F0F9FF',
    inputPlaceholder: '#9CA3AF',
    border: '#E5E7EB',                    // General border color
    
    // Animation colors
    animationPrimary: '#D4AF37',
    animationSecondary: '#FFD700',
    animationTertiary: '#FFA500',
    
    // Gradient colors
    gradientStart: '#D4AF37',
    gradientEnd: '#FFD700',
    gradientVibrant: '#FFA500',
  },
};

// Dark Theme - Sophisticated dark with elegant contrast
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Background colors - Rich blacks and sophisticated grays
    background: '#0A0A0B',                // Deep black with subtle warmth
    backgroundSecondary: '#1A1A1B',       // Card backgrounds
    backgroundTertiary: '#2A2A2B',        // Elevated surfaces
    
    // Text colors - High contrast but not harsh
    textPrimary: '#FAFAFA',               // Warm white
    textSecondary: '#A1A1AA',             // Elegant gray
    textTertiary: '#71717A',              // Subdued gray
    
    // Accent colors - Golden elegance for dark mode
    accent: '#FFD700',                    // Bright gold for dark backgrounds
    accentSecondary: '#FFA500',           // Orange gold
    accentVibrant: '#DAA520',             // Goldenrod
    accentSoft: '#2A2520',                // Dark golden brown
    
    // UI element colors
    buttonBackground: '#2A2A2B',
    buttonText: '#A1A1AA',
    buttonActiveBackground: '#FFD700',
    buttonActiveText: '#000000',
    inputBackground: '#1A1A1B',
    inputBorder: '#3F3F46',
    inputText: '#FAFAFA',
    inputFocusBackground: '#0A0A0B',
    inputPlaceholder: '#71717A',
    border: '#3F3F46',                    // General border color
    
    // Animation colors
    animationPrimary: '#FFD700',
    animationSecondary: '#FFA500',
    animationTertiary: '#DAA520',
    
    // Gradient colors
    gradientStart: '#FFD700',
    gradientEnd: '#FFA500',
    gradientVibrant: '#DAA520',
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme); // Start with light theme

  const toggleTheme = () => {
    setTheme(current => current.name === 'light' ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};