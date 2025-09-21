/**
 * OnboardingAnimationController
 * 
 * Manages the sequential animation flow for onboarding steps.
 * Separated from UI rendering to follow Single Responsibility Principle.
 * 
 * Critical: This controller ensures deterministic animation sequencing
 * without UI re-render dependencies that could cause infinite loops.
 */

import { useCallback, useState } from 'react';

export enum OnboardingStep {
  TITLE = 0,
  SUBTITLE = 1,
  DESCRIPTION = 2,
  INPUT_FORM = 3,
  WELCOME_MESSAGE = 4,
  REQUIREMENTS = 5,
  POLICY_ACKNOWLEDGMENT = 6
}

interface OnboardingState {
  currentStep: OnboardingStep;
  showWelcomeMessage: boolean;
  showPolicySection: boolean;
  isInputDisabled: boolean;
}

interface OnboardingAnimationController {
  state: OnboardingState;
  handlers: {
    advanceToSubtitle: () => void;
    advanceToDescription: () => void;
    advanceToInputForm: () => void;
    triggerWelcomeFlow: () => void;
    advanceToRequirements: () => void;
    showPolicySection: () => void;
  };
}

/**
 * Custom hook for managing onboarding animation flow.
 * 
 * Returns stable handlers via useCallback to prevent re-render cascades.
 * Each handler advances the animation to the next logical step.
 */
export const useOnboardingAnimationController = (): OnboardingAnimationController => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.TITLE);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showPolicySection, setShowPolicySection] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  // Critical: All handlers use useCallback with empty deps for reference stability
  const advanceToSubtitle = useCallback(() => {
    setCurrentStep(OnboardingStep.SUBTITLE);
  }, []);

  const advanceToDescription = useCallback(() => {
    setCurrentStep(OnboardingStep.DESCRIPTION);
  }, []);

  const advanceToInputForm = useCallback(() => {
    setCurrentStep(OnboardingStep.INPUT_FORM);
  }, []);

  const triggerWelcomeFlow = useCallback(() => {
    setCurrentStep(OnboardingStep.WELCOME_MESSAGE);
    setShowWelcomeMessage(true);
    setIsInputDisabled(true); // Prevent input during welcome animation
  }, []);

  const advanceToRequirements = useCallback(() => {
    setCurrentStep(OnboardingStep.REQUIREMENTS);
    setIsInputDisabled(false); // Re-enable input after welcome
  }, []);

  const showPolicyAcknowledgment = useCallback(() => {
    setShowPolicySection(true);
  }, []);

  return {
    state: {
      currentStep,
      showWelcomeMessage,
      showPolicySection,
      isInputDisabled
    },
    handlers: {
      advanceToSubtitle,
      advanceToDescription,
      advanceToInputForm,
      triggerWelcomeFlow,
      advanceToRequirements,
      showPolicySection: showPolicyAcknowledgment
    }
  };
};