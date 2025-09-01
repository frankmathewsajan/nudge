import { FontAwesome } from '@expo/vector-icons';
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
        'Sleep Mode Activated',
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
        'Good Morning!',
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
        'Start Sleep Mode?',
        'This will pause all productivity notifications until you wake up. Sweet dreams!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sleep', onPress: handleStartSleep }
        ]
      );
    } else {
      Alert.alert(
        'Wake Up?',
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
      {isAsleep ? (
        <View style={styles.sleepStatus}>
          <View style={styles.iconContainer}>
            <FontAwesome name="moon-o" size={24} color="#6750A4" />
          </View>
          <Text style={styles.statusTitle}>Sleeping</Text>
          <Text style={styles.statusSubtitle}>
            {sleepDuration}
          </Text>
          
          <TouchableOpacity
            style={styles.wakeButton}
            onPress={() => confirmSleepAction('wake')}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <FontAwesome name="sun-o" size={16} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.wakeButtonText}>
              {isLoading ? 'Waking up...' : 'Wake Up'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.awakeStatus}>
          <View style={styles.iconContainer}>
            <FontAwesome name="sun-o" size={24} color="#F57C00" />
          </View>
          <Text style={styles.statusTitle}>Awake</Text>
          <Text style={styles.statusDescription}>
            Notifications active
          </Text>
          
          <TouchableOpacity
            style={styles.sleepButton}
            onPress={() => confirmSleepAction('sleep')}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <FontAwesome name="moon-o" size={16} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.sleepButtonText}>
              {isLoading ? 'Going to sleep...' : 'Sleep'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E0EC',
    minHeight: 120,
  },
  sleepStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  awakeStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#EAE7F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1B20',
    marginBottom: 4,
    fontFamily: 'System',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#6750A4',
    marginBottom: 12,
    fontWeight: '500',
    fontFamily: 'System',
  },
  statusDescription: {
    fontSize: 12,
    color: '#49454F',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  sleepButton: {
    backgroundColor: '#6750A4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sleepButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  wakeButton: {
    backgroundColor: '#F57C00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  wakeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  buttonIcon: {
    marginRight: 6,
  },
  
  // Legacy styles (keep for compatibility but unused)
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
  statusEmoji: {
    fontSize: 48,
    marginBottom: 12,
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
