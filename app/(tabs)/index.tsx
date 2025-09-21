// Home Screen - Material You Knowledge Search Interface
// With form-based onboarding flow

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FormOnboarding } from '../../components/ui/FormOnboarding';
import { KnowledgeSearchScreen } from '../../components/ui/KnowledgeSearchScreen';

export default function HomeScreen() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('@nudge_onboarding_completed');
      const storedName = await AsyncStorage.getItem('@nudge_user_name');
      
      if (completed === 'true' && storedName) {
        setShowOnboarding(false);
        setUserName(storedName);
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
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  const handleVoiceSearch = () => {
    console.log('Voice search activated');
    // TODO: Implement voice search
  };

  const handleCameraSearch = () => {
    console.log('Camera search activated');
    // TODO: Implement camera search
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (showOnboarding) {
    return <FormOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <KnowledgeSearchScreen
      onSearch={handleSearch}
      onVoiceSearch={handleVoiceSearch}
      onCameraSearch={handleCameraSearch}
    />
  );
}