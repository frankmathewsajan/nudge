/**
 * FormOnboarding - Refactored with Clean Architecture
 * 
 * Single Responsibility: Orchestrates onboarding flow with separated concerns.
 * All business logic extracted to custom hooks for better maintainability.
 */

import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createOnboardingStyles } from '../../assets/styles/onboarding.styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnboardingAnimationController } from '../../hooks/onboarding/useOnboardingAnimationController';
import { useOnboardingFormController } from '../../hooks/onboarding/useOnboardingFormController';
import AnimatedBackground from '../ui/AnimatedBackground.component';
import { ThemeToggle } from '../ui/ThemeToggle.component';
import { OnboardingContent } from './OnboardingContent.component';

interface FormOnboardingProps {
  onComplete: (userName: string) => void;
}

/**
 * Main onboarding orchestrator following clean architecture principles.
 * 
 * Responsibilities:
 * - Theme management and UI setup
 * - Coordination between animation and form controllers
 * - Delegation of content rendering to OnboardingContent
 */
export const FormOnboarding: React.FC<FormOnboardingProps> = ({ onComplete }) => {
  const { theme, toggleTheme } = useTheme();
  const styles = createOnboardingStyles(theme);
  const insets = useSafeAreaInsets();

  // Separated business logic via specialized hooks
  const animationController = useOnboardingAnimationController();
  const formController = useOnboardingFormController(
    animationController.handlers.triggerWelcomeFlow,
    onComplete
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      
      <ThemeToggle onToggle={toggleTheme} theme={theme} safeAreaTop={insets.top} />
      <AnimatedBackground intensity="moderate" />
      
      <OnboardingContent 
        animationState={animationController.state}
        animationHandlers={animationController.handlers}
        formState={formController.formState}
        formValidation={formController.validation}
        formHandlers={formController.handlers}
        theme={theme}
        styles={styles}
        insets={insets}
      />
    </SafeAreaView>
  );
};