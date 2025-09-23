/**
 * GoalCollectionScreen - Main goal collection interface
 * 
 * Clean, Claude-inspired UI for collecting user life goals.
 * Matches onboarding aesthetic with seamless keyboard handling.
 */

import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createGoalCollectionStyles } from '../../assets/styles/goals/goal-collection.styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useGoalCollection } from '../../hooks/goals/useGoalCollection';
import { useKeyboardAware } from '../../hooks/goals/useKeyboardAware';
import { analyzeGoalWithGemini, createSmartGoalSummary, GoalAnalysisResponse } from '../../services/geminiService';
import { storageService } from '../../services/storageService';
import AnimatedBackground from '../ui/AnimatedBackground';
import { SettingsScreen } from '../ui/SettingsScreen';
import { TerminalLoader } from '../ui/TerminalLoader';
import { ThemeToggle } from '../ui/ThemeToggle';
import { GoalHistoryTab } from './GoalHistoryTab';
import { GoalPlanningScreen } from './GoalPlanningScreen';

interface GoalCollectionScreenProps {
  onComplete?: (goals: any[]) => void;
}

/**
 * Goal collection screen with clean architecture.
 * 
 * Features:
 * - Claude-inspired minimal UI
 * - Smooth keyboard adaptation
 * - Theme-aware styling
 * - Clean goal submission flow
 */
