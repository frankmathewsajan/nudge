/**
 * Settings Modal Screen
 * 
 * Modal presentation for settings using Expo Router modal patterns.
 * Now uses the modular SettingsModal component for consistency.
 */

import { SettingsModal } from '@/components/settings/SettingsModal.component';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function SettingsModalRoute() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show modal when route mounts
    setVisible(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
    // Small delay to allow animation to complete
    setTimeout(() => {
      router.back();
    }, 200);
  };

  return (
    <SettingsModal 
      visible={visible}
      onClose={handleClose}
    />
  );
}