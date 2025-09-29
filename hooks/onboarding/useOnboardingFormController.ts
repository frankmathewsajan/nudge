/**
 * OnboardingFormState
 * 
 * Manages form validation and user input state.
 * Separated from animation logic for better testability and maintainability.
 */

import { useCallback, useState } from 'react';

interface FormState {
  name: string;
  isAgeConfirmed: boolean;
}

interface FormValidation {
  isValid: boolean;
  hasNameInput: boolean;
}

interface OnboardingFormController {
  formState: FormState;
  validation: FormValidation;
  handlers: {
    updateName: (name: string) => void;
    toggleAgeConfirmation: () => void;
    handleFormSubmit: () => void;
    handleFinalSubmit: () => void;
  };
}

/**
 * Hook for managing onboarding form state and validation.
 * 
 * Provides clean separation between form logic and UI rendering.
 * All validation logic is centralized here for easier testing.
 */
export const useOnboardingFormController = (
  onFormSubmit: () => void,
  onFinalComplete: (userName: string) => void
): OnboardingFormController => {
  const [name, setName] = useState('');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);

  // Validation logic centralized
  const isValid = name.trim().length > 0 && isAgeConfirmed;
  const hasNameInput = name.trim().length > 0;

  const updateName = useCallback((newName: string) => {
    setName(newName);
  }, []);

  const toggleAgeConfirmation = useCallback(() => {
    setIsAgeConfirmed(prev => !prev);
  }, []);

  const handleFormSubmit = useCallback(() => {
    if (isValid) {
      onFormSubmit();
    }
  }, [isValid, onFormSubmit]);

  const handleFinalSubmit = useCallback(() => {
    console.log('Final submit called, isValid:', isValid, 'name:', name.trim());
    if (isValid) {
      console.log('Calling onFinalComplete with name:', name.trim());
      onFinalComplete(name.trim());
    } else {
      console.log('Form not valid for final submit');
    }
  }, [isValid, name, onFinalComplete]);

  return {
    formState: { name, isAgeConfirmed },
    validation: { isValid, hasNameInput },
    handlers: {
      updateName,
      toggleAgeConfirmation,
      handleFormSubmit,
      handleFinalSubmit
    }
  };
};