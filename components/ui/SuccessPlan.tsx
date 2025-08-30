import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import config from '../../config';
import { GoalResponse } from '../../utils/geminiAI';
import {
    PrimaryButton
} from '../ui/StyledComponents';

const { width: screenWidth } = Dimensions.get('window');

interface SuccessPlanProps {
  goals: string;
  response: GoalResponse;
  onNewGoals: () => void;
}

export const SuccessPlan: React.FC<SuccessPlanProps> = ({ goals, response, onNewGoals }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnimations = useRef(response.suggestions.map(() => new Animated.Value(0))).current;
  const stepAnimations = useRef(response.steps.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Stagger animations for smooth entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Animate cards with stagger
      Animated.stagger(150, [
        ...cardAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        ),
        ...stepAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        ),
      ]),
    ]).start();
  }, []);

  const PremiumCard: React.FC<{
    children: React.ReactNode;
    style?: any;
    variant?: 'hero' | 'primary' | 'secondary' | 'accent';
    onPress?: () => void;
  }> = ({ children, style, variant = 'primary', onPress }) => {
    const cardStyles = {
      hero: styles.heroCard,
      primary: styles.primaryCard,
      secondary: styles.secondaryCard,
      accent: styles.accentCard,
    };

    return (
      <TouchableOpacity
        style={[styles.baseCard, cardStyles[variant], style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.95 : 1}
      >
        {children}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFEFE" />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Premium Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.mainTitle}>Success Plan</Text>
              <View style={styles.titleUnderline} />
              <Text style={styles.subtitle}>Your personalized roadmap to achievement</Text>
              
              <View style={styles.goalQuote}>
                <Text style={styles.quoteText}>"{goals}"</Text>
              </View>
              
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  AI Analysis Complete {config.app.mockMode && '(Demo)'}
                </Text>
              </View>
            </View>

            {/* Hero Motivation Card */}
            <PremiumCard variant="hero" style={styles.motivationSection}>
              <Text style={styles.sectionLabel}>Motivation</Text>
              <Text style={styles.motivationText}>{response.motivation}</Text>
            </PremiumCard>

            {/* Premium Grid Layout */}
            <View style={styles.premiumGrid}>
              {/* Strategic Suggestions */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Strategic Insights</Text>
                <View style={styles.cardsGrid}>
                  {response.suggestions.map((suggestion, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.cardWrapper,
                        {
                          opacity: cardAnimations[index],
                          transform: [
                            {
                              translateY: cardAnimations[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <PremiumCard variant="primary" style={styles.suggestionCard}>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardNumber}>
                            <Text style={styles.cardNumberText}>{index + 1}</Text>
                          </View>
                        </View>
                        <Text style={styles.cardContent}>{suggestion}</Text>
                      </PremiumCard>
                    </Animated.View>
                  ))}
                </View>
              </View>

              {/* Action Steps */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Next Actions</Text>
                <View style={styles.stepsContainer}>
                  {response.steps.map((step, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.stepWrapper,
                        {
                          opacity: stepAnimations[index],
                          transform: [
                            {
                              translateX: stepAnimations[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <PremiumCard variant="secondary" style={styles.stepCard}>
                        <View style={styles.stepHeader}>
                          <Text style={styles.stepNumber}>{index + 1}</Text>
                          <View style={styles.stepLine} />
                        </View>
                        <Text style={styles.stepContent}>{step}</Text>
                      </PremiumCard>
                    </Animated.View>
                  ))}
                </View>
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.actionContainer}>
              <PrimaryButton onPress={onNewGoals} size="large">
                Create New Goals
              </PrimaryButton>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  // Base Layout
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE', // Pure white like magazine pages
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40, // More space from status bar
  },

  // Premium Header
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingTop: 20, // Extra safe area padding
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: '300', // Lighter weight for elegance
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: 'System', // Will use SF Pro on iOS
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 1,
    backgroundColor: '#D4AF37', // Luxury gold accent
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  goalQuote: {
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    padding: 24,
    marginBottom: 24,
    width: '100%',
    maxWidth: 320,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '400',
  },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Premium Cards
  baseCard: {
    borderRadius: 8, // Subtle rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 32,
    marginBottom: 40,
  },
  primaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
  },
  secondaryCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 20,
  },
  accentCard: {
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#E5E7EB',
    borderRightColor: '#E5E7EB',
    borderBottomColor: '#E5E7EB',
    padding: 24,
  },

  // Motivation Section
  motivationSection: {
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  motivationText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#1F2937',
    lineHeight: 32,
    textAlign: 'left',
  },

  // Premium Grid
  premiumGrid: {
    marginBottom: 40,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: 24,
    letterSpacing: -0.3,
  },

  // Cards Grid
  cardsGrid: {
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  suggestionCard: {
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
  },

  // Steps
  stepsContainer: {
    gap: 16,
  },
  stepWrapper: {
    marginBottom: 16,
  },
  stepCard: {
    minHeight: 100,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '300',
    color: '#D4AF37',
    marginRight: 12,
    minWidth: 24,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  stepContent: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
    paddingLeft: 36,
  },

  // Action
  actionContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
