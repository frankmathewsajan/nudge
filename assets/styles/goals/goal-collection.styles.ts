/**
 * GoalCollectionStyles - Theme-aware styling for goal collection
 * 
 * Matches onboarding aesthetic with clean, minimal design.
 * Inspired by Claude's clean interface with focus on content.
 */

import { Platform, StyleSheet } from 'react-native';
import { Theme } from '../../../contexts/ThemeContext';

export const createGoalCollectionStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },

  // Header section with centered content
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },

  // Clean icon/logo area - Dark theme
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.textPrimary, // Dark color instead of accent
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },

  iconSymbol: {
    fontSize: 32,
    color: theme.colors.buttonActiveText,
    fontWeight: '600',
  },

  // Main heading - Enhanced book-style typography with premium fonts
  mainHeading: {
    fontSize: 38,
    fontWeight: '200',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1.2,
    lineHeight: 44,
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' 
      ? 'Menlo' 
      : Platform.OS === 'android' 
        ? 'monospace' 
        : '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
    textShadowColor: theme.colors.textTertiary,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Input section
  inputSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // Chat-style input container
  inputContainer: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
    shadowColor: theme.colors.textTertiary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputContainerFocused: {
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  // Text input
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.inputText,
    fontWeight: '400',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 24,
  },

  placeholder: {
    color: theme.colors.textTertiary,
  },

  // Action buttons
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  sendButton: {
    backgroundColor: theme.colors.textPrimary, // Dark color instead of accent
  },

  sendButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
    opacity: 0.5,
  },

  // Keyboard-aware adjustments
  keyboardActive: {
    paddingTop: 20,
  },

  headerSectionKeyboard: {
    flex: 0,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // Suggestions area (for future use)
  suggestionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  suggestionChip: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },

  suggestionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Help text
  helpText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    lineHeight: 20,
  },

  // Example pills section - 2-row layout with tighter spacing
  examplePillsContainer: {
    marginTop: 40,
    height: 120, // Reduced height for tighter spacing
  },

  exampleRow: {
    height: 55, // Slightly shorter rows
    marginBottom: 4, // Much less space between rows
  },

  exampleRowContent: {
    alignItems: 'center',
    paddingRight: 50, // Reduced padding for seamless scrolling
    paddingLeft: 10, // Reduced left padding
  },

  examplePill: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 25, // More rounded
    paddingHorizontal: 20, // More horizontal padding
    paddingVertical: 12, // More vertical padding
    marginRight: 16, // More space between pills
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 80, // Minimum width to prevent squashing
  },

  examplePillText: {
    fontSize: 14, // Slightly larger text
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});