/**
 * Danger Zone Component
 * 
 * Compact component for dangerous actions like clearing all app data
 */

import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Theme } from '../../contexts/ThemeContext';

interface DangerZoneProps {
  theme: Theme;
}

export const DangerZone: React.FC<DangerZoneProps> = ({ theme }) => {
  const styles = createStyles(theme);

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your app data including goals, preferences, and progress. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              
              Alert.alert(
                'Data Cleared',
                'All app data has been cleared successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to main screen after clearing data
                      router.replace('/(tabs)' as any);
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear app data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <MaterialIcons name="warning" size={18} color="#F44336" />
        <Text style={styles.sectionTitle}>Danger Zone</Text>
      </View>
      
      <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
        <MaterialIcons name="delete-sweep" size={18} color="#F44336" />
        <View style={styles.dangerContent}>
          <Text style={styles.dangerLabel}>Clear All Data</Text>
          <Text style={styles.dangerDescription}>Delete all app data and reset</Text>
        </View>
        <MaterialIcons name="chevron-right" size={16} color="#F44336" />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  section: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 12,
    elevation: 1,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 0.5,
    borderColor: '#F44336' + '20',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  dangerContent: {
    marginLeft: 8,
    flex: 1,
  },

  dangerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F44336',
    marginBottom: 1,
  },

  dangerDescription: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
});