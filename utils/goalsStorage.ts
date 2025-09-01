import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS_STORAGE_KEY = '@nudge_user_goals';
const GOALS_HISTORY_KEY = '@nudge_goals_history';

export interface SavedGoal {
  id: string;
  originalText: string;
  formattedText: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface GoalsHistory {
  goals: SavedGoal[];
}

// Format and correct grammar of goals text
export function formatGoalsText(text: string): string {
  // Basic formatting and grammar corrections
  let formatted = text.trim();
  
  // Capitalize first letter
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  
  // Ensure proper punctuation
  if (formatted.length > 0 && !formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
    formatted += '.';
  }
  
  // Basic grammar fixes
  formatted = formatted
    // Fix common typos
    .replace(/\bi\b/g, 'I')
    .replace(/\bim\b/gi, "I'm")
    .replace(/\bive\b/gi, "I've")
    .replace(/\bill\b/gi, "I'll")
    .replace(/\bid\b/gi, "I'd")
    // Fix spacing
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    // Fix sentence structure
    .replace(/\.\s*([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
  
  return formatted;
}

// Save current goals
export async function saveGoals(originalText: string): Promise<SavedGoal> {
  try {
    const formattedText = formatGoalsText(originalText);
    const goalId = Date.now().toString();
    
    const goal: SavedGoal = {
      id: goalId,
      originalText,
      formattedText,
      createdAt: new Date(),
      lastUsed: new Date(),
    };
    
    // Save as current goals
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goal));
    
    // Add to history
    await addToGoalsHistory(goal);
    
    return goal;
  } catch (error) {
    console.error('Error saving goals:', error);
    throw error;
  }
}

// Get current saved goals
export async function getCurrentGoals(): Promise<SavedGoal | null> {
  try {
    const goalsData = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    if (!goalsData) return null;
    
    const goal = JSON.parse(goalsData);
    // Convert date strings back to Date objects
    goal.createdAt = new Date(goal.createdAt);
    goal.lastUsed = new Date(goal.lastUsed);
    
    return goal;
  } catch (error) {
    console.error('Error getting current goals:', error);
    return null;
  }
}

// Update last used timestamp
export async function updateGoalsLastUsed(goalId: string): Promise<void> {
  try {
    const currentGoal = await getCurrentGoals();
    if (currentGoal && currentGoal.id === goalId) {
      currentGoal.lastUsed = new Date();
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(currentGoal));
    }
  } catch (error) {
    console.error('Error updating goals last used:', error);
  }
}

// Add goal to history
async function addToGoalsHistory(goal: SavedGoal): Promise<void> {
  try {
    const historyData = await AsyncStorage.getItem(GOALS_HISTORY_KEY);
    let history: GoalsHistory = { goals: [] };
    
    if (historyData) {
      history = JSON.parse(historyData);
      // Convert date strings back to Date objects
      history.goals = history.goals.map(g => ({
        ...g,
        createdAt: new Date(g.createdAt),
        lastUsed: new Date(g.lastUsed),
      }));
    }
    
    // Remove duplicate if exists
    history.goals = history.goals.filter(g => g.id !== goal.id);
    
    // Add new goal to beginning
    history.goals.unshift(goal);
    
    // Keep only last 10 goals
    history.goals = history.goals.slice(0, 10);
    
    await AsyncStorage.setItem(GOALS_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding to goals history:', error);
  }
}

// Get goals history
export async function getGoalsHistory(): Promise<SavedGoal[]> {
  try {
    const historyData = await AsyncStorage.getItem(GOALS_HISTORY_KEY);
    if (!historyData) return [];
    
    const history: GoalsHistory = JSON.parse(historyData);
    // Convert date strings back to Date objects
    return history.goals.map(g => ({
      ...g,
      createdAt: new Date(g.createdAt),
      lastUsed: new Date(g.lastUsed),
    }));
  } catch (error) {
    console.error('Error getting goals history:', error);
    return [];
  }
}

// Clear current goals
export async function clearCurrentGoals(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GOALS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing current goals:', error);
  }
}

// Clear all goals data
export async function clearAllGoalsData(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(GOALS_STORAGE_KEY),
      AsyncStorage.removeItem(GOALS_HISTORY_KEY),
    ]);
  } catch (error) {
    console.error('Error clearing all goals data:', error);
  }
}
