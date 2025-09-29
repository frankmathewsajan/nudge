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
    
    // Accent colors - Sophisticated and minimal
    accent: '#4F46E5',                    // Elegant indigo
    accentSecondary: '#7C3AED',           // Refined purple
    accentVibrant: '#059669',             // Subtle emerald
    accentSoft: '#E5E7EB',                // Soft gray for highlights
    
    // UI element colors
    buttonBackground: '#F9FAFB',
    buttonText: '#6B7280',
    buttonActiveBackground: '#4F46E5',
    buttonActiveText: '#FFFFFF',
    inputBackground: '#FEFEFE',
    inputBorder: '#E5E7EB',
    inputText: '#1F2937',
    inputFocusBackground: '#F0F9FF',
    inputPlaceholder: '#9CA3AF',
    border: '#E5E7EB',                    // General border color
    
    // Animation colors
    animationPrimary: '#4F46E5',
    animationSecondary: '#7C3AED',
    animationTertiary: '#059669',
    
    // Gradient colors
    gradientStart: '#4F46E5',
    gradientEnd: '#7C3AED',
    gradientVibrant: '#059669',
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
    
    // Accent colors - Sophisticated and minimal
    accent: '#6366F1',                    // Elegant indigo
    accentSecondary: '#8B5CF6',           // Refined purple  
    accentVibrant: '#10B981',             // Emerald green
    accentSoft: '#3F3F46',                // Soft dark gray
    
    // UI element colors
    buttonBackground: '#2A2A2B',
    buttonText: '#A1A1AA',
    buttonActiveBackground: '#6366F1',
    buttonActiveText: '#FAFAFA',
    inputBackground: '#1A1A1B',
    inputBorder: '#3F3F46',
    inputText: '#FAFAFA',
    inputFocusBackground: '#0A0A0B',
    inputPlaceholder: '#71717A',
    border: '#3F3F46',                    // General border color
    
    // Animation colors
    animationPrimary: '#6366F1',
    animationSecondary: '#8B5CF6',
    animationTertiary: '#10B981',
    
    // Gradient colors
    gradientStart: '#6366F1',
    gradientEnd: '#8B5CF6',
    gradientVibrant: '#10B981',
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