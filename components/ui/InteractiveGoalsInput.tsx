import { LinearGradient } from 'expo-linear-gradient';
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
}

const GOAL_SUGGESTIONS = [
  "Build a healthy morning routine", "Learn a new programming language", 
  "Start a side business", "Improve work-life balance", "Develop leadership skills",
  "Travel to 3 new countries", "Read 24 books this year", "Get in the best shape of my life",
];

const WORD_TARGET = 10;
const ANIMATION_DURATION = 300;

export const InteractiveGoalsInput: React.FC<InteractiveInputProps> = React.memo(({
  value, onChangeText, onSubmit, disabled = false, isLoading = false,
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
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onSubmit();
  }, [onSubmit]);

  const toggleSuggestions = useCallback(() => setShowSuggestions(!showSuggestions), [showSuggestions]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, {
        borderColor: focusAnim.interpolate({
          inputRange: [0, 1], outputRange: ['#E0E0E0', '#2196F3'],
        }),
        borderWidth: focusAnim.interpolate({
          inputRange: [0, 1], outputRange: [1, 2],
        }),
      }]}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline
          placeholder="What are your goals?"
          placeholderTextColor="#999"
          editable={!disabled}
          textAlignVertical="top"
        />
        
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, {
              width: progressWidth.interpolate({
                inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp',
              }),
              backgroundColor: progressWidth.interpolate({
                inputRange: [0, 99, 100], outputRange: ['#2196F3', '#2196F3', '#4CAF50'], extrapolate: 'clamp',
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
          <LinearGradient
            colors={isReadyToSubmit ? ['#4CAF50', '#45A049'] : ['#BDBDBD', '#9E9E9E']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Processing...' : 'Transform Goals'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  inputContainer: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 4,
  },
  textInput: { fontSize: 16, color: '#212121', lineHeight: 24, minHeight: 120, textAlignVertical: 'top' },
  progressContainer: { marginTop: 16 },
  progressTrack: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 2 },
  wordCountText: { fontSize: 12, color: '#666', textAlign: 'center' },
  suggestionsToggle: {
    alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 20, 
    backgroundColor: '#E3F2FD', borderRadius: 20, marginBottom: 16,
  },
  suggestionsToggleText: { color: '#1976D2', fontSize: 14, fontWeight: '500' },
  suggestionsContainer: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  suggestionsTitle: { fontSize: 16, fontWeight: '600', color: '#212121', marginBottom: 12, textAlign: 'center' },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  suggestionChip: {
    backgroundColor: '#F5F5F5', paddingHorizontal: 16, paddingVertical: 8, 
    borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0',
  },
  suggestionText: { fontSize: 14, color: '#424242' },
  hideSuggestions: { alignSelf: 'center', paddingVertical: 8 },
  hideSuggestionsText: { fontSize: 14, color: '#666' },
  submitButtonContainer: { marginVertical: 24 },
  submitButton: {
    height: 56, borderRadius: 28, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  submitButtonDisabled: { shadowOpacity: 0.1, elevation: 2 },
  buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  submitButtonText: { fontSize: 18, fontWeight: '600', color: '#FFF', textAlign: 'center' },
});
