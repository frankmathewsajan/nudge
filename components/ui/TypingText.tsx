/**
 * TypingText Component - Refactored for Clean Architecture
 * 
 * Single Responsibility: Present animated text with extracted animation logic.
 * All timing and state management delegated to useTypingAnimation hook.
 */

import React, { useEffect, useState } from 'react';
import { Animated, Text, TextStyle, View } from 'react-native';
import { useTypingAnimation } from '../../hooks/onboarding/useTypingAnimation';

interface TypingTextProps {
  text: string;
  style?: TextStyle | TextStyle[];
  speed?: number;
  delay?: number;
  showCursor?: boolean;
  onComplete?: () => void;
}

/**
 * Clean presentation component for word-by-word text animation.
 * 
 * Architecture:
 * - Animation logic extracted to useTypingAnimation hook
 * - Cursor animation runs independently for smooth UX
 * - Minimal state management in component itself
 */
export const TypingText: React.FC<TypingTextProps> = ({
  text,
  style,
  speed = 200,
  delay = 0,
  showCursor = false,
  onComplete
}) => {
  const { displayedText, isComplete } = useTypingAnimation({
    text,
    speed,
    delay,
    onComplete
  });

  const [cursorOpacity] = useState(new Animated.Value(1));

  // Independent cursor blink animation - no interference with text animation
  useEffect(() => {
    if (!showCursor || isComplete) return;

    const createBlinkSequence = () => {
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(createBlinkSequence);
    };

    createBlinkSequence();
  }, [showCursor, isComplete, cursorOpacity]);

  const getCursorColor = () => {
    if (style && typeof style === 'object' && 'color' in style) {
      return style.color;
    }
    return '#C7D2FE';
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={style}>{displayedText}</Text>
      {showCursor && !isComplete && (
        <Animated.Text 
          style={[
            style, 
            { 
              opacity: cursorOpacity,
              color: getCursorColor(),
              marginLeft: 1,
              fontWeight: '300',
            }
          ]}
        >
          |
        </Animated.Text>
      )}
    </View>
  );
};