export const GoalCollectionScreen: React.FC<GoalCollectionScreenProps> = ({
  onComplete
}) => {
  const { theme, toggleTheme } = useTheme();
  const styles = createGoalCollectionStyles(theme);
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardAware();
  
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showPlanningScreen, setShowPlanningScreen] = useState(false);
  const [currentPlanningGoal, setCurrentPlanningGoal] = useState<string>('');
  const [goalAnalysis, setGoalAnalysis] = useState<GoalAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentGoalText, setCurrentGoalText] = useState<string>('');
  const [showTerminalLoader, setShowTerminalLoader] = useState(false);
  const [terminalStage, setTerminalStage] = useState<'analyzing' | 'parsing' | 'success' | 'error'>('analyzing');
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedValue = useRef(new Animated.Value(1)).current;
  
  // Icon animation values with Material physics
  const iconPulseValue = useRef(new Animated.Value(1)).current;
  const iconScaleValue = useRef(new Animated.Value(1)).current;
  const iconOpacityValue = useRef(new Animated.Value(0.8)).current;
  
  // Chip animation values for state feedback
  const chipAnimationValues = useRef(new Map()).current;
  
  // Input field state layer animation
  const inputStateValue = useRef(new Animated.Value(0)).current;

  // Reset animations when settings modal closes
  useEffect(() => {
    if (!showSettings) {
      // Reset all animation values to prevent UI misalignment
      iconPulseValue.setValue(1);
      iconScaleValue.setValue(1);
      iconOpacityValue.setValue(0.8);
      animatedValue.setValue(1);
      inputStateValue.setValue(0);
    }
  }, [showSettings, iconPulseValue, iconScaleValue, iconOpacityValue, animatedValue, inputStateValue]);

  // Retry analysis function
  const retryAnalysis = async () => {
    if (!currentGoalText || retryCount >= 3) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setRetryCount(prev => prev + 1);
    setShowTerminalLoader(true);
    setTerminalStage('analyzing');
    
    try {
      console.log('Retrying goal analysis... attempt:', retryCount + 1);
      
      setTimeout(() => {
        if (setTerminalStage) setTerminalStage('parsing');
      }, 2000);
      
      const analysis = await analyzeGoalWithGemini(currentGoalText);
      setTerminalStage('success');
      setGoalAnalysis(analysis);
      setCanRetry(false);
      setRetryCount(0);
      console.log('Retry successful');
      
      setTimeout(() => {
        setShowTerminalLoader(false);
      }, 1000);
    } catch (error) {
      console.error('Retry failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze goal';
      const shouldRetry = (error as any)?.shouldRetry && retryCount < 2;
      
      setTerminalStage('error');
      setAnalysisError(errorMessage);
      setCanRetry(shouldRetry);
      
      setTimeout(() => {
        setShowTerminalLoader(false);
        if (!shouldRetry) {
          setGoalAnalysis(null);
        }
      }, 2000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Business logic separation
  const goalController = useGoalCollection(
    async (goal) => {
      console.log('Goal submitted:', goal);
      setCurrentGoalText(goal.text);
      setRetryCount(0);
      
      // Create smart summary for the goal first
      let goalSummary = goal.text;
      try {
        console.log('Creating AI-powered goal summary...');
        goalSummary = await createSmartGoalSummary(goal.text);
        console.log('Smart summary created:', goalSummary);
      } catch (error) {
        console.log('Failed to create AI summary, using original text');
      }
      
      setCurrentPlanningGoal(goalSummary);
      
      // Start analyzing the goal with Gemini AI
      setIsAnalyzing(true);
      setAnalysisError(null);
      setCanRetry(false);
      setShowTerminalLoader(true);
      setTerminalStage('analyzing');
      
      try {
        console.log('Starting goal analysis with Gemini...');
        
        // Simulate parsing stage after some delay
        setTimeout(() => {
          if (setTerminalStage) setTerminalStage('parsing');
        }, 3000);
        
        const analysis = await analyzeGoalWithGemini(goal.text);
        
        // Check if this is a fallback response (which means there was an error)
        const isFallbackResponse = analysis.primary_goal.analysis.includes("This is a great goal that can significantly improve your skills and capabilities. Breaking it down into manageable steps with proper time management");
        
        if (isFallbackResponse) {
          console.log('Using V2 fallback response due to API error');
          setTerminalStage('success'); // Still show success to user for better UX
        } else {
          console.log('Goal analysis completed successfully with V2 format');
          setTerminalStage('success');
        }
        
        setGoalAnalysis(analysis);
        
        // Save to history
        try {
          await storageService.saveGoalAnalysis(goal.text, goalSummary, analysis);
          console.log('Goal analysis saved to history');
        } catch (error) {
          console.error('Failed to save goal analysis to history:', error);
        }
        
        // Show success for a moment before proceeding
        setTimeout(() => {
          setShowTerminalLoader(false);
          setShowPlanningScreen(true);
        }, 1500);
      } catch (error) {
        console.error('Failed to analyze goal:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze goal';
        const shouldRetry = (error as any)?.shouldRetry;
        
        setTerminalStage('error');
        setAnalysisError(errorMessage);
        setCanRetry(shouldRetry);
        
        // Show error for a moment before proceeding with fallback
        setTimeout(() => {
          setShowTerminalLoader(false);
          setGoalAnalysis(null);
          setShowPlanningScreen(true);
        }, 2000);
      } finally {
        setIsAnalyzing(false);
      }
    },
    (allGoals) => {
      console.log('All goals collected:', allGoals);
      if (onComplete) {
        onComplete(allGoals);
      }
    }
  );

  // Example goals for pills - expanded list with variety
  const exampleGoals = [
    "Learn a new language", "Start a business", "Get fit and healthy", 
    "Travel the world", "Learn to code", "Write a book",
    "Run a marathon", "Master cooking", "Learn an instrument", 
    "Build an app", "Start a podcast", "Learn photography",
    "Get a promotion", "Save for a house", "Learn yoga",
    "Volunteer regularly", "Read 50 books", "Learn dancing",
    "Start a garden", "Learn meditation", "Build a side hustle",
    "Learn painting", "Get certified", "Learn a craft"
  ];

  // Split examples into two rows for variety
  const row1Examples = exampleGoals.slice(0, 12);
  const row2Examples = exampleGoals.slice(12);
  
  // Duplicate arrays for seamless scrolling (no empty spaces)
  const row1Duplicated = [...row1Examples, ...row1Examples, ...row1Examples];
  const row2Duplicated = [...row2Examples, ...row2Examples, ...row2Examples];

  // Auto-scroll animation refs
  const scrollRef1 = useRef<ScrollView>(null);
  const scrollRef2 = useRef<ScrollView>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Icon breathing pulse animation - Material physics system
  useEffect(() => {
    const createBreathingAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulseValue, {
            toValue: 1.08,
            duration: 2800, // Slow breathing rhythm
            useNativeDriver: true,
          }),
          Animated.timing(iconPulseValue, {
            toValue: 1,
            duration: 2800,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const breathingAnimation = createBreathingAnimation();
    breathingAnimation.start();

    return () => breathingAnimation.stop();
  }, [iconPulseValue]);

  // Icon glow animation synchronized with pulse
  useEffect(() => {
    const createGlowAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(iconOpacityValue, {
            toValue: 1,
            duration: 2800,
            useNativeDriver: true,
          }),
          Animated.timing(iconOpacityValue, {
            toValue: 0.7,
            duration: 2800,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const glowAnimation = createGlowAnimation();
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, [iconOpacityValue]);

  // Auto-scroll setup with seamless continuous scrolling
  useEffect(() => {
    if (!keyboard.isVisible && !isPaused) {
      let scrollTimer1: any;
      let scrollTimer2: any;
      
      const startAutoScroll = () => {
        let scrollX1 = 0;
        let scrollX2 = 0;
        
        // Estimate content width: (pill width + margin) * number of items
        const estimatedPillWidth = 120; // pill width + margin
        const row1ContentWidth = row1Examples.length * estimatedPillWidth;
        const row2ContentWidth = row2Examples.length * estimatedPillWidth;
        
        // Row 1 - scroll right with seamless loop
        scrollTimer1 = setInterval(() => {
          scrollX1 += 1.0;
          scrollRef1.current?.scrollTo({ x: scrollX1, animated: false });
          // Reset when we've scrolled through one complete set
          if (scrollX1 >= row1ContentWidth) {
            scrollX1 = 0;
          }
        }, 16);
        
        // Row 2 - scroll left with seamless loop  
        scrollTimer2 = setInterval(() => {
          scrollX2 += 1.3; // Different speed
          scrollRef2.current?.scrollTo({ x: scrollX2, animated: false });
          // Reset when we've scrolled through one complete set
          if (scrollX2 >= row2ContentWidth) {
            scrollX2 = 0;
          }
        }, 16);
      };

      const timer = setTimeout(startAutoScroll, 500);
      
      return () => {
        clearTimeout(timer);
        if (scrollTimer1) clearInterval(scrollTimer1);
        if (scrollTimer2) clearInterval(scrollTimer2);
      };
    }
  }, [keyboard.isVisible, isPaused, row1Examples.length, row2Examples.length]);

  const handleExampleClick = (example: string) => {
    setSelectedChip(example);
    
    // Animate chip selection with Material physics
    const chipKey = `chip-${example}`;
    let animationValue = chipAnimationValues.get(chipKey);
    
    if (!animationValue) {
      animationValue = new Animated.Value(1);
      chipAnimationValues.set(chipKey, animationValue);
    }

    // Scale-in and color morph animation (180-220ms)
    Animated.sequence([
      Animated.spring(animationValue, {
        toValue: 0.94, // Slight scale down
        useNativeDriver: true,
        tension: 300, // Material physics - high tension for snappy feel
        friction: 20,  // Material physics - medium friction for natural damping
      }),
      Animated.spring(animationValue, {
        toValue: 1.05, // Scale up slightly beyond normal
        useNativeDriver: true,
        tension: 200,
        friction: 12, // Lower friction for bounce
      }),
      Animated.spring(animationValue, {
        toValue: 1, // Return to normal
        useNativeDriver: true,
        tension: 300,
        friction: 25,
      })
    ]).start(() => {
      // Clear selection after animation
      setTimeout(() => {
        setSelectedChip(null);
      }, 500);
    });

    goalController.handlers.updateCurrentGoal(example);
    inputRef.current?.focus();
    
    // Pause scrolling for 3 seconds when user taps
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  // Smooth keyboard animation
  React.useEffect(() => {
    const toValue = keyboard.isVisible ? 0.7 : 1;
    Animated.timing(animatedValue, {
      toValue,
      duration: keyboard.animationDuration || 250,
      useNativeDriver: true,
    }).start();
  }, [keyboard.isVisible, keyboard.animationDuration, animatedValue]);

  const handleSubmit = () => {
    // Spring "lock-in" animation when goal is submitted
    Animated.sequence([
      Animated.spring(iconScaleValue, {
        toValue: 0.85, // Compress
        useNativeDriver: true,
        tension: 400, // High tension for quick compression
        friction: 25,
      }),
      Animated.spring(iconScaleValue, {
        toValue: 1.15, // Expand beyond normal
        useNativeDriver: true,
        tension: 200, // Lower tension for satisfying bounce
        friction: 15,
      }),
      Animated.spring(iconScaleValue, {
        toValue: 1, // Lock into final position
        useNativeDriver: true,
        tension: 300,
        friction: 30, // Higher friction for solid "lock" feeling
      })
    ]).start();

    goalController.handlers.submitGoal();
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    
    // Material 3 state layer animation - focus state
    Animated.spring(inputStateValue, {
      toValue: 1,
      useNativeDriver: false, // Using backgroundColor which requires layout
      tension: 400,
      friction: 30,
    }).start();
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    
    // Material 3 state layer animation - unfocus state
    Animated.spring(inputStateValue, {
      toValue: 0,
      useNativeDriver: false,
      tension: 300,
      friction: 25,
    }).start();
  };

  // Planning screen handlers
  const handleBackToGoals = () => {
    setShowPlanningScreen(false);
    setCurrentPlanningGoal('');
    setGoalAnalysis(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setCanRetry(false);
    setRetryCount(0);
    setCurrentGoalText('');
    setShowTerminalLoader(false);
    setTerminalStage('analyzing');
  };

  const handleTabChange = (tab: 'create' | 'history') => {
    setActiveTab(tab);
  };

  const handleSelectHistoryGoal = (goalSummary: string, analysis: GoalAnalysisResponse) => {
    setCurrentPlanningGoal(goalSummary);
    setGoalAnalysis(analysis);
    setShowPlanningScreen(true);
  };

  const handleSetupAlarms = () => {
    // TODO: Implement alarm setup
    console.log('Setup alarms for goal:', currentPlanningGoal);
  };

  const handleStartNow = () => {
    // TODO: Implement start session
    console.log('Start working on goal:', currentPlanningGoal);
  };

  // Show terminal loader during analysis
  if (showTerminalLoader) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar 
          barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.colors.background} 
        />
        
        <AnimatedBackground intensity="subtle" />
        <ThemeToggle onToggle={toggleTheme} theme={theme} safeAreaTop={insets.top} />
        
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.mainHeading}>Analyzing your goal...</Text>
          </View>
          
          <TerminalLoader
            theme={theme}
            isVisible={showTerminalLoader}
            stage={terminalStage}
            errorMessage={analysisError || undefined}
            onComplete={() => {
              console.log('Terminal loading completed');
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show planning screen if a goal was submitted
  if (showPlanningScreen && currentPlanningGoal) {
    return (
      <GoalPlanningScreen
        goal={currentPlanningGoal}
        goalAnalysis={goalAnalysis}
        isAnalyzing={isAnalyzing}
        analysisError={analysisError}
        canRetry={canRetry}
        retryCount={retryCount}
        onBack={handleBackToGoals}
        onSetupAlarms={handleSetupAlarms}
        onStartNow={handleStartNow}
        onRetry={retryAnalysis}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      
      {/* Animated Background */}
      <AnimatedBackground intensity="subtle" />
      
      {/* Header with Settings, Centered Tabs, and Theme Toggle */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsButton}>
          <MaterialIcons name="settings" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.compactTabContainer}>
            <TouchableOpacity
              style={[styles.compactTab, activeTab === 'create' && styles.activeCompactTab]}
              onPress={() => handleTabChange('create')}
            >
              <MaterialIcons 
                name="add-circle-outline" 
                size={16} 
                color={activeTab === 'create' ? (theme.name === 'dark' ? '#0F172A' : '#FFFFFF') : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.compactTabText,
                activeTab === 'create' && styles.activeCompactTabText
              ]}>
                Create
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.compactTab, activeTab === 'history' && styles.activeCompactTab]}
              onPress={() => handleTabChange('history')}
            >
              <MaterialIcons 
                name="history" 
                size={16} 
                color={activeTab === 'history' ? (theme.name === 'dark' ? '#0F172A' : '#FFFFFF') : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.compactTabText,
                activeTab === 'history' && styles.activeCompactTabText
              ]}>
                History
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ThemeToggle onToggle={toggleTheme} theme={theme} safeAreaTop={0} inline={true} />
      </View>
      
      {/* Tab Content */}
      {activeTab === 'history' ? (
        <GoalHistoryTab
          theme={theme}
          onSelectGoal={handleSelectHistoryGoal}
        />
      ) : (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section with Smooth Animation */}
          <Animated.View 
            style={[
              keyboard.isVisible ? styles.headerSectionKeyboard : styles.headerSection,
              { transform: [{ scale: animatedValue }] }
            ]}
          >
          {/* Only show icon and heading when no content is entered */}
          {!goalController.state.currentGoal.trim() && (
            <>
              {/* Clean Icon with Breathing Pulse and Lock-in Animation */}
              <Animated.View 
                style={[
                  keyboard.isVisible ? styles.iconContainerKeyboard : styles.iconContainer,
                  {
                    transform: [
                      { scale: Animated.multiply(iconPulseValue, iconScaleValue) }
                    ],
                    opacity: iconOpacityValue,
                  }
                ]}
              >
                <LottieView
                  source={require('../../assets/animations/1.json')}
                  style={{ 
                    width: keyboard.isVisible ? 250 : 300, 
                    height: keyboard.isVisible ? 250 : 300 
                  }}
                  autoPlay
                  loop
                />
              </Animated.View>
              
              {/* Main Heading - Hide when keyboard is visible */}
              {!keyboard.isVisible && (
                <Text style={styles.mainHeading}>
                  What are your goals in life?
                </Text>
              )}
            </>
          )}
          
          {/* Example Pills - 2 Rows with Auto-scroll - Only show when no content and keyboard not visible */}
          {!keyboard.isVisible && !goalController.state.currentGoal.trim() && (
            <View style={styles.examplePillsContainer}>
              {/* Row 1 - Left to Right Scroll */}
              <ScrollView 
                ref={scrollRef1}
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.exampleRow}
                contentContainerStyle={styles.exampleRowContent}
                scrollEventThrottle={16}
              >
                {row1Duplicated.map((example, index) => {
                  const chipKey = `chip-${example}`;
                  const animationValue = chipAnimationValues.get(chipKey) || new Animated.Value(1);
                  const isSelected = selectedChip === example;
                  
                  return (
                    <Animated.View
                      key={`row1-${index}`}
                      style={{
                        transform: [{ scale: animationValue }],
                        marginLeft: index === 0 ? 0 : 0,
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.examplePill,
                          isSelected && styles.examplePillSelected,
                          {
                            backgroundColor: isSelected 
                              ? theme.colors.accentVibrant 
                              : theme.colors.backgroundSecondary,
                            borderColor: isSelected 
                              ? theme.colors.accent 
                              : theme.colors.accentSoft,
                          }
                        ]}
                        onPress={() => handleExampleClick(example)}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.examplePillText,
                          isSelected && styles.examplePillTextSelected,
                        ]}>
                          {example}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </ScrollView>
              
              {/* Row 2 - Right to Left Scroll */}
              <ScrollView 
                ref={scrollRef2}
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.exampleRow}
                contentContainerStyle={styles.exampleRowContent}
                scrollEventThrottle={16}
              >
                {row2Duplicated.map((example, index) => {
                  const chipKey = `chip-${example}`;
                  const animationValue = chipAnimationValues.get(chipKey) || new Animated.Value(1);
                  const isSelected = selectedChip === example;
                  
                  return (
                    <Animated.View
                      key={`row2-${index}`}
                      style={{
                        transform: [{ scale: animationValue }],
                        marginLeft: 0,
                        marginTop: index % 4 === 0 ? 2 : 0,
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.examplePill,
                          isSelected && styles.examplePillSelected,
                          {
                            backgroundColor: isSelected 
                              ? theme.colors.accentVibrant 
                              : theme.colors.backgroundSecondary,
                            borderColor: isSelected 
                              ? theme.colors.accent 
                              : theme.colors.accentSoft,
                          }
                        ]}
                        onPress={() => handleExampleClick(example)}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.examplePillText,
                          isSelected && styles.examplePillTextSelected,
                        ]}>
                          {example}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* Input Section */}
        <View style={[
          styles.inputSection,
          { paddingBottom: insets.bottom + (keyboard.isVisible ? 20 : 32) }
        ]}>
          <Animated.View style={[
            styles.inputContainer,
            isInputFocused && styles.inputContainerFocused,
            {
              backgroundColor: inputStateValue.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  theme.colors.inputBackground,
                  theme.colors.inputFocusBackground,  // Use dedicated focus background
                ]
              }),
              borderColor: inputStateValue.interpolate({
                inputRange: [0, 1],
                outputRange: [theme.colors.inputBorder, theme.colors.accentVibrant]
              }),
            }
          ]}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={goalController.state.currentGoal}
              onChangeText={goalController.handlers.updateCurrentGoal}
              placeholder="Enter a goal you want to achieve..."
              placeholderTextColor={theme.colors.inputPlaceholder}
              multiline
              textAlignVertical="top"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onSubmitEditing={handleSubmit}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            
            {/* Send Button with enhanced state feedback */}
            <Animated.View
              style={[
                styles.actionButton,
                goalController.state.isValid ? styles.sendButton : styles.sendButtonDisabled,
                {
                  transform: [{
                    scale: goalController.state.isValid ? 1 : 0.9
                  }],
                  opacity: goalController.state.isValid ? 1 : 0.6,
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'transparent' }]}
                onPress={handleSubmit}
                disabled={!goalController.state.isValid || goalController.state.isSubmitting}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name="send" 
                  size={18} 
                  color={theme.name === 'dark' ? '#0F172A' : '#FFFFFF'} // White icon for vibrant button
                />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Goal Count Progress */}
          {goalController.state.goals.length > 0 && (
            <Text style={styles.helpText}>
              {goalController.state.goals.length} goal{goalController.state.goals.length > 1 ? 's' : ''} added
            </Text>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsScreen 
          theme={theme} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </SafeAreaView>
  );
};