/**
 * Collection Styles - Theme-aware styling for goal collection
 * 
 * Matches onboarding aesthetic with clean, minimal design.
 * Inspired by Claude's clean interface with focus on content.
 */

import { Theme } from '@/../contexts/ThemeContext';
import { Platform, StyleSheet } from 'react-native';

export const createCollectionStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to show animated background
    position: 'relative',
  },

  // Scroll container for keyboard handling
  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  // Header section with centered content
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40, // Reduced from 60
    maxHeight: '80%', // Prevent overflow
  },

  // Clean icon/logo area - Enhanced with vibrant gradient-like effects
  iconContainer: {
    width: 320, // Reduced from 500 to fit better
    height: 320, // Reduced from 500 to fit better
    borderRadius: 160,
    backgroundColor: 'transparent',     // Remove background for Lottie
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -8, // Negative margin to bring heading closer
  },

  // Icon container when keyboard is visible - more compact
  iconContainerKeyboard: {
    width: 280, // Smaller when keyboard is visible
    height: 280,
    borderRadius: 140,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },

  iconSymbol: {
    fontSize: 32,
    color: theme.colors.buttonActiveText,
    fontWeight: '600',
  },

  // Main heading - Enhanced book-style typography with premium fonts
  mainHeading: {
    fontSize: 24, // Reduced from 28
    fontWeight: '300',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.6, // Reduced from -0.8
    lineHeight: 30, // Reduced from 36
    marginBottom: 24, // Reduced from 32
    marginTop: -16, // Negative margin to bring closer to Lottie
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
    paddingBottom: 48, // Increased for better keyboard clearance
    paddingTop: 16,
  },

  // Chat-style input container - Enhanced with vibrant colors
  inputContainer: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
    shadowColor: theme.colors.accentVibrant,    // Vibrant shadow color
    shadowOffset: { width: 0, height: 4 },      // Stronger shadow
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start' for better expansion
    paddingTop: 16, // Ensure proper top padding
  },

  inputContainerFocused: {
    borderColor: theme.colors.accentVibrant,     // Use vibrant cyan/blue
    shadowColor: theme.colors.accentVibrant,
    shadowOpacity: 0.2,                         // More pronounced shadow
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,                             // Thicker border when focused
  },

  // Text input - Fixed contrast issues and improved expansion
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.inputText,
    fontWeight: '400',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 24,
    maxHeight: 120, // Limit expansion to 5 lines approximately
    textAlignVertical: 'top',
  },

  placeholder: {
    color: theme.colors.textTertiary,
  },

  // Action buttons - Improved alignment for expanding text
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    alignSelf: 'center', // Center align with the input container
  },

  sendButton: {
    backgroundColor: theme.colors.accentVibrant, // Use vibrant cyan/blue
    shadowColor: theme.colors.accentVibrant,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
    paddingTop: 10, // Reduced padding when keyboard is visible
    paddingBottom: 16, // Reduced bottom padding
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    marginTop: 24,
    height: 80, // Much reduced height for tighter spacing
  },

  exampleRow: {
    height: 38, // Much shorter rows
    marginBottom: 2, // Minimal space between rows
  },

  exampleRowContent: {
    alignItems: 'center',
    paddingRight: 40, // Reduced padding for seamless scrolling
    paddingLeft: 8, // Reduced left padding
  },

  examplePill: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 20, // More rounded
    paddingHorizontal: 14, // Reduced horizontal padding
    paddingVertical: 8, // Reduced vertical padding
    marginRight: 12, // Less space between pills
    borderWidth: 1,
    borderColor: theme.colors.accentSoft,          // Purple border for elegance
    shadowColor: theme.colors.accentSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 60, // Reduced minimum width
  },

  examplePillSelected: {
    backgroundColor: theme.colors.accentVibrant,   // Vibrant cyan when selected
    borderColor: theme.colors.accent,             // Gold border when selected
    shadowColor: theme.colors.accentVibrant,
    shadowOpacity: theme.name === 'dark' ? 0.4 : 0.3,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }], // Slight scale for selected state
    borderWidth: 2,
  },

  examplePillText: {
    fontSize: 11, // Even smaller text for pills
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  examplePillTextSelected: {
    color: theme.name === 'dark' ? '#0F172A' : '#FFFFFF', // Ensure contrast
    fontWeight: '600',
  },

  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 8,
    margin: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },

  activeTab: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.accentVibrant,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },

  activeTabText: {
    color: theme.colors.accentVibrant,
    fontWeight: '600',
  },

  // Compact header navigation styles
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },

  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // Remove background, shadow and elevation for seamless integration
    // Ensure perfect centering
    display: 'flex',
    flexDirection: 'row',
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: '500', // Changed from 700 to 500 for Material Design 3
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactTabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  compactTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    minWidth: 80,
  },

  activeCompactTab: {
    backgroundColor: theme.colors.accentVibrant,
    shadowColor: theme.colors.accentVibrant,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  compactTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },

  activeCompactTabText: {
    color: theme.name === 'dark' ? '#0F172A' : '#FFFFFF',
    fontWeight: '600',
  },
});