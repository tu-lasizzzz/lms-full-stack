import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration before attempting initialization
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
const isConfigValid = missingKeys.length === 0;

if (!isConfigValid) {
  console.warn(
    `Firebase config missing: ${missingKeys.join(', ')}. Push notifications will be disabled.`
  );
}

// Lazy singletons — initialized on first use, not at import time
let _app = null;
let _messaging = null;

const getFirebaseApp = () => {
  if (!_app && isConfigValid) {
    try {
      _app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Failed to initialize Firebase:", error.message);
    }
  }
  return _app;
};

export const getFirebaseMessaging = () => {
  if (!_messaging) {
    const app = getFirebaseApp();
    if (app) {
      try {
        _messaging = getMessaging(app);
      } catch (error) {
        console.error("Failed to initialize Firebase Messaging:", error.message);
      }
    }
  }
  return _messaging;
};

export const requestForToken = async () => {
  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.warn("Firebase Messaging not available. Skipping token request.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      if (token) {
        console.log("FCM registration token:", token);
        return token;
      } else {
        console.log("No registration token available. Request permission to generate one.");
        return null;
      }
    } else {
      console.log("Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getFirebaseMessaging();
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
