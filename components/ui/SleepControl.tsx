import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    getCurrentSleepSession,
    getSleepStats,
    isUserAsleep,
    startSleep,
    wakeUp,
    type SleepSession
} from '../../utils/sleepState';

interface SleepControlProps {
  onSleepStateChange?: (isAsleep: boolean) => void;
}

export function SleepControl({ onSleepStateChange }: SleepControlProps) {
  const [isAsleep, setIsAsleep] = useState(false);
  const [currentSession, setCurrentSession] = useState<SleepSession | null>(null);
  const [sleepDuration, setSleepDuration] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSleepState();
    
    // Update sleep duration every minute if asleep
    let interval: ReturnType<typeof setInterval>;
    if (isAsleep && currentSession) {
      interval = setInterval(() => {
        updateSleepDuration();
      }, 60000); // Update every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAsleep, currentSession]);

  const loadSleepState = async () => {
    try {
      const asleep = await isUserAsleep();
      const session = await getCurrentSleepSession();
      
      setIsAsleep(asleep);
      setCurrentSession(session);
      
      if (asleep && session) {
        updateSleepDuration(session);
      }
    } catch (error) {
      console.error('Error loading sleep state:', error);
    }
  };

  const updateSleepDuration = (session: SleepSession | null = currentSession) => {
    if (session) {
      const now = new Date();
      const duration = (now.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
      setSleepDuration(`${duration.toFixed(1)} hours`);
    }
  };

  const handleStartSleep = async () => {
    setIsLoading(true);
    try {
      await startSleep();
      await loadSleepState();
      onSleepStateChange?.(true);
      
      Alert.alert(
        '😴 Sleep Mode Activated',
        'Productivity notifications have been paused. Sweet dreams!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error starting sleep:', error);
      Alert.alert('Error', 'Failed to start sleep mode. Please try again.');
    }
    setIsLoading(false);
  };

  const handleWakeUp = async () => {
    setIsLoading(true);
    try {
      await wakeUp();
      await loadSleepState();
      onSleepStateChange?.(false);
      
      const stats = await getSleepStats();
      const lastSleep = stats.lastSleepDuration;
      
      Alert.alert(
        '☀️ Good Morning!',
        `You slept for ${lastSleep?.toFixed(1) || 'some'} hours. Productivity notifications are now active for the rest of the day!`,
        [{ text: 'Let\'s be productive!' }]
      );
    } catch (error) {
      console.error('Error waking up:', error);
      Alert.alert('Error', 'Failed to wake up. Please try again.');
    }
    setIsLoading(false);
  };

  const confirmSleepAction = (action: 'sleep' | 'wake') => {
    if (action === 'sleep') {
      Alert.alert(
        '😴 Start Sleep Mode?',
        'This will pause all productivity notifications until you wake up. Sweet dreams!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sleep', onPress: handleStartSleep }
        ]
      );
    } else {
      Alert.alert(
        '☀️ Wake Up?',
        'This will resume productivity notifications and schedule check-ins for the rest of the day.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Wake Up', onPress: handleWakeUp }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep & Wake</Text>
        <Text style={styles.subtitle}>
          Manage your productivity notifications based on your sleep schedule
        </Text>
      </View>

      {isAsleep ? (
        <View style={styles.sleepStatus}>
          <Text style={styles.statusEmoji}>😴</Text>
          <Text style={styles.statusTitle}>You're sleeping</Text>
          <Text style={styles.statusSubtitle}>
            Asleep for: {sleepDuration}
          </Text>
          <Text style={styles.statusDescription}>
            Productivity notifications are paused
          </Text>
          
          <TouchableOpacity
            style={styles.wakeButton}
            onPress={() => confirmSleepAction('wake')}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.wakeButtonText}>
              {isLoading ? 'Waking up...' : '☀️ Wake Up'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.awakeStatus}>
          <Text style={styles.statusEmoji}>☀️</Text>
          <Text style={styles.statusTitle}>You're awake</Text>
          <Text style={styles.statusDescription}>
            Productivity notifications are active
          </Text>
          
          <TouchableOpacity
            style={styles.sleepButton}
            onPress={() => confirmSleepAction('sleep')}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.sleepButtonText}>
              {isLoading ? 'Going to sleep...' : '😴 Start Sleep'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <Text style={styles.infoItem}>• Sleep mode pauses hourly check-ins</Text>
        <Text style={styles.infoItem}>• Wake up resumes notifications for the day</Text>
        <Text style={styles.infoItem}>• Auto-wake after 12 hours for safety</Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  sleepStatus: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  awakeStatus: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 8,
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  sleepButton: {
    backgroundColor: '#4A5568',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sleepButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  wakeButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  wakeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoSection: {
    marginTop: 20,
    paddingTop: 20,
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
});
