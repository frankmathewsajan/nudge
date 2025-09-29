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
import { Text, TouchableOpacity, View } from 'react-native';

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
      
      console.log('🔧 DETAILED STATE CHECK:');
      console.log('  - completed:', completed, '(type:', typeof completed, ')');
      console.log('  - goalsCompleted:', goalsCompleted, '(type:', typeof goalsCompleted, ')');
      console.log('  - storedName:', storedName, '(exists:', !!storedName, ')');
      console.log('  - user:', user?.email);
      
      // ULTRA STRICT ENFORCEMENT: ALWAYS force onboarding first, THEN goals, THEN main app
      // This ensures NO bypassing is possible
      
      // Step 1: FORCE onboarding if not BOTH completed AND has name
      // Even if marked complete, if name is missing, force onboarding
      if (completed !== 'true' || !storedName || storedName.trim() === '') {
        console.log('🔧 🚫 FORCING STEP 1: Onboarding REQUIRED (ultra strict mode)');
        console.log('  - completed=' + completed + ', storedName=' + (storedName || 'missing'));
        setShowOnboarding(true);
        setShowGoalCollection(false);
        setUserName('');
        return;
      }
      
      // Step 2: Only after onboarding is 100% complete, check goals
      if (goalsCompleted !== 'true') {
        console.log('🔧 🚫 FORCING STEP 2: Goals REQUIRED (onboarding verified complete)');
        console.log('  - goalsCompleted=' + goalsCompleted);
        setUserName(storedName);
        setShowOnboarding(false);
        setShowGoalCollection(true);
        return;
      }
      
      // Step 3: Everything is complete - show main app
      console.log('🔧 ✅ All steps complete - showing main app');
      setUserName(storedName);
      setShowOnboarding(false);
      setShowGoalCollection(false);
      
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Force onboarding on any error
      console.log('🔧 ERROR: Forcing onboarding due to error');
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

  // Enhanced reset function for development/testing
  const resetOnboarding = async () => {
    try {
      console.log('🔄 FORCE RESET: Clearing all onboarding and goal data');
      await AsyncStorage.multiRemove([
        '@nudge_onboarding_completed',
        '@nudge_goals_completed', 
        '@nudge_user_name'
      ]);
      
      // Force UI state reset
      setShowOnboarding(true);
      setShowGoalCollection(false);
      setShowSettings(false);
      setUserName('');
      
      console.log('🔄 FORCE RESET: Complete - will show onboarding');
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
    showSettings,
    userName: !!userName 
  });

  // Authentication flow - show auth screen if not authenticated
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Settings screen - highest priority overlay
  if (showSettings) {
    console.log('🔧 Rendering SettingsScreen...');
    try {
      return <SettingsScreen onClose={handleCloseSettings} />;
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

  // STEP 1: STRICT ONBOARDING ENFORCEMENT - No access to any other screens until onboarding is complete
  if (showOnboarding || !userName) {
    console.log('🔧 Showing onboarding - STRICT enforcement');
    return <FormOnboarding onComplete={handleOnboardingComplete} />;
  }

  // STEP 2: Goal collection flow - ONLY show if onboarding is complete but goals are not
  if (showGoalCollection) {
    console.log('🔧 Showing goal collection - onboarding complete, goals pending');
    return <GoalCollectionScreen onComplete={handleGoalsComplete} onOpenSettings={handleOpenSettings} />;
  }

  // STEP 3: Main app content - ONLY accessible after BOTH onboarding AND goals are complete
  console.log('🔧 Showing main app - all requirements met');
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>🎉 Welcome to Nudge!</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', paddingHorizontal: 40 }}>
        All setup complete! Main app coming soon...
      </Text>
      <TouchableOpacity 
        onPress={handleOpenSettings}
        style={{ 
          marginTop: 30, 
          backgroundColor: '#007AFF', 
          paddingHorizontal: 20, 
          paddingVertical: 10, 
          borderRadius: 8 
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Settings</Text>
      </TouchableOpacity>
      
      {/* Development Reset Button */}
      <TouchableOpacity 
        onPress={resetOnboarding}
        style={{ 
          marginTop: 20, 
          backgroundColor: '#FF3B30', 
          paddingHorizontal: 20, 
          paddingVertical: 10, 
          borderRadius: 8 
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset for Testing</Text>
      </TouchableOpacity>
    </View>
  );
}