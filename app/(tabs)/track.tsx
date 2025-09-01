import { FontAwesome } from '@expo/vector-icons';
import { MeshGradient } from '@kuss/react-native-mesh-gradient';
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
import {
    formatDateKey,
    getAllActivityData,
    initializeSampleData,
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
      // Initialize sample data if none exists
      await initializeSampleData();
      
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
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Beautiful Gradient Background */}
      <MeshGradient
        colors={['#F8F9FA', '#E8F0FE', '#F3E5F5']}
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
                <View style={styles.iconContainer}>
                  <FontAwesome name="calendar" size={24} color="#6750A4" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Activity Tracker</Text>
                  <Text style={styles.headerSubtitle}>Your productivity journey</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.todayButton} onPress={() => setCurrentDate(new Date())}>
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
                <FontAwesome name="chevron-left" size={18} color="#6750A4" />
              </TouchableOpacity>
              
              <View style={styles.monthTitleContainer}>
                <Text style={styles.monthTitle}>{getMonthName(currentDate)}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigateMonth('next')}
                activeOpacity={0.7}
              >
                <FontAwesome name="chevron-right" size={18} color="#6750A4" />
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

            {/* Activity Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <FontAwesome name="check-circle" size={20} color="#4CAF50" />
                <View style={styles.summaryText}>
                  <Text style={styles.summaryNumber}>
                    {Object.keys(dayActivityData).length}
                  </Text>
                  <Text style={styles.summaryLabel}>Active Days</Text>
                </View>
              </View>
              
              <View style={styles.summaryCard}>
                <FontAwesome name="clock-o" size={20} color="#FF9800" />
                <View style={styles.summaryText}>
                  <Text style={styles.summaryNumber}>
                    {Object.values(dayActivityData).reduce((sum, day) => sum + day.totalActivities, 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Activities</Text>
                </View>
              </View>
            </View>
          </View>
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
  safeArea: {
    flex: 1,
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
  todayButton: {
    backgroundColor: '#6750A4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 16,
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(231, 224, 236, 0.3)',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    fontSize: 12,
    fontWeight: '600',
    color: '#49454F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  dayCell: {
    width: width / 7 - 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1B20',
    fontFamily: 'System',
  },
  dayTextInactive: {
    color: '#9E9E9E',
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
});
