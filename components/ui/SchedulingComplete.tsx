import React, { useEffect, useRef } from 'react';
import {
    Animated,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SchedulingCompleteProps {
  onBackToHome: () => void;
  onStartTracking?: () => void;
}

export const SchedulingComplete: React.FC<SchedulingCompleteProps> = ({ onBackToHome, onStartTracking }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
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
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFEFE" />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            {/* Success Icon */}
            <Animated.View 
              style={[
                styles.successIconContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <Text style={styles.successIcon}>✓</Text>
            </Animated.View>

            {/* Header */}
            <Animated.View 
              style={[
                styles.headerSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.mainTitle}>All Set!</Text>
              <View style={styles.titleUnderline} />
              <Text style={styles.subtitle}>
                Your personalized success system is now active
              </Text>
            </Animated.View>

            {/* Active Systems */}
            <Animated.View 
              style={[
                styles.systemsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.systemsTitle}>Active Systems:</Text>
              
              <View style={styles.systemCard}>
                <View style={styles.systemHeader}>
                  <Text style={styles.systemIcon}>📅</Text>
                  <Text style={styles.systemName}>Calendar Blocks</Text>
                </View>
                <Text style={styles.systemDescription}>
                  Time blocks automatically added for your priority tasks
                </Text>
              </View>

              <View style={styles.systemCard}>
                <View style={styles.systemHeader}>
                  <Text style={styles.systemIcon}>⏰</Text>
                  <Text style={styles.systemName}>Smart Alarms</Text>
                </View>
                <Text style={styles.systemDescription}>
                  9 AM alarm set: "Start Quiz Prep" 
                </Text>
              </View>

              <View style={styles.systemCard}>
                <View style={styles.systemHeader}>
                  <Text style={styles.systemIcon}>🔔</Text>
                  <Text style={styles.systemName}>Progress Nudges</Text>
                </View>
                <Text style={styles.systemDescription}>
                  Hourly check-ins: "Still working on quiz prep?"
                </Text>
              </View>

              <View style={styles.systemCard}>
                <View style={styles.systemHeader}>
                  <Text style={styles.systemIcon}>🎯</Text>
                  <Text style={styles.systemName}>Streak Trackers</Text>
                </View>
                <Text style={styles.systemDescription}>
                  Daily tracking for DSA, German, and Chess training
                </Text>
              </View>
            </Animated.View>

            {/* Next Steps */}
            <Animated.View 
              style={[
                styles.nextStepsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.nextStepsTitle}>What happens next:</Text>
              <View style={styles.stepsList}>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepText}>Check your calendar for scheduled blocks</Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepText}>Your 9 AM alarm will help you start strong</Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepText}>Progress notifications keep you on track</Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>4</Text>
                  <Text style={styles.stepText}>Build streaks with daily habit tracking</Text>
                </View>
              </View>
            </Animated.View>

            {/* Action Button */}
            <Animated.View 
              style={[
                styles.actionContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {onStartTracking && (
                <TouchableOpacity 
                  style={styles.trackingButton}
                  onPress={onStartTracking}
                  activeOpacity={0.95}
                >
                  <Text style={styles.trackingButtonText}>Start Productivity Tracking</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.homeButton}
                onPress={onBackToHome}
                activeOpacity={0.95}
              >
                <Text style={styles.homeButtonText}>Create New Goals</Text>
              </TouchableOpacity>
            </Animated.View>

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

  // Success Icon
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  successIcon: {
    fontSize: 80,
    color: '#D4AF37',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#F8F6F0',
    width: 120,
    height: 120,
    lineHeight: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 42,
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
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
  },

  // Active Systems
  systemsContainer: {
    marginBottom: 40,
  },
  systemsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  systemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  systemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  systemDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },

  // Next Steps
  nextStepsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 24,
    marginBottom: 40,
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
    backgroundColor: '#F8F6F0',
    width: 28,
    height: 28,
    lineHeight: 28,
    textAlign: 'center',
    borderRadius: 14,
  },
  stepText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    flex: 1,
  },

  // Action
  actionContainer: {
    alignItems: 'center',
    gap: 16,
  },
  trackingButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#4f46e5',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 250,
  },
  trackingButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  homeButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#B8941F',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 250,
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
