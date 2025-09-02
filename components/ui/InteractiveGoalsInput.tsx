import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface InteractiveInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  networkStatus?: 'checking' | 'connected' | 'disconnected';
}

const GOAL_SUGGESTIONS = [
  "Build a healthy morning routine", "Learn a new programming language", 
  "Start a side business", "Improve work-life balance", "Develop leadership skills",
  "Travel to 3 new countries", "Read 24 books this year", "Get in the best shape of my life",
];

const WORD_TARGET = 10;
const ANIMATION_DURATION = 300;

export const InteractiveGoalsInput: React.FC<InteractiveInputProps> = React.memo(({
  value, onChangeText, onSubmit, disabled = false, isLoading = false, networkStatus = 'connected',
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const focusAnim = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const wordCount = useMemo(() => 
    value.trim().split(/\s+/).filter(Boolean).length, [value]
  );

  const progressPercentage = useMemo(() => 
    Math.min((wordCount / WORD_TARGET) * 100, 100), [wordCount]
  );

  const isReadyToSubmit = useMemo(() => 
    wordCount >= 3 && !disabled && !isLoading, [wordCount, disabled, isLoading]
  );

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progressPercentage,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  const handleFocus = useCallback(() => {
    Animated.spring(focusAnim, {
      toValue: 1, useNativeDriver: false, tension: 100, friction: 8,
    }).start();
  }, []);

  const handleBlur = useCallback(() => {
    if (!value) {
      Animated.spring(focusAnim, {
        toValue: 0, useNativeDriver: false, tension: 100, friction: 8,
      }).start();
    }
  }, [value]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    onChangeText(value ? `${value}, ${suggestion}` : suggestion);
    setShowSuggestions(false);
  }, [value, onChangeText]);

  const handleSubmitPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 120, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 6 }),
    ]).start();
    onSubmit();
  }, [onSubmit]);

  const toggleSuggestions = useCallback(() => setShowSuggestions(!showSuggestions), [showSuggestions]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, {
        borderColor: focusAnim.interpolate({
          inputRange: [0, 1], outputRange: ['#E5E7EB', '#D4AF37'],
        }),
        borderWidth: focusAnim.interpolate({
          inputRange: [0, 1], outputRange: [1, 2],
        }),
        shadowOpacity: focusAnim.interpolate({
          inputRange: [0, 1], outputRange: [0.05, 0.1],
        }),
      }]}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline
          placeholder="What drives you forward? Share your goals..."
          placeholderTextColor="#9CA3AF"
          editable={!disabled}
          textAlignVertical="top"
          scrollEnabled={true}
        />
        
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, {
              width: progressWidth.interpolate({
                inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp',
              }),
              backgroundColor: progressWidth.interpolate({
                inputRange: [0, 99, 100], outputRange: ['#D4AF37', '#D4AF37', '#34D399'], extrapolate: 'clamp',
              }),
            }]} />
          </View>
          <Text style={styles.wordCountText}>
            {wordCount} words {progressPercentage < 100 && `(${WORD_TARGET - wordCount} more recommended)`}
          </Text>
        </View>
      </Animated.View>

      {!showSuggestions && wordCount < 3 && (
        <TouchableOpacity style={styles.suggestionsToggle} onPress={toggleSuggestions}>
          <Text style={styles.suggestionsToggleText}>Need ideas?</Text>
        </TouchableOpacity>
      )}

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Popular Goals</Text>
          <View style={styles.suggestionsGrid}>
            {GOAL_SUGGESTIONS.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.hideSuggestions} onPress={toggleSuggestions}>
            <Text style={styles.hideSuggestionsText}>Hide</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={[styles.submitButtonContainer, { transform: [{ scale: buttonScale }] }]}>
        <TouchableOpacity
          style={[styles.submitButton, !isReadyToSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmitPress}
          disabled={!isReadyToSubmit}
        >
          <View style={[styles.buttonContent, !isReadyToSubmit && styles.buttonContentDisabled]}>
            <Text style={[styles.submitButtonText, !isReadyToSubmit && styles.submitButtonTextDisabled]}>
              {isLoading 
                ? 'AI Processing...' 
                : networkStatus === 'disconnected' 
                ? 'Save Goals (Offline)'
                : 'Analyze with AI'
              }
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  inputContainer: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 24, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 3,
    position: 'relative', // Allow for scroll indicator positioning
  },
  textInput: { 
    fontSize: 18, 
    color: '#1F2937', 
    lineHeight: 28, 
    minHeight: 140, 
    maxHeight: 200, // Limit maximum height to prevent pushing button down
    textAlignVertical: 'top',
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  progressContainer: { marginTop: 20 },
  progressTrack: { 
    height: 3, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 2, 
    marginBottom: 12 
  },
  progressFill: { height: '100%', borderRadius: 2 },
  wordCountText: { 
    fontSize: 13, 
    color: '#6B7280', 
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  suggestionsToggle: {
    alignSelf: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsToggleText: { 
    color: '#374151', 
    fontSize: 15, 
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 24, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2,
  },
  suggestionsTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1F2937', 
    marginBottom: 16, 
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  suggestionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginBottom: 20 
  },
  suggestionChip: {
    backgroundColor: '#F9FAFB', 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
  },
  suggestionText: { 
    fontSize: 14, 
    color: '#374151',
    fontWeight: '500',
  },
  hideSuggestions: { 
    alignSelf: 'center', 
    paddingVertical: 10 
  },
  hideSuggestionsText: { 
    fontSize: 14, 
    color: '#6B7280',
    fontWeight: '500',
  },
  submitButtonContainer: { marginVertical: 32 },
  submitButton: {
    height: 60, 
    borderRadius: 8, 
    overflow: 'hidden',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 4,
  },
  submitButtonDisabled: { 
    shadowOpacity: 0.05, 
    elevation: 1 
  },
  buttonContent: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#333333',
  },
  buttonContentDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#D1D5DB',
  },
  submitButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  submitButtonTextDisabled: {
    color: '#F3F4F6',
  },
});
