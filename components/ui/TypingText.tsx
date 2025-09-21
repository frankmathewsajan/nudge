// TypingText - Smooth book-reading-like animation
// Creates fluid character-by-character reveal with strategic pauses

import React, { useEffect, useState } from 'react';
import { Animated, Text, TextStyle, View } from 'react-native';

interface TypingTextProps {
  text: string;
  style?: TextStyle | TextStyle[];
  speed?: number; // consistent speed in milliseconds per character
  delay?: number; // initial delay before starting
  showCursor?: boolean; // whether to show blinking cursor
  onComplete?: () => void;
}

export const TypingText: React.FC<TypingTextProps> = ({
  text,
  style,
  speed = 30, // fast, consistent speed for smooth flow
  delay = 0,
  showCursor = false, // no cursor by default for cleaner look
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const cursorOpacity = useState(new Animated.Value(1))[0];

  // Calculate strategic pauses for natural reading rhythm
  const calculateDelay = (char: string, prevChar: string, text: string, index: number) => {
    const baseSpeed = speed;
    
    // Strategic pauses at natural breakpoints (like reading aloud)
    if (prevChar === '.') return baseSpeed + 800; // Long pause after sentences
    if (prevChar === ',' || prevChar === ';') return baseSpeed + 300; // Medium pause after clauses
    if (prevChar === '?' || prevChar === '!') return baseSpeed + 600; // Pause after questions/exclamations
    if (prevChar === ':') return baseSpeed + 200; // Short pause after colons
    
    // Breathing pause after significant phrases (every 50-80 characters)
    const wordsFromLastPause = text.substring(Math.max(0, index - 60), index).split(' ').length;
    if (char === ' ' && wordsFromLastPause > 8 && Math.random() > 0.7) {
      return baseSpeed + 150; // Occasional breathing pause
    }
    
    return baseSpeed; // Consistent, smooth speed
  };

  // Smooth cursor animation (when enabled)
  useEffect(() => {
    if (!showCursor) return;

    const blinkAnimation = () => {
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
      ]).start(() => {
        if (!isComplete) {
          blinkAnimation();
        }
      });
    };

    blinkAnimation();
  }, [showCursor, isComplete, cursorOpacity]);

  // Main typing effect with smooth flow
  useEffect(() => {
    if (delay > 0) {
      const delayTimeout = setTimeout(() => {
        setCurrentIndex(0);
      }, delay);
      return () => clearTimeout(delayTimeout);
    } else {
      setCurrentIndex(0);
    }
  }, [delay]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const currentChar = text[currentIndex];
      const prevChar = currentIndex > 0 ? text[currentIndex - 1] : '';
      const dynamicDelay = calculateDelay(currentChar, prevChar, text, currentIndex);

      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, dynamicDelay);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        // Small delay before calling onComplete for smooth transition
        setTimeout(onComplete, 400);
      }
    }
  }, [currentIndex, text, isComplete, onComplete, speed]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' }}>
      <Text style={style}>{displayedText}</Text>
      {showCursor && !isComplete && (
        <Animated.Text 
          style={[
            style, 
            { 
              opacity: cursorOpacity,
              color: style && typeof style === 'object' && 'color' in style ? style.color : '#C7D2FE',
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