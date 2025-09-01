import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AsyncStorageUtils } from '../../utils/asyncStorage';
import { scheduleHourlyReminders } from '../../utils/notifications';

interface StartDayProps {
  onDayStarted?: () => void;
}

const DAY_STARTED_KEY = 'day_started_';

export function StartDay({ onDayStarted }: StartDayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dayStarted, setDayStarted] = useState(false);

  React.useEffect(() => {
    checkDayStartedStatus();
  }, []);

  const checkDayStartedStatus = async () => {
    try {
      const today = new Date().toDateString();
      const key = `${DAY_STARTED_KEY}${today}`;
      const started = await AsyncStorageUtils.getString(key);
      if (started === 'true') {
        setDayStarted(true);
      }
    } catch (error) {
      console.error('Error checking day started status:', error);
    }
  };

  const markDayAsStarted = async () => {
    try {
      const today = new Date().toDateString();
      const key = `${DAY_STARTED_KEY}${today}`;
      const success = await AsyncStorageUtils.setString(key, 'true');
      if (!success) {
        console.error('Failed to mark day as started');
      }
    } catch (error) {
      console.error('Error marking day as started:', error);
    }
  };

  const getCurrentHour = () => {
    return new Date().getHours();
  };

  const getWakeUpTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getSleepHours = () => {
    const currentHour = getCurrentHour();
    const sleepHours: number[] = [];
    
    // If it's past 6 AM, assume user was sleeping from midnight until they woke up
    // This makes sense for typical sleep patterns
    if (currentHour >= 6) {
      // Count hours from midnight to current hour as sleep
      for (let hour = 0; hour < currentHour; hour++) {
        sleepHours.push(hour);
      }
    } else {
      // If it's very early (before 6 AM), might still be night time
      // Only count a few hours as sleep
      for (let hour = 0; hour < Math.min(currentHour, 3); hour++) {
        sleepHours.push(hour);
      }
    }
    
    return sleepHours;
  };

  const formatSleepPeriod = () => {
    const sleepHours = getSleepHours();
    if (sleepHours.length === 0) return 'No sleep hours to log';
    
    const startHour = sleepHours[0];
    const endHour = sleepHours[sleepHours.length - 1];
    
    const formatHour = (hour: number) => {
      if (hour === 0) return '12:00 AM';
      if (hour < 12) return `${hour}:00 AM`;
      if (hour === 12) return '12:00 PM';
      return `${hour - 12}:00 PM`;
    };
    
    if (sleepHours.length === 1) {
      return `${formatHour(startHour)} - ${formatHour(startHour + 1)}`;
    }
    
    return `${formatHour(startHour)} - ${formatHour(endHour + 1)}`;
  };

  const handleStartDay = async () => {
    setIsLoading(true);
    
    try {
      const currentHour = getCurrentHour();
      const sleepHours = getSleepHours();
      const currentTime = getWakeUpTime();
      
      let alertMessage = `I'll start productivity tracking from now (${currentTime}).`;
      
      if (sleepHours.length > 0) {
        alertMessage = `I'll mark ${sleepHours.length} hours as sleep time and start productivity tracking from now (${currentTime}).`;
      }
      
      // Show confirmation
      Alert.alert(
        '🌅 Start Your Day',
        alertMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Start Day', 
            onPress: async () => {
              try {
                // Schedule notifications for the remaining hours of the day
                await scheduleHourlyReminders();
                
                // Mark day as started
                await markDayAsStarted();
                setDayStarted(true);
                onDayStarted?.();
                
                const remainingHours = Math.max(22 - currentHour, 0);
                Alert.alert(
                  '✅ Day Started!',
                  `Productivity tracking is now active! You'll receive ${remainingHours} check-ins today.`,
                  [{ text: 'Let\'s go!' }]
                );
              } catch (error) {
                console.error('Error in start day confirmation:', error);
                Alert.alert('Error', 'Failed to start the day. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error starting day:', error);
      Alert.alert('Error', 'Failed to start the day. Please try again.');
    }
    
    setIsLoading(false);
  };

  if (dayStarted) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedEmoji}>✅</Text>
        <Text style={styles.completedTitle}>Day Started!</Text>
        <Text style={styles.completedSubtitle}>
          Productivity tracking is active
        </Text>
      </View>
    );
  }

  const sleepHours = getSleepHours();
  const currentTime = getWakeUpTime();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🌅</Text>
        <Text style={styles.title}>Good Morning!</Text>
        <Text style={styles.subtitle}>
          {getCurrentDate()}
        </Text>
        <Text style={styles.timeText}>
          Current time: {currentTime}
        </Text>
      </View>

      {sleepHours.length > 0 ? (
        <View style={styles.sleepInfo}>
          <Text style={styles.sleepTitle}>Sleep Hours to Account For:</Text>
          <Text style={styles.sleepPeriod}>{formatSleepPeriod()}</Text>
          <Text style={styles.sleepCount}>
            ({sleepHours.length} hours will be marked as sleep)
          </Text>
        </View>
      ) : (
        <View style={styles.readyInfo}>
          <Text style={styles.readyTitle}>Ready to start tracking!</Text>
          <Text style={styles.readySubtitle}>
            I'll begin hourly productivity check-ins from now.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartDay}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>
          {isLoading ? 'Starting...' : 'Start Day & Track Productivity'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>What happens next:</Text>
        <Text style={styles.infoItem}>• Past hours marked as sleep time</Text>
        <Text style={styles.infoItem}>• Hourly productivity check-ins begin</Text>
        <Text style={styles.infoItem}>• Smart insights and feedback</Text>
      </View>
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
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  sleepInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  sleepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  sleepPeriod: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  sleepCount: {
    fontSize: 12,
    color: '#999',
  },
  startButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
    paddingLeft: 8,
  },
  completedContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  completedEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  readyInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  readySubtitle: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
});
