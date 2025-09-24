import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Polygon, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Add extra height to ensure full coverage with spinning elements
const extendedHeight = screenHeight * 1.5;
const extendedWidth = screenWidth * 1.2;

interface AnimatedBackgroundProps {
  intensity?: 'subtle' | 'moderate' | 'dynamic';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ intensity = 'moderate' }) => {
  const { theme } = useTheme();
  
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

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
    
    for (let row = -4; row < Math.ceil(extendedHeight / verticalSpacing) + 4; row++) {
      for (let col = -4; col < Math.ceil(extendedWidth / horizontalSpacing) + 4; col++) {
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



  const hexGrid = generateHexGrid();
  const orbits = generateOrbits();

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

    // Start all animations
    rotateAnimation.start();
    pulseAnimation.start();
    orbitAnimation.start();

    // Cleanup
    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
      orbitAnimation.stop();
    };
  }, [rotateAnim, pulseAnim, orbitAnim]);

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
              <Stop offset="0%" stopColor={theme.colors.animationSecondary} stopOpacity="0.15" />
              <Stop offset="50%" stopColor={theme.colors.animationPrimary} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={theme.colors.animationTertiary} stopOpacity="0.15" />
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
              <Stop offset="0%" stopColor={theme.colors.animationPrimary} stopOpacity="0" />
              <Stop offset="50%" stopColor={theme.colors.animationPrimary} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={theme.colors.animationPrimary} stopOpacity="0" />
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
                fill={theme.colors.animationPrimary}
                opacity={orbit.opacity * 2}
              />
            </G>
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
              fill={theme.colors.animationPrimary}
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
  particleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default AnimatedBackground;