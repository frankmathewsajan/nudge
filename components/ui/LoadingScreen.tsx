/**
 * LoadingScreen - Clean Loading State Component
 * 
 * Displays a proper loading screen instead of returning null.
 * Shows during app initialization while checking auth and progress state.
 */

import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaWrapper } from './SafeAreaWrapper';

export const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaWrapper backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.accentVibrant} 
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>Loading Nudge...</Text>
          <Text style={styles.subText}>Setting up your experience</Text>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  spinner: {
    marginBottom: 24,
  },
  
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  subText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});