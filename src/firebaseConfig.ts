// Firebase web config. These values are NOT secrets — for client apps they are
// safe to commit; security is enforced by Firestore/Storage Rules, not by
// hiding the API key. Paste the config from your Firebase project here.
//
// Firebase Console → Project settings (gear icon) → "Your apps" → Web app →
// SDK setup and configuration → copy the `firebaseConfig` object values.
//
// While the apiKey is still the placeholder below, the app runs in LOCAL mode
// (data in the browser's localStorage) so nothing breaks before setup.

export const firebaseConfig = {
  apiKey: 'AIzaSyB6qebOyjS0rSAnUZAswvt2wlYMh1YuBeo',
  authDomain: 'holdingos-3edca.firebaseapp.com',
  projectId: 'holdingos-3edca',
  storageBucket: 'holdingos-3edca.firebasestorage.app',
  messagingSenderId: '569242935283',
  appId: '1:569242935283:web:026ba5a834605f6bad7c86',
}

// True once real config has been pasted — flips the app from local mode to
// Firebase (Auth + Firestore + Storage).
export const firebaseEnabled = firebaseConfig.apiKey !== 'PASTE_API_KEY' && !!firebaseConfig.projectId && firebaseConfig.projectId !== 'PASTE_PROJECT_ID'
