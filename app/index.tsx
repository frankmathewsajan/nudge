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
  Divider,
  HeadlineText,
  PrimaryButton,
  SuccessCard,
  TitleText
} from '../components/ui/StyledComponents';
import { GoalResponse, sendGoalsToGemini } from '../utils/geminiAPI';

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

    setIsLoading(true);
    try {
      const response = await sendGoalsToGemini(goals);
      setAiResponse(response);
    } catch (error) {
      console.error('Error sending goals:', error);
      Alert.alert('Error', 'Failed to analyze your goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    setHasGreeted(true);
  };

  const handleReset = () => {
    setGoals('');
    setAiResponse(null);
    setHasGreeted(false);
  };

  if (!hasGreeted) {
    return (
      <SafeAreaView style={styles.container}>
        <OnboardingFlow onComplete={handleGetStarted} />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return <AILoadingScreen onComplete={() => setIsLoading(false)} />;
  }

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

              {aiResponse && (
                <View style={styles.responseSection}>
                  <SuccessCard>
                    <View style={styles.responseHeader}>
                      <TitleText>Your Personalized Success Plan</TitleText>
                      <BodyText variant="medium">Powered by AI Analysis</BodyText>
                    </View>
                    
                    <View style={styles.motivationSection}>
                      <View style={styles.sectionHeader}>
                        <TitleText>Motivation Boost</TitleText>
                      </View>
                      <BodyText variant="medium">{aiResponse.motivation}</BodyText>
                    </View>
                    
                    <Divider />
                    
                    <View style={styles.suggestionSection}>
                      <View style={styles.sectionHeader}>
                        <TitleText>Strategic Suggestions</TitleText>
                      </View>
                      {aiResponse.suggestions.map((suggestion, index) => (
                        <View key={index} style={styles.listItem}>
                          <View style={styles.bulletPoint} />
                          <BodyText variant="medium">{suggestion}</BodyText>
                        </View>
                      ))}
                    </View>
                    
                    <Divider />
                    
                    <View style={styles.stepsSection}>
                      <View style={styles.sectionHeader}>
                        <TitleText>Next Actions</TitleText>
                      </View>
                      {aiResponse.steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                          <View style={styles.stepNumber}>
                            <BodyText variant="medium">{index + 1}</BodyText>
                          </View>
                          <BodyText variant="medium">{step}</BodyText>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.actionButtons}>
                      <PrimaryButton 
                        variant="outlined" 
                        onPress={() => setAiResponse(null)}
                        size="medium"
                      >
                        Refine Goals
                      </PrimaryButton>
                    </View>
                  </SuccessCard>
                </View>
              )}
              
              <View style={styles.largeSpacing} />
              <PrimaryButton
                variant="outlined"
                onPress={handleReset}
              >
                Start Over
              </PrimaryButton>
              <View style={styles.spacing} />
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
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
  smallSpacing: {
    height: 8,
  },
  largeSpacing: {
    height: 24,
  },
  extraLargeSpacing: {
    height: 40,
  },
  listItemContainer: {
    marginBottom: 4,
  },
  responseSection: {
    marginTop: 32,
  },
  responseHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  motivationSection: {
    marginBottom: 16,
  },
  suggestionSection: {
    marginBottom: 16,
  },
  stepsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
    marginTop: 8,
    marginRight: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  actionButtons: {
    alignItems: 'center',
    marginTop: 16,
  },
});
