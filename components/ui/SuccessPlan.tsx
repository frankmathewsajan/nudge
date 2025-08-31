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
import { GoalResponse, Task } from '../../utils/geminiAI';

const { width: screenWidth } = Dimensions.get('window');

interface SuccessPlanProps {
  goals: string;
  response: GoalResponse;
  onNewGoals: () => void;
  onConfirmPlan: () => void;
}

export const SuccessPlan: React.FC<SuccessPlanProps> = ({ goals, response, onNewGoals, onConfirmPlan }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Calculate total tasks for animations
  const allTasks = [
    ...response.urgent,
    ...response.long_term,
    ...response.maintenance,
    ...response.optional
  ];
  
  const cardAnimations = useRef(allTasks.map(() => new Animated.Value(0))).current;

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
      Animated.stagger(150, 
        cardAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        )
      ),
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

  const TaskCard: React.FC<{
    task: Task;
    index: number;
    categoryColor: string;
  }> = ({ task, index, categoryColor }) => {
    const animationIndex = allTasks.findIndex(t => t === task);
    
    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: cardAnimations[animationIndex] || 1,
            transform: [
              {
                translateY: cardAnimations[animationIndex]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }) || 0,
              },
            ],
          },
        ]}
      >
        <PremiumCard variant="primary" style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={[styles.priorityIndicator, { backgroundColor: categoryColor }]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
            <View style={styles.taskMeta}>
              <Text style={styles.taskDuration}>{task.duration}</Text>
              <Text style={styles.taskFrequency}>{task.frequency}</Text>
            </View>
          </View>
          <Text style={styles.taskTitle}>{task.task}</Text>
          <View style={styles.taskDetails}>
            <Text style={styles.taskTime}>{task.suggested_time}</Text>
            {task.deadline && (
              <Text style={styles.taskDeadline}>Due: {task.deadline}</Text>
            )}
          </View>
        </PremiumCard>
      </Animated.View>
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

            {/* Premium Grid Layout */}
            <View style={styles.premiumGrid}>
              {/* Urgent Tasks */}
              {response.urgent.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Urgent</Text>
                  <View style={styles.cardsGrid}>
                    {response.urgent.map((task, index) => (
                      <TaskCard 
                        key={`urgent-${index}`}
                        task={task} 
                        index={index} 
                        categoryColor="#EF4444" 
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Long Term Goals */}
              {response.long_term.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Long Term</Text>
                  <View style={styles.cardsGrid}>
                    {response.long_term.map((task, index) => (
                      <TaskCard 
                        key={`long-term-${index}`}
                        task={task} 
                        index={index} 
                        categoryColor="#D4AF37" 
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Maintenance Tasks */}
              {response.maintenance.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Maintenance</Text>
                  <View style={styles.cardsGrid}>
                    {response.maintenance.map((task, index) => (
                      <TaskCard 
                        key={`maintenance-${index}`}
                        task={task} 
                        index={index} 
                        categoryColor="#6B7280" 
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Optional Tasks */}
              {response.optional.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Optional</Text>
                  <View style={styles.cardsGrid}>
                    {response.optional.map((task, index) => (
                      <TaskCard 
                        key={`optional-${index}`}
                        task={task} 
                        index={index} 
                        categoryColor="#8B5CF6" 
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Premium Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={onConfirmPlan}
                activeOpacity={0.95}
              >
                <Text style={styles.primaryButtonText}>Looks Good!</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={onNewGoals}
                activeOpacity={0.95}
              >
                <Text style={styles.secondaryButtonText}>Create New Goals</Text>
              </TouchableOpacity>
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

  // Task Cards
  taskCard: {
    minHeight: 120,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  taskMeta: {
    alignItems: 'flex-end',
  },
  taskDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskFrequency: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  taskDeadline: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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

  // Action
  actionContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#D4AF37', // Gold primary action
    borderRadius: 8,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#B8941F',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 200,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    minWidth: 200,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  premiumButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 200,
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
