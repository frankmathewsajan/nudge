/**
 * AuthFlow - Authentication and Onboarding Flow Controller
 * 
 * Handles the complete authentication flow:
 * - Login -> Check onboarding -> Redirect appropriately
 * - Register -> Email verification -> Onboarding -> Main app
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import authService, { AuthUser } from '../../services/authService';
import { AuthScreen } from './AuthScreen';
import { EmailVerificationScreen } from './EmailVerificationScreen';

export type AuthFlowState = 
  | 'loading'           // Checking initial auth state
  | 'unauthenticated'   // Need to login/register
  | 'email-verification' // Waiting for email verification
  | 'onboarding'        // Need to complete onboarding  
  | 'authenticated';    // Fully authenticated and onboarded

interface AuthFlowProps {
  onAuthComplete: (user: AuthUser) => void;
  onNeedsOnboarding: (user: AuthUser) => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({
  onAuthComplete,
  onNeedsOnboarding,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [flowState, setFlowState] = useState<AuthFlowState>('loading');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Check initial authentication state
  useEffect(() => {
    checkInitialAuthState();

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        await handleAuthenticatedUser(user);
      } else {
        setFlowState('unauthenticated');
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const checkInitialAuthState = async () => {
    try {
      console.log('🔍 Checking initial auth state...');
      
      // Check for persisted user
      const persistedUser = await authService.handleAuthPersistence();
      if (persistedUser) {
        await handleAuthenticatedUser(persistedUser);
      } else {
        // Check current user
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          await handleAuthenticatedUser(currentUser);
        } else {
          setFlowState('unauthenticated');
        }
      }
    } catch (error) {
      console.error('❌ Error checking initial auth state:', error);
      setFlowState('unauthenticated');
    }
  };

  const handleAuthenticatedUser = async (user: AuthUser) => {
    try {
      setCurrentUser(user);
      
      // Check if email is verified (for new registrations)
      if (!user.isEmailVerified) {
        console.log('📧 Email not verified, showing verification screen');
        setFlowState('email-verification');
        return;
      }

      // Check if onboarding is completed
      const onboardingCompleted = await authService.checkOnboardingStatus();
      
      if (onboardingCompleted) {
        console.log('✅ User is fully authenticated and onboarded');
        setFlowState('authenticated');
        onAuthComplete(user);
      } else {
        console.log('📝 User needs to complete onboarding');
        setFlowState('onboarding');
        onNeedsOnboarding(user);
      }
    } catch (error) {
      console.error('❌ Error handling authenticated user:', error);
      setFlowState('unauthenticated');
    }
  };

  const handleSuccessfulAuth = async (user: AuthUser) => {
    console.log('🎉 Authentication successful:', user.email);
    await handleAuthenticatedUser(user);
  };

  const handleEmailVerificationComplete = () => {
    if (currentUser) {
      // Re-check the user to get updated email verification status
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
        handleAuthenticatedUser(updatedUser);
      }
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await authService.completeOnboarding();
      if (currentUser) {
        setFlowState('authenticated');
        onAuthComplete(currentUser);
      }
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      Alert.alert(
        'Error',
        'Failed to complete onboarding. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Render appropriate screen based on flow state
  switch (flowState) {
    case 'loading':
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      );

    case 'unauthenticated':
      return <AuthScreen onAuthSuccess={handleSuccessfulAuth} />;

    case 'email-verification':
      return (
        <EmailVerificationScreen 
          theme={theme}
          userEmail={currentUser?.email || ''}
          onVerificationComplete={handleEmailVerificationComplete}
          onBackToLogin={() => setFlowState('unauthenticated')}
        />
      );

    case 'onboarding':
      // This will be handled by the parent component
      return null;

    case 'authenticated':
      // This will be handled by the parent component  
      return null;

    default:
      return <AuthScreen onAuthSuccess={handleSuccessfulAuth} />;
  }
};

const createStyles = (theme: any) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default AuthFlow;