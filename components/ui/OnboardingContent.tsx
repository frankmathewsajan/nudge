/**
 * OnboardingContent - Main content orchestrator
 * 
 * Simplified container that delegates to specialized components.
 * Clean architecture with single responsibility per component.
 */

import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { OnboardingForm } from './OnboardingForm';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingPolicy } from './OnboardingPolicy';

interface OnboardingContentProps {
  animationState: any;
  animationHandlers: any;
  formState: any;
  formValidation: any;
  formHandlers: any;
  theme: any;
  styles: any;
  insets: any;
}

/**
 * Content orchestrator with clean delegation pattern.
 * 
 * Responsibilities:
 * - Layout management (scroll, keyboard avoidance)
 * - Delegation to specialized components
 * - Prop passing coordination
 */
export const OnboardingContent: React.FC<OnboardingContentProps> = ({
  animationState,
  animationHandlers,
  formState,
  formValidation,
  formHandlers,
  theme,
  styles,
  insets
}) => {
  const { currentStep, showWelcomeMessage, showPolicySection, isInputDisabled } = animationState;

  return (
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
        <OnboardingHeader 
          currentStep={currentStep}
          animationHandlers={animationHandlers}
          styles={styles}
        />

        <OnboardingForm 
          currentStep={currentStep}
          formState={formState}
          formValidation={formValidation}
          formHandlers={formHandlers}
          isInputDisabled={isInputDisabled}
          showWelcomeMessage={showWelcomeMessage}
          theme={theme}
          styles={styles}
        />

        <OnboardingPolicy 
          currentStep={currentStep}
          showWelcomeMessage={showWelcomeMessage}
          showPolicySection={showPolicySection}
          formState={formState}
          animationHandlers={animationHandlers}
          formHandlers={formHandlers}
          theme={theme}
          styles={styles}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};