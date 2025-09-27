/**
 * Data Management Component
 * 
 * Provides options to clear app data and reset settings
 */

import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Theme } from '../../contexts/ThemeContext';

interface DataManagementProps {
  theme: Theme;
}

export const DataManagement: React.FC<DataManagementProps> = ({ theme }) => {
  const [isClearing, setIsClearing] = useState(false);
  const styles = createStyles(theme);

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all app data including onboarding status, goals, and preferences. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              console.log('Clearing all AsyncStorage data...');
              await AsyncStorage.clear();
              
              Alert.alert(
                'Data Cleared',
                'All app data has been successfully cleared. Please restart the app.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Note: In a real app, you might want to navigate to restart or login screen
                      console.log('App data cleared successfully');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert(
                'Error',
                'Failed to clear data. Please try again.'
              );
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };





  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Data Management</Text>
      
      <TouchableOpacity
        style={[styles.clearAllButton, isClearing && styles.clearAllButtonDisabled]}
        onPress={clearAllData}
        disabled={isClearing}
      >
        <MaterialIcons 
          name="delete-forever" 
          size={20} 
          color={isClearing ? '#999' : '#F44336'} 
        />
        <Text style={[styles.clearAllButtonText, isClearing && styles.clearAllButtonTextDisabled]}>
          {isClearing ? 'Clearing...' : 'Clear All Data'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  section: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    elevation: 1,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },

  clearAllButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },

  clearAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  clearAllButtonTextDisabled: {
    color: '#999',
  },
});