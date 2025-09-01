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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        <View style={{ paddingTop: insets.top }}>
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
              activityCount={activityHistory.length}
              onViewDetails={() => setShowReport(true)}
            />
          )}
          
          {/* Hourly Check-in */}
          <View style={styles.checkInSection}>
            <Text style={styles.checkInTitle}>
              {currentHour}:00 Check-in
            </Text>
            <View style={styles.titleUnderline} />
            
            {plannedTask && (
              <View style={styles.plannedTaskContainer}>
                <Text style={styles.plannedTaskLabel}>PLANNED TASK</Text>
                <Text style={styles.plannedTaskText}>{plannedTask}</Text>
              </View>
            )}

            <TextInput
              style={styles.activityInput}
              placeholder="What did you accomplish this hour?"
              value={activity}
              onChangeText={setActivity}
              multiline={true}
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              style={[styles.submitButton, (!activity.trim() || isLoading) && styles.disabledButton]}
              onPress={handleSubmitActivity}
              disabled={!activity.trim() || isLoading}
              activeOpacity={0.95}
            >
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
  // Base Layout - Matching SuccessPlan
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  // Check-in Section
  checkInSection: {
    marginBottom: 32,
  },
  checkInTitle: {
    fontSize: 42,
    fontWeight: '300', // Lighter weight for elegance
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
    fontFamily: 'System', // Will use SF Pro on iOS
    textAlign: 'center',
  },
  titleUnderline: {
    width: 60,
    height: 1,
    backgroundColor: '#D4AF37', // Luxury gold accent
    marginBottom: 24,
    alignSelf: 'center',
  },
  
  // Planned Task Container
  plannedTaskContainer: {
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  plannedTaskLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  plannedTaskText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 24,
  },
  
  // Activity Input
  activityInput: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 20,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  
  // Buttons
  submitButton: {
    backgroundColor: '#D4AF37', // Gold primary action
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B8941F',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Feedback Container
  feedbackContainer: {
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  feedbackPositive: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  feedbackCorrectiveWrapper: {
    backgroundColor: '#FFF7ED',
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  feedbackNeutral: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  feedbackMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 22,
  },
  adjustmentText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 12,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  
  // Report Button
  reportButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Report Container
  reportContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    maxHeight: '80%', // Allow report to take most of screen
    minHeight: 300,   // Ensure minimum height
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
