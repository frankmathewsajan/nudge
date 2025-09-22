import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../contexts/ThemeContext';
import { loadUserData, saveUserData } from '../../services/storageService';
import { ENV } from '../../utils/env';

interface SettingsScreenProps {
    theme: Theme;
    onClose: () => void;
}

interface UserSettings {
    username: string;
    geminiApiKey: string;
    notificationsEnabled: boolean;
    autoSaveHistory: boolean;
    maxHistoryItems: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ theme, onClose }) => {
    const [settings, setSettings] = useState<UserSettings>({
        username: '',
        geminiApiKey: '',
        notificationsEnabled: true,
        autoSaveHistory: true,
        maxHistoryItems: 50,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeveloperOptions, setShowDeveloperOptions] = useState(false);
    const [developerPassword, setDeveloperPassword] = useState('');
    const [asyncStorageData, setAsyncStorageData] = useState<Record<string, string>>({});
    const insets = useSafeAreaInsets();

    const styles = createSettingsStyles(theme);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Load from AsyncStorage keys used in onboarding
            const storedUsername = await AsyncStorage.getItem('@nudge_user_name');
            const userData = await loadUserData();
            
            setSettings(prev => ({
                ...prev,
                username: storedUsername || userData?.name || '',
                geminiApiKey: userData?.geminiApiKey || ENV.getGeminiKey(),
                notificationsEnabled: userData?.notificationsEnabled ?? true,
                autoSaveHistory: userData?.autoSaveHistory ?? true,
                maxHistoryItems: userData?.maxHistoryItems ?? 50,
            }));
        } catch (error) {
            console.error('Error loading settings:', error);
            // Fallback to env values if no user data
            setSettings(prev => ({
                ...prev,
                geminiApiKey: ENV.getGeminiKey(),
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!settings.username.trim()) {
            Alert.alert('Error', 'Please enter a username');
            return;
        }

        setIsSaving(true);
        try {
            // Save to AsyncStorage for onboarding compatibility
            await AsyncStorage.setItem('@nudge_user_name', settings.username);
            
            // Also save to userStore for other app usage
            const userData = await loadUserData();
            const updatedUserData = {
                ...userData,
                name: settings.username,
                geminiApiKey: settings.geminiApiKey,
                notificationsEnabled: settings.notificationsEnabled,
                autoSaveHistory: settings.autoSaveHistory,
                maxHistoryItems: settings.maxHistoryItems,
            };
            
            await saveUserData(updatedUserData);
            Alert.alert('Success', 'Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSetting = (key: keyof UserSettings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const updateSetting = (key: keyof UserSettings, value: string | number) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    };

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

    const loadAsyncStorageData = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const stores = await AsyncStorage.multiGet(keys);
            const data: Record<string, string> = {};
            
            stores.forEach(([key, value]) => {
                data[key] = value || '';
            });
            
            setAsyncStorageData(data);
        } catch (error) {
            console.error('Error loading AsyncStorage data:', error);
        }
    };

    const handleDeveloperAccess = () => {
        if (checkDeveloperPassword(developerPassword)) {
            setShowDeveloperOptions(true);
            loadAsyncStorageData();
            setDeveloperPassword('');
        } else {
            Alert.alert('Access Denied', 'Invalid developer password');
            setDeveloperPassword('');
        }
    };

    const clearAllStorage = async () => {
        Alert.alert(
            'Clear All Data',
            'This will permanently delete all your data including goals, history, and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert('Success', 'All data has been cleared successfully.');
                        } catch (error) {
                            console.error('Error clearing storage:', error);
                            Alert.alert('Error', 'Failed to clear data. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <Modal
                visible={true}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={onClose}
            >
                <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
                    <View style={styles.loadingContainer}>
                        <MaterialIcons name="settings" size={48} color={theme.colors.textTertiary} />
                        <Text style={styles.loadingText}>Loading settings...</Text>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    return (
        <Modal
            visible={true}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { paddingTop: Math.max(insets.top - 10, 0) }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <TouchableOpacity 
                    onPress={saveSettings} 
                    style={[styles.backButton, isSaving && styles.saveButtonDisabled]}
                    disabled={isSaving}
                >
                    <MaterialIcons 
                        name={isSaving ? "hourglass-empty" : "save"} 
                        size={24} 
                        color={theme.colors.textPrimary} 
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Username</Text>
                        <TextInput
                            style={styles.textInput}
                            value={settings.username}
                            onChangeText={(text) => updateSetting('username', text)}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    
                    <TouchableOpacity 
                        style={styles.toggleItem}
                        onPress={() => toggleSetting('notificationsEnabled')}
                    >
                        <View style={styles.toggleContent}>
                            <Text style={styles.settingLabel}>Notifications</Text>
                            <Text style={styles.settingDescription}>
                                Receive reminders and goal updates
                            </Text>
                        </View>
                        <View style={[
                            styles.toggle,
                            settings.notificationsEnabled && styles.toggleActive
                        ]}>
                            <View style={[
                                styles.toggleThumb,
                                settings.notificationsEnabled && styles.toggleThumbActive
                            ]} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.toggleItem}
                        onPress={() => toggleSetting('autoSaveHistory')}
                    >
                        <View style={styles.toggleContent}>
                            <Text style={styles.settingLabel}>Auto-save History</Text>
                            <Text style={styles.settingDescription}>
                                Automatically save goal analyses
                            </Text>
                        </View>
                        <View style={[
                            styles.toggle,
                            settings.autoSaveHistory && styles.toggleActive
                        ]}>
                            <View style={[
                                styles.toggleThumb,
                                settings.autoSaveHistory && styles.toggleThumbActive
                            ]} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Max History Items</Text>
                        <View style={styles.numberInputContainer}>
                            <TouchableOpacity 
                                onPress={() => updateSetting('maxHistoryItems', Math.max(10, settings.maxHistoryItems - 10))}
                                style={styles.numberButton}
                            >
                                <MaterialIcons name="remove" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                            <Text style={styles.numberValue}>{settings.maxHistoryItems}</Text>
                            <TouchableOpacity 
                                onPress={() => updateSetting('maxHistoryItems', Math.min(200, settings.maxHistoryItems + 10))}
                                style={styles.numberButton}
                            >
                                <MaterialIcons name="add" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Developer Options Section */}
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
                                    value={settings.geminiApiKey}
                                    onChangeText={(text) => updateSetting('geminiApiKey', text)}
                                    placeholder="Enter Gemini API key"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    secureTextEntry
                                />
                                <Text style={styles.settingHelp}>
                                    Get your API key from Google AI Studio
                                </Text>
                            </View>
                            
                            {/* AsyncStorage Section */}
                            <View style={styles.settingItem}>
                                <View style={styles.developerSectionHeader}>
                                    <MaterialIcons name="storage" size={20} color="#1976D2" />
                                    <Text style={styles.developerSectionTitle}>AsyncStorage Data</Text>
                                </View>
                                
                                <ScrollView style={styles.storageDataContainer} nestedScrollEnabled>
                                    {Object.entries(asyncStorageData).map(([key, value]) => (
                                        <View key={key} style={styles.storageItem}>
                                            <View style={styles.storageItemHeader}>
                                                <Text style={styles.storageKey}>{key}</Text>
                                                <View style={styles.storageActions}>
                                                    <TouchableOpacity 
                                                        onPress={() => {
                                                            const newValue = prompt(`Edit value for ${key}:`, value);
                                                            if (newValue !== null) {
                                                                AsyncStorage.setItem(key, newValue);
                                                                loadAsyncStorageData();
                                                            }
                                                        }}
                                                        style={styles.editStorageButton}
                                                    >
                                                        <MaterialIcons name="edit" size={16} color="#2196F3" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity 
                                                        onPress={() => {
                                                            Alert.alert(
                                                                'Delete Item',
                                                                `Are you sure you want to delete "${key}"?`,
                                                                [
                                                                    { text: 'Cancel', style: 'cancel' },
                                                                    {
                                                                        text: 'Delete',
                                                                        style: 'destructive',
                                                                        onPress: () => {
                                                                            AsyncStorage.removeItem(key);
                                                                            loadAsyncStorageData();
                                                                        }
                                                                    }
                                                                ]
                                                            );
                                                        }}
                                                        style={styles.deleteStorageButton}
                                                    >
                                                        <MaterialIcons name="delete" size={16} color="#F44336" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <Text style={styles.storageValue} numberOfLines={3}>
                                                {value}
                                            </Text>
                                        </View>
                                    ))}
                                    {Object.keys(asyncStorageData).length === 0 && (
                                        <Text style={styles.emptyStorage}>No AsyncStorage data found</Text>
                                    )}
                                </ScrollView>
                                <TouchableOpacity 
                                    style={styles.refreshButton}
                                    onPress={loadAsyncStorageData}
                                >
                                    <MaterialIcons name="refresh" size={20} color={theme.colors.accentVibrant} />
                                    <Text style={styles.refreshButtonText}>Refresh Data</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Danger Zone Section */}
                <View style={[styles.section, styles.dangerSection]}>
                    <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
                    
                    <TouchableOpacity 
                        style={styles.dangerButton}
                        onPress={clearAllStorage}
                    >
                        <MaterialIcons name="delete-forever" size={24} color="#DC2626" />
                        <View style={styles.dangerButtonContent}>
                            <Text style={styles.dangerButtonText}>Clear All Data</Text>
                            <Text style={styles.dangerButtonDescription}>
                                Permanently delete all goals, history, and settings
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    
                    <View style={styles.aboutItem}>
                        <Text style={styles.aboutLabel}>App Version</Text>
                        <Text style={styles.aboutValue}>1.0.0</Text>
                    </View>
                    
                    <View style={styles.aboutItem}>
                        <Text style={styles.aboutLabel}>Created by</Text>
                        <Text style={styles.aboutValue}>Frank Mathew Sajan</Text>
                    </View>
                    
                    {/* Developer Links */}
                    <View style={styles.socialLinksContainer}>
                        <Text style={[styles.settingLabel, { marginBottom: 16 }]}>Connect with Frank</Text>
                        
                        <TouchableOpacity style={styles.socialLink}>
                            <MaterialIcons name="web" size={24} color={theme.colors.accentVibrant} />
                            <View style={styles.socialLinkContent}>
                                <Text style={styles.socialLinkTitle}>Portfolio</Text>
                                <Text style={styles.socialLinkUrl}>itsfrank.web.app</Text>
                            </View>
                            <MaterialIcons name="open-in-new" size={16} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.socialLink}>
                            <MaterialIcons name="work" size={24} color="#0A66C2" />
                            <View style={styles.socialLinkContent}>
                                <Text style={styles.socialLinkTitle}>LinkedIn</Text>
                                <Text style={styles.socialLinkUrl}>@frankmathewsajan</Text>
                            </View>
                            <MaterialIcons name="open-in-new" size={16} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.socialLink}>
                            <MaterialIcons name="code" size={24} color="#333333" />
                            <View style={styles.socialLinkContent}>
                                <Text style={styles.socialLinkTitle}>GitHub</Text>
                                <Text style={styles.socialLinkUrl}>@frankmathewsajan</Text>
                            </View>
                            <MaterialIcons name="open-in-new" size={16} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.socialLink}>
                            <MaterialIcons name="camera-alt" size={24} color="#E4405F" />
                            <View style={styles.socialLinkContent}>
                                <Text style={styles.socialLinkTitle}>Instagram</Text>
                                <Text style={styles.socialLinkUrl}>@franklyy.idk</Text>
                            </View>
                            <MaterialIcons name="open-in-new" size={16} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
        </Modal>
    );
};

const createSettingsStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
    },
    
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.colors.backgroundSecondary,
        shadowColor: theme.colors.textSecondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    
    backButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        shadowColor: theme.colors.textSecondary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        letterSpacing: 0.5,
    },
    
    saveButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: theme.colors.accentVibrant,
        shadowColor: theme.colors.accentVibrant,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    saveButtonDisabled: {
        opacity: 0.6,
        backgroundColor: theme.colors.textTertiary,
    },
    
    saveState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    
    savingState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    
    section: {
        marginVertical: 20,
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
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 20,
        letterSpacing: 0.3,
    },
    
    settingItem: {
        marginBottom: 20,
    },
    
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
        letterSpacing: 0.2,
    },
    
    settingDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
        marginTop: 4,
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
    
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    
    toggleContent: {
        flex: 1,
        marginRight: 16,
    },
    
    toggle: {
        width: 56,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        paddingHorizontal: 2,
        shadowColor: theme.colors.textSecondary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
    },
    
    toggleActive: {
        backgroundColor: theme.colors.accentVibrant,
        shadowColor: theme.colors.accentVibrant,
        shadowOpacity: 0.3,
    },
    
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: theme.colors.textTertiary,
        alignSelf: 'flex-start',
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    
    toggleThumbActive: {
        backgroundColor: theme.name === 'dark' ? '#0F172A' : '#FFFFFF',
        alignSelf: 'flex-end',
    },
    
    numberInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginTop: 8,
    },
    
    numberButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.textSecondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    
    numberValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        minWidth: 80,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    
    aboutItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    
    aboutLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        letterSpacing: 0.2,
    },
    
    aboutValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        letterSpacing: 0.3,
    },
    
    // Danger Zone Styles
    dangerSection: {
        borderColor: '#DC2626',
        borderWidth: 1,
        backgroundColor: theme.name === 'dark' ? '#1F1F1F' : '#FEF2F2',
    },
    
    dangerTitle: {
        color: '#DC2626',
    },
    
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        borderColor: '#DC2626',
        borderWidth: 1,
    },
    
    dangerButtonContent: {
        flex: 1,
        marginLeft: 12,
    },
    
    dangerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
        letterSpacing: 0.2,
    },
    
    dangerButtonDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
        lineHeight: 18,
    },
    
    // Developer Options Styles
    developerAccess: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
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
    
    accessButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.textSecondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
    
    closeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: theme.colors.backgroundSecondary,
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
    
    storageKey: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.accentVibrant,
        marginBottom: 8,
        fontFamily: 'monospace',
        letterSpacing: 0.5,
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
    
    // Social Links Styles
    socialLinksContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.inputBorder,
    },
    
    socialLink: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: theme.colors.textSecondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    
    socialLinkContent: {
        flex: 1,
        marginLeft: 16,
    },
    
    socialLinkTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        letterSpacing: 0.2,
    },
    
    socialLinkUrl: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
        letterSpacing: 0.1,
    },
    
    // Developer Access Styles
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
    
    cardDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    
    passwordInputContainer: {
        marginBottom: 16,
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
    
    // AsyncStorage Editor Styles
    storageItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
    
    // Developer Section Styles
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
});