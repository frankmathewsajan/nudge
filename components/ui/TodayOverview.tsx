import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getScheduledNotificationsCount } from '../../utils/notifications';
import { getSleepStats, isUserAsleep } from '../../utils/sleepState';

interface TodayOverviewProps {
  activityCount?: number;
  onViewDetails?: () => void;
}

export function TodayOverview({ activityCount = 0, onViewDetails }: TodayOverviewProps) {
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
      const [asleep, notificationCount, stats] = await Promise.all([
        isUserAsleep(),
        getScheduledNotificationsCount(),
        getSleepStats()
      ]);

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
            <Text style={styles.statusEmoji}>😴</Text>
            <Text style={styles.statusText}>Currently sleeping</Text>
          </View>
        ) : (
          <View style={styles.statusItem}>
            <Text style={styles.statusEmoji}>🌟</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
});
