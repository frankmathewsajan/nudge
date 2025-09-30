/**
 * Settings Content Styles
 * 
 * Theme-aware styles for settings content component
 * Clean, accessible design with proper spacing
 */

import { Theme } from '@/contexts/ThemeContext';
import { StyleSheet } from 'react-native';

export const createSettingsContentStyles = (theme: Theme) => StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },

  section: {
    marginBottom: 32,
  },

  dangerSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },

  // User Profile Section
  userSection: {
    marginBottom: 32,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  userInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.buttonText,
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },

  // Setting Rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 1,
    backgroundColor: theme.colors.background,
    minHeight: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },

  destructiveRow: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0,
  },

  settingIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },

  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  settingArrow: {
    marginLeft: 8,
  },

  destructiveText: {
    color: '#FF4444',
  },

  destructiveIcon: {
    color: '#FF4444',
  },
});