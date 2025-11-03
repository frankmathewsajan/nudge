/**
 * SafeAreaWrapper - Universal Safe Area Component
 * 
 * A reusable wrapper that ensures proper safe area handling across all devices.
 * Can be extended with common UI elements like offline indicators, loading states, etc.
 */

import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StatusBar, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'auto' | 'light' | 'dark';
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
  testID?: string;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  backgroundColor,
  statusBarStyle = 'auto',
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const finalBackgroundColor = backgroundColor || theme.colors.background;
  
  // Calculate padding based on edges
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;
  const paddingLeft = edges.includes('left') ? insets.left : 0;
  const paddingRight = edges.includes('right') ? insets.right : 0;
  
  const containerStyle = [
    styles.container,
    {
      backgroundColor: finalBackgroundColor,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
    },
    style,
  ];
  
  return (
    <View style={containerStyle} testID={testID}>
      <StatusBar 
        barStyle={
          statusBarStyle === 'auto' 
            ? theme.name === 'dark' ? 'light-content' : 'dark-content'
            : statusBarStyle === 'dark' ? 'dark-content' : 'light-content'
        }
        backgroundColor="transparent"
        translucent
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});