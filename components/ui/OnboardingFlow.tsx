import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BodyText, DisplayText, HeadlineText, PrimaryButton } from './StyledComponents';

const STEPS = [
  { title: 'Welcome to Nudge', subtitle: 'Your AI-Powered Goal Coach', 
    description: 'Transform your aspirations into achievable milestones.', buttonText: 'Get Started' },
  { title: 'Smart Goal Analysis', subtitle: 'Advanced AI Understanding', 
    description: 'AI analyzes your goals using proven frameworks.', buttonText: 'Continue' },
  { title: 'Ready to Begin', subtitle: 'Start Your Journey', 
    description: 'Get personalized guidance designed for success.', buttonText: 'Start' },
];

interface OnboardingProps { onComplete: () => void; }

export const OnboardingFlow: React.FC<OnboardingProps> = React.memo(({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
      Animated.timing(progressAnim, {
        toValue: (currentStep + 1) / STEPS.length,
        duration: 300, useNativeDriver: false,
      }).start();
      
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const step = STEPS[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, {
            width: progressAnim.interpolate({
              inputRange: [0, 1], outputRange: ['0%', '100%'],
            }),
          }]} />
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.text}>
          <DisplayText>{step.title}</DisplayText>
          <View style={styles.spacing} />
          <HeadlineText>{step.subtitle}</HeadlineText>
          <View style={styles.spacing} />
          <BodyText variant="large">{step.description}</BodyText>
        </View>

        <View style={styles.visual}>
          <View style={[styles.circle, styles.primary]} />
          <View style={[styles.circle, styles.secondary]} />
          <View style={[styles.circle, styles.tertiary]} />
        </View>
      </Animated.View>

      <View style={styles.navigation}>
        <View style={styles.dots}>
          {STEPS.map((_, index) => (
            <View key={index} style={[styles.dot, 
              index === currentStep ? styles.activeDot : styles.inactiveDot]} />
          ))}
        </View>
        <PrimaryButton onPress={handleNext} size="large">{step.buttonText}</PrimaryButton>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBFE', paddingHorizontal: 24 },
  progress: { paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
  progressTrack: { width: '100%', height: 4, backgroundColor: '#E7E0EC', borderRadius: 2 },
  progressBar: { height: '100%', backgroundColor: '#2196F3', borderRadius: 2 },
  content: { flex: 1, justifyContent: 'center' },
  text: { alignItems: 'center', marginBottom: 48 },
  spacing: { height: 16 },
  visual: { height: 200, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  circle: { position: 'absolute', borderRadius: 20 },
  primary: { width: 120, height: 120, backgroundColor: '#2196F3', opacity: 0.9 },
  secondary: { width: 80, height: 80, backgroundColor: '#009688', opacity: 0.7, top: -20, right: -10 },
  tertiary: { width: 40, height: 40, backgroundColor: '#FF9800', opacity: 0.8, bottom: -10, left: -20 },
  navigation: { paddingBottom: 48 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  activeDot: { backgroundColor: '#2196F3', width: 24 },
  inactiveDot: { backgroundColor: '#E7E0EC' },
});
