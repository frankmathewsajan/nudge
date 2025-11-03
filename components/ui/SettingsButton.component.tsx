/**
 * Settings Button Component
 * 
 * Reusable, accessible settings button with consistent styling
 * Follows app naming conventions and theme integration
 */

import { useTheme } from '@/contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { AccessibilityInfo, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface SettingsButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  onPress: () => void;
  size?: number;
  variant?: 'default' | 'compact' | 'minimal';
  testID?: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  onPress,
  size = 20,
  variant = 'default',
  testID = 'settings-button',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderRadius: variant === 'minimal' ? 0 : 22,
    };

    switch (variant) {
      case 'compact':
        return {
          ...baseStyle,
          width: 36,
          height: 36,
          backgroundColor: theme.colors.backgroundSecondary,
        };
      case 'minimal':
        return {
          ...baseStyle,
          padding: 8,
        };
      case 'default':
      default:
        return {
          ...baseStyle,
          width: 44,
          height: 44,
          padding: 12,
        };
    }
  };

  const handlePress = () => {
    // Provide haptic feedback if available
    try {
      AccessibilityInfo.announceForAccessibility('Opening settings');
    } catch (error) {
      // Gracefully handle platforms without accessibility support
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      accessibilityHint="Opens the settings modal with app preferences"
      testID={testID}
      {...props}
    >
      <MaterialIcons 
        name="settings" 
        size={size} 
        color={theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );
};