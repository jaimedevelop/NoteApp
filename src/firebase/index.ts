import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'

// ─── Firebase Config ─────────────────────────────────────────────────────────
// Populate these values from your Firebase Console → Project Settings.
// In production, pull from environment variables (e.g. Vite import.meta.env).
console.log('Firebase config:', {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ present' : '✗ MISSING',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
});

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

// Guard against double-initialization in hot-reload environments
const app: FirebaseApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export default app