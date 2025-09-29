/**
 * Profile Tab Screen
 * 
 * User profile and settings access within the tab navigation.
 */

import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/hooks/useUserData';
import authService from '@/services/authService';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileTabScreen() {
  const { theme } = useTheme();
  const { userName, currentUser } = useUserData();
  const styles = createStyles(theme);

  const handleOpenSettings = () => {
    router.push('/modal/settings' as any);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      // The app will automatically redirect to auth screen due to state change
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaWrapper backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.welcomeTitle}>👋 Hello, {userName}!</Text>
          <Text style={styles.subtitle}>Your Profile</Text>
          
          {currentUser?.email && (
            <Text style={styles.emailText}>📧 {currentUser.email}</Text>
          )}

          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={handleOpenSettings}
          >
            <Text style={styles.buttonText}>⚙️ Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
    marginBottom: 24,
    textAlign: 'center',
  },
  
  emailText: {
    fontSize: 16,
    color: theme.colors.textTertiary,
    marginBottom: 32,
    textAlign: 'center',
  },
  
  settingsButton: {
    backgroundColor: theme.colors.accentVibrant,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});