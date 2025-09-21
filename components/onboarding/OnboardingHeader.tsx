/**
 * OnboardingHeader - Animation step rendering
 * 
 * Handles sequential text animations for onboarding introduction.
 * Separated for better maintainability and single responsibility.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { OnboardingStep } from '../../hooks/onboarding/useOnboardingAnimationController';
import { TypingText } from '../ui/TypingText';

interface OnboardingHeaderProps {
  currentStep: OnboardingStep;
  animationHandlers: any;
  styles: any;
}

/**
 * Renders sequential introduction animations based on current step.
 * 
 * Each step shows appropriate animation while preserving previous text.
 * Clean separation allows easy testing and modification of animation flow.
 */
export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  currentStep,
  animationHandlers,
  styles
}) => {
  const renderCurrentAnimation = () => {
    switch (currentStep) {
      case OnboardingStep.TITLE:
        return (
          <TypingText 
            text="Hello, I'm Nudge."
            style={styles.headerTitle}
            speed={150}
            showCursor={true}
            onComplete={animationHandlers.advanceToSubtitle}
          />
        );
      
      case OnboardingStep.SUBTITLE:
        return (
          <>
            <Text style={styles.headerTitle}>Hello, I'm Nudge.</Text>
            <TypingText 
              text="I'm a next generation AI app to help you track your day, schedule tasks and make sure the work you do aligns with your goals."
              style={styles.headerSubtitle}
              speed={100}
              delay={300}
              showCursor={true}
              onComplete={animationHandlers.advanceToDescription}
            />
          </>
        );
      
      case OnboardingStep.DESCRIPTION:
        return (
          <>
            <Text style={styles.headerTitle}>Hello, I'm Nudge.</Text>
            <Text style={styles.headerSubtitle}>
              I'm a next generation AI app to help you track your day, schedule tasks and make sure the work you do aligns with your goals.
            </Text>
            <TypingText 
              text="I'd love for us to get to know each other a bit better."
              style={styles.headerDescription}
              speed={120}
              delay={200}
              showCursor={true}
              onComplete={animationHandlers.advanceToInputForm}
            />
          </>
        );
      
      default:
        return (
          <>
            <Text style={styles.headerTitle}>Hello, I'm Nudge.</Text>
            <Text style={styles.headerSubtitle}>
              I'm a next generation AI app to help you track your day, schedule tasks and make sure the work you do aligns with your goals.
            </Text>
            <Text style={styles.headerDescription}>
              I'd love for us to get to know each other a bit better.
            </Text>
          </>
        );
    }
  };

  return (
    <View style={styles.headerContainer}>
      {renderCurrentAnimation()}
    </View>
  );
};