// Form Onboarding Styles - Midnight blue to silver with animated background
// Memory layers, time passing, and focus aesthetic

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Midnight blue base
    position: 'relative',
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
  
  // Hexagonal grid overlay
  hexagonalGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  
  // Concentric orbits
  orbitContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 800,
    height: 800,
    marginTop: -400,
    marginLeft: -400,
    zIndex: 1,
  },
  
  orbit1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: '#475569',
    opacity: 0.1,
    top: 250,
    left: 250,
  },
  
  orbit2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    borderWidth: 1,
    borderColor: '#64748B',
    opacity: 0.08,
    top: 150,
    left: 150,
  },
  
  orbit3: {
    position: 'absolute',
    width: 700,
    height: 700,
    borderRadius: 350,
    borderWidth: 1,
    borderColor: '#94A3B8',
    opacity: 0.05,
    top: 50,
    left: 50,
  },
  
  // Ripple effects
  ripple1: {
    position: 'absolute',
    top: 120,
    right: 60,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#F59E0B',
    opacity: 0.1,
  },
  
  ripple2: {
    position: 'absolute',
    bottom: 200,
    left: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#EAB308',
    opacity: 0.15,
  },
  
  // Spiral accent
  spiralAccent: {
    position: 'absolute',
    top: 300,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F59E0B',
    opacity: 0.08,
  },
  
  keyboardContainer: {
    flex: 1,
    zIndex: 2,
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    zIndex: 2,
  },

  // Header Section with gradient text effect
  headerContainer: {
    marginBottom: 40,
    zIndex: 3,
  },
  
  headerTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: '#F8FAFC', // Light silver-white
    marginBottom: 24,
    letterSpacing: -0.5,
    textShadowColor: '#F59E0B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#CBD5E1', // Medium silver
    marginBottom: 16,
  },
  
  headerDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#94A3B8', // Lighter silver
  },

  // Input Section (hidden initially)
  inputSection: {
    marginBottom: 32,
    zIndex: 3,
  },
  
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B', // Dark slate with transparency
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  avatarContainer: {
    marginRight: 16,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569', // Medium slate
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B', // Gold accent border
  },
  
  avatarText: {
    color: '#F8FAFC', // Light silver
    fontSize: 16,
    fontWeight: '600',
  },
  
  inputWrapper: {
    flex: 1,
  },
  
  inputLabel: {
    fontSize: 14,
    color: '#94A3B8', // Silver
    marginBottom: 4,
  },
  
  nameInput: {
    fontSize: 16,
    color: '#F8FAFC', // Light silver
    paddingVertical: 0,
    minHeight: 24,
  },
  
  userMessageContainer: {
    marginBottom: 16,
  },
  
  welcomeMessage: {
    fontSize: 16,
    color: '#CBD5E1', // Medium silver
    marginBottom: 16,
  },

  // Requirements Section
  requirementsSection: {
    marginBottom: 32,
  },
  
  requirementsTitle: {
    fontSize: 16,
    color: '#F8FAFC', // Light silver
    marginBottom: 24,
    fontWeight: '500',
  },
  
  // Age Confirmation
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748B', // Medium slate
    backgroundColor: 'transparent',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkboxChecked: {
    backgroundColor: '#F59E0B', // Gold
    borderColor: '#F59E0B',
  },
  
  checkmark: {
    color: '#0F172A', // Dark for contrast
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#CBD5E1', // Medium silver
    lineHeight: 20,
  },

  // Policy Section
  policySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 4,
  },
  
  policyIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  policyIconText: {
    fontSize: 16,
  },
  
  policyContent: {
    flex: 1,
  },
  
  policyText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#94A3B8', // Silver
  },
  
  policyLink: {
    color: '#F59E0B', // Gold accent
    textDecorationLine: 'underline',
  },
  
  policyButton: {
    backgroundColor: '#334155', // Dark slate
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64748B',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  policyButtonActive: {
    backgroundColor: '#F59E0B', // Gold
    borderColor: '#EAB308',
    shadowColor: '#F59E0B',
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
    color: '#CBD5E1', // Medium silver
  },
  
  policyButtonTextActive: {
    color: '#0F172A', // Dark text on gold background
  },

  // Continue Section
  continueSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  
  continueButton: {
    backgroundColor: '#334155', // Dark slate
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64748B',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  continueButtonActive: {
    backgroundColor: '#F59E0B', // Gold
    borderColor: '#EAB308',
    shadowColor: '#F59E0B',
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
    color: '#CBD5E1', // Medium silver
  },
  
  continueButtonTextActive: {
    color: '#0F172A', // Dark text on gold background
  },
  
  disclaimerText: {
    fontSize: 13,
    color: '#94A3B8', // Light silver
    textAlign: 'center',
    marginTop: 12,
  },
});