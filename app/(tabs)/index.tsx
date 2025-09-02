import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingNavigation } from '../../components/ui/FloatingNavigation';
import { InteractiveGoalsInput } from '../../components/ui/InteractiveGoalsInput';
import { OnboardingFlow } from '../../components/ui/OnboardingFlow';
import { TodayOverview } from '../../components/ui/TodayOverview';
import { AsyncStorageUtils } from '../../utils/asyncStorage';
import { formatGoalsText, saveGoals } from '../../utils/goalsStorage';
import { hasInternetAccess, isNetworkError } from '../../utils/networkUtils';

export default function HomeScreen() {
  const [sleepState, setSleepState] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGoalsInput, setShowGoalsInput] = useState(false);
  const [goalsText, setGoalsText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingData, setIsCheckingData] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkForExistingData();
  }, []);

  const checkForExistingData = async () => {
    try {
      // Check network connectivity
      const hasInternet = await hasInternetAccess();
      setNetworkStatus(hasInternet ? 'connected' : 'disconnected');
      
      // Check if any core data exists
      const [activityData, sleepData, goalsData, userGoalsData] = await Promise.all([
        AsyncStorageUtils.getString('daily_activity_data'),
        AsyncStorageUtils.getString('sleep_state'),
        AsyncStorageUtils.getString('@nudge_user_goals'),
        AsyncStorageUtils.getString('user_goals'),
      ]);

      // If no data exists, show onboarding
      if (!activityData && !sleepData && !goalsData && !userGoalsData) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
      // If there's an error reading storage, assume we need onboarding
      setShowOnboarding(true);
      setNetworkStatus('disconnected'); // Assume no network if data check fails
    }
    setIsCheckingData(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowGoalsInput(true);
  };

  const handleGoalsSubmit = async () => {
    if (!goalsText.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Check internet connectivity first
      const hasInternet = await hasInternetAccess();
      
      if (!hasInternet) {
        Alert.alert(
          'Internet Connection Required',
          'AI goal processing requires an internet connection. Please connect to the internet and try again.',
          [
            {
              text: 'Skip AI Processing',
              style: 'cancel',
              onPress: () => handleOfflineGoalsProcessing()
            },
            {
              text: 'Retry',
              onPress: () => {
                setIsProcessing(false);
                // Let user try again when they have internet
              }
            }
          ]
        );
        setIsProcessing(false);
        return;
      }

      // Process goals through Gemini AI using the prompt.md template
      const { sendGoalsToGemini } = await import('../../utils/geminiAI');
      const aiResponse = await sendGoalsToGemini(goalsText, 'onboarding_user');
      
      // Convert AI response to Goals screen format
      const structuredGoals: any[] = [];
      
      // Process each category and create goal objects
      const categories = ['urgent', 'long_term', 'maintenance', 'optional'] as const;
      categories.forEach(category => {
        if (aiResponse[category] && Array.isArray(aiResponse[category])) {
          aiResponse[category].forEach((task: any, index: number) => {
            structuredGoals.push({
              id: `${category}_${Date.now()}_${index}`,
              title: task.task,
              description: `${task.duration} • ${task.frequency} • ${task.suggested_time}${task.deadline ? ` • Due: ${task.deadline}` : ''}`,
              category: category,
              priority: task.priority === 1 ? 'high' : task.priority <= 3 ? 'medium' : 'low',
              progress: 0,
              completed: false,
              createdAt: new Date().toISOString(),
              // Store additional AI data for future reference
              aiData: {
                duration: task.duration,
                frequency: task.frequency,
                suggested_time: task.suggested_time,
                deadline: task.deadline,
                originalCategory: task.category
              }
            });
          });
        }
      });
      
      // Save the structured goals to AsyncStorage for the Goals screen
      await AsyncStorageUtils.setString('user_goals', JSON.stringify(structuredGoals));
      
      // Also save the original goals text and AI response for reference
      await saveGoals(goalsText);
      await AsyncStorageUtils.setString('ai_processed_goals', JSON.stringify(aiResponse));
      
      // Complete the onboarding process
      setShowGoalsInput(false);
      setGoalsText('');
      
    } catch (error) {
      console.error('Error processing goals with AI:', error);
      
      // Check if it's a network error
      if (isNetworkError(error)) {
        Alert.alert(
          'Connection Lost',
          'Internet connection was lost during AI processing. You can continue without AI processing or try again when connected.',
          [
            {
              text: 'Continue Without AI',
              style: 'cancel',
              onPress: () => handleOfflineGoalsProcessing()
            },
            {
              text: 'Try Again',
              onPress: () => {
                setIsProcessing(false);
                // Let user try again
              }
            }
          ]
        );
      } else {
        // Handle other errors with fallback processing
        Alert.alert(
          'AI Processing Failed',
          'There was an issue with AI processing. Your goals will be saved in simple format.',
          [
            {
              text: 'OK',
              onPress: () => handleOfflineGoalsProcessing()
            }
          ]
        );
      }
    }
    setIsProcessing(false);
  };

  const handleOfflineGoalsProcessing = async () => {
    try {
      // Fallback: save goals in simple format when offline or AI fails
      const formattedGoals = formatGoalsText(goalsText);
      const fallbackGoal = {
        id: Date.now().toString(),
        title: formattedGoals.split('.')[0] || 'My Goals',
        description: formattedGoals,
        category: 'personal' as const,
        priority: 'high' as const,
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        isOfflineProcessed: true, // Flag to indicate this was processed offline
      };
      
      await AsyncStorageUtils.setString('user_goals', JSON.stringify([fallbackGoal]));
      await saveGoals(goalsText);
      
      // Complete onboarding even in offline mode
      setShowGoalsInput(false);
      setGoalsText('');
      
    } catch (error) {
      console.error('Error in offline goals processing:', error);
      Alert.alert(
        'Save Failed',
        'Unable to save your goals. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSleepStateChange = (isAsleep: boolean) => {
    setSleepState(isAsleep);
  };

  const handleDayStarted = () => {
    console.log('Day started from Home screen');
  };

  const handleViewDetails = () => {
    console.log('Navigate to track tab');
  };

  const navigateToGoals = () => {
    console.log('Navigate to goals tab');
  };

  // Show loading while checking data
  if (isCheckingData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F3F0" translucent />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show onboarding flow if no data exists
  if (showOnboarding) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F3F0" translucent />
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </View>
    );
  }

  // Show goals input after onboarding
  if (showGoalsInput) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F3F0" translucent />
        <View style={styles.goalsInputContainer}>
          <View style={styles.goalsHeader}>
            <Text style={styles.goalsTitle}>What are your goals?</Text>
            <Text style={styles.goalsSubtitle}>
              Tell me about your aspirations. I'll help refine and organize them.
            </Text>
          </View>
          
          <InteractiveGoalsInput
            value={goalsText}
            onChangeText={setGoalsText}
            onSubmit={handleGoalsSubmit}
            disabled={isProcessing}
            isLoading={isProcessing}
            networkStatus={networkStatus}
          />
          
          <View style={styles.goalsFooter}>
            <Text style={styles.goalsHint}>
              {isProcessing 
                ? "🤖 AI is analyzing your goals and creating a structured plan..." 
                : networkStatus === 'disconnected'
                ? "⚠️ No internet connection. AI processing will be skipped."
                : "💡 Try: \"I want to learn programming, get fit, and build better habits\""
              }
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 72 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F3F0" translucent />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Header with Greeting */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.subtitle}>Ready to make today productive?</Text>
          </View>

          {/* Bento Grid Layout */}
          <View style={styles.bentoGrid}>
            
            {/* Row 1: Today Overview (full width) */}
            <View style={styles.bentoFull}>
              <TodayOverview onViewDetails={handleViewDetails} />
            </View>
            

          </View>

        </View>
      </ScrollView>
      
      {/* Floating Navigation */}
      <FloatingNavigation currentRoute="index" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3F0', // Elegant beige base
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3C2A21', // Rich brown text
    marginBottom: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7355', // Warm brown
    fontWeight: '400',
    fontFamily: 'System',
  },
  
  // Bento Grid Layout
  bentoGrid: {
    gap: 16,
  },
  bentoFull: {
    width: '100%',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  bentoHalf: {
    flex: 1,
  },
  bentoTwoThirds: {
    flex: 2,
  },
  bentoThird: {
    flex: 1,
  },
  
  // Stats Card
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6750A4',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'System',
  },
  statsLabel: {
    fontSize: 12,
    color: '#49454F',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'System',
  },
  
  // Goals Card
  goalsCard: {
    backgroundColor: '#6750A4',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 3,
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  goalsText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'System',
  },
  
  // Action Cards
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  actionIconContainer: {
    backgroundColor: '#EAE7F0',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1B20',
    marginBottom: 4,
    fontFamily: 'System',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#49454F',
    fontWeight: '400',
    fontFamily: 'System',
  },
  
  // Legacy styles (keep for compatibility)
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quickActions: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  
  // Loading and Onboarding Styles
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3C2A21',
    fontFamily: 'System',
  },
  
  // Goals Input Styles
  goalsInputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  goalsHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  goalsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3C2A21',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
  },
  goalsSubtitle: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'System',
  },
  goalsFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  goalsHint: {
    fontSize: 14,
    color: '#B8A082',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
});
