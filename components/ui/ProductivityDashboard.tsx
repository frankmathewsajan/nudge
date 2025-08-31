import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    cancelAllNotifications,
    getScheduledNotificationsCount,
    scheduleTestNotification,
    setupNotificationCategories
} from '../../utils/notifications';
import { ProductivityTracker } from './ProductivityTracker';

interface ProductivityDashboardProps {
  userId?: string;
  plannedTask?: string;
  onScheduleUpdate?: (needsUpdate: boolean) => void;
  onBackToGoals?: () => void;
}

type ViewMode = 'tracker' | 'analytics' | 'settings';

export function ProductivityDashboard({ 
  userId = 'default', 
  plannedTask,
  onScheduleUpdate,
  onBackToGoals
}: ProductivityDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('tracker');
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const insets = useSafeAreaInsets();

  // Initialize notification categories and count
  React.useEffect(() => {
    setupNotificationCategories();
    updateNotificationCount();
  }, []);

  const updateNotificationCount = async () => {
    try {
      const count = await getScheduledNotificationsCount();
      setNotificationCount(count);
    } catch (error) {
      console.error('Error getting notification count:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await scheduleTestNotification();
      Alert.alert(
        'Notification Scheduled! 🔔',
        'You will receive a test notification in 5 seconds. You can interact with it directly!',
        [{ text: 'OK' }]
      );
      await updateNotificationCount();
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification. Please check permissions.');
    }
  };

  const handleCancelNotifications = async () => {
    try {
      await cancelAllNotifications();
      Alert.alert('Notifications Cancelled', 'All scheduled notifications have been cancelled.');
      await updateNotificationCount();
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  };

  const renderTabButton = (mode: ViewMode, label: string) => (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={() => setCurrentView(mode)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.tabButtonText,
        currentView === mode && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
      {currentView === mode && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'tracker':
        return (
          <ProductivityTracker 
            userId={userId}
            plannedTask={plannedTask}
            onScheduleUpdate={onScheduleUpdate}
          />
        );
      case 'analytics':
        return (
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonTitle}>Analytics Dashboard</Text>
              <View style={styles.titleUnderline} />
              <Text style={styles.comingSoonText}>
                Deep insights into your productivity patterns, time allocation, and goal progress will be available here.
              </Text>
              <View style={styles.featuresList}>
                <Text style={styles.featuresTitle}>Features coming soon:</Text>
                <Text style={styles.featureItem}>• Productivity trends and charts</Text>
                <Text style={styles.featureItem}>• Time allocation breakdowns</Text>
                <Text style={styles.featureItem}>• Goal completion rates</Text>
                <Text style={styles.featureItem}>• Performance recommendations</Text>
              </View>
            </View>
          </ScrollView>
        );
      case 'settings':
        return (
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.settingsContainer}>
              <Text style={styles.settingsTitle}>Settings & Preferences</Text>
              <View style={styles.titleUnderline} />
              
              {/* Notification Testing Section */}
              <View style={styles.notificationSection}>
                <Text style={styles.sectionTitle}>NOTIFICATION TESTING</Text>
                <Text style={styles.sectionDescription}>
                  Test interactive notifications that allow you to log activities directly from the notification.
                </Text>
                
                <TouchableOpacity 
                  style={styles.testButton}
                  onPress={handleTestNotification}
                  activeOpacity={0.9}
                >
                  <Text style={styles.testButtonText}>Send Test Notification (5s)</Text>
                </TouchableOpacity>
                
                <View style={styles.notificationInfo}>
                  <Text style={styles.infoText}>
                    Scheduled notifications: {notificationCount}
                  </Text>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelNotifications}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.cancelButtonText}>Cancel All</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.notificationFeatures}>
                  <Text style={styles.featuresTitle}>Interactive Actions:</Text>
                  <Text style={styles.featureItem}>• Quick Log - Opens app to log activity</Text>
                  <Text style={styles.featureItem}>• Remind Later - Snooze for 30 minutes</Text>
                  <Text style={styles.featureItem}>• Mark Productive - Log as productive hour</Text>
                </View>
              </View>

              {/* Coming Soon Features */}
              <View style={styles.featuresList}>
                <Text style={styles.featuresTitle}>Additional Features Coming Soon:</Text>
                <Text style={styles.featureItem}>• Custom notification schedules</Text>
                <Text style={styles.featureItem}>• Productivity categories</Text>
                <Text style={styles.featureItem}>• Goal templates</Text>
                <Text style={styles.featureItem}>• Export preferences</Text>
              </View>
              
              {onBackToGoals && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={onBackToGoals}
                  activeOpacity={0.95}
                >
                  <Text style={styles.backButtonText}>Create New Goals</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        {/* Navigation Tabs */}
        <View style={[styles.tabContainer, { paddingTop: insets.top + 16 }]}>
          {renderTabButton('tracker', 'Track')}
          {renderTabButton('analytics', 'Analytics')}
          {renderTabButton('settings', 'Settings')}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Base Layout - Light Theme
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  activeTabButtonText: {
    color: '#1E293B',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  
  // Scroll containers for content
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  // Coming Soon Sections - Light Theme
  comingSoonContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    backgroundColor: '#FFFFFF',
  },
  settingsTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: 'System',
    marginBottom: 8,
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: 'System',
    marginBottom: 8,
  },
  titleUnderline: {
    width: 50,
    height: 2,
    backgroundColor: '#D4AF37',
    marginBottom: 24,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: 300,
  },
  featuresList: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    padding: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  featureItem: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 180,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  // Notification Testing Styles
  notificationSection: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    padding: 24,
    marginBottom: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionDescription: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 22,
  },
  testButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  notificationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
  },
  notificationFeatures: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});
