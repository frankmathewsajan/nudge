/**
 * GoalPlanningScreen - Claude-style goal breakdown and planning
 * 
 * Shows after a user submits a goal, provides planning and alarm setup
 * functionality similar to Claude's interface.
 */

import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createGoalPlanningStyles } from '../../assets/styles/goals/goal-planning.styles';
import { useTheme } from '../../contexts/ThemeContext';
import { GoalAnalysisResponse } from '../../services/geminiService';
import AnimatedBackground from '../ui/AnimatedBackground';
import { TerminalLoader } from '../ui/TerminalLoader';
import { ThemeToggle } from '../ui/ThemeToggle';

// Simple goal summarization function
const summarizeGoal = (goal: string): string => {
  if (goal.length <= 80) return goal;
  const words = goal.split(' ');
  if (words.length <= 12) return goal;
  return words.slice(0, 12).join(' ') + '...';
};

interface GoalPlanningScreenProps {
  goal: string;
  goalAnalysis?: GoalAnalysisResponse | null;
  isAnalyzing?: boolean;
  analysisError?: string | null;
  canRetry?: boolean;
  retryCount?: number;
  onBack?: () => void;
  onSetupAlarms?: () => void;
  onStartNow?: () => void;
  onRetry?: () => void;
}

/**
 * Ensure text is safe for display in UI
 */
const safeDisplayText = (text: string, maxLength: number = 200): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Goal planning screen with Claude-inspired design.
 * 
 * Features:
 * - Goal breakdown and analysis
 * - Time recommendations 
 * - Alarm/reminder setup
 * - Action buttons for next steps
 */
