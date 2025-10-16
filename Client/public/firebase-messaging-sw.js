// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your Firebase config (same as above)
const firebaseConfig = {
  apiKey: "AIzaSyC_h5pwnby9BLN5yq3qOY2ZMg_JrtHHMn4",
  authDomain: "resqconnect-emergency.firebaseapp.com",
  projectId: "resqconnect-emergency",
  storageBucket: "resqconnect-emergency.firebasestorage.app",
  messagingSenderId: "989446555817",
  appId: "1:989446555817:web:030f8f0e290bcc59c141b8"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Received background message:', payload);
  
  const notificationTitle = payload.notification.title || 'Emergency Alert';
  const notificationOptions = {
    body: payload.notification.body || 'New notification',
    icon: '/emergency-icon.png', // Add your icon
    badge: '/badge-icon.png',
    tag: payload.data?.emergencyId || 'notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});