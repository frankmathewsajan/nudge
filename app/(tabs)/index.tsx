// Home Screen - Goal Collection Interface
// Clean onboarding flow followed by goal collection

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { GoalCollectionScreen } from '../../components/goals/GoalCollectionScreen';
import { FormOnboarding } from '../../components/onboarding/FormOnboarding';

export default function HomeScreen() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showGoalCollection, setShowGoalCollection] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('@nudge_onboarding_completed');
      const goalsCompleted = await AsyncStorage.getItem('@nudge_goals_completed');
      const storedName = await AsyncStorage.getItem('@nudge_user_name');
      
      if (completed === 'true' && storedName) {
        setUserName(storedName);
        setShowOnboarding(false);
        
        if (goalsCompleted !== 'true') {
          setShowGoalCollection(true);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
    setIsLoading(false);
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

  if (showOnboarding) {
    return <FormOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (showGoalCollection) {
    return <GoalCollectionScreen onComplete={handleGoalsComplete} />;
  }

  // Main app content (placeholder for now)
  return <GoalCollectionScreen onComplete={handleGoalsComplete} />;
}