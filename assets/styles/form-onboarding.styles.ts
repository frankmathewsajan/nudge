// Form Onboarding Styles - Claude-inspired minimal design
// Clean typography, proper spacing, and safe area handling

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  keyboardContainer: {
    flex: 1,
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
  },

  // Header Section
  headerContainer: {
    marginBottom: 40,
  },
  
  headerTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 16,
  },
  
  headerDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },

  // Input Section
  inputSection: {
    marginBottom: 32,
  },
  
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  
  avatarContainer: {
    marginRight: 16,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  inputWrapper: {
    flex: 1,
  },
  
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  
  nameInput: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
    minHeight: 24,
  },
  
  userMessageContainer: {
    marginBottom: 16,
  },
  
  welcomeMessage: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },

  // Requirements Section
  requirementsSection: {
    marginBottom: 32,
  },
  
  requirementsTitle: {
    fontSize: 16,
    color: '#111827',
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
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkboxChecked: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
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
    color: '#374151',
  },
  
  policyLink: {
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  
  policyButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    alignItems: 'center',
  },
  
  policyButtonActive: {
    backgroundColor: '#111827',
  },
  
  policyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  
  policyButtonTextActive: {
    color: '#FFFFFF',
  },

  // Continue Section
  continueSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  
  continueButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  
  continueButtonActive: {
    backgroundColor: '#111827',
  },
  
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  
  disclaimerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
});