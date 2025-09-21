/**
 * useKeyboardAware - Keyboard visibility and height tracking
 * 
 * Provides seamless keyboard handling for better UX.
 * Tracks keyboard state and adjusts UI accordingly.
 */

import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  animationDuration?: number;
}

/**
 * Hook for tracking keyboard visibility and height.
 * 
 * Enables UI components to respond gracefully to keyboard events
 * for better user experience during text input.
 */
export const useKeyboardAware = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    animationDuration: 0,
  });

  useEffect(() => {
    const keyboardWillShow = (event: KeyboardEvent) => {
      setKeyboardState({
        isVisible: true,
        height: event.endCoordinates.height,
        animationDuration: event.duration,
      });
    };

    const keyboardWillHide = (event: KeyboardEvent) => {
      setKeyboardState({
        isVisible: false,
        height: 0,
        animationDuration: event.duration,
      });
    };

    const keyboardDidShow = (event: KeyboardEvent) => {
      setKeyboardState(prev => ({
        ...prev,
        isVisible: true,
        height: event.endCoordinates.height,
      }));
    };

    const keyboardDidHide = () => {
      setKeyboardState(prev => ({
        ...prev,
        isVisible: false,
        height: 0,
      }));
    };

    // Use platform-specific events for better UX
    const showEvent = 'keyboardWillShow';
    const hideEvent = 'keyboardWillHide';
    const didShowEvent = 'keyboardDidShow';
    const didHideEvent = 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideSubscription = Keyboard.addListener(hideEvent, keyboardWillHide);
    const didShowSubscription = Keyboard.addListener(didShowEvent, keyboardDidShow);
    const didHideSubscription = Keyboard.addListener(didHideEvent, keyboardDidHide);

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
      didShowSubscription?.remove();
      didHideSubscription?.remove();
    };
  }, []);

  return keyboardState;
};