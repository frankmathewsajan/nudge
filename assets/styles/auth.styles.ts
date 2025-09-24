/**
 * Authentication Screen Styles
 * 
 * Matches onboarding aesthetic with clean, minimal design
 */

import { StyleSheet } from 'react-native';

export const createAuthStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },

  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitleContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },

  authSection: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },

  authPrompt: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#4285F4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  googleButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },

  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },

  privacyText: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
    maxWidth: 280,
  },

  footer: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },

  footerText: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.textSecondary,
    textAlign: 'center',
  },

  // Animation states
  fadeIn: {
    opacity: 1,
  },

  fadeOut: {
    opacity: 0,
  },
});