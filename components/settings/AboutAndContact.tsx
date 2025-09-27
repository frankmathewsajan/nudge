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
      icon: 'web',
      color: theme.colors.accentVibrant,
    },
    {
      label: 'GitHub', 
      url: 'https://github.com/frankmathewsajan',
      icon: 'code',
      color: theme.colors.textSecondary,
    },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/frankmathewsajan/',
      icon: 'business',
      color: '#0077B5',
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/frankdevelopment/',
      icon: 'camera-alt',
      color: '#E1306C',
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
      
      {/* App Info Row */}
      <View style={styles.infoRow}>
        <MaterialIcons name="info-outline" size={20} color={theme.colors.accentVibrant} />
        <View style={styles.infoContent}>
          <Text style={styles.appName}>{appInfo.name} v{appInfo.version}</Text>
          <Text style={styles.developmentYear}>© {appInfo.developmentYear}</Text>
        </View>
      </View>

      {/* Developer Info with Tap-to-Unlock */}
      <TouchableOpacity style={styles.developerRow} onPress={handleDeveloperTap}>
        <MaterialIcons name="person" size={20} color={theme.colors.accentVibrant} />
        <View style={styles.developerContent}>
          <Text style={styles.developerName}>{appInfo.developer}</Text>
          <Text style={styles.developerTitle}>Full-Stack Developer</Text>
        </View>
      </TouchableOpacity>

      {/* Social Links */}
      <View style={styles.socialSection}>
        <View style={styles.divider} />
        <Text style={styles.socialTitle}>Connect</Text>
        <View style={styles.socialGrid}>
          {socialLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              style={styles.socialButton}
              onPress={() => handleLinkPress(link.url, link.label)}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name={link.icon as any} 
                size={18} 
                color={link.color} 
              />
              <Text style={styles.socialLabel}>{link.label}</Text>
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
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    elevation: 1,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  infoContent: {
    marginLeft: 12,
    flex: 1,
  },

  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },

  developmentYear: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },

  developerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.inputBorder,
    marginTop: 8,
  },

  developerContent: {
    marginLeft: 12,
    flex: 1,
  },

  developerName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },

  developerTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },

  socialSection: {
    marginTop: 12,
  },

  divider: {
    height: 0.5,
    backgroundColor: theme.colors.inputBorder,
    marginVertical: 12,
  },

  socialTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },

  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.inputBorder + '40',
    borderWidth: 0.5,
    borderColor: theme.colors.inputBorder,
    minWidth: '47%',
  },

  socialLabel: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginLeft: 6,
    fontWeight: '500',
  },
});