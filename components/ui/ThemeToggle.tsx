/**
 * ThemeToggle - Simple theme switching button
 * 
 * Extracted for reusability and clean component architecture.
 * Positioned within safe area for proper accessibility.
 */

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface ThemeToggleProps {
  onToggle: () => void;
  theme: any; // Using theme type from context
  safeAreaTop?: number; // Safe area inset for proper positioning
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  onToggle, 
  theme, 
  safeAreaTop = 0 
}) => {
  const toggleStyle = {
    position: 'absolute' as const,
    top: safeAreaTop + 20, // Position within safe area + padding
    right: 20,
    zIndex: 1000,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  return (
    <View style={toggleStyle}>
      <TouchableOpacity onPress={onToggle}>
        <MaterialIcons 
          name={theme.name === 'light' ? 'nightlight-round' : 'wb-sunny'} 
          size={24} 
          color={theme.colors.textPrimary} 
        />
      </TouchableOpacity>
    </View>
  );
};