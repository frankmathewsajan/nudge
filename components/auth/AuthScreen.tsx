/**
 * AuthScreen - Firebase Authentication with Google Sign-In
 * 
 * Matches onboarding aesthetic with clean, minimal design.
 * Handles login/register flow before onboarding.
 */

import { MaterialIcons } from '@expo/vector-icons';
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
import GoogleIcon from '../ui/GoogleIcon';
import { ThemeToggle } from '../ui/ThemeToggle';
// Inline auth styles to resolve import issues
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
    paddingTop: 60, // Add extra top padding for safe area
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
  
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.buttonBackground,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  googleButtonPressed: {
    backgroundColor: theme.colors.buttonActiveBackground,
    transform: [{ scale: 0.98 }],
  },
  
  googleButtonDisabled: {
    opacity: 0.6,
  },
  
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.buttonText,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 12,
  },
  
  subtitleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  
  authSection: {
    width: '100%',
    alignItems: 'center',
  },
  
  authPrompt: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.buttonText,
  },
  
  privacyText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  // Email/Password Form Styles
  emailFormContainer: {
    width: '100%',
    marginBottom: 24,
  },
  
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.inputText,
    marginBottom: 12,
  },
  
  inputFocused: {
    backgroundColor: theme.colors.inputFocusBackground,
    borderColor: theme.colors.accent,
  },
  
  emailAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.buttonBackground,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
    minHeight: 48,
  },
  
  emailAuthButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.buttonText,
    letterSpacing: 0.25,
  },
  
  // Form submit button (different from "Continue with Email" button)
  formSubmitButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  formSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  toggleModeButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  
  toggleModeText: {
    fontSize: 14,
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.inputBorder,
  },
  
  dividerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginHorizontal: 16,
  },
  
  // Enhanced Google Button
  googleButtonEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADCE0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 48,
  },
  
  googleIconEnhanced: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  
  googleButtonTextEnhanced: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3c4043',
    letterSpacing: 0.25,
  },
  
  authModeToggle: {
    alignItems: 'center',
    marginBottom: 16,
  },

  // New form footer styles
  formFooter: {
    marginTop: 24,
    alignItems: 'center',
    gap: 16,
  },

  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  linkText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  linkTextBold: {
    fontSize: 15,
    color: theme.colors.accent,
    fontWeight: '600',
  },

  backLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },

  backLinkText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Privacy footer at bottom
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
});

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser) => void;
}

/**
 * Authentication screen with Google Sign-In
 * 
 * Features:
 * - Claude-inspired minimal UI matching onboarding theme
 * - Google OAuth integration
 * - Smooth animations and feedback
 * - Error handling with user-friendly messages
 */
export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const styles = createAuthStyles(theme);
  const insets = useSafeAreaInsets();
  
  // Animation refs
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const promptOpacity = useRef(new Animated.Value(0)).current;
  const googleButtonOpacity = useRef(new Animated.Value(0)).current;
  const emailButtonOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [animationsStarted, setAnimationsStarted] = useState(false);

  // Check for existing auth state and start animations
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          onAuthSuccess(currentUser);
          return;
        }

        // Check for persisted auth state (React Native)
        const persistedUser = await authService.handleAuthPersistence();
        if (persistedUser) {
          onAuthSuccess(persistedUser);
          return;
        }

        console.log('No existing auth state');
      } catch (error) {
        console.error('Error checking auth state:', error);
      }

      // Start animation sequence after auth check
      startAnimationSequence();
    };

    checkAuthState();

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        onAuthSuccess(user);
      }
    });

    return unsubscribe;
  }, [onAuthSuccess]);

  // Animation sequence for Material Design fade-in
  const startAnimationSequence = () => {
    setAnimationsStarted(true);
    
    // Animate elements one by one with staggered timing
    Animated.sequence([
      // 1. Welcome title
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // 2. Description text (after 300ms)
      Animated.timing(descriptionOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // 3. Sign in prompt (after another 300ms)
      Animated.timing(promptOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // 4. Google button (after another 200ms)
      Animated.timing(googleButtonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 5. Email button (after another 200ms)
      Animated.timing(emailButtonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle email form animation
  const showEmailForm = () => {
    setShowEmailAuth(true);
    
    // Animate form appearance
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const hideEmailForm = () => {
    Animated.timing(formOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowEmailAuth(false);
      setEmail('');
      setPassword('');
    });
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      console.log('✅ Authentication successful:', user.displayName);
      onAuthSuccess(user);
    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      
      // Don't show error for redirect initiation
      if (!error.message.includes('Redirect initiated')) {
        Alert.alert(
          'Authentication Failed',
          'Unable to sign in with Google. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (isLoading || !email.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      let user: AuthUser;
      if (authMode === 'signup') {
        user = await authService.signUpWithEmail(email.trim(), password);
        console.log('✅ Email sign-up successful:', user.email);
      } else {
        user = await authService.signInWithEmail(email.trim(), password);
        console.log('✅ Email sign-in successful:', user.email);
      }
      onAuthSuccess(user);
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
        {/* Always show title - don't hide when showing email form */}
        <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
          <Text style={styles.title}>Welcome to Nudge</Text>
        </Animated.View>

        <Animated.View style={[styles.subtitleContainer, { opacity: descriptionOpacity }]}>
          <Text style={styles.subtitle}>Your personal productivity companion</Text>
        </Animated.View>

        {!showEmailAuth ? (
          // Main auth options
          <>
            <Animated.View style={[styles.authSection, { opacity: promptOpacity }]}>
              <Text style={styles.authPrompt}>Sign in to sync your goals</Text>
            </Animated.View>

            <Animated.View style={[styles.buttonContainer, { opacity: googleButtonOpacity }]}>
              <TouchableOpacity
                style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#666" size="small" />
                ) : (
                  <>
                    <GoogleIcon size={20} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider between Google and Email */}
            <Animated.View style={[styles.divider, { opacity: googleButtonOpacity }]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            <Animated.View style={[styles.buttonContainer, { opacity: emailButtonOpacity }]}>
              <TouchableOpacity
                style={[styles.emailAuthButton]}
                onPress={showEmailForm}
                disabled={isLoading}
              >
                <MaterialIcons name="email" size={20} color={theme.colors.buttonText} />
                <Text style={styles.emailAuthButtonText}>Continue with Email</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          // Email authentication form
          <Animated.View style={[styles.emailFormContainer, { opacity: formOpacity }]}>
            <TextInput
              style={[styles.input]}
              placeholder="Email address"
              placeholderTextColor={theme.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <TextInput
              style={[styles.input]}
              placeholder="Password"
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[
                styles.formSubmitButton,
                (!email.trim() || !password.trim()) && styles.googleButtonDisabled
              ]}
              onPress={handleEmailAuth}
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.formSubmitButtonText}>
                  {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Auth mode toggle with better styling */}
            <View style={styles.formFooter}>
              <TouchableOpacity onPress={toggleAuthMode} style={styles.linkButton}>
                <Text style={styles.linkText}>
                  {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={styles.linkTextBold}>
                    {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backLinkButton} onPress={hideEmailForm}>
                <MaterialIcons name="arrow-back" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.backLinkText}>Back to options</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Privacy text at the bottom */}
      <Animated.View style={[styles.privacyFooter, { opacity: emailButtonOpacity }]}>
        <Text style={styles.privacyText}>Nudge your goals, your privacy.</Text>
      </Animated.View>
    </SafeAreaView>
  );
};