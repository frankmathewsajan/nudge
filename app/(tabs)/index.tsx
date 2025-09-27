// Home Screen - Authentication -> Onboarding -> Goal Collection
// Clean flow: Auth -> Onboarding -> Goals

import { AuthScreen } from '@/components/auth/AuthScreen';
import { GoalCollectionScreen } from '@/components/goals/GoalCollectionScreen';
import { FormOnboarding } from '@/components/onboarding/FormOnboarding';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { useTheme } from '@/contexts/ThemeContext';
import authService, { AuthUser } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGoalCollection, setShowGoalCollection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAppState();
  }, []);

  // Debug showSettings state changes
  useEffect(() => {
    console.log('🔧 showSettings state changed to:', showSettings);
  }, [showSettings]);

  const checkAppState = async () => {
    try {
      // First check authentication
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await checkOnboardingStatus(user);
      }
    } catch (error) {
      console.error('Error checking app state:', error);
    }
    setIsLoading(false);
  };

  const checkOnboardingStatus = async (user: AuthUser) => {
    try {
      const completed = await AsyncStorage.getItem('@nudge_onboarding_completed');
      const goalsCompleted = await AsyncStorage.getItem('@nudge_goals_completed');
      const storedName = await AsyncStorage.getItem('@nudge_user_name');
      
      console.log('🔧 Onboarding check:', { completed, goalsCompleted, storedName: !!storedName });
      
      // STRICT: Both onboarding AND name must exist
      if (completed === 'true' && storedName && storedName.trim() !== '') {
        setUserName(storedName);
        setShowOnboarding(false);
        
        // Only show goals if onboarding is truly complete
        if (goalsCompleted !== 'true') {
          setShowGoalCollection(true);
        }
      } else {
        // Force onboarding if ANY requirement is missing
        console.log('🔧 FORCING ONBOARDING - requirements not met');
        setShowOnboarding(true);
        setShowGoalCollection(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Force onboarding on any error
      setShowOnboarding(true);
      setShowGoalCollection(false);
    }
  };

  const handleAuthSuccess = async (user: AuthUser) => {
    console.log('🔐 Authentication successful:', user.displayName);
    setCurrentUser(user);
    await checkOnboardingStatus(user);
  };

  const handleOnboardingComplete = async (name: string) => {
    try {
      await AsyncStorage.setItem('@nudge_onboarding_completed', 'true');
      await AsyncStorage.setItem('@nudge_user_name', name);
      setUserName(name);
      setShowOnboarding(false);
      setShowGoalCollection(true); // Show goal collection after onboarding
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  const handleGoalsComplete = async (goals: any[]) => {
    try {
      await AsyncStorage.setItem('@nudge_goals_completed', 'true');
      await AsyncStorage.setItem('@nudge_user_goals', JSON.stringify(goals));
      setShowGoalCollection(false);
      console.log('Goals collection completed:', goals);
      // TODO: Navigate to main app or dashboard
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  // Settings handlers
  const handleOpenSettings = () => {
    console.log('🔧 handleOpenSettings called');
    console.log('🔧 Current showSettings state:', showSettings);
    setShowSettings(true);
    console.log('🔧 setShowSettings(true) called');
  };

  const handleCloseSettings = () => {
    console.log('🔧 handleCloseSettings called');
    setShowSettings(false);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setShowOnboarding(false);
      setShowGoalCollection(false);
      setShowSettings(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Reset function for development/testing
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@nudge_onboarding_completed', 'false');
      await AsyncStorage.setItem('@nudge_goals_completed', 'false');
      setShowOnboarding(true);
      setShowGoalCollection(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Debug current state
  console.log('🔧 Render state:', { 
    currentUser: !!currentUser, 
    showOnboarding, 
    showGoalCollection, 
    showSettings 
  });

  // Authentication flow - show auth screen if not authenticated
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Settings screen - highest priority overlay
  if (showSettings) {
    console.log('🔧 Rendering SettingsScreen...');
    try {
      return <SettingsScreen />;
    } catch (error) {
      console.error('🔧 Error rendering SettingsScreen:', error);
      // Fallback to simple view
      return (
        <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
          <Text>Settings Screen Error</Text>
        </View>
      );
    }
  }

  // STRICT ONBOARDING ENFORCEMENT - No access to any other screens until onboarding is complete
  if (showOnboarding || !userName) {
    console.log('🔧 Showing onboarding - STRICT enforcement');
    return <FormOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Goal collection flow - ONLY show if onboarding is complete
  if (showGoalCollection) {
    return <GoalCollectionScreen onComplete={handleGoalsComplete} onOpenSettings={handleOpenSettings} />;
  }

  // Main app content - ONLY accessible after onboarding
  return <GoalCollectionScreen onComplete={handleGoalsComplete} onOpenSettings={handleOpenSettings} />;
}