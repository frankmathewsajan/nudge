// Onboarding Styles - Theme-aware styling
// Uses theme context to provide light/dark theme support

import { Theme } from '@/contexts/ThemeContext';
import { StyleSheet } from 'react-native';

export const createOnboardingStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  
  // Theme Toggle Button
  themeToggleContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  
  themeToggleButton: {
    backgroundColor: theme.colors.buttonBackground,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  themeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  
  // Animated background layer
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  
  // Keyboard handling
  keyboardContainer: {
    flex: 1,
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  
  contentContainer: {
    flexGrow: 1, // Use flexGrow instead of flex for proper scrolling
    justifyContent: 'flex-start', // Start from top instead of center
    paddingTop: 80, // Add some top padding for spacing
    paddingBottom: 40, // Add bottom padding for scrolling
    zIndex: 2,
  },
  
  // Header Section with theme-aware text - fixed positioning
  headerContainer: {
    marginBottom: 24, // Reduced from 40 to 24
    zIndex: 3,
  },
  
  headerTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 16, // Reduced from 24 to 16
    letterSpacing: -0.5,
    // Remove text shadow in light mode, keep subtle in dark mode
    textShadowColor: theme.name === 'light' ? 'transparent' : theme.colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: theme.name === 'light' ? 0 : 4, // Reduced radius
  },
  
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 20, // Reduced from 24 to 20 for tighter spacing
    color: theme.colors.textSecondary,
    marginBottom: 10, // Consistent spacing
  },
  
  headerDescription: {
    fontSize: 16,
    lineHeight: 20, // Reduced from 24 to 20 for tighter spacing
    color: theme.colors.textSecondary,
    marginBottom: 12, // Small bottom margin
  },
  
  // Input Section
  inputSection: {
    marginTop: 20, // Reduced from 40 to 20
    zIndex: 3,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  
  nameInput: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: theme.colors.inputText,
    marginBottom: 20,
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  nameInputFocused: {
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  
  nameInputDisabled: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderColor: theme.colors.textTertiary,
    color: theme.colors.textTertiary,
  },
  
  // Age Confirmation Section
  ageSection: {
    marginTop: 24,
  },
  
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.inputBackground,
  },
  
  checkboxChecked: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  
  checkboxText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // Form elements styles
  checkmark: {
    color: theme.colors.buttonActiveText,
    fontSize: 12,
    fontWeight: 'bold',
  },

  policyIconText: {
    fontSize: 20,
    textAlign: 'center',
  },

  policyContent: {
    flex: 1,
  },

  policyLink: {
    color: theme.colors.accent,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  
  // Welcome Section
  welcomeSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  
  userMessageContainer: {
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  
  welcomeMessage: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    textAlign: 'left', // Left align instead of center
    fontWeight: '500',
  },
  
  // Requirements Section
  requirementsSection: {
    marginTop: 30,
  },
  
  requirementsTitle: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: 20,
    fontWeight: '500',
  },
  
  // Policy Section
  policySection: {
    marginTop: 20,
  },
  
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  
  policyIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  
  policyText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  
  policyButton: {
    backgroundColor: theme.colors.buttonBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  policyButtonActive: {
    backgroundColor: theme.colors.buttonActiveBackground,
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  policyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.buttonText,
  },
  
  policyButtonTextActive: {
    color: theme.colors.buttonActiveText,
  },

  // Continue Section
  continueSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  
  continueButton: {
    backgroundColor: theme.colors.buttonBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  continueButtonActive: {
    backgroundColor: theme.colors.buttonActiveBackground,
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.buttonText,
  },
  
  continueButtonTextActive: {
    color: theme.colors.buttonActiveText,
  },
  
  disclaimerText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 12,
  },
});