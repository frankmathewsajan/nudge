/**
 * Settings Screen Component
 * 
 * Claude-inspired clean and minimal settings interface
 * Calm, eye-pleasing design with perfect spacing and typography
 */

import { createSettingsStyles } from '@/assets/styles/app/settings.styles';
import { useUserData } from '@/hooks/useUserData';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import authService from '../../services/authService';
import AnimatedBackground from '../ui/AnimatedBackground';

interface SettingsScreenProps {
  onClose?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { userName } = useUserData();
  const [userEmail, setUserEmail] = useState<string>('');
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const styles = createSettingsStyles(theme);

  useEffect(() => {
    // Get current user email
    const loadUserData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleBack = () => {
    if (onClose) onClose();
  };

  const handleProfile = () => {
    // TODO: Navigate to profile screen
  };

  const handleBilling = () => {
    // TODO: Navigate to billing screen
  };

  const handleCapabilities = () => {
    // TODO: Navigate to capabilities screen
  };

  const handlePermissions = () => {
    // TODO: Navigate to permissions screen
  };

  const handleColorMode = () => {
    toggleTheme();
  };

  const handleFontStyle = () => {
    // TODO: Navigate to font settings
  };

  const handleSpeechLanguage = () => {
    // TODO: Navigate to language settings
  };

  const handlePrivacy = () => {
    // TODO: Navigate to privacy settings
  };

  const handleSharedLinks = () => {
    // TODO: Navigate to shared links
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              if (onClose) onClose();
            } catch (error) {
              console.error('Logout error:', error);
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
    rightElement = null 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    destructive?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={[styles.settingRow, destructive && styles.destructiveRow]} 
      onPress={onPress}
      activeOpacity={0.7}
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground intensity="subtle" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userName || 'User'}</Text>
              <Text style={styles.userEmail}>{userEmail || 'No email'}</Text>
            </View>
          </View>
        </View>

        {/* Main Settings */}
        <SettingRow
          icon="person-outline"
          title="Profile"
          onPress={handleProfile}
        />

        <SettingRow
          icon="credit-card"
          title="Billing"
          onPress={handleBilling}
        />

        <View style={styles.spacerMedium} />

        <SettingRow
          icon="tune"
          title="Capabilities"
          subtitle="2 enabled"
          onPress={handleCapabilities}
        />

        <SettingRow
          icon="security"
          title="Permissions"
          onPress={handlePermissions}
        />

        <View style={styles.spacerMedium} />

        <SettingRow
          icon="dark-mode"
          title="Color mode"
          subtitle={theme.name === 'dark' ? 'Dark' : 'Light'}
          onPress={handleColorMode}
        />

        <SettingRow
          icon="font-download"
          title="Font style"
          subtitle="Default"
          onPress={handleFontStyle}
        />

        <SettingRow
          icon="language"
          title="Speech language"
          subtitle="English"
          onPress={handleSpeechLanguage}
        />

        <View style={styles.spacerMedium} />

        <SettingRow
          icon="vibration"
          title="Haptic feedback"
          onPress={() => setHapticEnabled(!hapticEnabled)}
          showArrow={false}
          rightElement={
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ 
                false: theme.colors.backgroundTertiary, 
                true: theme.colors.accent 
              }}
              thumbColor={hapticEnabled ? '#FFFFFF' : theme.colors.backgroundSecondary}
            />
          }
        />

        <SettingRow
          icon="privacy-tip"
          title="Privacy"
          onPress={handlePrivacy}
        />

        <SettingRow
          icon="link"
          title="Shared links"
          onPress={handleSharedLinks}
        />

        <View style={styles.spacerLarge} />

        {/* Logout */}
        <SettingRow
          icon="logout"
          title="Log out"
          onPress={handleLogout}
          showArrow={false}
          destructive={true}
        />

        <View style={styles.spacerLarge} />
      </ScrollView>
    </SafeAreaView>
  );
};