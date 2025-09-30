/**
 * Home Tab Screen
 * 
 * The main goals collection interface - this IS the app!
 */

import { GoalCollectionScreen } from '@/components/goals/GoalCollectionScreen';
import { router } from 'expo-router';

export default function HomeTabScreen() {
  const handleComplete = () => {
    // Goals interface is the main app - no need to "complete" 
    // This could trigger success animations or goal analysis
  };

  const handleOpenSettings = () => {
    router.push('/modal/settings' as any);
  };

  return (
    <GoalCollectionScreen 
      onComplete={handleComplete}
    />
  );
}