/**
 * AuthScreen - Email/Password Authentication
 *
 * Clean, simplified authentication with email verification.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import authService, { AuthUser } from '../../services/authService';
import AnimatedBackground from '../ui/AnimatedBackground';
import { ThemeToggle } from '../ui/ThemeToggle';

const createAuthStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  
  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  
  subtitleContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },

  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },

  input: {
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: theme.colors.inputText,
  },

  inputFocused: {
    backgroundColor: theme.colors.inputFocusBackground,
    borderColor: theme.colors.accent,
  },

  inputError: {
    borderColor: theme.colors.error || '#FF5252',
    backgroundColor: theme.colors.errorBackground || theme.colors.inputBackground,
  },

  primaryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    marginTop: 8,
  },

  primaryButtonDisabled: {
    opacity: 0.5,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  formFooter: {
    marginTop: 16,
    alignItems: 'center',
    gap: 12,
  },

  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  linkText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  linkTextBold: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
  },

  helperText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 12,
    color: theme.colors.error || '#FF5252',
    marginTop: 4,
    paddingHorizontal: 4,
  },

  errorToast: {
    position: 'absolute',
    top: 60, // Below the header
    left: 20,
    right: 20,
    backgroundColor: theme.colors.error || '#FF5252',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },

  errorToastText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },

  dismissButton: {
    marginLeft: 12,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dismissText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 16,
  },

  verificationContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },

  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },

  privacyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  privacyText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const styles = createAuthStyles(theme);
  const insets = useSafeAreaInsets();
  
  // Animation refs
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [toastError, setToastError] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Animation refs
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          onAuthSuccess(currentUser);
          return;
        }

        const persistedUser = await authService.handleAuthPersistence();
        if (persistedUser) {
          onAuthSuccess(persistedUser);
          return;
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }

      startAnimationSequence();
    };

    checkAuthState();

    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        onAuthSuccess(user);
      }
    });

    return unsubscribe;
  }, [onAuthSuccess]);

  const startAnimationSequence = () => {
    Animated.sequence([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(descriptionOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validatePasswords = () => {
    let hasError = false;
    
    if (authMode === 'signup') {
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        hasError = true;
      } else {
        setPasswordError('');
      }
      
      if (confirmPassword && password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        hasError = true;
      } else {
        setConfirmPasswordError('');
      }
    }
    
    return !hasError;
  };

  const handleEmailAuth = async () => {
    const canSubmit = email.trim() && password.trim() && 
      (authMode === 'signin' || (confirmPassword.trim() && validatePasswords()));
    
    if (isLoading || !canSubmit) return;

    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const user = await authService.signUpWithEmail(email.trim(), password);
        
        // Email verification is automatically sent in signUpWithEmail
        setEmailVerificationSent(true);
        
        Alert.alert(
          'Account Created!',
          'A verification email has been sent to your email address. Please verify your email to complete registration.',
          [{ text: 'OK' }]
        );
        
        console.log('✅ Email sign-up successful:', user.email);
      } else {
        const user = await authService.signInWithEmail(email.trim(), password);
        console.log('✅ Email sign-in successful:', user.email);
        onAuthSuccess(user);
      }
    } catch (error: any) {
      console.error('❌ Email authentication failed:', error);
      console.log('🔍 Error details:');
      console.log('  - error.code:', error.code);
      console.log('  - error.message:', error.message);
      console.log('  - error type:', typeof error);
      
      // The authService already processes Firebase errors and throws user-friendly messages
      // So we should use the processed message directly if it's user-friendly
      let errorMessage = error.message || 'Authentication failed. Please try again.';
      
      // Check if the message is already user-friendly (from authService)
      const userFriendlyMessages = [
        'This email is already registered. Try signing in instead.',
        'Password should be at least 6 characters long.',
        'Please enter a valid email address.',
        'Too many requests. Please wait a few minutes before trying again.',
        'Email authentication is not enabled in Firebase Console.',
        'No account found with this email.',
        'Incorrect password.',
        'This account has been disabled.',
        'Network error. Please check your connection and try again.'
      ];
      
      const isUserFriendly = userFriendlyMessages.some(msg => errorMessage.includes(msg.split('.')[0]));
      
      if (isUserFriendly) {
        // Use the message from authService directly, just add an icon
        if (errorMessage.includes('email is already registered')) {
          errorMessage = '📧 ' + errorMessage;
        } else if (errorMessage.includes('Password should be')) {
          errorMessage = '� ' + errorMessage;
        } else if (errorMessage.includes('valid email address')) {
          errorMessage = '✉️ ' + errorMessage;
        } else if (errorMessage.includes('Too many requests')) {
          errorMessage = '⏰ ' + errorMessage;
        } else if (errorMessage.includes('authentication is not enabled')) {
          errorMessage = '⚙️ ' + errorMessage;
        } else if (errorMessage.includes('No account found')) {
          errorMessage = '❓ ' + errorMessage;
        } else if (errorMessage.includes('Incorrect password')) {
          errorMessage = '🔑 ' + errorMessage;
        } else if (errorMessage.includes('account has been disabled')) {
          errorMessage = '🚫 ' + errorMessage;
        } else if (errorMessage.includes('Network error')) {
          errorMessage = '🌐 ' + errorMessage;
        }
      } else {
        // Fallback to Firebase error code detection for any edge cases
        const errorCode = error.code || '';
        const fullErrorString = JSON.stringify(error).toLowerCase();
        
        if (errorCode === 'auth/email-already-in-use' || 
            fullErrorString.includes('email-already-in-use')) {
          errorMessage = '� This email is already registered. Try signing in instead.';
        } else if (errorCode === 'auth/weak-password' || 
                   fullErrorString.includes('weak-password')) {
          errorMessage = '🔒 Password should be at least 6 characters long.';
        } else if (errorCode === 'auth/invalid-email' || 
                   fullErrorString.includes('invalid-email')) {
          errorMessage = '✉️ Please enter a valid email address.';
        } else if (errorCode === 'auth/user-not-found' || 
                   fullErrorString.includes('user-not-found')) {
          errorMessage = '❓ No account found with this email. Please sign up first.';
        } else if (errorCode === 'auth/wrong-password' || 
                   fullErrorString.includes('wrong-password')) {
          errorMessage = '🔑 Incorrect password. Please try again.';
        } else {
          errorMessage = '⚠️ ' + errorMessage;
        }
      }
      
      console.log('📱 Final error message for toast:', errorMessage);
      
      // Show toast error with animation
      setToastError(errorMessage);
      setShowToast(true);
      
      // Animate toast in
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Clear error after 8 seconds with animation
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowToast(false);
          setToastError('');
        });
      }, 8000);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmPasswordError('');
    setEmailVerificationSent(false);
  };

  const isFormValid = () => {
    const emailValid = email.trim().length > 0;
    const passwordValid = password.trim().length > 0;
    
    if (authMode === 'signin') {
      return emailValid && passwordValid;
    } else {
      const confirmPasswordValid = confirmPassword.trim().length > 0;
      const passwordsMatch = password === confirmPassword;
      const passwordLongEnough = password.length >= 6;
      
      return emailValid && passwordValid && confirmPasswordValid && passwordsMatch && passwordLongEnough;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <AnimatedBackground />
      
      <View style={styles.header}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} inline />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
          <Text style={styles.title}>Welcome to Nudge</Text>
        </Animated.View>

        <Animated.View style={[styles.subtitleContainer, { opacity: descriptionOpacity }]}>
          <Text style={styles.subtitle}>Your personal productivity companion</Text>
        </Animated.View>
        
        {/* Error Toast with Animation */}
        {showToast && toastError ? (
          <Animated.View style={[
            styles.errorToast, 
            { 
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }]
            }
          ]}>
            <Text style={styles.errorToastText}>{toastError}</Text>
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={() => {
                Animated.parallel([
                  Animated.timing(toastOpacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                  }),
                  Animated.timing(toastTranslateY, {
                    toValue: -100,
                    duration: 250,
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  setShowToast(false);
                  setToastError('');
                });
              }}
            >
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
        
        <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
          {emailVerificationSent ? (
            <View style={styles.verificationContainer}>
              <Text style={styles.verificationTitle}>
                Check your email for verification
              </Text>
              <Text style={styles.helperText}>
                We sent a verification link to {email}. Click the link to verify your account.
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setEmailVerificationSent(false);
                  setAuthMode('signin');
                }}
                style={styles.linkButton}
              >
                <Text style={[styles.linkText, styles.linkTextBold]}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused
                ]}
                placeholder="Email address"
                placeholderTextColor={theme.colors.inputPlaceholder || theme.colors.textTertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (showToast) {
                    // Animate toast out when user starts typing
                    Animated.parallel([
                      Animated.timing(toastOpacity, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                      }),
                      Animated.timing(toastTranslateY, {
                        toValue: -100,
                        duration: 250,
                        useNativeDriver: true,
                      }),
                    ]).start(() => {
                      setShowToast(false);
                      setToastError('');
                    });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />

              <View>
                <TextInput
                  style={[
                    styles.input,
                    passwordFocused && styles.inputFocused,
                    passwordError && styles.inputError
                  ]}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.inputPlaceholder || theme.colors.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (showToast) {
                      // Animate toast out when user starts typing
                      Animated.parallel([
                        Animated.timing(toastOpacity, {
                          toValue: 0,
                          duration: 250,
                          useNativeDriver: true,
                        }),
                        Animated.timing(toastTranslateY, {
                          toValue: -100,
                          duration: 250,
                          useNativeDriver: true,
                        }),
                      ]).start(() => {
                        setShowToast(false);
                        setToastError('');
                      });
                    }
                    if (authMode === 'signup') {
                      setTimeout(() => validatePasswords(), 100);
                    }
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {authMode === 'signup' && (
                <View>
                  <TextInput
                    style={[
                      styles.input,
                      confirmPasswordFocused && styles.inputFocused,
                      confirmPasswordError && styles.inputError
                    ]}
                    placeholder="Confirm password"
                    placeholderTextColor={theme.colors.inputPlaceholder || theme.colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setTimeout(() => validatePasswords(), 100);
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                  {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!isFormValid() || isLoading) && styles.primaryButtonDisabled,
                ]}
                onPress={handleEmailAuth}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {authMode === 'signup' ? 'Create account' : 'Sign in'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.formFooter}>
                <Text style={styles.helperText}>
                  {authMode === 'signup'
                    ? 'Already have an account?'
                    : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode} style={styles.linkButton}>
                  <Text style={[styles.linkText, styles.linkTextBold]}>
                    {authMode === 'signup' ? 'Sign in' : 'Sign up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </View>

      <Animated.View style={[styles.privacyFooter, { opacity: footerOpacity }]}>
        <Text style={styles.privacyText}>Nudge • Your Goals, Your Privacy</Text>
      </Animated.View>
    </SafeAreaView>
  );
};