import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const STEPS = [
  ['Analyzing Your Goals', 'Understanding your aspirations...', 2000],
  ['Deep Thinking Process', 'Applying cognitive frameworks...', 2500],
  ['Creating Your Plan', 'Building your roadmap...', 2000],
  ['Setting Up Reminders', 'Configuring triggers...', 1500],
  ['Finalizing Success Path', 'Adding finishing touches...', 1000],
];

interface AILoadingScreenProps { onComplete: () => void; }

export const AILoadingScreen: React.FC<AILoadingScreenProps> = React.memo(({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const particles = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;

  const runSequence = useCallback(async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      Animated.timing(progress, {
        toValue: (i + 1) / STEPS.length, duration: STEPS[i][2] as number, useNativeDriver: false,
      }).start();
      await new Promise(resolve => setTimeout(resolve, STEPS[i][2] as number));
    }
    setTimeout(onComplete, 500);
  }, [onComplete]);

  const startAnimations = useCallback(() => {
    const pulseLoop = () => Animated.sequence([
      Animated.timing(pulse, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ]).start(pulseLoop);
    
    particles.forEach((anim, i) => {
      const particleLoop = () => Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2000 + i * 200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]).start(particleLoop);
      setTimeout(particleLoop, i * 300);
    });
    
    pulseLoop();
  }, []);

  useEffect(() => { runSequence(); startAnimations(); }, []);

  const step = STEPS[currentStep];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#3B82F6', '#06B6D4']} style={styles.gradient}>
        {particles.map((anim: Animated.Value, i: number) => (
          <Animated.View key={i} style={[styles.particle, {
            left: `${15 + i * 12}%`, top: `${20 + (i % 3) * 20}%`, opacity: anim,
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [50, -50] }) },
              { scale: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.5, 0] }) },
            ],
          }]} />
        ))}

        <View style={styles.content}>
          <View style={styles.brain}>
            <Animated.View style={[styles.brainCore, { transform: [{ scale: pulse }] }]}>
              <LinearGradient colors={['#FF6B6B', '#4ECDC4', '#45B7D1']} style={styles.brainGrad} />
            </Animated.View>
            
            <View style={styles.neural}>
              {Array.from({ length: 8 }, (_, i) => (
                <Animated.View key={i} style={[styles.line, {
                  transform: [
                    { rotate: `${i * 45}deg` },
                    { scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) },
                  ],
                }]} />
              ))}
            </View>
          </View>

          <View style={styles.progress}>
            <Text style={styles.title}>{step[0]}</Text>
            <Text style={styles.desc}>{step[1]}</Text>
            
            <View style={styles.progressBar}>
              <View style={styles.track}>
                <Animated.View style={[styles.fill, {
                  width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }]} />
              </View>
            </View>

            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.dot, i <= currentStep ? styles.active : styles.inactive]} />
              ))}
            </View>
          </View>

          <Text style={styles.message}>Creating something amazing just for you...</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  gradient: { flex: 1, paddingHorizontal: 24, paddingVertical: 60 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  brain: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  brainCore: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden' },
  brainGrad: { flex: 1, borderRadius: 60 },
  neural: { position: 'absolute', width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  line: { position: 'absolute', width: 100, height: 2, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 1 },
  particle: { position: 'absolute', width: 8, height: 8, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 4 },
  progress: { alignItems: 'center', paddingHorizontal: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  progressBar: { width: '100%', alignItems: 'center', marginBottom: 24 },
  track: { width: '100%', height: 6, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 3 },
  fill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  active: { backgroundColor: '#FFFFFF' },
  inactive: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  message: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', fontStyle: 'italic', marginBottom: 40 },
});
