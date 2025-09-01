import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        'Start Your Day',
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
                  'Day Started!',
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
        <View style={styles.completedIconContainer}>
          <FontAwesome name="check-circle" size={32} color="#4CAF50" />
        </View>
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
      <LinearGradient
        style={styles.gradientBackground}
        colors={['#1A0E3D', '#4C1D95', '#7C3AED', '#A855F7']}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FontAwesome name="sun-o" size={32} color="#F57C00" />
          </View>
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
          <FontAwesome name="play" size={16} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.startButtonText}>
            {isLoading ? 'Starting...' : 'Start Day & Track Productivity'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What happens next:</Text>
          <View style={styles.infoItem}>
            <FontAwesome name="moon-o" size={12} color="#49454F" style={styles.infoIcon} />
            <Text style={styles.infoText}>Past hours marked as sleep time</Text>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome name="clock-o" size={12} color="#49454F" style={styles.infoIcon} />
            <Text style={styles.infoText}>Hourly productivity check-ins begin</Text>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome name="lightbulb-o" size={12} color="#49454F" style={styles.infoIcon} />
            <Text style={styles.infoText}>Smart insights and feedback</Text>
          </View>
        </View>
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
    shadowOffset: { width: 0, height: 4 },
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
    marginBottom: 24,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3C2A21', // Rich brown text
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B5B73', // Muted lavender
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#8B7355', // Warm brown
    fontWeight: '500',
    fontFamily: 'System',
  },
  sleepInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(103, 80, 164, 0.2)',
  },
  sleepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6750A4',
    marginBottom: 8,
    fontFamily: 'System',
  },
  sleepPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1B20',
    marginBottom: 4,
    fontFamily: 'System',
  },
  sleepCount: {
    fontSize: 12,
    color: '#49454F',
    fontFamily: 'System',
  },
  readyInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  readySubtitle: {
    fontSize: 14,
    color: '#3C2A21', // Rich brown
    lineHeight: 20,
    fontFamily: 'System',
  },
  startButton: {
    backgroundColor: '#6750A4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    flexShrink: 1,
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B5B73', // Muted lavender
    marginBottom: 12,
    fontFamily: 'System',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexShrink: 1,
  },
  infoIcon: {
    marginRight: 8,
    width: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#3C2A21', // Rich brown
    fontFamily: 'System',
    flex: 1,
    flexWrap: 'wrap',
  },
  completedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  completedIconContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C2A21', // Rich brown
    marginBottom: 8,
    fontFamily: 'System',
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#6B5B73', // Muted lavender
    textAlign: 'center',
    fontFamily: 'System',
  },
  
  // Legacy styles (keep for compatibility but unused)
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  completedEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
});
