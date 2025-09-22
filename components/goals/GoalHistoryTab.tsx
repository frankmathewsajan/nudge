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
import { Theme } from '../../contexts/ThemeContext';
import { GoalAnalysisResponse } from '../../services/geminiService';
import { GoalHistoryItem, storageService } from '../../services/storageService';

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
            <MaterialIcons name="flag" size={20} color={theme.colors.accentVibrant} />
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.goalSummary}
            </Text>
          </View>
          
          <Text style={styles.itemDate}>{timeAgo}</Text>
          
          <View style={styles.itemStats}>
            <View style={styles.stat}>
              <MaterialIcons name="psychology" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>
                {item.analysis.primary_goal.difficulty}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <MaterialIcons name="schedule" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>
                {item.analysis.primary_goal.estimated_timeline}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <MaterialIcons name="checklist" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>
                {item.analysis.primary_goal.smart_breakdown.length} steps
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteGoal(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="delete-outline" size={20} color={theme.colors.textTertiary} />
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Goal History</Text>
        <Text style={styles.headerSubtitle}>
          {history.length} {history.length === 1 ? 'analysis' : 'analyses'}
        </Text>
      </View>
      
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  listContent: {
    padding: 16,
  },
  
  historyItem: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  itemContent: {
    flex: 1,
    padding: 16,
  },
  
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  
  itemDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginBottom: 12,
  },
  
  itemStats: {
    flexDirection: 'row',
    gap: 16,
  },
  
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  
  deleteButton: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  
  emptySubText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});