/**
 * Account Management Component
 * 
 * Enhanced account management with Firestore profile details, status indicators, and edit functionality
 */

import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Theme } from '../../contexts/ThemeContext';
import authService from '../../services/authService';

interface UserProfile {
  displayName: string;
  email: string;
  age?: number;
  goals?: string[];
  joinedDate: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
}

interface AccountManagementProps {
  theme: Theme;
  userEmail?: string;
}

export const AccountManagement: React.FC<AccountManagementProps> = ({ 
  theme, 
  userEmail 
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  
  const styles = createStyles(theme);

  useEffect(() => {
    loadUserProfile();
  }, [userEmail]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Mock user profile data - in real app, this would come from Firestore
      const mockProfile: UserProfile = {
        displayName: 'User',
        email: userEmail || 'user@example.com',
        age: 25,
        goals: ['Fitness', 'Productivity'],
        joinedDate: '2024-01-15',
        emailVerified: true,
        onboardingCompleted: true,
      };

      // Check onboarding status from AsyncStorage
      const onboardingStatus = await AsyncStorage.getItem('onboardingCompleted');
      mockProfile.onboardingCompleted = onboardingStatus === 'true';

      setUserProfile(mockProfile);
      setEditedName(mockProfile.displayName);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    try {
      // In real app, save to Firestore
      setUserProfile({ ...userProfile, displayName: editedName });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account</Text>
      
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="account-circle" size={48} color={theme.colors.accentVibrant} />
        </View>
        <View style={styles.profileInfo}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Display name"
              placeholderTextColor={theme.colors.textTertiary}
            />
          ) : (
            <Text style={styles.displayName}>{userProfile.displayName}</Text>
          )}
          <Text style={styles.emailText}>{userProfile.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <MaterialIcons 
            name={isEditing ? "check" : "edit"} 
            size={20} 
            color={theme.colors.accentVibrant} 
          />
        </TouchableOpacity>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusItem, 
          userProfile.onboardingCompleted ? styles.statusSuccess : styles.statusWarning
        ]}>
          <MaterialIcons 
            name={userProfile.onboardingCompleted ? "check-circle" : "pending"} 
            size={16} 
            color={userProfile.onboardingCompleted ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={styles.statusText}>
            Onboarding {userProfile.onboardingCompleted ? 'Completed' : 'Pending'}
          </Text>
        </View>
        
        <View style={[
          styles.statusItem, 
          userProfile.emailVerified ? styles.statusSuccess : styles.statusError
        ]}>
          <MaterialIcons 
            name={userProfile.emailVerified ? "verified" : "error"} 
            size={16} 
            color={userProfile.emailVerified ? "#4CAF50" : "#F44336"} 
          />
          <Text style={styles.statusText}>
            Email {userProfile.emailVerified ? 'Verified' : 'Unverified'}
          </Text>
        </View>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MaterialIcons name="cake" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.detailLabel}>Age</Text>
          <Text style={styles.detailValue}>{userProfile.age || 'Not set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="flag" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.detailLabel}>Goals</Text>
          <Text style={styles.detailValue}>
            {userProfile.goals?.length || 0} active
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.detailLabel}>Joined</Text>
          <Text style={styles.detailValue}>
            {new Date(userProfile.joinedDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <MaterialIcons name="logout" size={18} color="#F44336" />
        <Text style={styles.signOutText}>Sign Out</Text>
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
    marginBottom: 16,
    letterSpacing: 0.2,
  },

  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    paddingVertical: 20,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  avatarContainer: {
    marginRight: 12,
  },

  profileInfo: {
    flex: 1,
  },

  displayName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },

  nameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accentVibrant,
    paddingBottom: 2,
    marginBottom: 2,
  },

  emailText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },

  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.inputBorder + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  statusSuccess: {
    backgroundColor: '#4CAF50' + '20',
  },

  statusWarning: {
    backgroundColor: '#FF9800' + '20',
  },

  statusError: {
    backgroundColor: '#F44336' + '20',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginLeft: 4,
  },

  detailsContainer: {
    gap: 8,
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },

  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },

  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.inputBorder,
    marginTop: 8,
  },

  signOutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F44336',
    marginLeft: 6,
  },
});