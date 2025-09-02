import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingNavigation } from '../../components/ui/FloatingNavigation';
import { AsyncStorageUtils } from '../../utils/asyncStorage';

export default function SettingsScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [rawData, setRawData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadAllData();
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const keys = [
        'user_goals',
        'day_started_',
        'activity_data',
        'user_preferences',
        'notification_settings',
        'sleep_data',
        'productivity_data'
      ];
      
      const data: any = {};
      
      // Get all AsyncStorage keys
      const allKeys = await AsyncStorageUtils.getAllKeys();
      
      for (const key of allKeys) {
        const value = await AsyncStorageUtils.getString(key);
        data[key] = value ? JSON.parse(value) : value;
      }
      
      setRawData(data);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
    setIsLoading(false);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data and restart the onboarding flow. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorageUtils.clear();
              Alert.alert(
                'Data Cleared',
                'All data has been cleared. The app will restart to the onboarding flow.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Refresh the data display
                      loadAllData();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Data export functionality would be implemented here. Raw data is displayed below for now.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0E3D" />
      
      <LinearGradient
        colors={['#1A0E3D', '#2D1B69', '#6B46C1', '#9333EA']}
        style={styles.gradientBackground}
      />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome name="cog" size={24} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>
                  Manage your data and preferences
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <ScrollView 
          style={styles.settingsList}
          contentContainerStyle={styles.settingsListContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Action Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={loadAllData}>
              <View style={styles.settingIconContainer}>
                <FontAwesome name="refresh" size={20} color="#F59E0B" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Refresh Data</Text>
                <Text style={styles.settingSubtitle}>Reload all stored data</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#8B5CF6" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={exportData}>
              <View style={styles.settingIconContainer}>
                <FontAwesome name="download" size={20} color="#F59E0B" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Export Data</Text>
                <Text style={styles.settingSubtitle}>Download your data</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#8B5CF6" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={clearAllData}>
              <View style={styles.settingIconContainer}>
                <FontAwesome name="trash" size={20} color="#EF4444" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Clear All Data</Text>
                <Text style={styles.settingSubtitle}>Reset app to onboarding</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Raw Data Display */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Raw Data Store</Text>
            <View style={styles.rawDataContainer}>
              <ScrollView style={styles.rawDataScrollView} nestedScrollEnabled>
                <Text style={styles.rawDataText}>
                  {JSON.stringify(rawData, null, 2)}
                </Text>
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
      
      {/* Floating Navigation */}
      <FloatingNavigation currentRoute="settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F3E8FF',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C4B5FD',
    fontWeight: '400',
    fontFamily: 'System',
  },
  settingsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsListContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3E8FF',
    marginBottom: 16,
    fontFamily: 'System',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  dangerItem: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3E8FF',
    marginBottom: 2,
    fontFamily: 'System',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#C4B5FD',
    fontFamily: 'System',
  },
  dangerText: {
    color: '#EF4444',
  },
  rawDataContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  rawDataScrollView: {
    flex: 1,
  },
  rawDataText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#DDD6FE',
    lineHeight: 14,
  },
});
