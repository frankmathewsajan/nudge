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
import { InteractiveGoalsInput } from '../components/ui/InteractiveGoalsInput';
import { OnboardingFlow } from '../components/ui/OnboardingFlow';
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

  // Show success plan if we have a response
  if (aiResponse) {
    return <SuccessPlan goals={goals} response={aiResponse} onNewGoals={handleNewGoals} />;
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
