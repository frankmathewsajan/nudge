import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GoalResponse } from '../../utils/geminiAI';

const { width: screenWidth } = Dimensions.get('window');

interface AutoSchedulerProps {
  goals: string;
  response: GoalResponse;
  onComplete: () => void;
}

interface ScheduledAction {
  type: 'calendar' | 'alarm' | 'notification' | 'tracker';
  title: string;
  description: string;
  time?: string;
  frequency?: string;
  icon: string;
}

export const AutoScheduler: React.FC<AutoSchedulerProps> = ({ goals, response, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Generate scheduled actions based on the response
  useEffect(() => {
    const actions: ScheduledAction[] = [];

    // Add calendar blocks for urgent tasks
    response.urgent.forEach(task => {
      if (task.deadline) {
        actions.push({
          type: 'calendar',
          title: `${task.task} Block`,
          description: `${task.duration} time block scheduled`,
          time: task.suggested_time,
          icon: '📅'
        });
      }
    });

    // Add alarms for high priority tasks
    const highPriorityTasks = [...response.urgent, ...response.long_term].filter(task => task.priority <= 2);
    if (highPriorityTasks.length > 0) {
      actions.push({
        type: 'alarm',
        title: 'Morning Kickstart',
        description: `Alarm set for 9 AM - "${highPriorityTasks[0].task}"`,
        time: '9:00 AM',
        icon: '⏰'
      });
    }

    // Add hourly check notifications for urgent tasks
    response.urgent.forEach(task => {
      actions.push({
        type: 'notification',
        title: 'Progress Check',
        description: `Hourly reminder: "Still working on ${task.task}?"`,
        frequency: 'Hourly during work time',
        icon: '🔔'
      });
    });

    // Add streak trackers for daily/weekly tasks
    const habitTasks = [...response.long_term, ...response.maintenance].filter(
      task => task.frequency === 'daily' || task.frequency === 'weekly'
    );
    habitTasks.forEach(task => {
      actions.push({
        type: 'tracker',
        title: `${task.task} Streak`,
        description: `Track your ${task.frequency} progress`,
        frequency: task.frequency,
        icon: '🎯'
      });
    });

    setScheduledActions(actions);
  }, [response]);

  // Auto-advance through steps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < scheduledActions.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          // Auto complete after showing all actions
          setTimeout(() => {
            onComplete();
          }, 2000);
          return prev;
        }
      });
    }, 1500); // Show each action for 1.5 seconds

    return () => clearInterval(timer);
  }, [scheduledActions.length, onComplete]);

  // Animation setup
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Reset animations when step changes
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const ActionCard: React.FC<{ action: ScheduledAction }> = ({ action }) => {
    const getTypeColor = () => {
      switch (action.type) {
        case 'calendar': return '#4285F4'; // Google Blue
        case 'alarm': return '#FF6B35'; // Orange
        case 'notification': return '#34A853'; // Green
        case 'tracker': return '#9C27B0'; // Purple
        default: return '#666666';
      }
    };

    const getTypeLabel = () => {
      switch (action.type) {
        case 'calendar': return 'Calendar Block';
        case 'alarm': return 'Smart Alarm';
        case 'notification': return 'Progress Nudge';
        case 'tracker': return 'Streak Tracker';
        default: return 'System';
      }
    };

    return (
      <Animated.View
        style={[
          styles.actionCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            borderLeftColor: getTypeColor(),
          },
        ]}
      >
        <View style={styles.actionHeader}>
          <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.typeText}>{getTypeLabel()}</Text>
          </View>
          <Text style={styles.actionIcon}>{action.icon}</Text>
        </View>
        
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{action.title}</Text>
          <Text style={styles.actionDescription}>{action.description}</Text>
          
          {action.time && (
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Time: {action.time}</Text>
            </View>
          )}
          
          {action.frequency && (
            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyLabel}>Frequency: {action.frequency}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  if (scheduledActions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Setting up your success system...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentAction = scheduledActions[currentStep];
  const progress = ((currentStep + 1) / scheduledActions.length) * 100;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFEFE" />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.mainTitle}>Auto-Scheduling</Text>
              <View style={styles.titleUnderline} />
              <Text style={styles.subtitle}>
                Setting up your personalized success system
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {scheduledActions.length}
              </Text>
            </View>

            {/* Current Action */}
            <View style={styles.actionContainer}>
              <ActionCard action={currentAction} />
            </View>

            {/* Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>What's Being Set Up:</Text>
              <View style={styles.summaryList}>
                {scheduledActions.map((action, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.summaryItem,
                      index <= currentStep && styles.summaryItemCompleted
                    ]}
                  >
                    <Text style={styles.summaryIcon}>
                      {index <= currentStep ? '✓' : '○'}
                    </Text>
                    <Text style={styles.summaryText}>{action.title}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Skip Button */}
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={onComplete}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip Setup</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '300',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 1,
    backgroundColor: '#D4AF37',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Progress
  progressContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },

  // Action Card
  actionContainer: {
    marginBottom: 40,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {},
  actionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 16,
  },
  timeContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  frequencyContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },

  // Summary
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  summaryList: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryItemCompleted: {
    opacity: 1,
  },
  summaryIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    width: 20,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },

  // Action Button
  actionButtonContainer: {
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
});
