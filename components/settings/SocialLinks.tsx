/**
 * Social Links Component
 * 
 * Provides links to social media and developer contact information
 */

import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Theme } from '../../contexts/ThemeContext';

interface SocialLinksProps {
  theme: Theme;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ theme }) => {
  const styles = createStyles(theme);

  const handleLinkPress = async (url: string, label: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open ${label}: ${url}`);
      }
    } catch (error) {
      console.error(`Error opening ${label}:`, error);
    }
  };

  const socialLinks = [
    {
      label: 'Portfolio',
      url: 'https://frankmathew.dev',
      icon: 'web',
      color: '#6366F1',
    },
    {
      label: 'GitHub', 
      url: 'https://github.com/frankmathewsajan',
      icon: 'code',
      color: '#333',
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

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Links & Contact</Text>
      
      <View style={styles.socialRow}>
        {socialLinks.map((link) => (
          <TouchableOpacity
            key={link.label}
            style={styles.socialButton}
            onPress={() => handleLinkPress(link.url, link.label)}
            activeOpacity={0.7}
          >
            <View style={[styles.socialIcon, { backgroundColor: `${link.color}20` }]}>
              <MaterialIcons 
                name={link.icon as any} 
                size={20} 
                color={link.color} 
              />
            </View>
            <Text style={styles.socialLabel}>{link.label}</Text>
          </TouchableOpacity>
        ))}
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

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  socialButton: {
    alignItems: 'center',
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },

  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  socialLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});