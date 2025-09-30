/**
 * OnboardingPolicy - Policy acknowledgment section
 * 
 * Handles requirements and policy display with final submission.
 * Separated for focused responsibility and compliance clarity.
 */

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { OnboardingStep } from '../../hooks/onboarding/useOnboardingAnimationController';
import { TypingText } from '../ui/TypingText.component';

interface OnboardingPolicyProps {
  currentStep: OnboardingStep;
  showWelcomeMessage: boolean;
  showPolicySection: boolean;
  formState: any;
  animationHandlers: any;
  formHandlers: any;
  theme: any;
  styles: any;
}

/**
 * Policy and requirements section with animated introduction.
 * 
 * Shows requirements introduction followed by policy items
 * and final acknowledgment button for completion.
 */
export const OnboardingPolicy: React.FC<OnboardingPolicyProps> = ({
  currentStep,
  showWelcomeMessage,
  showPolicySection,
  formState,
  animationHandlers,
  formHandlers,
  theme,
  styles
}) => {
  // Welcome message section
  const renderWelcomeMessage = () => {
    if (!showWelcomeMessage) return null;

    return (
      <View style={styles.userMessageContainer}>
        <TypingText 
          text={`Lovely to meet you, ${formState.name.trim()}.`}
          style={styles.welcomeMessage}
          speed={120}
          showCursor={true}
          onComplete={animationHandlers.advanceToRequirements}
        />
      </View>
    );
  };

  // Requirements and policy section
  const renderRequirementsSection = () => {
    if (!showWelcomeMessage || currentStep < OnboardingStep.REQUIREMENTS) {
      return null;
    }

    return (
      <View style={styles.requirementsSection}>
        <TypingText 
          text="A few things to know before we get started:"
          style={styles.requirementsTitle}
          speed={120}
          delay={400}
          showCursor={true}
          onComplete={animationHandlers.showPolicySection}
        />

        {showPolicySection && (
          <>
            <View style={styles.policyItem}>
              <View style={styles.policyIcon}>
                <MaterialIcons name="pan-tool" size={24} color={theme.colors.accent} />
              </View>
              <View style={styles.policyContent}>
                <Text style={styles.policyText}>
                  Nudge's <Text style={styles.policyLink}>Acceptable Use Policy</Text> prohibits using Nudge for harm, like producing violent, abusive, or deceptive content.
                </Text>
              </View>
            </View>

            <View style={styles.policyItem}>
              <View style={styles.policyIcon}>
                <MaterialIcons name="security" size={24} color={theme.colors.accent} />
              </View>
              <View style={styles.policyContent}>
                <Text style={styles.policyText}>
                  Nudge regularly reviews conversations flagged by our automated abuse detection, and may use them to improve our safety systems.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.policyButton, styles.policyButtonActive]}
              onPress={formHandlers.handleFinalSubmit}
            >
              <Text style={[styles.policyButtonText, styles.policyButtonTextActive]}>
                Acknowledge & Continue
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <>
      {renderWelcomeMessage()}
      {renderRequirementsSection()}
    </>
  );
};