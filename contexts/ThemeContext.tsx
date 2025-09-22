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

// Light Theme - Enhanced with vibrant, lively colors
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    backgroundTertiary: '#F1F5F9',
    
    // Text colors
    textPrimary: '#1E293B',
    textSecondary: '#475569',
    textTertiary: '#64748B',
    
    // Accent colors - Vibrant and lively
    accent: '#F59E0B',                    // Warm gold
    accentSecondary: '#EAB308',           // Rich yellow
    accentVibrant: '#06B6D4',             // Cyan blue for life!
    accentSoft: '#8B5CF6',                // Purple for elegance
    
    // UI element colors
    buttonBackground: '#F1F5F9',
    buttonText: '#475569',
    buttonActiveBackground: '#1E293B',
    buttonActiveText: '#FFFFFF',
    inputBackground: '#F8FAFC',           // Softer than pure white
    inputBorder: '#E2E8F0',
    inputText: '#1E293B',
    inputFocusBackground: '#F0F9FF',      // Light blue tint when focused
    inputPlaceholder: '#94A3B8',          // Harmonious placeholder color
    
    // Animation colors
    animationPrimary: '#F59E0B',
    animationSecondary: '#06B6D4',        // Vibrant cyan
    animationTertiary: '#8B5CF6',         // Purple accent
    
    // Gradient colors for life
    gradientStart: '#F59E0B',             // Warm gold
    gradientEnd: '#06B6D4',               // Cool cyan
    gradientVibrant: '#8B5CF6',           // Purple for variety
  },
};

// Dark Theme - Enhanced with vibrant, lively colors
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Background colors
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    
    // Text colors
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    
    // Accent colors - Vibrant and electric for dark mode
    accent: '#FCD34D',                    // Bright gold
    accentSecondary: '#F59E0B',           // Warm amber
    accentVibrant: '#22D3EE',             // Electric cyan for energy!
    accentSoft: '#A78BFA',                // Soft purple for elegance
    
    // UI element colors
    buttonBackground: '#334155',
    buttonText: '#CBD5E1',
    buttonActiveBackground: '#F8FAFC',
    buttonActiveText: '#0F172A',
    inputBackground: '#1E293B',           // Dark but not harsh
    inputBorder: '#64748B',
    inputText: '#F8FAFC',
    inputFocusBackground: '#0F172A',      // Slightly darker when focused
    inputPlaceholder: '#64748B',          // Softer placeholder in dark
    
    // Animation colors - Electric and vibrant
    animationPrimary: '#FCD34D',          // Bright gold
    animationSecondary: '#22D3EE',        // Electric cyan
    animationTertiary: '#A78BFA',         // Soft purple
    
    // Gradient colors for life
    gradientStart: '#FCD34D',             // Bright gold
    gradientEnd: '#22D3EE',               // Electric cyan  
    gradientVibrant: '#A78BFA',           // Purple magic
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