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
  inline?: boolean; // Whether to use inline styling (non-absolute)
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  onToggle, 
  theme, 
  safeAreaTop = 0,
  inline = false
}) => {
  const toggleStyle = inline ? {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } : {
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
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  return (
    <View style={toggleStyle}>
      <TouchableOpacity onPress={onToggle} style={{ padding: 8 }}>
        <MaterialIcons 
          name={theme.name === 'light' ? 'nightlight-round' : 'wb-sunny'} 
          size={20} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  );
};