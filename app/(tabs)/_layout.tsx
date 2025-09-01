import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#DDD6FE', // Light purple for active tabs
        tabBarInactiveTintColor: '#8B5CF6', // Medium purple for inactive tabs
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A0E3D', // Dark luxurious background
          borderBottomWidth: 1,
          borderBottomColor: '#4C1D95', // Purple border
          paddingTop: 8,
          paddingBottom: 8,
          height: 72,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          textTransform: 'none',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome 
              name="home" 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome 
              name="calendar" 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome 
              name="bullseye" 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome 
              name="cog" 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
