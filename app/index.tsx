import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { AILoadingScreen } from '../components/ui/AILoadingScreen';
import { AutoScheduler } from '../components/ui/AutoScheduler';
import { InteractiveGoalsInput } from '../components/ui/InteractiveGoalsInput';
import { OnboardingFlow } from '../components/ui/OnboardingFlow';
import { ProductivityDashboard } from '../components/ui/ProductivityDashboard';
import { SchedulingComplete } from '../components/ui/SchedulingComplete';
import {
    BodyText,
    Container,
    HeadlineText,
} from '../components/ui/StyledComponents';
import { SuccessPlan } from '../components/ui/SuccessPlan';
import { GoalResponse, sendGoalsToGemini } from '../utils/geminiAI';

export default function HomeScreen() {
  const [goals, setGoals] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<GoalResponse | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedulingComplete, setSchedulingComplete] = useState(false);
  const [showProductivityTracker, setShowProductivityTracker] = useState(false);
  const [currentPlannedTask, setCurrentPlannedTask] = useState<string>();

  const handleSendGoals = async () => {
    if (!goals.trim()) {
      Alert.alert('Please enter your goals', 'Tell us what you want to achieve!');
      return;
    }

    console.log('Starting goal analysis for:', goals);
    setIsLoading(true);
    try {
      const response = await sendGoalsToGemini(goals);
      console.log('Received response from API:', response);
      setAiResponse(response);
      console.log('Updated UI with response');
    } catch (error) {
      console.error('Error sending goals:', error);
      Alert.alert('Error', 'Failed to analyze your goals. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('Goal analysis complete');
    }
  };

  const handleGetStarted = () => {
    setHasGreeted(true);
  };

  const handleNewGoals = () => {
    setGoals('');
    setAiResponse(null);
    setIsScheduling(false);
    setSchedulingComplete(false);
    setShowProductivityTracker(false);
    setCurrentPlannedTask(undefined);
  };

  const handleConfirmPlan = () => {
    setIsScheduling(true);
  };

  const handleSchedulingComplete = () => {
    setIsScheduling(false);
    setSchedulingComplete(true);
  };

  const handleBackToHome = () => {
    setGoals('');
    setAiResponse(null);
    setIsScheduling(false);
    setSchedulingComplete(false);
    setShowProductivityTracker(false);
    setCurrentPlannedTask(undefined);
  };

  const handleStartTracking = () => {
    setSchedulingComplete(false);
    setShowProductivityTracker(true);
    
    // Extract first task from urgent tasks as current planned task
    if (aiResponse?.urgent?.length) {
      setCurrentPlannedTask(aiResponse.urgent[0].task);
    } else if (aiResponse?.long_term?.length) {
      setCurrentPlannedTask(aiResponse.long_term[0].task);
    }
  };

  const handleScheduleUpdate = (needsUpdate: boolean) => {
    if (needsUpdate) {
      // Handle schedule adjustment if needed
      console.log('Schedule needs adjustment based on productivity feedback');
    }
  };

  // Show onboarding if not greeted
  if (!hasGreeted) {
    return (
      <SafeAreaView style={styles.container}>
        <OnboardingFlow onComplete={handleGetStarted} />
      </SafeAreaView>
    );
  }

  // Show loading screen while processing
  if (isLoading) {
    return <AILoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  // Show auto-scheduler after plan confirmation
  if (isScheduling && aiResponse) {
    return (
      <AutoScheduler 
        goals={goals} 
        response={aiResponse} 
        onComplete={handleSchedulingComplete} 
      />
    );
  }

  // Show productivity tracker after scheduling complete
  if (showProductivityTracker) {
    return (
      <ProductivityDashboard 
        userId="default"
        plannedTask={currentPlannedTask}
        onScheduleUpdate={handleScheduleUpdate}
        onBackToGoals={handleBackToHome}
      />
    );
  }

  // Show completion screen after scheduling
  if (schedulingComplete) {
    return <SchedulingComplete onBackToHome={handleBackToHome} onStartTracking={handleStartTracking} />;
  }

  // Show success plan if we have a response
  if (aiResponse) {
    return (
      <SuccessPlan 
        goals={goals} 
        response={aiResponse} 
        onNewGoals={handleNewGoals}
        onConfirmPlan={handleConfirmPlan}
      />
    );
  }

  // Show goal input screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Container>
            <View style={styles.content}>
              <View style={styles.headerSection}>
                <HeadlineText>What drives you forward?</HeadlineText>
                <View style={styles.spacing} />
                <BodyText variant="medium">
                  Share your aspirations and watch our AI transform them into a roadmap for success
                </BodyText>
              </View>
              
              <View style={styles.inputSection}>
                <InteractiveGoalsInput
                  value={goals}
                  onChangeText={setGoals}
                  onSubmit={handleSendGoals}
                  disabled={isLoading}
                  isLoading={isLoading}
                />
              </View>
            </View>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  spacing: {
    height: 16,
  },
});
