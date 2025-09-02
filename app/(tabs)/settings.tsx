import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
import { getAllActivityData } from '../../utils/activityData';
import { AsyncStorageUtils } from '../../utils/asyncStorage';
import { getCurrentGoals, getGoalsHistory } from '../../utils/goalsStorage';
import { getCacheStats } from '../../utils/insightCache';
import { getSleepState, getSleepStats } from '../../utils/sleepState';

export default function SettingsScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [rawData, setRawData] = useState<any>({});
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [structuredData, setStructuredData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
      // Load structured data from each service
      const structured = {
        activityData: await getAllActivityData(),
        sleepState: await getSleepState(),
        sleepStats: await getSleepStats(),
        currentGoals: await getCurrentGoals(),
        goalsHistory: await getGoalsHistory(),
        cacheStats: getCacheStats(),
        asyncStorageAvailable: await AsyncStorageUtils.isAvailable(),
      };
      setStructuredData(structured);

      // Load raw AsyncStorage data
      const data: any = {};
      
      // Get all AsyncStorage keys
      const allKeys = await AsyncStorageUtils.getAllKeys();
      
      for (const key of allKeys) {
        try {
          const value = await AsyncStorageUtils.getString(key);
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value; // Store as string if not JSON
            }
          } else {
            data[key] = null;
          }
        } catch (error) {
          data[key] = `Error reading key: ${error}`;
        }
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
                      // Navigate to home to trigger onboarding flow
                      router.push('/(tabs)');
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

            <TouchableOpacity 
              style={[styles.settingItem, isDeveloperMode && styles.activeItem]} 
              onPress={() => setIsDeveloperMode(!isDeveloperMode)}
            >
              <View style={styles.settingIconContainer}>
                <FontAwesome name="code" size={20} color="#F59E0B" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Developer Mode</Text>
                <Text style={styles.settingSubtitle}>
                  {isDeveloperMode ? 'Hide raw data view' : 'Show structured data inspection'}
                </Text>
              </View>
              <FontAwesome 
                name={isDeveloperMode ? "toggle-on" : "toggle-off"} 
                size={20} 
                color={isDeveloperMode ? "#10B981" : "#6B7280"} 
              />
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

          {/* Developer Mode - Structured Data */}
          {isDeveloperMode && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Structured Data Overview</Text>
              
              {/* Storage Stats */}
              <View style={styles.devCard}>
                <Text style={styles.devCardTitle}>Storage Status</Text>
                <Text style={styles.devText}>
                  AsyncStorage Available: {structuredData.asyncStorageAvailable ? '✅' : '❌'}
                </Text>
                <Text style={styles.devText}>
                  Total Keys: {Object.keys(rawData).length}
                </Text>
                <Text style={styles.devText}>
                  Cache Stats: {JSON.stringify(structuredData.cacheStats, null, 2)}
                </Text>
              </View>

              {/* Activity Data */}
              <View style={styles.devCard}>
                <Text style={styles.devCardTitle}>📅 Activity Data (daily_activity_data)</Text>
                <Text style={styles.devText}>
                  Days with activity: {Object.keys(structuredData.activityData || {}).length}
                </Text>
                <Text style={styles.devText}>
                  Most recent: {Object.keys(structuredData.activityData || {}).sort().pop() || 'None'}
                </Text>
              </View>

              {/* Sleep State */}
              <View style={styles.devCard}>
                <Text style={styles.devCardTitle}>😴 Sleep State (sleep_state)</Text>
                <Text style={styles.devText}>
                  Currently asleep: {structuredData.sleepState?.isAsleep ? '✅' : '❌'}
                </Text>
                <Text style={styles.devText}>
                  Total sessions: {structuredData.sleepStats?.totalSessions || 0}
                </Text>
                <Text style={styles.devText}>
                  Avg duration: {(structuredData.sleepStats?.averageSleepDuration || 0).toFixed(1)}h
                </Text>
              </View>

              {/* Goals Data */}
              <View style={styles.devCard}>
                <Text style={styles.devCardTitle}>🎯 Goals Data</Text>
                <Text style={styles.devText}>
                  Goals screen (user_goals): {rawData.user_goals ? 
                    (typeof rawData.user_goals === 'string' ? JSON.parse(rawData.user_goals).length : rawData.user_goals.length)
                    : 0} goals
                </Text>
                <Text style={styles.devText}>
                  Goals service current: {structuredData.currentGoals ? '1 goal' : 'None'}
                </Text>
                <Text style={styles.devText}>
                  Goals service history: {structuredData.goalsHistory?.length || 0} entries
                </Text>
                <Text style={styles.devNote}>
                  ⚠️ Note: Goals screen and goalsStorage.ts use different keys (see README cleanup)
                </Text>
              </View>

              {/* Storage Schema Verification */}
              <View style={styles.devCard}>
                <Text style={styles.devCardTitle}>📋 Storage Schema Verification</Text>
                <Text style={styles.devText}>Expected Keys from README:</Text>
                <Text style={styles.devText}>  ✅ daily_activity_data: {rawData.daily_activity_data ? 'Found' : 'Missing'}</Text>
                <Text style={styles.devText}>  ✅ sleep_state: {rawData.sleep_state ? 'Found' : 'Missing'}</Text>
                <Text style={styles.devText}>  ✅ user_goals: {rawData.user_goals ? 'Found' : 'Missing'}</Text>
                <Text style={styles.devText}>  🔄 @nudge_user_goals: {rawData['@nudge_user_goals'] ? 'Found' : 'Missing'} (alt API)</Text>
                <Text style={styles.devText}>  🔄 @nudge_goals_history: {rawData['@nudge_goals_history'] ? 'Found' : 'Missing'} (alt API)</Text>
                <Text style={styles.devNote}>
                  ✅ = Currently used by UI, 🔄 = Alternative API available but not wired to UI
                </Text>
              </View>

              {/* All Storage Keys */}
              <View style={styles.devCard}>
                <Text style={styles.devCardTitle}>🗝️ All Storage Keys</Text>
                {Object.keys(rawData).map((key, index) => (
                  <Text key={index} style={styles.devText}>
                    • {key}: {typeof rawData[key] === 'object' ? 'Object' : typeof rawData[key]}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Raw Data Display */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isDeveloperMode ? '🔧 Raw AsyncStorage Dump' : 'Raw Data Store'}
            </Text>
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
  
  // Developer Mode Styles
  activeItem: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  devCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  devCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 12,
    fontFamily: 'System',
  },
  devText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#E5E7EB',
    lineHeight: 16,
    marginBottom: 4,
  },
  devNote: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#F59E0B',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 14,
  },
});
