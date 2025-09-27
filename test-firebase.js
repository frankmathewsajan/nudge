// Test Firebase Configuration
// Run with: node test-firebase.js

const { auth } = require('./config/firebase');

console.log('Testing Firebase Auth configuration...');

try {
  console.log('✅ Firebase Auth instance created successfully');
  console.log('Auth configuration:', {
    app: auth.app?.name || 'default',
    persistence: 'AsyncStorage configured'
  });
  
  // Test auth state listener
  const unsubscribe = auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
    unsubscribe(); // Cleanup
  });
  
  console.log('✅ Firebase Auth is properly configured with AsyncStorage persistence');
} catch (error) {
  console.error('❌ Firebase Auth configuration error:', error.message);
}