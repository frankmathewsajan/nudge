/**
 * Network Connectivity Utilities
 * Handles network detection and connectivity checks
 */

import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

/**
 * Check current network connectivity
 */
export async function checkNetworkConnectivity(): Promise<NetworkState> {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    };
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return {
      isConnected: false,
      type: null,
      isInternetReachable: false,
    };
  }
}

/**
 * Check if device has internet access
 */
export async function hasInternetAccess(): Promise<boolean> {
  const networkState = await checkNetworkConnectivity();
  return networkState.isConnected && (networkState.isInternetReachable !== false);
}

/**
 * Wait for internet connection with timeout
 */
export async function waitForInternetConnection(timeoutMs: number = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });

    // Check immediately as well
    checkNetworkConnectivity().then(networkState => {
      if (networkState.isConnected && networkState.isInternetReachable !== false) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || '';
  const networkKeywords = [
    'network request failed',
    'network error',
    'connection failed',
    'no internet connection',
    'unable to resolve host',
    'connection timeout',
    'request timeout'
  ];
  
  return networkKeywords.some(keyword => errorMessage.includes(keyword));
}

/**
 * Get user-friendly network error message
 */
export function getNetworkErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'Internet connection required. Please check your network and try again.';
  }
  return 'An unexpected error occurred. Please try again.';
}