export const GoalPlanningScreen: React.FC<GoalPlanningScreenProps> = ({
  goal,
  goalAnalysis,
  isAnalyzing = false,
  analysisError = null,
  canRetry = false,
  retryCount = 0,
  onBack,
  onSetupAlarms,
  onStartNow,
  onRetry
}) => {
  const { theme, toggleTheme } = useTheme();
  const styles = createGoalPlanningStyles(theme);
  const insets = useSafeAreaInsets();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Use the provided goal (already summarized) or fallback to summarization
  const displayGoal = goal.length <= 80 ? goal : summarizeGoal(goal);
  const planningData = goalAnalysis ? {
    title: `Planning for: "${displayGoal}"`,
    analysis: goalAnalysis.primary_goal.analysis,
    timeRecommendation: goalAnalysis.primary_goal.time_recommendation,
    sessionStructure: goalAnalysis.primary_goal.session_structure,
    steps: goalAnalysis.primary_goal.smart_breakdown,
    timeSlots: goalAnalysis.recommended_sessions.map((session, index) => ({
      id: `${index}`,
      label: session.duration,
      description: session.type,
      details: session.description,
      bestFor: session.best_for
    })),
    milestones: goalAnalysis.primary_goal.progress_milestones,
    motivationTips: goalAnalysis.primary_goal.motivation_tips,
    obstacles: goalAnalysis.primary_goal.common_obstacles,
    resources: goalAnalysis.primary_goal.resources_needed,
    nextActions: goalAnalysis.next_actions,
    difficulty: goalAnalysis.primary_goal.difficulty,
    timeline: goalAnalysis.primary_goal.estimated_timeline,
    // V2 Enhanced Features
    timeBlocks: goalAnalysis.time_blocks || [],
    sleepOptimization: goalAnalysis.sleep_optimization,
    energyManagement: goalAnalysis.energy_management,
    scheduleSuggestions: goalAnalysis.schedule_suggestions || []
  } : {
    // Fallback data when API hasn't responded yet or failed
    title: `Planning for: "${displayGoal}"`,
    analysis: "Analyzing your goal to provide personalized recommendations...",
    timeRecommendation: "Please wait while we analyze your goal to provide optimal time recommendations.",
    sessionStructure: "Session structure will be provided once analysis is complete.",
    steps: [
      "Analysis in progress...",
      "Please wait for personalized recommendations",
    ],
    timeSlots: [
      { id: '30min', label: '30 minutes', description: 'Quick sessions', details: 'Short focused work periods', bestFor: ['daily habits'] },
      { id: '60min', label: '60 minutes', description: 'Standard focus', details: 'Regular practice sessions', bestFor: ['skill building'] },
      { id: '90min', label: '90 minutes', description: 'Deep work', details: 'Intensive learning sessions', bestFor: ['complex projects'] },
    ],
    milestones: ["Milestones will be provided after analysis"],
    motivationTips: "Motivation tips will be personalized based on your goal.",
    obstacles: ["Common obstacles will be identified after analysis"],
    resources: ["Resource recommendations coming soon..."],
    nextActions: ["Wait for analysis to complete", "Review recommendations", "Choose your session duration"],
    difficulty: "intermediate",
    timeline: "Timeline will be provided after analysis",
    // V2 Enhanced Features - Fallback
    timeBlocks: [],
    sleepOptimization: "Sleep optimization recommendations will be provided after analysis.",
    energyManagement: "Energy management tips will be personalized based on your goal and schedule.",
    scheduleSuggestions: []
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      
      {/* Animated Background */}
      <AnimatedBackground intensity="subtle" />
      
      <ThemeToggle onToggle={toggleTheme} theme={theme} safeAreaTop={insets.top} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Planning</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goal Title with AI Status */}
        <View style={styles.goalSection}>
          <View style={styles.goalIconContainer}>
            {isAnalyzing ? (
              <ActivityIndicator size="small" color={theme.colors.buttonActiveText} />
            ) : (
              <MaterialIcons name="flag" size={24} color={theme.colors.buttonActiveText} />
            )}
          </View>
          <Text style={styles.goalTitle}>{safeDisplayText(planningData.title, 150)}</Text>
          {isAnalyzing && (
            <Text style={styles.loadingText}>AI is analyzing your goal...</Text>
          )}
          {analysisError && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={16} color={theme.colors.accent} />
              <View style={styles.errorContent}>
                <Text style={styles.errorText}>
                  {safeDisplayText(analysisError, 200)}
                </Text>
                {canRetry && onRetry && (
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={onRetry}
                    disabled={isAnalyzing}
                  >
                    <MaterialIcons name="refresh" size={16} color={theme.colors.accentVibrant} />
                    <Text style={styles.retryText}>
                      Retry {retryCount > 0 ? `(${retryCount}/3)` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Terminal Loading Animation */}
        {isAnalyzing && (
          <TerminalLoader
            theme={theme}
            isVisible={isAnalyzing}
            stage="analyzing"
            onComplete={() => {
              // This will be called when analysis is complete
              console.log('Terminal animation completed');
            }}
          />
        )}

        {/* Analysis Section */}
        <View style={styles.section}>
          <Text style={styles.analysisText}>{safeDisplayText(planningData.analysis, 500)}</Text>
        </View>

        {/* Time Recommendation */}
        <View style={styles.section}>
          <Text style={styles.recommendationText}>{safeDisplayText(planningData.timeRecommendation, 400)}</Text>
        </View>

        {/* Session Structure (if available) */}
        {goalAnalysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Structure:</Text>
            <Text style={styles.bodyText}>{planningData.sessionStructure}</Text>
          </View>
        )}

        {/* Smart Breakdown Steps */}
        {goalAnalysis && planningData.steps.length > 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Action Steps:</Text>
            {planningData.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Time Slots Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your session duration:</Text>
          {planningData.timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlot,
                selectedTimeSlot === slot.id && styles.timeSlotSelected
              ]}
              onPress={() => handleTimeSlotSelect(slot.id)}
            >
              <View style={styles.timeSlotInfo}>
                <Text style={[
                  styles.timeSlotLabel,
                  selectedTimeSlot === slot.id && styles.timeSlotLabelSelected
                ]}>
                  {slot.label}
                </Text>
                <Text style={[
                  styles.timeSlotDescription,
                  selectedTimeSlot === slot.id && styles.timeSlotDescriptionSelected
                ]}>
                  {slot.description}
                </Text>
                {slot.details && (
                  <Text style={styles.bodyText}>{slot.details}</Text>
                )}
                {goalAnalysis && slot.bestFor && (
                  <Text style={styles.bodyText}>
                    Best for: {slot.bestFor.join(', ')}
                  </Text>
                )}
              </View>
              {selectedTimeSlot === slot.id && (
                <MaterialIcons name="check-circle" size={20} color={theme.colors.accentVibrant} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional AI-Generated Sections */}
        {goalAnalysis && (
          <>
            {/* Progress Milestones */}
            {planningData.milestones.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Progress Milestones:</Text>
                {planningData.milestones.map((milestone, index) => (
                  <View key={index} style={styles.stepItem}>
                    <MaterialIcons name="flag" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                    <Text style={styles.bodyText}>{milestone}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Motivation Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Motivation Tips:</Text>
              <Text style={styles.bodyText}>{planningData.motivationTips}</Text>
            </View>

            {/* Common Obstacles */}
            {planningData.obstacles.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Potential Challenges & Solutions:</Text>
                {planningData.obstacles.map((obstacle, index) => (
                  <View key={index} style={styles.stepItem}>
                    <MaterialIcons name="warning" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                    <Text style={styles.bodyText}>{obstacle}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Next Actions */}
            {planningData.nextActions.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Next Actions:</Text>
                {planningData.nextActions.map((action, index) => (
                  <View key={index} style={styles.stepItem}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <Text style={styles.stepText}>{action}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* V2 Enhanced Features - Time Management */}
            {planningData.timeBlocks && planningData.timeBlocks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Optimal Time Blocks:</Text>
                {planningData.timeBlocks.map((block: any, index: number) => (
                  <View key={index} style={styles.stepItem}>
                    <MaterialIcons name="schedule" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                    <Text style={styles.bodyText}>
                      <Text style={{fontWeight: 'bold'}}>{block.period}:</Text> {block.activity} ({block.duration})
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Sleep Optimization */}
            {planningData.sleepOptimization && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sleep & Recovery:</Text>
                <View style={styles.stepItem}>
                  <MaterialIcons name="bedtime" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                  <Text style={styles.bodyText}>{planningData.sleepOptimization}</Text>
                </View>
              </View>
            )}

            {/* Energy Management */}
            {planningData.energyManagement && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Energy Management:</Text>
                {typeof planningData.energyManagement === 'string' ? (
                  <View style={styles.stepItem}>
                    <MaterialIcons name="bolt" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                    <Text style={styles.bodyText}>{planningData.energyManagement}</Text>
                  </View>
                ) : (
                  <>
                    {planningData.energyManagement.peak_hours && (
                      <View style={styles.stepItem}>
                        <MaterialIcons name="trending-up" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                        <Text style={styles.bodyText}>
                          <Text style={{fontWeight: 'bold'}}>Peak Energy:</Text> {planningData.energyManagement.peak_hours.join(', ')}
                        </Text>
                      </View>
                    )}
                    {planningData.energyManagement.high_energy_tasks && planningData.energyManagement.high_energy_tasks.length > 0 && (
                      <View style={styles.stepItem}>
                        <MaterialIcons name="flash-on" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                        <Text style={styles.bodyText}>
                          <Text style={{fontWeight: 'bold'}}>High Energy Tasks:</Text> {planningData.energyManagement.high_energy_tasks.join(', ')}
                        </Text>
                      </View>
                    )}
                    {planningData.energyManagement.low_energy_tasks && planningData.energyManagement.low_energy_tasks.length > 0 && (
                      <View style={styles.stepItem}>
                        <MaterialIcons name="battery-saver" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                        <Text style={styles.bodyText}>
                          <Text style={{fontWeight: 'bold'}}>Low Energy Tasks:</Text> {planningData.energyManagement.low_energy_tasks.join(', ')}
                        </Text>
                      </View>
                    )}
                    {planningData.energyManagement.break_recommendations && planningData.energyManagement.break_recommendations.length > 0 && (
                      <>
                        <View style={styles.stepItem}>
                          <MaterialIcons name="free-breakfast" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                          <Text style={styles.bodyText}>
                            <Text style={{fontWeight: 'bold'}}>Break Recommendations:</Text>
                          </Text>
                        </View>
                        {planningData.energyManagement.break_recommendations.map((breakRec: any, idx: number) => (
                          <View key={idx} style={[styles.stepItem, {marginLeft: 24}]}>
                            <Text style={styles.bodyText}>
                              • {breakRec.type} ({breakRec.duration_minutes}min): {breakRec.activity}
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Schedule Suggestions */}
            {planningData.scheduleSuggestions && planningData.scheduleSuggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Schedule Suggestions:</Text>
                {planningData.scheduleSuggestions.map((suggestion: string, index: number) => (
                  <View key={index} style={styles.stepItem}>
                    <MaterialIcons name="event" size={16} color={theme.colors.accent} style={{marginRight: 8, marginTop: 3}} />
                    <Text style={styles.bodyText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={onSetupAlarms}>
            <MaterialIcons name="schedule" size={20} color={theme.colors.buttonActiveText} />
            <Text style={styles.primaryButtonText}>Setup Reminders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={onStartNow}>
            <MaterialIcons name="play-arrow" size={20} color={theme.colors.textPrimary} />
            <Text style={styles.secondaryButtonText}>Start Now</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};