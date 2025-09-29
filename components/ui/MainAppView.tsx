/**
 * MainAppView - Presentational Component
 * 
 * DUMB COMPONENT: Displays the main app content after all requirements are met.
 * Receives all data through props and has no internal state or logic.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme } from '../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../ui/SafeAreaWrapper';

interface MainAppViewProps {
  theme: Theme;
  userName: string;
  onOpenSettings: () => void;
}

export const MainAppView: React.FC<MainAppViewProps> = ({
  theme,
  userName,
  onOpenSettings,
}) => {
  const styles = createStyles(theme);
  
  return (
    <SafeAreaWrapper backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.welcomeTitle}>🎉 Welcome to Nudge!</Text>
          <Text style={styles.subtitle}>
            Hello {userName}! All setup complete.
          </Text>
          <Text style={styles.description}>
            Your personal productivity companion is ready to help you achieve your goals.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={onOpenSettings}
            testID="settings-button"
          >
            <Text style={styles.primaryButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 400,
  },
  
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  description: {
    fontSize: 16,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  
  primaryButton: {
    backgroundColor: theme.colors.accentVibrant,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});