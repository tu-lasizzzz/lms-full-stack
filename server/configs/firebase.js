import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

let messaging = null;

try {
  let credentials = null;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    };
  } else {
    console.warn("WARNING: Firebase environment variables missing.");
  }

  if (credentials) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials)
    });
    messaging = admin.messaging();
    console.log("Firebase Admin initialized successfully.");
  } else {
    console.warn("WARNING: Firebase Admin credentials not found (neither FIREBASE_SERVICE_ACCOUNT env var nor configs/serviceAccountKey.json). FCM notifications will not be sent.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}

export { admin, messaging };
