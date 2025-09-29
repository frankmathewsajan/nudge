/**
 * Settings Modal Styles
 * 
 * Claude-inspired clean and minimal design
 * Calm, eye-pleasing aesthetic with perfect spacing
 */

import { Theme } from '@/contexts/ThemeContext';
import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const createSettingsStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to show animated background
  },

  // Header with back arrow and centered title
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },

  // User profile section at top
  userSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle beige tint
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  userInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 17,
    fontWeight: '400',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },

  userEmail: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },

  // Settings sections
  settingsSection: {
    paddingVertical: 12,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.backgroundSecondary,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Individual setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Very subtle transparency
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },

  settingIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },

  settingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },

  settingArrow: {
    marginLeft: 8,
  },

  // Destructive actions (logout, delete)
  destructiveRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Very subtle transparency
  },

  destructiveIcon: {
    color: '#FF3B30', // iOS red
  },

  destructiveText: {
    color: '#FF3B30', // iOS red
  },

  // Toggle switch styling
  switchContainer: {
    marginLeft: 'auto',
  },

  // Spacing helpers
  spacerSmall: {
    height: 12,
  },

  spacerMedium: {
    height: 24,
  },

  spacerLarge: {
    height: 32,
  },
});