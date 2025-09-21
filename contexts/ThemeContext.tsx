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
  
  // Accent colors
  accent: string;
  accentSecondary: string;
  
  // UI element colors
  buttonBackground: string;
  buttonText: string;
  buttonActiveBackground: string;
  buttonActiveText: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  
  // Animation colors
  animationPrimary: string;
  animationSecondary: string;
  animationTertiary: string;
}

export interface Theme {
  name: 'light' | 'dark';
  colors: ThemeColors;
}

// Light Theme
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
    
    // Accent colors
    accent: '#F59E0B', // Gold (same as dark theme for consistency)
    accentSecondary: '#EAB308',
    
    // UI element colors
    buttonBackground: '#F1F5F9',
    buttonText: '#475569',
    buttonActiveBackground: '#F59E0B', // Golden active background
    buttonActiveText: '#FFFFFF',
    inputBackground: '#FFFFFF',
    inputBorder: '#E2E8F0',
    inputText: '#1E293B',
    
    // Animation colors
    animationPrimary: '#F59E0B', // Golden
    animationSecondary: '#64748B',
    animationTertiary: '#CBD5E1',
  },
};

// Dark Theme (current implementation)
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
    
    // Accent colors
    accent: '#F59E0B', // Gold
    accentSecondary: '#EAB308',
    
    // UI element colors
    buttonBackground: '#334155',
    buttonText: '#CBD5E1',
    buttonActiveBackground: '#F59E0B',
    buttonActiveText: '#0F172A',
    inputBackground: '#1E293B',
    inputBorder: '#64748B',
    inputText: '#F8FAFC',
    
    // Animation colors
    animationPrimary: '#F59E0B',
    animationSecondary: '#64748B',
    animationTertiary: '#CBD5E1',
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