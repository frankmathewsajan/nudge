/**
 * GoalCollectionScreen - Main goal collection interface
 * 
 * Clean, Claude-inspired UI for collecting user life goals.
 * Matches onboarding aesthetic with seamless keyboard handling.
 */

import { MaterialIcons } from '@expo/vector-icons';
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
import AnimatedBackground from '../ui/AnimatedBackground';
import { ThemeToggle } from '../ui/ThemeToggle';

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
  const inputRef = useRef<TextInput>(null);
  const animatedValue = useRef(new Animated.Value(1)).current;

  // Business logic separation
  const goalController = useGoalCollection(
    (goal) => {
      console.log('Goal submitted:', goal);
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
    goalController.handlers.submitGoal();
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
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
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header Section with Smooth Animation */}
        <Animated.View 
          style={[
            keyboard.isVisible ? styles.headerSectionKeyboard : styles.headerSection,
            { transform: [{ scale: animatedValue }] }
          ]}
        >
          {/* Clean Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons 
              name="gps-fixed" 
              size={36} 
              color="#FFFFFF" 
            />
          </View>
          
          {/* Main Heading */}
          <Text style={styles.mainHeading}>
            What are your goals in life?
          </Text>
          
          {/* Example Pills - 2 Rows with Auto-scroll */}
          {!keyboard.isVisible && (
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
                {row1Duplicated.map((example, index) => (
                  <TouchableOpacity
                    key={`row1-${index}`}
                    style={[
                      styles.examplePill,
                      { marginLeft: index === 0 ? 0 : 0 } // Remove extra margin, use padding instead
                    ]}
                    onPress={() => handleExampleClick(example)}
                  >
                    <Text style={styles.examplePillText}>{example}</Text>
                  </TouchableOpacity>
                ))}
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
                {row2Duplicated.map((example, index) => (
                  <TouchableOpacity
                    key={`row2-${index}`}
                    style={[
                      styles.examplePill,
                      { 
                        marginLeft: 0, // Clean consistent spacing
                        marginTop: index % 4 === 0 ? 2 : 0 // Subtle random vertical offset
                      }
                    ]}
                    onPress={() => handleExampleClick(example)}
                  >
                    <Text style={styles.examplePillText}>{example}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* Input Section */}
        <View style={[
          styles.inputSection,
          { paddingBottom: insets.bottom + (keyboard.isVisible ? 20 : 32) }
        ]}>
          <View style={[
            styles.inputContainer,
            isInputFocused && styles.inputContainerFocused
          ]}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={goalController.state.currentGoal}
              onChangeText={goalController.handlers.updateCurrentGoal}
              placeholder="Enter a goal you want to achieve..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              textAlignVertical="top"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onSubmitEditing={handleSubmit}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            
            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                goalController.state.isValid ? styles.sendButton : styles.sendButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!goalController.state.isValid || goalController.state.isSubmitting}
            >
              <MaterialIcons 
                name="send" 
                size={18} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>

          {/* Goal Count Progress */}
          {goalController.state.goals.length > 0 && (
            <Text style={styles.helpText}>
              {goalController.state.goals.length} of 3 goals added
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};