/**
 * ThemeToggle - Simple theme switching button
 * 
 * Extracted for reusability and clean component architecture.
 * Positioned within safe area for proper accessibility.
 */

import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
    // Inline style with backdrop blur for better visibility
    width: 44,
    height: 44,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: 22,
    overflow: 'hidden' as const,
  } : {
    position: 'absolute' as const,
    top: safeAreaTop + 20, // Position within safe area + padding
    right: 20,
    zIndex: 1000,
    // Positioned style with backdrop blur for better visibility
    width: 50,
    height: 50,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: 25,
    overflow: 'hidden' as const,
  };

  return (
    <View style={toggleStyle}>
      <BlurView
        intensity={theme.name === 'light' ? 20 : 40}
        tint={theme.name === 'light' ? 'light' : 'dark'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View
        style={{
          backgroundColor: theme.name === 'light' 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(20, 20, 20, 0.8)',
          borderRadius: inline ? 22 : 25,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: theme.name === 'dark' ? 1 : 0,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        <TouchableOpacity onPress={onToggle} style={{ padding: 8 }}>
          <MaterialIcons 
            name={theme.name === 'light' ? 'nightlight-round' : 'wb-sunny'} 
            size={20} 
            color={theme.colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};