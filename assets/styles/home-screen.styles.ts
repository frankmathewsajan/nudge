import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
  
  // Loading and Onboarding Styles
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3C2A21',
    fontFamily: 'System',
  },
  
  // Goals Input Styles
  goalsInputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  goalsHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  goalsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3C2A21',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
  },
  goalsSubtitle: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'System',
  },
  goalsFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  goalsHint: {
    fontSize: 14,
    color: '#B8A082',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  
  // Completion Message Styles
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3C2A21',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    fontFamily: 'System',
  },
});