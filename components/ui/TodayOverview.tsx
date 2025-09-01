import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getActivityCount } from '../../utils/activityData';
import { getScheduledNotificationsCount } from '../../utils/notifications';
import { getSleepStats, isUserAsleep } from '../../utils/sleepState';

interface TodayOverviewProps {
  onViewDetails?: () => void;
}

export function TodayOverview({ onViewDetails }: TodayOverviewProps) {
  const [activityCount, setActivityCount] = useState(0);
  const [isAsleep, setIsAsleep] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState(0);
  const [sleepStats, setSleepStats] = useState<{
    totalSessions: number;
    averageSleepDuration: number;
    lastSleepDuration?: number;
    totalSleepTime: number;
  } | null>(null);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const [todayCount, asleep, notificationCount, stats] = await Promise.all([
        getActivityCount(new Date()),
        isUserAsleep(),
        getScheduledNotificationsCount(),
        getSleepStats()
      ]);

      setActivityCount(todayCount);
      setIsAsleep(asleep);
      setScheduledNotifications(notificationCount);
      setSleepStats(stats);
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getNextNotificationTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const nextHour = currentHour + 1;
    
    if (nextHour > 22) return 'No more today';
    
    return `${nextHour}:00`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.gradientBackground}
        colors={['#1A0E3D', '#4C1D95', '#7C3AED', '#A855F7']}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <Text style={styles.timeText}>{getCurrentTime()}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activityCount}</Text>
            <Text style={styles.statLabel}>Activities Logged</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{scheduledNotifications}</Text>
            <Text style={styles.statLabel}>Pending Check-ins</Text>
          </View>

          {sleepStats && sleepStats.lastSleepDuration && (
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sleepStats.lastSleepDuration.toFixed(1)}h</Text>
              <Text style={styles.statLabel}>Last Sleep</Text>
            </View>
          )}
        </View>

        <View style={styles.statusContainer}>
          {isAsleep ? (
            <View style={styles.statusItem}>
              <FontAwesome name="moon-o" size={20} color="#666666" style={styles.statusIcon} />
              <Text style={styles.statusText}>Currently sleeping</Text>
            </View>
          ) : (
            <View style={styles.statusItem}>
              <FontAwesome name="clock-o" size={20} color="#2196F3" style={styles.statusIcon} />
              <Text style={styles.statusText}>
                Next check-in: {getNextNotificationTime()}
              </Text>
            </View>
          )}
        </View>

        {onViewDetails && (
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={onViewDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsButtonText}>View Detailed Report</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#3C2A21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 224, 236, 0.5)',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C2A21', // Rich brown text
    marginBottom: 4,
    fontFamily: 'System',
  },
  timeText: {
    fontSize: 14,
    color: '#6B5B73', // Muted lavender
    fontFamily: 'System',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B5B73',
    marginBottom: 4,
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12,
    color: '#3C2A21',
    textAlign: 'center',
    fontFamily: 'System',
    flexWrap: 'wrap',
    maxWidth: 80,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.5)',
    maxWidth: '100%',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#3C2A21',
    fontWeight: '500',
    fontFamily: 'System',
    flexShrink: 1,
  },
  detailsButton: {
    backgroundColor: '#C8A882', // Warm beige
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3C2A21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  detailsButtonText: {
    color: '#3C2A21', // Rich brown
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
