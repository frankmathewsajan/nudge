/**
 * GoalHistoryTab - Displays saved goal analyses
 * 
 * Shows previous goal analyses with the ability to view details
 * and re-access planning screens
 */

import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../contexts/ThemeContext';
import { GoalAnalysisResponse } from '../../services/ai/geminiService';
import { GoalHistoryItem, storageService } from '../../services/storage/storageService';

interface GoalHistoryTabProps {
  theme: Theme;
  onSelectGoal: (goalSummary: string, analysis: GoalAnalysisResponse) => void;
}

export const GoalHistoryTab: React.FC<GoalHistoryTabProps> = ({
  theme,
  onSelectGoal,
}) => {
  const [history, setHistory] = useState<GoalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const styles = createHistoryStyles(theme);

  const loadHistory = async () => {
    try {
      const historyData = await storageService.loadGoalHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load goal history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleDeleteGoal = (item: GoalHistoryItem) => {
    Alert.alert(
      'Delete Goal Analysis',
      'Are you sure you want to delete this goal analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await storageService.deleteGoalAnalysis(item.id);
            if (success) {
              setHistory(prev => prev.filter(h => h.id !== item.id));
            }
          },
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: GoalHistoryItem }) => {
    const date = new Date(item.createdAt);
    const timeAgo = getTimeAgo(date);

    return (
      <View style={styles.historyItem}>
        <TouchableOpacity
          style={styles.itemContent}
          onPress={() => onSelectGoal(item.goalSummary, item.analysis)}
          activeOpacity={0.7}
        >
          <View style={styles.itemHeader}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="flag" size={18} color={theme.colors.accentVibrant} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.goalSummary}
              </Text>
              <Text style={styles.itemDate}>{timeAgo}</Text>
            </View>
          </View>
          
          <View style={styles.itemStats}>
            <View style={styles.stat}>
              <MaterialIcons name="psychology" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>
                {item.analysis.primary_goal.difficulty}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <MaterialIcons name="schedule" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>
                {item.analysis.primary_goal.estimated_timeline}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <MaterialIcons name="checklist" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>
                {item.analysis.primary_goal.smart_breakdown.length} steps
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteGoal(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="delete-outline" size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>
    );
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="hourglass-empty" size={48} color={theme.colors.textTertiary} />
        <Text style={styles.emptyText}>Loading history...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="history" size={48} color={theme.colors.textTertiary} />
        <Text style={styles.emptyText}>No goal analyses yet</Text>
        <Text style={styles.emptySubText}>
          Your analyzed goals will appear here for easy access
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accentVibrant}
            colors={[theme.colors.accentVibrant]}
          />
        }
      />
    </View>
  );
};

const createHistoryStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    letterSpacing: 0.1,
  },
  
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  
  historyItem: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    minHeight: 72,
  },
  
  itemContent: {
    flex: 1,
    padding: 16,
  },
  
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    lineHeight: 20,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  
  itemDate: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textTertiary,
    letterSpacing: 0.1,
  },
  
  itemStats: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  statText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
    letterSpacing: 0.1,
  },
  
  deleteButton: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  emptySubText: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.textTertiary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },
});