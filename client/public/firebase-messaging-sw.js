// Give the service worker access to Firebase Messaging.
// Note: We use firebase-app-compat and firebase-messaging-compat in the SW.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// You must replace these placeholders with your actual Firebase config values.
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title || 'LMS Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new message!',
    icon: payload.notification.image || '/favicon.ico', // standard fallback icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
