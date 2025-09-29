/**
 * About & Contact Component
 * 
 * Merged component displaying app info, developer details with tap-to-unlock, and social links
 */

import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Theme } from '../../contexts/ThemeContext';

interface AboutAndContactProps {
  theme: Theme;
  onDeveloperUnlock?: () => void;
}

export const AboutAndContact: React.FC<AboutAndContactProps> = ({ theme, onDeveloperUnlock }) => {
  const styles = createStyles(theme);
  const [tapCount, setTapCount] = useState(0);

  const appInfo = {
    name: 'Nudge',
    version: '1.0.0',
    buildNumber: '1',
    developer: 'Frank Mathew Sajan',
    developmentYear: '2025',
  };

  const socialLinks = [
    {
      label: 'Portfolio',
      url: 'https://frankmathew.dev',
      icon: 'language',
      color: theme.name === 'dark' ? '#4FC3F7' : '#0277BD',
      description: 'Visit website',
    },
    {
      label: 'GitHub', 
      url: 'https://github.com/frankmathewsajan',
      icon: 'code',
      color: theme.name === 'dark' ? '#A5A5A5' : '#333333',
      description: 'View projects',
    },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/frankmathewsajan/',
      icon: 'business-center',
      color: '#0A66C2',
      description: 'Connect professionally',
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/frankdevelopment/',
      icon: 'photo-camera',
      color: '#E4405F',
      description: 'Follow updates',
    },
  ];

  const handleDeveloperTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (newTapCount === 7) {
      setTapCount(0);
      
      Alert.alert(
        'Developer Mode',
        'Enter password to access developer settings:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock',
            onPress: () => {
              Alert.prompt(
                'Developer Password',
                'Enter the developer password:',
                (password) => {
                  if (password === 'dev2025') {
                    onDeveloperUnlock?.();
                    Alert.alert('Success', 'Developer options unlocked!');
                  } else {
                    Alert.alert('Error', 'Incorrect password');
                  }
                },
                'secure-text'
              );
            }
          }
        ]
      );
    } else if (newTapCount === 5) {
      Alert.alert('Almost there...', `Tap ${7 - newTapCount} more times to unlock developer mode`);
    }
    
    // Reset count after 10 seconds of inactivity
    setTimeout(() => {
      setTapCount(0);
    }, 10000);
  };

  const handleLinkPress = async (url: string, label: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${label}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open link');
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About & Contact</Text>
      
      {/* App Info Card */}
      <View style={styles.appCard}>
        <View style={styles.appIconContainer}>
          <MaterialIcons name="apps" size={32} color={theme.colors.accentVibrant} />
        </View>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>Version {appInfo.version} • Build {appInfo.buildNumber}</Text>
          <Text style={styles.developmentYear}>© {appInfo.developmentYear}</Text>
        </View>
      </View>

      {/* Developer Info with Tap-to-Unlock */}
      <TouchableOpacity style={styles.developerCard} onPress={handleDeveloperTap} activeOpacity={0.7}>
        <View style={styles.developerIconContainer}>
          <MaterialIcons name="person" size={24} color={theme.colors.accentVibrant} />
        </View>
        <View style={styles.developerInfo}>
          <Text style={styles.developerName}>{appInfo.developer}</Text>
          <Text style={styles.developerTitle}>Full-Stack Developer</Text>
          <Text style={styles.tapHint}>Tap to unlock developer options</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Social Links */}
      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>Connect with Developer</Text>
        <View style={styles.socialGrid}>
          {socialLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              style={styles.socialCard}
              onPress={() => handleLinkPress(link.url, link.label)}
              activeOpacity={0.7}
            >
              <View style={[styles.socialIconContainer, { backgroundColor: link.color + '15' }]}>
                <MaterialIcons 
                  name={link.icon as any} 
                  size={20} 
                  color={link.color} 
                />
              </View>
              <View style={styles.socialInfo}>
                <Text style={styles.socialLabel}>{link.label}</Text>
                <Text style={styles.socialDescription}>{link.description}</Text>
              </View>
              <MaterialIcons name="open-in-new" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  section: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 20,
    elevation: 2,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  // App Info Card
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },

  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accentVibrant + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  appInfo: {
    flex: 1,
  },

  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.2,
  },

  appVersion: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },

  developmentYear: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '400',
  },

  // Developer Card
  developerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },

  developerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentVibrant + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  developerInfo: {
    flex: 1,
  },

  developerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
    letterSpacing: 0.1,
  },

  developerTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },

  tapHint: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },

  // Social Section
  socialSection: {
    marginTop: 4,
  },

  socialTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.1,
  },

  socialGrid: {
    gap: 8,
  },

  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },

  socialIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  socialInfo: {
    flex: 1,
  },

  socialLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.1,
  },

  socialDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
});