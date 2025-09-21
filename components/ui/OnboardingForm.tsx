/**
 * OnboardingForm - Input form section
 * 
 * Handles name input and age confirmation with clean validation.
 * Separated for focused responsibility and easier testing.
 */

import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OnboardingStep } from '../../hooks/useOnboardingAnimationController';

interface OnboardingFormProps {
  currentStep: OnboardingStep;
  formState: any;
  formValidation: any;
  formHandlers: any;
  isInputDisabled: boolean;
  showWelcomeMessage: boolean;
  theme: any;
  styles: any;
}

/**
 * Form input component with integrated validation display.
 * 
 * Shows input field, age confirmation, and continue button
 * based on form state and validation results.
 */
export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  currentStep,
  formState,
  formValidation,
  formHandlers,
  isInputDisabled,
  showWelcomeMessage,
  theme,
  styles
}) => {
  if (currentStep < OnboardingStep.INPUT_FORM) {
    return null;
  }

  return (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Nice to meet you, I'm...</Text>
      <TextInput
        style={[styles.nameInput, isInputDisabled && styles.nameInputDisabled]}
        placeholder="Enter your full name"
        placeholderTextColor={theme.colors.textTertiary}
        value={formState.name}
        onChangeText={formHandlers.updateName}
        autoCapitalize="words"
        autoCorrect={false}
        textContentType="name"
        editable={!isInputDisabled}
      />

      {/* Age Confirmation - Show when name entered but welcome not shown */}
      {formValidation.hasNameInput && !showWelcomeMessage && (
        <>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={formHandlers.toggleAgeConfirmation}
          >
            <View style={[styles.checkbox, formState.isAgeConfirmed && styles.checkboxChecked]}>
              {formState.isAgeConfirmed && (
                <Text style={{color: theme.colors.buttonActiveText, fontSize: 12, fontWeight: 'bold'}}>
                  ✓
                </Text>
              )}
            </View>
            <Text style={styles.checkboxText}>
              I confirm that I am at least 13 years of age
            </Text>
          </TouchableOpacity>

          {/* Continue Button - Show when age confirmed */}
          {formState.isAgeConfirmed && (
            <View style={styles.continueSection}>
              <TouchableOpacity
                style={[styles.continueButton, formValidation.isValid && styles.continueButtonActive]}
                onPress={formHandlers.handleFormSubmit}
                disabled={!formValidation.isValid}
              >
                <Text style={[styles.continueButtonText, formValidation.isValid && styles.continueButtonTextActive]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};