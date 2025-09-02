import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingNavigation } from '../../components/ui/FloatingNavigation';
import { TodayOverview } from '../../components/ui/TodayOverview';

export default function HomeScreen() {
  const [sleepState, setSleepState] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSleepStateChange = (isAsleep: boolean) => {
    setSleepState(isAsleep);
  };

  const handleDayStarted = () => {
    console.log('Day started from Home screen');
  };

  const handleViewDetails = () => {
    console.log('Navigate to track tab');
  };

  const navigateToGoals = () => {
    console.log('Navigate to goals tab');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 72 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F3F0" translucent />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Header with Greeting */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.subtitle}>Ready to make today productive?</Text>
          </View>

          {/* Bento Grid Layout */}
          <View style={styles.bentoGrid}>
            
            {/* Row 1: Today Overview (full width) */}
            <View style={styles.bentoFull}>
              <TodayOverview onViewDetails={handleViewDetails} />
            </View>
            

          </View>

        </View>
      </ScrollView>
      
      {/* Floating Navigation */}
      <FloatingNavigation currentRoute="index" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3F0', // Elegant beige base
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3C2A21', // Rich brown text
    marginBottom: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7355', // Warm brown
    fontWeight: '400',
    fontFamily: 'System',
  },
  
  // Bento Grid Layout
  bentoGrid: {
    gap: 16,
  },
  bentoFull: {
    width: '100%',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  bentoHalf: {
    flex: 1,
  },
  bentoTwoThirds: {
    flex: 2,
  },
  bentoThird: {
    flex: 1,
  },
  
  // Stats Card
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6750A4',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'System',
  },
  statsLabel: {
    fontSize: 12,
    color: '#49454F',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'System',
  },
  
  // Goals Card
  goalsCard: {
    backgroundColor: '#6750A4',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 3,
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  goalsText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'System',
  },
  
  // Action Cards
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  actionIconContainer: {
    backgroundColor: '#EAE7F0',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1B20',
    marginBottom: 4,
    fontFamily: 'System',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#49454F',
    fontWeight: '400',
    fontFamily: 'System',
  },
  
  // Legacy styles (keep for compatibility)
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quickActions: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666666',
  },
});
