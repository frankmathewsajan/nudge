/**
 * Settings Screen Component
 * 
 * Compact settings interface with Material Design 3 styling
 */

import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import authService from '../../services/authService';
import { AboutAndContact } from './AboutAndContact';
import { AccountManagement } from './AccountManagement';
import { DangerZone } from './DangerZone';
import { DeveloperOptions } from './DeveloperOptions';

interface SettingsScreenProps {
  onClose?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme.name === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showDeveloperOptions, setShowDeveloperOptions] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    setIsDarkMode(theme.name === 'dark');
    
    // Get current user email and load settings
    const loadUserData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user?.email) {
          setUserEmail(user.email);
        }

        // Load saved API key (in a real app, this would be encrypted)
        // For now, we'll just keep it in state
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };
    
    loadUserData();
  }, [theme.name]);

  const handleThemeToggle = (value: boolean) => {
    setIsDarkMode(value);
    toggleTheme();
  };

  const handleDeveloperUnlock = () => {
    setShowDeveloperOptions(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* 1. Account Management - Enhanced with profile details */}
        <AccountManagement 
          theme={theme}
          userEmail={userEmail}
        />

        {/* 2. Preferences - Theme and Notifications only */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="dark-mode" size={20} color={theme.colors.accentVibrant} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: theme.colors.inputBorder, true: theme.colors.accentVibrant }}
              thumbColor={isDarkMode ? '#fff' : theme.colors.backgroundSecondary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications" size={20} color={theme.colors.accentVibrant} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.inputBorder, true: theme.colors.accentVibrant }}
              thumbColor={notificationsEnabled ? '#fff' : theme.colors.backgroundSecondary}
            />
          </View>
        </View>

        {/* 3. Danger Zone - Compact, positioned before About */}
        <DangerZone theme={theme} />

        {/* 4. About & Contact - Merged component with social links */}
        <AboutAndContact 
          theme={theme} 
          onDeveloperUnlock={handleDeveloperUnlock}
        />

        {/* Developer Options - Hidden until unlocked via 7-tap gesture on About */}
        {showDeveloperOptions && (
          <DeveloperOptions 
            theme={theme}
            geminiApiKey={geminiApiKey}
            onGeminiApiKeyChange={setGeminiApiKey}
          />
        )}

      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollView: {
    flex: 1,
  },

  card: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    elevation: 1,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.2,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.inputBorder,
  },



  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginLeft: 12,
    letterSpacing: 0.1,
  },


});

export default SettingsScreen;