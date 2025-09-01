import { FontAwesome } from '@expo/vector-icons';
import { MeshGradient } from '@kuss/react-native-mesh-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DailyReport, ProductivityFeedback } from '../../utils/geminiAI';
import { generateDailyReport, processHourlyActivity } from '../../utils/geminiAI';
import {
  addActivityToCache,
  cacheReport,
  generateInputHash,
  getCachedActivities,
  getCachedReport
} from '../../utils/insightCache';
import { StartDay } from './StartDay';
import { TodayOverview } from './TodayOverview';

interface ProductivityTrackerProps {
  userId?: string;
  plannedTask?: string;
  onScheduleUpdate?: (needsUpdate: boolean) => void;
}

export function ProductivityTracker({ 
  userId = 'default', 
  plannedTask,
  onScheduleUpdate 
}: ProductivityTrackerProps) {
  const [activity, setActivity] = useState('');
  const [feedback, setFeedback] = useState<ProductivityFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [currentHour] = useState(new Date().getHours());
  const [lastReportHash, setLastReportHash] = useState<string>('');
  const [isReportCached, setIsReportCached] = useState(false);
  const [dayStarted, setDayStarted] = useState(false);
  
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const reportAnimation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Load cached activities on component mount
  const [activityHistory, setActivityHistory] = useState<string[]>(() => 
    getCachedActivities(userId)
  );

  useEffect(() => {
    if (feedback) {
      Animated.spring(feedbackAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [feedback, feedbackAnimation]);

  useEffect(() => {
    if (showReport) {
      Animated.spring(reportAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [showReport, reportAnimation]);

  const handleSubmitActivity = async () => {
    if (!activity.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await processHourlyActivity(activity, userId, plannedTask);
      setFeedback(result.feedback);
      
      // Add to activity history and cache
      const newActivity = activity.trim();
      setActivityHistory(prev => [...prev, newActivity]);
      addActivityToCache(userId, newActivity);
      
      // Notify parent if schedule needs adjustment
      if (result.feedback.schedule_adjustment && onScheduleUpdate) {
        onScheduleUpdate(true);
      }
      
      setActivity('');
    } catch (error) {
      console.error('Error processing activity:', error);
      setFeedback({
        message: 'Activity tracked successfully',
        tone: 'neutral',
        suggestions: [],
        schedule_adjustment: false
      });
    }
    setIsLoading(false);
  };

  const generateReport = async () => {
    const currentInputHash = generateInputHash(userId, activityHistory);
    
    // Check if we already have this exact report
    if (lastReportHash === currentInputHash && dailyReport) {
      setIsReportCached(true);
      setShowReport(true);
      return;
    }
    
    // Check cache for existing valid report
    const cachedReport = getCachedReport(userId, currentInputHash);
    if (cachedReport) {
      setDailyReport(cachedReport);
      setLastReportHash(currentInputHash);
      setIsReportCached(true);
      setShowReport(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const report = await generateDailyReport(userId);
      setDailyReport(report);
      setLastReportHash(currentInputHash);
      setIsReportCached(false);
      
      // Cache the report
      cacheReport(userId, report, currentInputHash);
      
      setShowReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
    }
    setIsLoading(false);
  };

  const getFeedbackStyle = (tone: string) => {
    switch (tone) {
      case 'positive': return styles.feedbackPositive;
      case 'corrective': return styles.feedbackCorrectiveWrapper;
      default: return styles.feedbackNeutral;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F5FF" />
      <SafeAreaView style={styles.container}>
        <MeshGradient
          colors={['#F8F5FF', '#E7E0EC', '#FEF7FF']}
          style={styles.gradientBackground}
        />
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Start Day Component - only show if day hasn't started */}
          {!dayStarted && activityHistory.length === 0 && (
            <StartDay onDayStarted={() => setDayStarted(true)} />
          )}

          {/* Today Overview - show when day has started */}
          {(dayStarted || activityHistory.length > 0) && (
            <TodayOverview 
              onViewDetails={() => setShowReport(true)}
            />
          )}
          
          {/* Hourly Check-in */}
          <View style={styles.checkInSection}>
            <View style={styles.checkInHeader}>
              <FontAwesome name="clock-o" size={20} color="#6750A4" style={styles.checkInIcon} />
              <Text style={styles.checkInTitle}>
                {currentHour}:00 Check-in
              </Text>
            </View>
            
            {plannedTask && (
              <View style={styles.plannedTaskContainer}>
                <View style={styles.plannedTaskHeader}>
                  <FontAwesome name="bullseye" size={16} color="#6750A4" />
                  <Text style={styles.plannedTaskLabel}>PLANNED TASK</Text>
                </View>
                <Text style={styles.plannedTaskText}>{plannedTask}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.activityInput}
                placeholder="What did you accomplish this hour?"
                value={activity}
                onChangeText={setActivity}
                multiline={true}
                placeholderTextColor="#79747E"
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, (!activity.trim() || isLoading) && styles.disabledButton]}
              onPress={handleSubmitActivity}
              disabled={!activity.trim() || isLoading}
              activeOpacity={0.95}
            >
              <FontAwesome 
                name={isLoading ? "spinner" : "paper-plane"} 
                size={16} 
                color="#FFFFFF" 
                style={styles.submitIcon}
              />
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Processing...' : 'Submit Activity'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Display */}
          {feedback && (
            <Animated.View 
              style={[
                styles.feedbackContainer,
                getFeedbackStyle(feedback.tone),
                {
                  opacity: feedbackAnimation,
                  transform: [{ scale: feedbackAnimation }]
                }
              ]}
            >
              <Text style={styles.feedbackMessage}>
                {feedback.message}
              </Text>
              
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsLabel}>
                    SUGGESTIONS:
                  </Text>
                  {feedback.suggestions.map((suggestion: string, index: number) => (
                    <Text key={index} style={styles.suggestionText}>
                      • {suggestion}
                    </Text>
                  ))}
                </View>
              )}
              
              {feedback.schedule_adjustment && (
                <Text style={styles.adjustmentText}>
                  Your schedule has been adjusted based on this activity.
                </Text>
              )}
            </Animated.View>
          )}

          {/* Daily Report Button */}
          <TouchableOpacity 
            style={[styles.reportButton, isLoading && styles.disabledButton]}
            onPress={generateReport}
            disabled={isLoading}
            activeOpacity={0.95}
          >
            <Text style={styles.reportButtonText}>
              {isLoading ? 'Generating...' : (showReport && isReportCached ? 'View Cached Report' : 'View Daily Report')}
            </Text>
          </TouchableOpacity>

          {/* Daily Report Display */}
          {showReport && dailyReport && (
            <Animated.View 
              style={[
                styles.reportContainer,
                {
                  opacity: reportAnimation,
                  transform: [{ translateY: Animated.multiply(reportAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  }), 1) }]
                }
              ]}
            >
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Daily Report</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowReport(false)}
                  activeOpacity={0.95}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.reportContent} 
                contentContainerStyle={styles.reportContentContainer}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {/* Productivity Metrics */}
                <View style={styles.metricContainer}>
                  <Text style={styles.metricTitle}>PRODUCTIVITY OVERVIEW</Text>
                  <Text style={styles.metricText}>
                    {dailyReport.productive_hours}h productive • {dailyReport.neutral_hours}h neutral • {dailyReport.wasted_hours}h wasted
                  </Text>
                  <Text style={styles.metricText}>
                    Overall: {dailyReport.productivity_percentage.toFixed(1)}% productive
                  </Text>
                  <Text style={styles.metricText}>
                    Goal alignment: {dailyReport.goal_alignment_score.toFixed(1)}%
                  </Text>
                </View>

                {/* Streak Updates */}
                {dailyReport.streak_updates.length > 0 && (
                  <View style={styles.streakContainer}>
                    <Text style={styles.streakTitle}>STREAK UPDATES</Text>
                    {dailyReport.streak_updates.map((streak: any, index: number) => (
                      <View key={index} style={styles.streakItem}>
                        <Text style={styles.streakTask}>{streak.task}</Text>
                        <Text style={styles.streakCount}>
                          {streak.current_streak} days {streak.completed_today ? '✓' : '○'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Insights */}
                <View style={styles.insightContainer}>
                  <Text style={styles.insightTitle}>INSIGHTS</Text>
                  {dailyReport.insights.map((insight: string, index: number) => (
                    <Text key={index} style={styles.insightText}>
                      • {insight}
                    </Text>
                  ))}
                </View>

                {/* Tomorrow Suggestions */}
                <View style={styles.tomorrowContainer}>
                  <Text style={styles.tomorrowTitle}>TOMORROW&apos;S FOCUS</Text>
                  {dailyReport.tomorrow_suggestions.map((suggestion: string, index: number) => (
                    <Text key={index} style={styles.tomorrowText}>
                      • {suggestion}
                    </Text>
                  ))}
                </View>
              </ScrollView>
            </Animated.View>
          )}
        </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  // Base Layout - Modern Material Design 3
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
    position: 'relative',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  // Check-in Section
  checkInSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.5)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 224, 236, 0.5)',
  },
  checkInIcon: {
    marginRight: 8,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1B20',
    fontFamily: 'System',
  },
  
  // Planned Task Container
  plannedTaskContainer: {
    backgroundColor: 'rgba(255, 251, 254, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.5)',
  },
  plannedTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plannedTaskLabel: {
    fontSize: 12,
    color: '#49454F',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  plannedTaskText: {
    fontSize: 16,
    color: '#1D1B20',
    fontWeight: '500',
    lineHeight: 24,
    fontFamily: 'System',
  },
  
  // Input Container
  inputContainer: {
    marginBottom: 16,
  },
  activityInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1D1B20',
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.5)',
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  
  // Buttons
  submitButton: {
    backgroundColor: '#6750A4',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  
  // Feedback Container
  feedbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.5)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  feedbackPositive: {
    backgroundColor: 'rgba(232, 245, 233, 0.9)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  feedbackCorrectiveWrapper: {
    backgroundColor: 'rgba(255, 243, 224, 0.9)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  feedbackNeutral: {
    backgroundColor: 'rgba(243, 241, 255, 0.9)',
    borderLeftWidth: 4,
    borderLeftColor: '#6750A4',
  },
  feedbackMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1B20',
    marginBottom: 12,
    lineHeight: 24,
    fontFamily: 'System',
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: '#49454F',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1D1B20',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: 'System',
  },
  adjustmentText: {
    fontSize: 14,
    color: '#1D1B20',
    fontWeight: '600',
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 248, 225, 0.9)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  
  // Report Button
  reportButton: {
    backgroundColor: '#6750A4',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 20,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  
  // Report Container
  reportContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.5)',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    maxHeight: '80%',
    minHeight: 300,
    marginTop: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  reportContent: {
    flex: 1,
    maxHeight: '70%', // Use percentage instead of fixed height
  },
  reportContentContainer: {
    padding: 24,
    paddingBottom: 40, // Extra padding at bottom for better scrolling
  },
  
  // Report Sections
  metricContainer: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metricText: {
    fontSize: 16,
    color: '#15803D',
    marginBottom: 4,
    lineHeight: 22,
  },
  
  streakContainer: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  streakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTask: {
    fontSize: 16,
    color: '#1E40AF',
  },
  streakCount: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  
  insightContainer: {
    backgroundColor: '#FAF5FF',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B21A8',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 16,
    color: '#7C3AED',
    marginBottom: 8,
    lineHeight: 22,
  },
  
  tomorrowContainer: {
    backgroundColor: '#FFF7ED',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  tomorrowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C2410C',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tomorrowText: {
    fontSize: 16,
    color: '#EA580C',
    marginBottom: 8,
    lineHeight: 22,
  },
});
