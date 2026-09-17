import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAaYREIVwxBZVxFZ1MALtu0fS1KPGXPZLY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'toolguard-23223.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'toolguard-23223',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'toolguard-23223.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '141200837649',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:141200837649:web:16cfadcbb9034e60f6f5b0',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-BCQFGFDG9Z'
};

export const isFirebaseConfigured = true;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);

  if (typeof window !== 'undefined') {
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }

  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1';
    connectAuthEmulator(auth, `http://${host}:9099`);
    connectFirestoreEmulator(db, host, 8080);
  }
} catch (error) {
  console.warn('[ToolGuard] Firebase initialization warning:', error);
}

export { app, auth, db, analytics };
