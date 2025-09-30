import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Polygon, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Make it square and 2x screen height to ensure full coverage during rotation
const ANIMATION_SIZE = screenHeight * 2;

interface AnimatedBackgroundProps {
  intensity?: 'subtle' | 'moderate' | 'dynamic';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ intensity = 'moderate' }) => {
  const { theme } = useTheme();
  
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

  // Theme-aware color scheme - Much more subtle for background use
  const getThemeColors = () => {
    const isLight = theme.name === 'light';
    return {
      hexGradient: {
        primary: isLight ? 'rgba(74, 144, 226, 0.03)' : 'rgba(147, 197, 253, 0.08)',
        secondary: isLight ? 'rgba(16, 185, 129, 0.04)' : 'rgba(34, 197, 94, 0.10)',
        tertiary: isLight ? 'rgba(245, 158, 11, 0.02)' : 'rgba(251, 191, 36, 0.06)',
      },
      orbit: {
        primary: isLight ? 'rgba(74, 144, 226, 0.05)' : 'rgba(147, 197, 253, 0.12)',
        opacity: isLight ? 0.04 : 0.08,
      },
      particles: {
        primary: isLight ? 'rgba(74, 144, 226, 0.06)' : 'rgba(147, 197, 253, 0.10)',
        opacity: isLight ? 0.05 : 0.08,
      }
    };
  };

  const themeColors = getThemeColors();

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
    
    for (let row = -4; row < Math.ceil(ANIMATION_SIZE / verticalSpacing) + 4; row++) {
      for (let col = -4; col < Math.ceil(ANIMATION_SIZE / horizontalSpacing) + 4; col++) {
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
    // Continuous rotation animation - slower for subtle background effect
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 120000, // 2 minutes for full rotation
        useNativeDriver: true,
      })
    );

    // Orbit animation - slower for subtle background effect
    const orbitAnimation = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 80000, // 80 seconds for orbit
        useNativeDriver: true,
      })
    );

    // Start animations (removed pulse animation to prevent blinking/sharpening)
    rotateAnimation.start();
    orbitAnimation.start();

    // Cleanup
    return () => {
      rotateAnimation.stop();
      orbitAnimation.stop();
    };
  }, [rotateAnim, orbitAnim]);

  // Interpolated values
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Theme-adaptive translucent background overlay */}
      <View style={[
        styles.backgroundOverlay,
        {
          backgroundColor: theme.name === 'light' 
            ? 'rgba(250, 250, 255, 0.4)' 
            : 'rgba(15, 15, 20, 0.6)'
        }
      ]} />
      
      {/* Hexagonal Grid Layer */}
      <Animated.View
        style={[
          styles.hexLayer,
          {
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        <Svg height={ANIMATION_SIZE} width={ANIMATION_SIZE} style={styles.svg}>
          <Defs>
            <LinearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={themeColors.hexGradient.tertiary} stopOpacity="1" />
              <Stop offset="50%" stopColor={themeColors.hexGradient.primary} stopOpacity="1" />
              <Stop offset="100%" stopColor={themeColors.hexGradient.secondary} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {hexGrid.map((hex) => (
            <Polygon
              key={hex.id}
              points={hex.points}
              fill="none"
              stroke="url(#hexGradient)"
              strokeWidth="0.2"
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
              <Stop offset="0%" stopColor={themeColors.orbit.primary} stopOpacity="0" />
              <Stop offset="50%" stopColor={themeColors.orbit.primary} stopOpacity="1" />
              <Stop offset="100%" stopColor={themeColors.orbit.primary} stopOpacity="0" />
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
                opacity={themeColors.orbit.opacity}
              />
              <Circle
                cx={orbit.centerX + orbit.radius}
                cy={orbit.centerY}
                r="3"
                fill={themeColors.orbit.primary.replace(/,\s*[\d.]+\)/, ', 1)')}
                opacity={themeColors.orbit.opacity * 1.5}
              />
            </G>
          ))}
        </Svg>
      </Animated.View>

      {/* Floating Particles Layer */}
      <View style={styles.particleLayer}>
        <Svg height={screenHeight} width={screenWidth} style={styles.svg}>
          {Array.from({ length: 20 }, (_, i) => (
            <Circle
              key={`particle-${i}`}
              cx={Math.random() * screenWidth}
              cy={Math.random() * screenHeight}
              r={Math.random() * 2 + 0.5}
              fill={themeColors.particles.primary.replace(/,\s*[\d.]+\)/, ', 1)')}
              opacity={themeColors.particles.opacity + Math.random() * 0.1}
            />
          ))}
        </Svg>
      </View>
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
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  svg: {
    position: 'absolute',
  },
  hexLayer: {
    position: 'absolute',
    top: -(ANIMATION_SIZE - screenHeight) / 2,
    left: -(ANIMATION_SIZE - screenWidth) / 2,
    width: ANIMATION_SIZE,
    height: ANIMATION_SIZE,
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