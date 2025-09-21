import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Polygon, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  intensity?: 'subtle' | 'moderate' | 'dynamic';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ intensity = 'moderate' }) => {
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  // Create hexagon points for hexagonal grid
  const createHexagonPoints = (centerX: number, centerY: number, radius: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // Generate hexagonal grid
  const generateHexGrid = () => {
    const hexagons = [];
    const hexRadius = 30;
    const horizontalSpacing = hexRadius * 1.73; // √3 * radius
    const verticalSpacing = hexRadius * 1.5;
    
    for (let row = -2; row < Math.ceil(screenHeight / verticalSpacing) + 2; row++) {
      for (let col = -2; col < Math.ceil(screenWidth / horizontalSpacing) + 2; col++) {
        const x = col * horizontalSpacing + (row % 2) * (horizontalSpacing / 2);
        const y = row * verticalSpacing;
        
        hexagons.push({
          id: `hex-${row}-${col}`,
          points: createHexagonPoints(x, y, hexRadius),
          x,
          y,
        });
      }
    }
    return hexagons;
  };

  // Generate orbit elements
  const generateOrbits = () => {
    const orbits = [];
    const numOrbits = intensity === 'subtle' ? 2 : intensity === 'moderate' ? 3 : 4;
    
    for (let i = 0; i < numOrbits; i++) {
      const radius = 80 + i * 60;
      const centerX = screenWidth * (0.2 + (i * 0.2));
      const centerY = screenHeight * (0.3 + (i * 0.15));
      
      orbits.push({
        id: `orbit-${i}`,
        centerX,
        centerY,
        radius,
        opacity: 0.15 - i * 0.03,
      });
    }
    return orbits;
  };

  // Generate ripple waves
  const generateRipples = () => {
    const ripples = [];
    const numRipples = intensity === 'subtle' ? 2 : intensity === 'moderate' ? 3 : 4;
    
    for (let i = 0; i < numRipples; i++) {
      const centerX = screenWidth * (0.1 + Math.random() * 0.8);
      const centerY = screenHeight * (0.2 + Math.random() * 0.6);
      
      ripples.push({
        id: `ripple-${i}`,
        centerX,
        centerY,
        delay: i * 1000,
      });
    }
    return ripples;
  };

  const hexGrid = generateHexGrid();
  const orbits = generateOrbits();
  const ripples = generateRipples();

  useEffect(() => {
    // Continuous rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 60000, // 60 seconds for full rotation
        useNativeDriver: true,
      })
    );

    // Pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Orbit animation
    const orbitAnimation = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 40000, // 40 seconds for orbit
        useNativeDriver: true,
      })
    );

    // Ripple animation
    const rippleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations
    rotateAnimation.start();
    pulseAnimation.start();
    orbitAnimation.start();
    rippleAnimation.start();

    // Cleanup
    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
      orbitAnimation.stop();
      rippleAnimation.stop();
    };
  }, [rotateAnim, pulseAnim, orbitAnim, rippleAnim]);

  // Interpolated values
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.4, 0.1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Hexagonal Grid Layer */}
      <Animated.View
        style={[
          styles.hexLayer,
          {
            transform: [{ rotate: rotation }],
            opacity: pulseOpacity,
          },
        ]}
      >
        <Svg height={screenHeight * 1.5} width={screenWidth * 1.5} style={styles.svg}>
          <Defs>
            <LinearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#64748B" stopOpacity="0.15" />
              <Stop offset="50%" stopColor="#F59E0B" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.15" />
            </LinearGradient>
          </Defs>
          {hexGrid.map((hex) => (
            <Polygon
              key={hex.id}
              points={hex.points}
              fill="none"
              stroke="url(#hexGradient)"
              strokeWidth="0.5"
            />
          ))}
        </Svg>
      </Animated.View>

      {/* Orbital Elements Layer */}
      <Animated.View
        style={[
          styles.orbitLayer,
          {
            transform: [{ rotate: orbitRotation }],
          },
        ]}
      >
        <Svg height={screenHeight} width={screenWidth} style={styles.svg}>
          <Defs>
            <LinearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
              <Stop offset="50%" stopColor="#F59E0B" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {orbits.map((orbit) => (
            <G key={orbit.id}>
              <Circle
                cx={orbit.centerX}
                cy={orbit.centerY}
                r={orbit.radius}
                fill="none"
                stroke="url(#orbitGradient)"
                strokeWidth="1"
                opacity={orbit.opacity}
              />
              <Circle
                cx={orbit.centerX + orbit.radius}
                cy={orbit.centerY}
                r="3"
                fill="#F59E0B"
                opacity={orbit.opacity * 2}
              />
            </G>
          ))}
        </Svg>
      </Animated.View>

      {/* Ripple Waves Layer */}
      <Animated.View style={styles.rippleLayer}>
        <Svg height={screenHeight} width={screenWidth} style={styles.svg}>
          <Defs>
            <LinearGradient id="rippleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#CBD5E1" stopOpacity="0" />
              <Stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {ripples.map((ripple, index) => (
            <Animated.View
              key={ripple.id}
              style={[
                styles.ripple,
                {
                  left: ripple.centerX - 50,
                  top: ripple.centerY - 50,
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                },
              ]}
            >
              <Svg height={100} width={100}>
                <Circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="url(#rippleGradient)"
                  strokeWidth="1"
                />
              </Svg>
            </Animated.View>
          ))}
        </Svg>
      </Animated.View>

      {/* Floating Particles Layer */}
      <Animated.View
        style={[
          styles.particleLayer,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      >
        <Svg height={screenHeight} width={screenWidth} style={styles.svg}>
          {Array.from({ length: 20 }, (_, i) => (
            <Circle
              key={`particle-${i}`}
              cx={Math.random() * screenWidth}
              cy={Math.random() * screenHeight}
              r={Math.random() * 2 + 0.5}
              fill="#F59E0B"
              opacity={Math.random() * 0.3 + 0.1}
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
  },
  hexLayer: {
    position: 'absolute',
    top: -screenHeight * 0.25,
    left: -screenWidth * 0.25,
    right: 0,
    bottom: 0,
  },
  orbitLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rippleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
});

export default AnimatedBackground;