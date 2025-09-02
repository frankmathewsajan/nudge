import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingNavigation } from '../../components/ui/FloatingNavigation';
import {
    formatDateKey,
    getAllActivityData,
    type DayActivity
} from '../../utils/activityData';

const { width } = Dimensions.get('window');

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasActivity: boolean;
  activities?: string[];
}

interface DayActivityData {
  [date: string]: DayActivity;
}

export default function TrackScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [dayActivityData, setDayActivityData] = useState<DayActivityData>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const insets = useSafeAreaInsets();

  // Load real activity data
  useEffect(() => {
    loadActivityData();
    // Animate in the calendar
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

  const loadActivityData = async () => {
    try {
      // Load all activity data
      const data = await getAllActivityData();
      setDayActivityData(data);
    } catch (error) {
      console.error('Error loading activity data:', error);
    }
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevMonthDay.getDate(),
        isCurrentMonth: false,
        isToday: false,
        hasActivity: false,
      });
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dayKey = formatDateKey(dayDate);
      const isToday = dayDate.toDateString() === today.toDateString();
      const hasActivity = dayActivityData[dayKey]?.totalActivities > 0;
      
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday,
        hasActivity,
        activities: hasActivity ? Object.values(dayActivityData[dayKey]?.hourlyActivities || {}).flat() : [],
      });
    }
    
    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false,
        hasActivity: false,
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDayPress = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    
    const selectedDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
    const today = new Date();
    
    // Check if the selected date is in the future
    if (selectedDay.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)) {
      Alert.alert('Future Date', 'This day hasn\'t arrived yet! No activities to show.');
      return;
    }
    
    setSelectedDate(selectedDay);
    setShowDayDetail(true);
  };

  const renderDayDetail = () => {
    if (!selectedDate) return null;
    
    const dayKey = formatDateKey(selectedDate);
    const dayData = dayActivityData[dayKey];
    
    if (!dayData) {
      return (
        <View style={styles.dayDetailContent}>
          <Text style={styles.dayDetailTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <View style={styles.noActivityContainer}>
            <FontAwesome name="bed" size={48} color="#999999" />
            <Text style={styles.noActivityTitle}>No Activity Recorded</Text>
            <Text style={styles.noActivityText}>
              No productivity tracking data for this day yet.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.dayDetailContent}>
        <Text style={styles.dayDetailTitle}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <Text style={styles.activitySummary}>
          {dayData.totalActivities} activities logged
        </Text>
        
        <ScrollView style={styles.hourlyContainer}>
          {Object.entries(dayData.hourlyActivities)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([hour, activities]) => (
              <View key={hour} style={styles.hourBlock}>
                <Text style={styles.hourLabel}>
                  {parseInt(hour) === 12 ? '12:00 PM' : 
                   parseInt(hour) > 12 ? `${parseInt(hour) - 12}:00 PM` : 
                   `${hour}:00 AM`}
                </Text>
                <View style={styles.activitiesList}>
                  {activities.map((activity, index) => (
                    <Text key={index} style={styles.activityItem}>
                      • {activity}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
        </ScrollView>
      </View>
    );
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F3F0" />
      
      {/* Elegant Beige/Lavender Gradient Background */}
      <LinearGradient
        colors={['#F7F3F0', '#F0EBE5', '#E8E1D9', '#F5F0F0']}
        style={styles.gradientBackground}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Modern Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Track</Text>
                <Text style={styles.headerSubtitle}>Your productivity journey</Text>
              </View>
              <TouchableOpacity style={styles.todayButton} onPress={() => setCurrentDate(new Date())}>
                <FontAwesome name="calendar-o" size={16} color="#FFFFFF" />
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Modern Calendar Container */}
          <View style={styles.calendarContainer}>
            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigateMonth('prev')}
                activeOpacity={0.7}
              >
                <FontAwesome name="chevron-left" size={20} color="#4A90E2" />
              </TouchableOpacity>
              
              <View style={styles.monthTitleContainer}>
                <Text style={styles.monthTitle}>{getMonthName(currentDate)}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigateMonth('next')}
                activeOpacity={0.7}
              >
                <FontAwesome name="chevron-right" size={20} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            {/* Week Days Header */}
            <View style={styles.weekDaysHeader}>
              {weekDays.map((day) => (
                <View key={day} style={styles.weekDayContainer}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Modern Calendar Grid */}
            <View style={styles.calendarGrid}>
              {days.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !day.isCurrentMonth && styles.dayInactive,
                    day.isToday && styles.dayToday,
                    day.hasActivity && styles.dayWithActivity,
                  ]}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dayCellContent}>
                    <Text style={[
                      styles.dayText,
                      !day.isCurrentMonth && styles.dayTextInactive,
                      day.isToday && styles.dayTextToday,
                      day.hasActivity && styles.dayTextWithActivity,
                    ]}>
                      {day.date}
                    </Text>
                    {day.hasActivity && (
                      <View style={styles.activityIndicator}>
                        <View style={styles.activityDot} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <FontAwesome name="check-circle" size={18} color="#4CAF50" />
                </View>
                <Text style={styles.statNumber}>{Object.keys(dayActivityData).length}</Text>
                <Text style={styles.statLabel}>Active Days</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <FontAwesome name="flash" size={18} color="#FF9800" />
                </View>
                <Text style={styles.statNumber}>
                  {Object.values(dayActivityData).reduce((sum, day) => sum + day.totalActivities, 0)}
                </Text>
                <Text style={styles.statLabel}>Activities</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <FontAwesome name="fire" size={18} color="#FF5722" />
                </View>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </View>

          {/* Floating Add Button */}
          <TouchableOpacity 
            style={styles.floatingAddButton} 
            activeOpacity={0.9}
            onPress={() => {
              Alert.alert(
                'Quick Add Activity',
                'This will be connected to a quick add flow. For now, you can add activities via notifications or the detailed day view.',
                [{ text: 'OK' }]
              );
            }}
          >
            <FontAwesome name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* Day Detail Modal */}
      <Modal
        visible={showDayDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDayDetail(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDayDetail(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          {renderDayDetail()}
        </SafeAreaView>
      </Modal>
      
      {/* Floating Navigation */}
      <FloatingNavigation currentRoute="track" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FAFBFC',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Space for floating button
  },
  
  // Header Styles - Modern & Clean
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'System',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
    fontFamily: 'System',
    marginTop: 2,
  },
  todayButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  
  // Calendar Container - Google Calendar Style
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  
  // Month Navigation - Minimalist
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  
  // Month Title - Centered and Clean
  monthTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1B20',
    fontFamily: 'System',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 10, // Reduced from 12 to 10
    fontWeight: '600',
    color: '#8B7355', // Warm brown for elegant theme
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dayCell: {
    width: width / 7 - 12, // Reduced from 20 to 12
    height: 36, // Reduced from 48 to 36
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1, // Reduced from 2 to 1
    borderRadius: 18, // Reduced from 24 to 18
  },
  dayCellContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  dayInactive: {
    opacity: 0.3,
  },
  dayToday: {
    backgroundColor: '#6750A4',
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayWithActivity: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  dayText: {
    fontSize: 13, // Reduced from 16 to 13
    fontWeight: '500',
    color: '#3C2A21', // Rich brown for elegant theme
    fontFamily: 'System',
  },
  dayTextInactive: {
    color: '#B8A082', // Muted beige
  },
  dayTextToday: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextWithActivity: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  activityIndicator: {
    position: 'absolute',
    bottom: 4,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.3)',
  },
  summaryText: {
    flex: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1B20',
    fontFamily: 'System',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#49454F',
    fontWeight: '500',
    fontFamily: 'System',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  dayDetailContent: {
    flex: 1,
    padding: 20,
  },
  dayDetailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  activitySummary: {
    fontSize: 16,
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  hourlyContainer: {
    flex: 1,
  },
  hourBlock: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  hourLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  activitiesList: {
    gap: 4,
  },
  activityItem: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  noActivityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noActivityTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 16,
  },
  noActivityText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Quick Stats - Modern Cards
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1B20',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Floating Add Button - Google Style
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
