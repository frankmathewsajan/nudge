// Form Onboarding - Conversational chat with dynamic typing effects
// Linear flow: name input → age confirmation → greeting → policy → acknowledge button

import styles from '@/assets/styles/form-onboarding.styles';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: number;
}

interface FormOnboardingProps {
  onComplete: (userName: string) => void;
}

export const FormOnboarding: React.FC<FormOnboardingProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isInputEnabled, setIsInputEnabled] = useState(false);
  const [typingText, setTypingText] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const typingSequence = [
    "I'm...",
    "I'm Nudge...",
    "I'm Nudge, a next‑gen goal AI...",
    "I'm Nudge, a next‑gen goal AI built to help you achieve your goals..."
  ];

  useEffect(() => {
    // Start the conversation with typing effect
    setTimeout(() => startTypingSequence(), 1000);
    
    // Animate screen in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const startTypingSequence = async () => {
    setIsTyping(true);
    
    for (let i = 0; i < typingSequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setTypingText(typingSequence[i]);
    }
    
    // Add final message to chat
    await new Promise(resolve => setTimeout(resolve, 1000));
    addMessage('ai', typingSequence[typingSequence.length - 1]);
    setIsTyping(false);
    setTypingText('');
    
    // Ask for name
    setTimeout(() => {
      addMessage('ai', "What's your name?");
      setIsInputEnabled(true);
    }, 1000);
  };

  const addMessage = (type: 'ai' | 'user', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    const userMessage = currentInput.trim();
    addMessage('user', userMessage);
    setCurrentInput('');
    setIsInputEnabled(false);

    if (step === 0) {
      // Name input step
      setUserName(userMessage);
      setTimeout(() => {
        addMessage('ai', `Are you 13 years or older, ${userMessage}?`);
        setStep(1);
        // Show age confirmation buttons instead of text input
      }, 1000);
    }
  };

  const handleAgeConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      setIsAgeConfirmed(true);
      addMessage('user', 'Yes, I am 13 or older');
      
      setTimeout(() => {
        addMessage('ai', `Lovely to meet you, ${userName}!`);
        
        setTimeout(() => {
          addMessage('ai', 'A few things to know before we start working together:');
          
          setTimeout(() => {
            addMessage('ai', 'policy_section'); // Special identifier for policy section
            setStep(2);
          }, 1000);
        }, 1000);
      }, 1000);
    } else {
      addMessage('user', 'No, I am under 13');
      setTimeout(() => {
        addMessage('ai', 'I\'m sorry, but you must be at least 13 years old to use Nudge.');
      }, 1000);
    }
  };

  const handleAcknowledgeAndContinue = () => {
    onComplete(userName);
  };

  const renderMessage = (message: Message) => {
    if (message.content === 'policy_section') {
      return (
        <View key={message.id} style={styles.policyMessageContainer}>
          <View style={styles.aiMessageBubble}>
            <View style={styles.policySection}>
              <View style={styles.policyIcon}>
                <Text style={styles.policyIconText}>⚠️</Text>
              </View>
              <Text style={styles.policyText}>
                Nudge's{' '}
                <Text style={styles.policyLink}>Acceptable Use Policy</Text>
                {' '}prohibits using Nudge for harm, like producing violent, abusive, or deceptive content.
              </Text>
            </View>
            
            <View style={styles.policySection}>
              <View style={styles.policyIcon}>
                <Text style={styles.policyIconText}>🛡️</Text>
              </View>
              <Text style={styles.policyText}>
                Nudge regularly reviews conversations flagged by our automated abuse detection, and may use them to improve our safety systems.
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.acknowledgeButton}
            onPress={handleAcknowledgeAndContinue}
            accessibilityRole="button"
          >
            <Text style={styles.acknowledgeButtonText}>
              Acknowledge & Continue
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={message.id} style={[
        styles.messageContainer,
        message.type === 'ai' ? styles.aiMessageContainer : styles.userMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          message.type === 'ai' ? styles.aiMessageBubble : styles.userMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            message.type === 'ai' ? styles.aiMessageText : styles.userMessageText
          ]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.aiMessageContainer}>
        <View style={styles.aiMessageBubble}>
          <Text style={styles.aiMessageText}>
            {typingText}
            <Text style={styles.typingCursor}>|</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Hello, I'm Nudge.</Text>
            <Text style={styles.headerSubtitle}>
              I'm a next generation AI assistant built for work and trained to be safe, accurate, and secure.
            </Text>
            <Text style={styles.headerDescription}>
              I'd love for us to get to know each other a bit better.
            </Text>
          </View>

          {/* Name Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.nameInputContainer}>
              {name.trim().length > 0 && (
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(name)}</Text>
                  </View>
                </View>
              )}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Nice to meet you, I'm...</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  textContentType="name"
                />
              </View>
            </View>

            {/* Display user message if name is entered */}
            {name.trim().length > 0 && (
              <View style={styles.userMessageContainer}>
                <Text style={styles.welcomeMessage}>Lovely to meet you, {name.trim()}.</Text>
              </View>
            )}
          </View>

          {/* Requirements Section */}
          {name.trim().length > 0 && (
            <View style={styles.requirementsSection}>
              <Text style={styles.requirementsTitle}>
                A few things to know before we start working together:
              </Text>

              {/* Age Confirmation */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsAgeConfirmed(!isAgeConfirmed)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isAgeConfirmed }}
              >
                <View style={[styles.checkbox, isAgeConfirmed && styles.checkboxChecked]}>
                  {isAgeConfirmed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I confirm that I am at least 18 years of age
                </Text>
              </TouchableOpacity>

              {/* Policy Section */}
              <View style={styles.policySection}>
                <View style={styles.policyIcon}>
                  <Text style={styles.policyIconText}>✋</Text>
                </View>
                <View style={styles.policyContent}>
                  <Text style={styles.policyText}>
                    Nudge's{' '}
                    <Text style={styles.policyLink}>Acceptable Use Policy</Text>
                    {' '}prohibits using Nudge for harm, like producing violent, abusive, or deceptive content.
                  </Text>
                </View>
              </View>

              <View style={styles.policySection}>
                <View style={styles.policyIcon}>
                  <Text style={styles.policyIconText}>🛡️</Text>
                </View>
                <View style={styles.policyContent}>
                  <Text style={styles.policyText}>
                    Nudge regularly reviews conversations flagged by our automated abuse detection, and may use them to improve our safety systems.
                  </Text>
                </View>
              </View>

              {/* Policy Acknowledgment */}
              <TouchableOpacity
                style={styles.policyButton}
                onPress={handleAcknowledgeAndContinue}
                disabled={!name.trim().length || !isAgeConfirmed}
                accessibilityRole="button"
              >
                <Text style={[styles.policyButtonText, (name.trim().length > 0 && isAgeConfirmed) && styles.policyButtonTextActive]}>
                  {!isPolicyAccepted ? 'Acknowledge & Continue' : 'Continue'}
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.disclaimerText}>
                You can always change your name later
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};