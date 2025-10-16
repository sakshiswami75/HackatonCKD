import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
});

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Request notification permission and get token
export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Requesting notification permission...');

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');

      // Get FCM token
      const token = await getToken(messaging, { vapidKey });

      if (token) {
        console.log('✅ FCM Token received:', token.substring(0, 30) + '...');
        return token;
      } else {
        console.log('❌ No registration token available');
        return null;
      }
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('🔔 Foreground message received:', payload);
      resolve(payload);
    });
  });

export { messaging };