// Form Onboarding - Nudge-style minimal form interface
// Clean introduction form with name, age confirmation, and policy acknowledgment

import styles from '@/assets/styles/form-onboarding.styles';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TypingText } from './TypingText';
import AnimatedBackground from './AnimatedBackground';

interface FormOnboardingProps {
  onComplete: (userName: string) => void;
}

export const FormOnboarding: React.FC<FormOnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [showAgeConfirmation, setShowAgeConfirmation] = useState(false);
  const [showNameContinue, setShowNameContinue] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showPolicySection, setShowPolicySection] = useState(false);
  const [headerTypingComplete, setHeaderTypingComplete] = useState(false);
  const [subtitleTypingComplete, setSubtitleTypingComplete] = useState(false);
  const [descriptionTypingComplete, setDescriptionTypingComplete] = useState(false);
  const [welcomeTypingComplete, setWelcomeTypingComplete] = useState(false);
  
  const insets = useSafeAreaInsets();

  const isFormValid = () => {
    return name.trim().length > 0 && isAgeConfirmed;
  };

  const handleNameFocus = () => {
    if (name.trim().length > 0) {
      setShowAgeConfirmation(true);
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (text.trim().length > 0) {
      setShowAgeConfirmation(true);
      setShowNameContinue(true);
    } else {
      setShowAgeConfirmation(false);
      setShowNameContinue(false);
    }
  };

  const handleFirstContinue = () => {
    if (name.trim().length > 0 && isAgeConfirmed) {
      setShowNameContinue(false);
      setShowAgeConfirmation(false); // Hide age confirmation
      setShowWelcomeMessage(true);
    }
  };

  const handleFinalContinue = () => {
    if (name.trim().length > 0 && isAgeConfirmed) {
      setIsPolicyAccepted(true);
      onComplete(name.trim());
    }
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + (names[names.length - 1].charAt(0) || '')).toUpperCase();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Animated Background */}
      <AnimatedBackground intensity="moderate" />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <TypingText 
              text="Hello, I'm Nudge."
              style={styles.headerTitle}
              speed={80}
              showCursor={true}
              onComplete={() => setHeaderTypingComplete(true)}
            />
            {headerTypingComplete && (
              <TypingText 
                text="I'm a next generation AI app to help you track your day, schedule tasks and make sure the work you do aligns with your goals."
                style={styles.headerSubtitle}
                speed={35}
                delay={500}
                showCursor={true}
                onComplete={() => setSubtitleTypingComplete(true)}
              />
            )}
            {headerTypingComplete && subtitleTypingComplete && (
              <TypingText 
                text="I'd love for us to get to know each other a bit better."
                style={styles.headerDescription}
                speed={40}
                delay={300}
                showCursor={true}
                onComplete={() => setDescriptionTypingComplete(true)}
              />
            )}
          </View>

          {/* Name Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.nameInputContainer}>
              {name.trim().length > 0 && (
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(name)}</Text>
                  </View>
                </View>
              )}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Nice to meet you, I'm...</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={handleNameChange}
                  onFocus={handleNameFocus}
                  autoCapitalize="words"
                  autoCorrect={false}
                  textContentType="name"
                />
              </View>
            </View>

            {/* Age Confirmation - Shows after name input focus */}
            {showAgeConfirmation && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsAgeConfirmed(!isAgeConfirmed)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isAgeConfirmed }}
              >
                <View style={[styles.checkbox, isAgeConfirmed && styles.checkboxChecked]}>
                  {isAgeConfirmed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I confirm that I am at least 13 years of age
                </Text>
              </TouchableOpacity>
            )}

            {/* First Continue Button */}
            {showNameContinue && isFormValid() && (
              <View style={styles.continueSection}>
                <TouchableOpacity
                  style={[styles.continueButton, styles.continueButtonActive]}
                  onPress={handleFirstContinue}
                  accessibilityRole="button"
                >
                  <Text style={[styles.continueButtonText, styles.continueButtonTextActive]}>
                    Continue
                  </Text>
                </TouchableOpacity>
                <Text style={styles.disclaimerText}>
                  You can always change your name later
                </Text>
              </View>
            )}

            {/* Welcome Message - Shows after first continue */}
            {showWelcomeMessage && (
              <View style={styles.userMessageContainer}>
                <TypingText 
                  text={`Lovely to meet you, ${name.trim()}.`}
                  style={styles.welcomeMessage}
                  speed={45}
                  showCursor={true}
                  onComplete={() => setWelcomeTypingComplete(true)}
                />
              </View>
            )}
          </View>

          {/* Requirements Section - Shows after welcome message typing completes */}
          {showWelcomeMessage && welcomeTypingComplete && (
            <View style={styles.requirementsSection}>
              <TypingText 
                text="A few things to know before we get started:"
                style={styles.requirementsTitle}
                speed={35}
                delay={500}
                showCursor={true}
                onComplete={() => setShowPolicySection(true)}
              />

              {/* Policy Section */}
              {showPolicySection && (
                <>
                  <View style={styles.policySection}>
                    <View style={styles.policyIcon}>
                      <Text style={styles.policyIconText}>✋</Text>
                    </View>
                    <View style={styles.policyContent}>
                      <Text style={styles.policyText}>
                        Nudge's{' '}
                        <Text style={styles.policyLink}>Acceptable Use Policy</Text>
                        {' '}prohibits using Nudge for harm, like producing violent, abusive, or deceptive content.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.policySection}>
                    <View style={styles.policyIcon}>
                      <Text style={styles.policyIconText}>🛡️</Text>
                    </View>
                    <View style={styles.policyContent}>
                      <Text style={styles.policyText}>
                        Nudge regularly reviews conversations flagged by our automated abuse detection, and may use them to improve our safety systems.
                      </Text>
                    </View>
                  </View>

                  {/* Final Policy Acknowledgment */}
                  <TouchableOpacity
                    style={[styles.policyButton, styles.policyButtonActive]}
                    onPress={handleFinalContinue}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.policyButtonText, styles.policyButtonTextActive]}>
                      Acknowledge & Continue
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};