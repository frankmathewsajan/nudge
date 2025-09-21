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

interface FormOnboardingProps {
  onComplete: (userName: string) => void;
}

export const FormOnboarding: React.FC<FormOnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  
  const insets = useSafeAreaInsets();

  const isFormValid = () => {
    return name.trim().length > 0 && isAgeConfirmed;
  };

  const handleContinue = () => {
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
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
            <Text style={styles.headerTitle}>Hello, I'm Nudge.</Text>
            <Text style={styles.headerSubtitle}>
              I'm a next generation AI assistant built for work and trained to be safe, accurate, and secure.
            </Text>
            <Text style={styles.headerDescription}>
              I'd love for us to get to know each other a bit better.
            </Text>
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
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  textContentType="name"
                />
              </View>
            </View>

            {/* Display user message if name is entered */}
            {name.trim().length > 0 && (
              <View style={styles.userMessageContainer}>
                <Text style={styles.welcomeMessage}>Lovely to meet you, {name.trim()}.</Text>
              </View>
            )}
          </View>

          {/* Requirements Section */}
          {name.trim().length > 0 && (
            <View style={styles.requirementsSection}>
              <Text style={styles.requirementsTitle}>
                A few things to know before we start working together:
              </Text>

              {/* Age Confirmation */}
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
                  I confirm that I am at least 18 years of age
                </Text>
              </TouchableOpacity>

              {/* Policy Section */}
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

              {/* Policy Acknowledgment */}
              <TouchableOpacity
                style={[styles.policyButton, isFormValid() && styles.policyButtonActive]}
                onPress={handleContinue}
                disabled={!isFormValid()}
                accessibilityRole="button"
              >
                <Text style={[styles.policyButtonText, isFormValid() && styles.policyButtonTextActive]}>
                  Acknowledge & Continue
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.disclaimerText}>
                You can always change your name later
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};