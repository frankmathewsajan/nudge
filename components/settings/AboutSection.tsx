/**
 * About Section Component
 * 
 * Displays essential app information with developer unlock feature
 */

import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Theme } from '../../contexts/ThemeContext';

interface AboutSectionProps {
  theme: Theme;
  onDeveloperUnlock?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ theme, onDeveloperUnlock }) => {
  const styles = createStyles(theme);
  const [tapCount, setTapCount] = useState(0);

  const appInfo = {
    name: 'Nudge',
    version: '1.0.0',
    buildNumber: '1',
    developer: 'Frank Mathew Sajan',
    developmentYear: '2025',
    portfolio: 'https://frankmathew.dev',
    github: 'https://github.com/frankmathewsajan',
  };

  const handleDeveloperTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (newTapCount === 7) {
      // Reset tap count and show developer options unlock
      setTapCount(0);
      
      Alert.alert(
        'Developer Mode',
        'Enter password to access developer settings:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock',
            onPress: () => {
              // Simple password prompt - in production, this would be more secure
              Alert.prompt(
                'Developer Password',
                'Enter the developer password:',
                (password) => {
                  if (password === 'dev2025') { // Simple password
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
      // Give user a hint at 5 taps
      Alert.alert('Almost there...', `Tap ${7 - newTapCount} more times to unlock developer mode`);
    }
    
    // Reset count after 10 seconds of inactivity
    setTimeout(() => {
      setTapCount(0);
    }, 10000);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => 
      Alert.alert('Error', 'Could not open link')
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About</Text>
      
      {/* App Info */}
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
          <Text style={styles.developerNameLarge}>{appInfo.developer}</Text>
          <Text style={styles.developerTitle}>Full-Stack Developer</Text>
          
          {/* Developer Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => openLink(appInfo.portfolio)}
            >
              <MaterialIcons name="web" size={16} color={theme.colors.accentVibrant} />
              <Text style={styles.linkText}>Portfolio</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => openLink(appInfo.github)}
            >
              <MaterialIcons name="code" size={16} color={theme.colors.accentVibrant} />
              <Text style={styles.linkText}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
    alignItems: 'flex-start',
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

  developerName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },

  developmentYear: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },

  developerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.inputBorder,
    marginTop: 8,
  },

  developerContent: {
    marginLeft: 12,
    flex: 1,
  },

  developerNameLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  developerTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },

  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: theme.colors.inputBorder,
  },

  linkText: {
    fontSize: 12,
    color: theme.colors.accentVibrant,
    marginLeft: 4,
    fontWeight: '500',
  },
});