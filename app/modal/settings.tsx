/**
 * Settings Modal Screen
 * 
 * Modal presentation for settings using Expo Router modal patterns.
 */

import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { router } from 'expo-router';
import React from 'react';

export default function SettingsModal() {
  const handleClose = () => {
    router.back();
  };

  return <SettingsScreen onClose={handleClose} />;
}