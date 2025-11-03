/**
 * TerminalLoader - Terminal-style loading animation
 * 
 * Shows AI analysis progress with typewriter effects and status updates
 * Provides engaging feedback during goal analysis
 */

import { Theme } from '@/contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface TerminalLoaderProps {
  theme: Theme;
  isVisible: boolean;
  stage: 'analyzing' | 'parsing' | 'success' | 'error';
  errorMessage?: string;
  onComplete?: () => void;
}

interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
}

export const TerminalLoader: React.FC<TerminalLoaderProps> = ({
  theme,
  isVisible,
  stage,
  errorMessage,
  onComplete,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingInterval = useRef<any>(null);
  const cursorBlinkValue = useRef(new Animated.Value(1)).current;

  const styles = createTerminalStyles(theme);

  // Terminal messages for different stages
  const stageMessages: Record<string, LogEntry[]> = {
    analyzing: [
      { id: '1', text: 'nudge@ai:~$ Initializing goal analysis...', type: 'info', timestamp: new Date().toLocaleTimeString() },
      { id: '2', text: 'Loading Gemini AI models...', type: 'info', timestamp: new Date().toLocaleTimeString() },
      { id: '3', text: 'Processing natural language input...', type: 'info', timestamp: new Date().toLocaleTimeString() },
      { id: '4', text: 'Analyzing goal complexity and context...', type: 'warning', timestamp: new Date().toLocaleTimeString() },
      { id: '5', text: 'Generating smart breakdown strategies...', type: 'info', timestamp: new Date().toLocaleTimeString() },
      { id: '6', text: 'Calculating time recommendations...', type: 'info', timestamp: new Date().toLocaleTimeString() },
    ],
    parsing: [
      { id: '7', text: 'Received AI response (2.1KB)', type: 'success', timestamp: new Date().toLocaleTimeString() },
      { id: '8', text: 'Parsing JSON structure...', type: 'info', timestamp: new Date().toLocaleTimeString() },
      { id: '9', text: 'Validating analysis completeness...', type: 'info', timestamp: new Date().toLocaleTimeString() },
    ],
    success: [
      { id: '10', text: '✓ Goal analysis completed successfully!', type: 'success', timestamp: new Date().toLocaleTimeString() },
      { id: '11', text: 'Generated smart breakdown with actionable steps', type: 'success', timestamp: new Date().toLocaleTimeString() },
      { id: '12', text: 'Ready to display planning interface...', type: 'success', timestamp: new Date().toLocaleTimeString() },
    ],
    error: [
      { id: 'error', text: `✗ Analysis failed: ${errorMessage || 'Unknown error'}`, type: 'error', timestamp: new Date().toLocaleTimeString() },
      { id: 'fallback', text: 'Falling back to smart recommendations...', type: 'warning', timestamp: new Date().toLocaleTimeString() },
    ],
  };

  // Cursor blinking animation
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorBlinkValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorBlinkValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blinkAnimation.start();
    return () => blinkAnimation.stop();
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!isVisible) {
      setLogs([]);
      setCurrentIndex(0);
      return;
    }

    const messages = stage === 'error' 
      ? stageMessages.error 
      : [...stageMessages.analyzing, ...stageMessages.parsing, ...stageMessages.success];

    if (currentIndex < messages.length) {
      const currentMessage = messages[currentIndex];
      setIsTyping(true);
      
      let charIndex = 0;
      const typeMessage = () => {
        if (charIndex <= currentMessage.text.length) {
          const partialMessage = {
            ...currentMessage,
            text: currentMessage.text.substring(0, charIndex),
          };
          
          setLogs(prev => {
            const newLogs = [...prev];
            newLogs[currentIndex] = partialMessage;
            return newLogs;
          });
          
          charIndex++;
          typingInterval.current = setTimeout(typeMessage, 20 + Math.random() * 40);
        } else {
          setIsTyping(false);
          setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
          }, 200 + Math.random() * 300);
        }
      };

      if (!logs[currentIndex]) {
        setLogs(prev => [...prev, { ...currentMessage, text: '' }]);
      }
      
      setTimeout(typeMessage, 100);
    } else if (stage === 'success' && onComplete) {
      setTimeout(onComplete, 1000);
    }

    return () => {
      if (typingInterval.current) {
        clearTimeout(typingInterval.current);
      }
    };
  }, [currentIndex, stage, isVisible]);

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [logs]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.terminalHeader}>
        <View style={styles.terminalControls}>
          <View style={[styles.controlButton, styles.closeButton]} />
          <View style={[styles.controlButton, styles.minimizeButton]} />
          <View style={[styles.controlButton, styles.maximizeButton]} />
        </View>
        <Text style={styles.terminalTitle}>Nudge AI Analysis Terminal</Text>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.terminalBody}
        showsVerticalScrollIndicator={false}
      >
        {logs.map((log, index) => (
          <View key={log.id} style={styles.logEntry}>
            <Text style={styles.timestamp}>[{log.timestamp}]</Text>
            <MaterialIcons 
              name={
                log.type === 'success' ? 'check-circle' :
                log.type === 'error' ? 'error' :
                log.type === 'warning' ? 'warning' :
                'info'
              }
              size={12}
              color={
                log.type === 'success' ? '#10B981' :
                log.type === 'error' ? '#EF4444' :
                log.type === 'warning' ? '#F59E0B' :
                theme.colors.accentVibrant
              }
              style={styles.logIcon}
            />
            <Text style={[
              styles.logText,
              { color: 
                log.type === 'success' ? '#10B981' :
                log.type === 'error' ? '#EF4444' :
                log.type === 'warning' ? '#F59E0B' :
                theme.colors.textPrimary
              }
            ]}>
              {log.text}
            </Text>
            {index === currentIndex && isTyping && (
              <Animated.Text 
                style={[
                  styles.cursor,
                  { opacity: cursorBlinkValue }
                ]}
              >
                ▋
              </Animated.Text>
            )}
          </View>
        ))}
        
        {/* Empty space for better scrolling */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const createTerminalStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.name === 'dark' ? '#0D1117' : '#F6F8FA',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginVertical: 10,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: theme.name === 'dark' ? '#30363D' : '#D0D7DE',
  },
  
  terminalHeader: {
    backgroundColor: theme.name === 'dark' ? '#161B22' : '#F6F8FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.name === 'dark' ? '#30363D' : '#D0D7DE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  terminalControls: {
    flexDirection: 'row',
    gap: 8,
  },
  
  controlButton: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  closeButton: {
    backgroundColor: '#FF5F57',
  },
  
  minimizeButton: {
    backgroundColor: '#FFBD2E',
  },
  
  maximizeButton: {
    backgroundColor: '#28CA42',
  },
  
  terminalTitle: {
    color: theme.name === 'dark' ? '#F0F6FC' : '#24292F',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 12,
    fontFamily: 'monospace',
  },
  
  terminalBody: {
    backgroundColor: theme.name === 'dark' ? '#0D1117' : '#FFFFFF',
    padding: 16,
    maxHeight: 320,
  },
  
  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  
  timestamp: {
    color: theme.name === 'dark' ? '#7D8590' : '#656D76',
    fontSize: 11,
    fontFamily: 'monospace',
    marginRight: 8,
  },
  
  logIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  
  logText: {
    fontSize: 13,
    fontFamily: 'monospace',
    flex: 1,
    lineHeight: 18,
  },
  
  cursor: {
    color: theme.colors.accentVibrant,
    fontSize: 13,
    fontFamily: 'monospace',
    marginLeft: 2,
  },
});