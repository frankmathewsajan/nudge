/**
 * Side Menu Modal Styles
 * 
 * Styles for the Claude-inspired side navigation menu
 * Following Material Design 3 guidelines with elegant typography
 */

import { Theme } from '@/contexts/ThemeContext';
import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH;

export const createSideMenuStyles = (theme: Theme) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },

  overlayPress: {
    flex: 1,
  },

  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  menuContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    paddingVertical: 20,
    marginBottom: 20,
    // Removed border for cleaner look
  },

  appTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: theme.colors.textPrimary,
    fontFamily: 'System',
  },

  mainActions: {
    marginBottom: 30,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },

  actionText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 12,
    fontWeight: '400',
  },

  recentsSection: {
    flex: 1,
    paddingTop: 10,
  },

  sectionTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  recentsList: {
    flex: 1,
  },

  recentItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 2,
  },

  recentText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },

  bottomSection: {
    // Removed border for cleaner look
    paddingTop: 20,
    paddingBottom: 10,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  userInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  userName: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '400',
  },

  settingsButton: {
    padding: 8,
    borderRadius: 6,
  },

  // Close indicator for swipe gesture
  swipeIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 4,
    height: 60,
    backgroundColor: theme.colors.textTertiary,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.3,
  },
});

export { MENU_WIDTH };
