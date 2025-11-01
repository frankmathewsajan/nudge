/**
 * Settings Content Component
 * 
 * Modular content component for settings
 * Separated from modal presentation logic
 */

import { createSettingsContentStyles } from '@/assets/styles/app/settings-content.styles';
import { useUserData } from '@/hooks/app/useUserData';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import authService from '../../services/auth/authService';

interface SettingsContentProps {
  onClose?: () => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { userName } = useUserData();
  const [userEmail, setUserEmail] = useState<string>('');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const styles = createSettingsContentStyles(theme);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const user = await authService.getCurrentUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'This will sync your data to the cloud and sign you out. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            
            try {
              // Simply logout without showing the syncing alert
              // The backup happens fast enough that users don't need to see it
              await authService.signOut();
              
              console.log('✅ Logout complete, auth state will update automatically');
              
              // Close the modal after successful logout
              if (onClose) onClose();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(
                'Logout Error',
                'There was an issue signing out. Your data has been backed up, but please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    destructive = false,
    rightElement = null,
    testID,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    destructive?: boolean;
    rightElement?: React.ReactNode;
    testID?: string;
  }) => (
    <TouchableOpacity 
      style={[styles.settingRow, destructive && styles.destructiveRow]} 
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      testID={testID}
    >
      <View style={styles.settingIcon}>
        <MaterialIcons 
          name={icon as any} 
          size={22} 
          color={destructive ? styles.destructiveIcon.color : theme.colors.textPrimary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      {rightElement || (showArrow && (
        <MaterialIcons 
          name="chevron-right" 
          size={20} 
          color={theme.colors.textTertiary}
          style={styles.settingArrow}
        />
      ))}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Main Settings */}
      <View style={styles.section}>
        <SettingRow
          icon="person-outline"
          title="Profile"
          onPress={() => {/* TODO: Navigate to profile */}}
          testID="profile-setting"
        />
        
        <SettingRow
          icon="credit-card"
          title="Billing"
          onPress={() => {/* TODO: Navigate to billing */}}
          testID="billing-setting"
        />
      </View>

      {/* Features */}
      <View style={styles.section}>
        <SettingRow
          icon="tune"
          title="Capabilities"
          subtitle="2 enabled"
          onPress={() => {/* TODO: Navigate to capabilities */}}
          testID="capabilities-setting"
        />
        
        <SettingRow
          icon="security"
          title="Permissions"
          onPress={() => {/* TODO: Navigate to permissions */}}
          testID="permissions-setting"
        />
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <SettingRow
          icon="dark-mode"
          title="Color mode"
          subtitle="System"
          onPress={toggleTheme}
          showArrow={false}
          testID="theme-setting"
        />
        
        <SettingRow
          icon="text-format"
          title="Font style"
          subtitle="Default"
          onPress={() => {/* TODO: Navigate to font settings */}}
          testID="font-setting"
        />
        
        <SettingRow
          icon="language"
          title="Speech language"
          subtitle="English"
          onPress={() => {/* TODO: Navigate to language settings */}}
          testID="language-setting"
        />
      </View>

      {/* System */}
      <View style={styles.section}>
        <SettingRow
          icon="vibration"
          title="Haptic feedback"
          onPress={() => setHapticEnabled(!hapticEnabled)}
          showArrow={false}
          testID="haptic-setting"
          rightElement={
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: theme.colors.backgroundSecondary, true: theme.colors.accent }}
              thumbColor={theme.colors.buttonText}
            />
          }
        />
        
        <SettingRow
          icon="security"
          title="Privacy"
          onPress={() => {/* TODO: Navigate to privacy */}}
          testID="privacy-setting"
        />
        
        <SettingRow
          icon="link"
          title="Shared links"
          onPress={() => {/* TODO: Navigate to shared links */}}
          testID="links-setting"
        />
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <SettingRow
          icon="logout"
          title={isLoggingOut ? "Signing out..." : "Log out"}
          onPress={isLoggingOut ? () => {} : handleLogout}
          destructive
          showArrow={false}
          testID="logout-setting"
        />
      </View>
    </ScrollView>
  );
};