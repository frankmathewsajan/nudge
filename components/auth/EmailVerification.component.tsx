/**
 * Email Verification Screen
 * 
 * Material Design 3 screen for email verification with resend functionality
 */

import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Theme } from '../../contexts/ThemeContext';
import authService from '../../services/auth/authService';

interface EmailVerificationScreenProps {
  theme: Theme;
  userEmail: string;
  onVerificationComplete: () => void;
  onBackToLogin: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  theme,
  userEmail,
  onVerificationComplete,
  onBackToLogin,
}) => {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkAnimation] = useState(new Animated.Value(0));
  
  const insets = useSafeAreaInsets();
  const styles = createEmailVerificationStyles(theme);

  useEffect(() => {
    // Start cooldown timer if needed
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Auto-check verification status every 30 seconds
    // (User might verify on laptop/desktop)
    const interval = setInterval(async () => {
      console.log('🔄 Checking email verification status...');
      const isVerified = await authService.reloadUserAndCheckVerification();
      if (isVerified) {
        console.log('✅ Email verified automatically detected');
        Alert.alert(
          'Email Verified! 🎉',
          'Your email has been successfully verified.',
          [
            {
              text: 'Continue',
              onPress: onVerificationComplete,
            },
          ]
        );
      }
    }, 30000); // Check every 30 seconds

    // Also check immediately on mount
    checkVerificationOnMount();

    return () => clearInterval(interval);
  }, [onVerificationComplete]);

  const checkVerificationOnMount = async () => {
    // Check if already verified (in case user clicked the link)
    const isVerified = await authService.reloadUserAndCheckVerification();
    if (isVerified) {
      console.log('✅ Email already verified on mount');
      onVerificationComplete();
    }
  };

  const animateCheck = useCallback(() => {
    Animated.sequence([
      Animated.timing(checkAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(checkAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkAnimation]);

  const handleCheckVerification = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    animateCheck();
    
    try {
      const isVerified = await authService.reloadUserAndCheckVerification();
      
      if (isVerified) {
        Alert.alert(
          'Email Verified! 🎉',
          'Your email has been successfully verified. You can now access the app.',
          [
            {
              text: 'Continue',
              onPress: onVerificationComplete,
            },
          ]
        );
      } else {
        Alert.alert(
          'Email Not Verified',
          'Your email is not verified yet. Please check your email and click the verification link, then try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error checking verification:', error);
      Alert.alert(
        'Verification Check Failed',
        'Failed to check verification status. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;
    
    setIsResending(true);
    
    try {
      await authService.sendEmailVerification();
      setResendCooldown(60); // 1 minute cooldown
      
      Alert.alert(
        'Verification Email Sent',
        'A new verification email has been sent to your inbox. Please check your email and follow the instructions.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Error resending email:', error);
      Alert.alert(
        'Resend Failed',
        error.message || 'Failed to resend verification email. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Email Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="mark-email-unread" size={80} color={theme.colors.accentVibrant} />
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.description}>
            We've sent a verification link to
          </Text>
          <Text style={styles.email}>{userEmail}</Text>
          <Text style={styles.description}>
            Please check your email and click the verification link to continue.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Check Verification Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isChecking && styles.buttonDisabled]}
              onPress={handleCheckVerification}
              disabled={isChecking}
            >
              <Animated.View
                style={[
                  styles.buttonContent,
                  {
                    transform: [
                      {
                        scale: checkAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {isChecking ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>Checking...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="refresh" size={20} color="#fff" />
                    <Text style={styles.buttonText}>I've Verified My Email</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Resend Email Button */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                (isResending || resendCooldown > 0) && styles.buttonDisabled,
              ]}
              onPress={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
            >
              <View style={styles.buttonContent}>
                {isResending ? (
                  <>
                    <ActivityIndicator size="small" color={theme.colors.accentVibrant} />
                    <Text style={styles.secondaryButtonText}>Sending...</Text>
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <MaterialIcons name="timer" size={20} color={theme.colors.textTertiary} />
                    <Text style={styles.secondaryButtonTextDisabled}>
                      Resend in {resendCooldown}s
                    </Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color={theme.colors.accentVibrant} />
                    <Text style={styles.secondaryButtonText}>Resend Email</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <MaterialIcons name="info-outline" size={16} color={theme.colors.textTertiary} />
            <Text style={styles.helpText}>
              Didn't receive the email? Check your spam folder or try resending.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createEmailVerificationStyles = (theme: Theme) => {
  const screenHeight = Dimensions.get('window').height;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      flex: 1,
      paddingHorizontal: 24,
    },

    header: {
      paddingVertical: 16,
    },

    backButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.textSecondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    mainContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
      maxHeight: screenHeight * 0.8,
    },

    iconContainer: {
      marginBottom: 32,
      padding: 24,
      borderRadius: 80,
      backgroundColor: theme.colors.backgroundSecondary,
      shadowColor: theme.colors.accentVibrant,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },

    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 16,
      letterSpacing: 0.5,
    },

    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 8,
    },

    email: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.accentVibrant,
      textAlign: 'center',
      marginBottom: 16,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 12,
      overflow: 'hidden',
    },

    buttonContainer: {
      width: '100%',
      marginTop: 40,
      gap: 16,
    },

    primaryButton: {
      backgroundColor: theme.colors.accentVibrant,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      shadowColor: theme.colors.accentVibrant,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    secondaryButton: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderWidth: 2,
      borderColor: theme.colors.accentVibrant,
      shadowColor: theme.colors.textSecondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    buttonDisabled: {
      opacity: 0.6,
      shadowOpacity: 0.1,
      elevation: 2,
    },

    buttonContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },

    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      letterSpacing: 0.3,
    },

    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.accentVibrant,
      letterSpacing: 0.3,
    },

    secondaryButtonTextDisabled: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textTertiary,
      letterSpacing: 0.3,
    },

    helpContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 32,
      paddingHorizontal: 16,
      gap: 8,
    },

    helpText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textTertiary,
      lineHeight: 20,
    },
  });
};