/**
 * Developer Options Component
 * 
 * Password-protected developer tools including API key management and AsyncStorage editor
 */

import { MaterialIcons } from '@expo/vector-icons';
import CryptoJS from 'crypto-js';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Theme } from '../../contexts/ThemeContext';

interface DeveloperOptionsProps {
  theme: Theme;
  geminiApiKey: string;
  onGeminiApiKeyChange: (key: string) => void;
}

export const DeveloperOptions: React.FC<DeveloperOptionsProps> = ({
  theme,
  geminiApiKey,
  onGeminiApiKeyChange,
}) => {
  const [showDeveloperOptions, setShowDeveloperOptions] = useState(false);
  const [developerPassword, setDeveloperPassword] = useState('');

  
  const styles = createStyles(theme);

  // Developer password validation using crypto-js MD5
  const checkDeveloperPassword = (password: string): boolean => {
    // The expected MD5 hash
    const expectedHash = 'fd5d780506e95be055acb4b48eadba8e';
    
    if (password.length === 8 && /^\d{8}$/.test(password)) {
      // Use crypto-js to compute MD5 hash
      const passwordHash = CryptoJS.MD5(password).toString();
      return passwordHash === expectedHash;
    }
    return false;
  };



  const handleDeveloperAccess = () => {
    if (checkDeveloperPassword(developerPassword)) {
      setShowDeveloperOptions(true);
      setDeveloperPassword('');
    } else {
      Alert.alert('Access Denied', 'Invalid developer password');
      setDeveloperPassword('');
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Developer Options</Text>
      
      {!showDeveloperOptions ? (
        <View style={styles.materialCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="lock" size={20} color="#1976D2" />
            <Text style={styles.cardTitle}>Developer Access</Text>
          </View>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.passwordInput, { color: theme.colors.textPrimary }]}
              value={developerPassword}
              onChangeText={setDeveloperPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
              maxLength={8}
              secureTextEntry={true}
              textAlign="center"
            />
          </View>
          {developerPassword.length > 0 && (
            <View style={styles.passwordFeedback}>
              {checkDeveloperPassword(developerPassword) ? (
                <View style={styles.successFeedback}>
                  <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.successText}>Access granted</Text>
                </View>
              ) : (
                <View style={styles.errorFeedback}>
                  <MaterialIcons name="error" size={16} color="#F44336" />
                  <Text style={styles.errorText}>Invalid code</Text>
                </View>
              )}
            </View>
          )}
          {developerPassword.length === 8 && checkDeveloperPassword(developerPassword) && (
            <TouchableOpacity 
              style={[styles.unlockButton, { backgroundColor: theme.colors.accentVibrant }]}
              onPress={handleDeveloperAccess}
            >
              <MaterialIcons name="lock-open" size={20} color="#fff" />
              <Text style={styles.unlockButtonText}>Unlock Developer Tools</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.developerContent}>
          <View style={styles.developerHeader}>
            <Text style={styles.settingLabel}>Developer Tools</Text>
            <TouchableOpacity 
              onPress={() => setShowDeveloperOptions(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* API Key Section */}
          <View style={styles.settingItem}>
            <View style={styles.developerSectionHeader}>
              <MaterialIcons name="api" size={20} color="#1976D2" />
              <Text style={styles.developerSectionTitle}>Gemini API Key</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={geminiApiKey}
              onChangeText={onGeminiApiKeyChange}
              placeholder="Enter Gemini API key"
              placeholderTextColor={theme.colors.textTertiary}
              secureTextEntry
            />
            <Text style={styles.settingHelp}>
              Get your API key from Google AI Studio
            </Text>
          </View>
          

        </View>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  section: {
    marginVertical: 12,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  materialCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  passwordInputContainer: {
    marginBottom: 16,
  },

  passwordInput: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.inputBackground,
    fontFamily: 'monospace',
    letterSpacing: 4,
    textAlign: 'center',
    minHeight: 56,
  },

  passwordFeedback: {
    marginTop: 8,
    marginBottom: 16,
  },

  successFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },

  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 6,
    fontWeight: '500',
  },

  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  developerContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },

  developerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },

  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundSecondary,
  },

  settingItem: {
    marginBottom: 20,
  },

  developerSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  developerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  textInput: {
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  settingHelp: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 8,
    lineHeight: 16,
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },

  storageDataContainer: {
    maxHeight: 300,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  storageItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
  },

  storageItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  storageKey: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accentVibrant,
    marginBottom: 8,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    flex: 1,
  },

  storageActions: {
    flexDirection: 'row',
    gap: 8,
  },

  editStorageButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },

  deleteStorageButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },

  storageValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 16,
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 8,
  },

  emptyStorage: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },

  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: theme.colors.accentVibrant,
    borderRadius: 12,
    gap: 8,
  },

  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.name === 'dark' ? '#0F172A' : '#FFFFFF',
    letterSpacing: 0.2,
  },
});