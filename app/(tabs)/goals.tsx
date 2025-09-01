import { FontAwesome } from '@expo/vector-icons';
import { MeshGradient } from '@kuss/react-native-mesh-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AsyncStorageUtils } from '../../utils/asyncStorage';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'career' | 'health' | 'learning' | 'finance';
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  progress: number;
  completed: boolean;
  createdAt: string;
}

const GOALS_STORAGE_KEY = 'user_goals';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    priority: 'medium' as Goal['priority'],
    deadline: '',
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadGoals();
    // Animate in
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
    ]).start();
  }, []);

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorageUtils.getString(GOALS_STORAGE_KEY);
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      await AsyncStorageUtils.setString(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const addGoal = () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Missing Information', 'Please enter a goal title');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      deadline: newGoal.deadline,
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    
    // Reset form
    setNewGoal({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      deadline: '',
    });
    setShowAddGoal(false);
  };

  const deleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedGoals = goals.filter(goal => goal.id !== goalId);
            saveGoals(updatedGoals);
          },
        },
      ]
    );
  };

  const toggleGoalComplete = (goalId: string) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed, progress: goal.completed ? 0 : 100 } : goal
    );
    saveGoals(updatedGoals);
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'personal': return 'user';
      case 'career': return 'briefcase';
      case 'health': return 'heart';
      case 'learning': return 'graduation-cap';
      case 'finance': return 'dollar';
      default: return 'bullseye';
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'personal': return '#6750A4';
      case 'career': return '#2196F3';
      case 'health': return '#4CAF50';
      case 'learning': return '#FF9800';
      case 'finance': return '#9C27B0';
      default: return '#6750A4';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#FF9800';
    }
  };

  const renderGoalCard = (goal: Goal) => (
    <View key={goal.id} style={styles.goalCard}>
      <MeshGradient
        colors={['#F8F5FF', '#E8EAFF', '#F0F2FF', '#E8F0FE']}
        style={styles.goalCardGradient}
      />
      
      <View style={styles.goalHeader}>
        <View style={styles.goalHeaderLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(goal.category) }]}>
            <FontAwesome name={getCategoryIcon(goal.category)} size={16} color="#FFFFFF" />
          </View>
          <View style={styles.goalTitleContainer}>
            <Text style={[styles.goalTitle, goal.completed && styles.completedText]}>
              {goal.title}
            </Text>
            <View style={styles.goalMeta}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) }]}>
                <Text style={styles.priorityText}>{goal.priority}</Text>
              </View>
              <Text style={styles.categoryText}>{goal.category}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleGoalComplete(goal.id)}
          >
            <FontAwesome 
              name={goal.completed ? "check-circle" : "circle-o"} 
              size={20} 
              color={goal.completed ? "#4CAF50" : "#9E9E9E"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteGoal(goal.id)}
          >
            <FontAwesome name="trash" size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      {goal.description && (
        <Text style={styles.goalDescription}>{goal.description}</Text>
      )}

      {goal.deadline && (
        <View style={styles.deadlineContainer}>
          <FontAwesome name="calendar" size={14} color="#49454F" />
          <Text style={styles.deadlineText}>
            Due: {new Date(goal.deadline).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{goal.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${goal.progress}%`,
                backgroundColor: getCategoryColor(goal.category),
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );

  if (showAddGoal) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <MeshGradient
          colors={['#F8F9FA', '#E8F0FE', '#F3E5F5']}
          style={styles.gradientBackground}
        />
        
        <ScrollView style={styles.addGoalContainer}>
          <View style={[styles.addGoalHeader, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowAddGoal(false)}
            >
              <FontAwesome name="arrow-left" size={20} color="#6750A4" />
            </TouchableOpacity>
            <Text style={styles.addGoalTitle}>Add New Goal</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.addGoalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What do you want to achieve?"
                value={newGoal.title}
                onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
                placeholderTextColor="#79747E"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Add more details about your goal..."
                value={newGoal.description}
                onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
                multiline
                numberOfLines={3}
                placeholderTextColor="#79747E"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {(['personal', 'career', 'health', 'learning', 'finance'] as Goal['category'][]).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newGoal.category === category && styles.categoryOptionSelected,
                      { borderColor: getCategoryColor(category) }
                    ]}
                    onPress={() => setNewGoal({ ...newGoal, category })}
                  >
                    <FontAwesome 
                      name={getCategoryIcon(category)} 
                      size={16} 
                      color={newGoal.category === category ? '#FFFFFF' : getCategoryColor(category)} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      newGoal.category === category && styles.categoryOptionTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.prioritySelector}>
                {(['high', 'medium', 'low'] as Goal['priority'][]).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      newGoal.priority === priority && { backgroundColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setNewGoal({ ...newGoal, priority })}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      newGoal.priority === priority && styles.priorityOptionTextSelected
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addGoal}>
              <FontAwesome name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <MeshGradient
        colors={['#F8F9FA', '#E8F0FE', '#F3E5F5']}
        style={styles.gradientBackground}
      />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome name="bullseye" size={24} color="#6750A4" />
              </View>
              <View>
                <Text style={styles.headerTitle}>My Goals</Text>
                <Text style={styles.headerSubtitle}>
                  {goals.length} {goals.length === 1 ? 'goal' : 'goals'} • {goals.filter(g => g.completed).length} completed
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.addGoalButton}
              onPress={() => setShowAddGoal(true)}
            >
              <FontAwesome name="plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals List */}
        <ScrollView 
          style={styles.goalsList}
          contentContainerStyle={styles.goalsListContent}
          showsVerticalScrollIndicator={false}
        >
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="bullseye" size={64} color="#E0E0E0" />
              <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
              <Text style={styles.emptyStateText}>
                Start your journey by adding your first goal!
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowAddGoal(true)}
              >
                <FontAwesome name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Add Your First Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map(renderGoalCard)
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1B20',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#49454F',
    fontWeight: '400',
    fontFamily: 'System',
  },
  addGoalButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6750A4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  goalsListContent: {
    paddingBottom: 40,
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  goalCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1B20',
    marginBottom: 4,
    fontFamily: 'System',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  categoryText: {
    fontSize: 12,
    color: '#49454F',
    textTransform: 'capitalize',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalDescription: {
    fontSize: 14,
    color: '#49454F',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  deadlineText: {
    fontSize: 12,
    color: '#49454F',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#49454F',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#1D1B20',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1B20',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#49454F',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#6750A4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Add Goal Form Styles
  addGoalContainer: {
    flex: 1,
  },
  addGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1B20',
  },
  placeholder: {
    width: 44,
  },
  addGoalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1B20',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.5)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1D1B20',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    gap: 6,
  },
  categoryOptionSelected: {
    backgroundColor: '#6750A4',
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.5)',
    alignItems: 'center',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1B20',
    textTransform: 'capitalize',
  },
  priorityOptionTextSelected: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#6750A4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
