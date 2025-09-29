/**
 * Home Tab Screen
 * 
 * Main home screen within the tab navigation.
 */

import { MainAppView } from '@/components/ui/MainAppView';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/hooks/useUserData';
import { router } from 'expo-router';
import React from 'react';

export default function HomeTabScreen() {
  const { theme } = useTheme();
  const { userName } = useUserData();

  const handleOpenSettings = () => {
    router.push('/modal/settings' as any);
  };

  return (
    <MainAppView
      theme={theme}
      userName={userName}
      onOpenSettings={handleOpenSettings}
    />
  );
}