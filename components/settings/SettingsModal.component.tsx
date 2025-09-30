/**
 * Settings Modal Component
 * 
 * Modular, responsive settings modal with smooth animations
 * Separates presentation from business logic
 */

import { createSettingsModalStyles } from '@/assets/styles/app/settings-modal.styles';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsContent } from './SettingsContent.component';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  animationDuration?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9; // 90% of screen height

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  animationDuration = 300,
}) => {
  const { theme } = useTheme();
  const styles = createSettingsModalStyles(theme);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      // Animate modal in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate modal out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: animationDuration * 0.8, // Slightly faster exit
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: animationDuration * 0.8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, animationDuration]);

  const handleClose = () => {
    onClose();
  };

  const handleOverlayPress = () => {
    handleClose();
  };

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <Pressable 
          style={styles.overlayPress} 
          onPress={handleOverlayPress}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialIcons 
                name="arrow-back" 
                size={24} 
                color={theme.colors.textPrimary} 
              />
            </Pressable>
            <Text style={styles.headerTitle}>Settings</Text>
            <Pressable
              style={styles.infoButton}
              onPress={() => {/* TODO: Show info */}}
              accessibilityRole="button"
              accessibilityLabel="Information"
            >
              <MaterialIcons 
                name="info-outline" 
                size={24} 
                color={theme.colors.textPrimary} 
              />
            </Pressable>
          </View>

          {/* Settings Content */}
          <SettingsContent onClose={handleClose} />
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};