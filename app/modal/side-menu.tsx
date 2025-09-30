/**
 * Side Menu Modal
 * 
 * Claude-inspired side navigation menu with New Path, Visions, and Recents
 */

import { createSideMenuStyles, MENU_WIDTH } from '@/assets/styles/app/side-menu.styles';
import { SettingsModal } from '@/components/settings/SettingsModal.component';
import { SettingsButton } from '@/components/ui/SettingsButton.component';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/hooks/app/useUserData';
import authService from '@/services/auth/authService';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SideMenuModal() {
  const { theme } = useTheme();
  const { userName } = useUserData();
  const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const styles = createSideMenuStyles(theme);

  useEffect(() => {
    // Animate menu in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const handleNewPath = () => {
    closeMenu();
    // TODO: Navigate to new goal creation
  };

  const handleVisions = () => {
    closeMenu();
    // TODO: Navigate to goal history/visions
  };

  const handleSettings = () => {
    // Open settings modal directly without navigation
    setSettingsModalVisible(true);
  };

  const handleCloseSettings = () => {
    setSettingsModalVisible(false);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      closeMenu();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSwipeIndicatorPress = () => {
    closeMenu();
  };

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={closeMenu}
    >
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <Pressable style={styles.overlayPress} onPress={closeMenu} />
      </Animated.View>

      {/* Side Menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Swipe indicator */}
        <TouchableOpacity 
          style={styles.swipeIndicator} 
          onPress={handleSwipeIndicatorPress}
          activeOpacity={0.7}
        />
        
        <SafeAreaView style={styles.menuContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>Nudge</Text>
          </View>

          {/* Main Actions */}
          <View style={styles.mainActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleNewPath}>
              <MaterialIcons name="add" size={20} color={theme.colors.accent} />
              <Text style={styles.actionText}>New Path</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleVisions}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.actionText}>Visions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
              <MaterialIcons name="widgets" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.actionText}>Artifacts</Text>
            </TouchableOpacity>
          </View>

          {/* Recents Section */}
          <View style={styles.recentsSection}>
            <Text style={styles.sectionTitle}>Recents</Text>
            <ScrollView style={styles.recentsList} showsVerticalScrollIndicator={false}>
              {/* TODO: Add recent goal conversations */}
              <TouchableOpacity style={styles.recentItem}>
                <Text style={styles.recentText}>Goal planning session</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recentItem}>
                <Text style={styles.recentText}>Life vision discussion</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitial}>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <Text style={styles.userName}>{userName || 'User'}</Text>
              <SettingsButton 
                onPress={handleSettings} 
                variant="minimal"
                testID="side-menu-settings-button"
              />
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Settings Modal */}
      <SettingsModal 
        visible={settingsModalVisible}
        onClose={handleCloseSettings}
      />
    </Modal>
  );
}