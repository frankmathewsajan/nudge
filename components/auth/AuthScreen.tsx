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
        
        // Send email verification
        await authService.sendEmailVerification();
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
      
      let errorMessage = 'Authentication failed. Please try again.';
      if (error.message.includes('email-already-in-use')) {
        errorMessage = 'This email is already registered. Try signing in instead.';
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
        errorMessage = 'Invalid email or password. Please try again.';
      }
      
      Alert.alert('Authentication Failed', errorMessage, [{ text: 'OK' }]);
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
                onChangeText={setEmail}
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