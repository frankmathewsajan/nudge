/**
 * Planning Styles - Claude-inspired goal planning interface
 * 
 * Clean, professional styling for goal breakdown and planning screen.
 * Follows Claude's design principles with clear typography and spacing.
 */

import { Platform, StyleSheet } from 'react-native';
import { Theme } from '../../../contexts/ThemeContext';

export const createPlanningStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
  },

  backButton: {
    padding: 8,
    marginRight: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 40, // Space for visual balance
  },

  // Content area
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Goal section
  goalSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  goalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.buttonActiveBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  goalTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' 
      ? 'Menlo' 
      : Platform.OS === 'android' 
        ? 'monospace' 
        : '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
    flexWrap: 'wrap',
    maxWidth: '100%',
    paddingHorizontal: 16,
  },

  // Section styling
  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },

  // Analysis text
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    flexWrap: 'wrap',
  },

  // Recommendation text  
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    flexWrap: 'wrap',
  },

  // Time slot selection
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  timeSlotSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.backgroundTertiary,
  },

  timeSlotInfo: {
    flex: 1,
  },

  timeSlotLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },

  timeSlotLabelSelected: {
    color: theme.colors.textPrimary,
  },

  timeSlotDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  timeSlotDescriptionSelected: {
    color: theme.colors.textSecondary,
  },

  // Action buttons
  actionSection: {
    marginTop: 24,
    gap: 12,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.buttonActiveBackground,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.buttonActiveText,
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    gap: 8,
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },

  // Loading and status text
  loadingText: {
    fontSize: 14,
    color: theme.colors.accentVibrant,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Body text for detailed content
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },

  // Step items for action breakdown
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
  },

  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.accentVibrant,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },

  stepText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textPrimary,
    flex: 1,
    flexWrap: 'wrap',
  },

  // Error handling styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.name === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },

  errorText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: 8,
    lineHeight: 18,
  },

  errorContent: {
    flex: 1,
    marginLeft: 8,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  retryText: {
    fontSize: 12,
    color: theme.colors.accentVibrant,
    fontWeight: '600',
    marginLeft: 4,
  },
});