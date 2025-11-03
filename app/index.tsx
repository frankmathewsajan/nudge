/**
 * Main Goals Screen
 * 
 * The core goals collection interface - this IS the app!
 */

import { GoalCollectionScreen } from '@/components/goals/GoalCollection';
import { router } from 'expo-router';
import React from 'react';

export default function GoalsScreen() {
  const handleComplete = () => {
    // Goals interface is the main app - no need to "complete" 
    // This could trigger success animations or goal analysis
  };

  const handleOpenSideMenu = () => {
    router.push('/modal/side-menu' as any);
  };

  return (
    <GoalCollectionScreen 
      onComplete={handleComplete}
      onOpenSideMenu={handleOpenSideMenu}
    />
  );
}