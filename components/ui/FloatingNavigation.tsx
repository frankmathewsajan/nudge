import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface FloatingNavigationProps {
  currentRoute?: string;
}

export function FloatingNavigation({ currentRoute = 'index' }: FloatingNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [menuAnimation] = useState(new Animated.Value(0));
  const router = useRouter();

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: isExpanded ? 1 : 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(menuAnimation, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    setIsExpanded(!isExpanded);
  };

  const navigateTo = (route: string) => {
    if (route === 'settings') {
      router.push('/(tabs)/settings');
    } else if (route === 'goals') {
      router.push('/(tabs)/goals');
    } else if (route === 'track') {
      router.push('/(tabs)/track');
    } else if (route === 'index') {
      router.push('/(tabs)');
    }
    toggleMenu();
  };

  const menuItems = [
    { route: 'settings', icon: 'cog', label: 'Settings' },
    { route: 'goals', icon: 'bullseye', label: 'Goals' },
    { route: 'track', icon: 'calendar', label: 'Track' },
  ];

  return (
    <View style={styles.container}>
      
      {/* Overlay */}
      {isExpanded && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* Menu Items */}
      {menuItems.map((item, index) => {
        const translateY = menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(70 + index * 60)],
        });

        const opacity = menuAnimation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.5, 1],
        });

        const scale = menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });

        return (
          <Animated.View
            key={item.route}
            style={[
              styles.menuItem,
              {
                transform: [
                  { translateY },
                  { scale },
                ],
                opacity,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.menuButton,
                currentRoute === item.route && styles.activeMenuButton,
              ]}
              onPress={() => navigateTo(item.route)}
              activeOpacity={0.8}
            >
              <FontAwesome
                name={item.icon as any}
                size={20}
                color={currentRoute === item.route ? '#FFFFFF' : '#1A1A1A'}
              />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main Home Button */}
      <Animated.View style={[styles.mainButton, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          style={[
            styles.homeButton,
            currentRoute === 'index' && styles.activeHomeButton,
          ]}
          onPress={() => {
            if (currentRoute === 'index') {
              toggleMenu();
            } else {
              navigateTo('index');
            }
          }}
          activeOpacity={0.8}
        >
          <FontAwesome
            name={isExpanded ? 'times' : 'home'}
            size={24}
            color={currentRoute === 'index' ? '#FFFFFF' : '#1A1A1A'}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: -1,
  },
  mainButton: {
    zIndex: 10,
  },
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  activeHomeButton: {
    backgroundColor: '#1A1A1A',
  },
  menuItem: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 5,
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginRight: 5,
  },
  activeMenuButton: {
    backgroundColor: '#1A1A1A',
  },
});
