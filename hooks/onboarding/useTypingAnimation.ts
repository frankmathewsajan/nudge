/**
 * TypingAnimationEngine
 * 
 * Core animation logic extracted from TypingText component.
 * Handles word-by-word reveal with precise timing control.
 * 
 * Critical: Dependency array excludes onComplete to prevent re-render loops.
 */

import { useEffect, useRef, useState } from 'react';

interface TypingAnimationState {
  displayedText: string;
  isComplete: boolean;
  isAnimating: boolean;
}

interface TypingAnimationConfig {
  text: string;
  speed: number;
  delay: number;
  onComplete?: () => void;
}

/**
 * Hook for word-by-word typing animation.
 * 
 * Engineered to prevent infinite re-render loops by excluding
 * onComplete from dependency array. Only text content changes
 * should trigger animation restart.
 */
export const useTypingAnimation = ({
  text,
  speed,
  delay,
  onComplete
}: TypingAnimationConfig): TypingAnimationState => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup previous animation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reset animation state
    setDisplayedText('');
    setIsComplete(false);
    setIsAnimating(false);

    const words = text.split(' ');
    let currentWordIndex = 0;

    const executeAnimation = () => {
      setIsAnimating(true);
      
      const revealNextWord = () => {
        if (currentWordIndex < words.length) {
          const visibleWords = words.slice(0, currentWordIndex + 1);
          setDisplayedText(visibleWords.join(' '));
          currentWordIndex++;
          
          timeoutRef.current = setTimeout(revealNextWord, speed);
        } else {
          // Animation sequence complete
          setIsComplete(true);
          setIsAnimating(false);
          
          // Trigger completion callback with slight delay for visual polish
          if (onComplete) {
            timeoutRef.current = setTimeout(onComplete, 200);
          }
        }
      };

      // Start animation with optional delay
      timeoutRef.current = setTimeout(revealNextWord, delay);
    };

    executeAnimation();

    // Cleanup on unmount or re-run
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, delay]); // Intentionally excludes onComplete

  return { displayedText, isComplete, isAnimating };
};