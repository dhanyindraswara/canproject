// Firebase web config.
//
// NOTE: A Firebase *web* apiKey is NOT a secret — for client apps it is shipped
// in the browser bundle by design, and security is enforced by Firestore/Storage
// Rules + API key restrictions + App Check, not by hiding the key. See
// https://firebase.google.com/docs/projects/api-keys
//
// Even so, we read the values from environment variables (Vite `import.meta.env`)
// instead of hard-coding them in source. This keeps the literal key out of the
// repository (so secret scanners stay quiet) and lets each deploy supply its own
// project. Copy `.env.example` to `.env` and fill in the values from:
//   Firebase Console → Project settings (gear icon) → "Your apps" → Web app →
//   SDK setup and configuration → copy the `firebaseConfig` object values.
//
// While the config is empty (e.g. no `.env`), the app runs in LOCAL mode
// (data in the browser's localStorage) so nothing breaks before setup.

const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
}

// True once real config has been provided — flips the app from local mode to
// Firebase (Auth + Firestore + Storage).
export const firebaseEnabled = !!firebaseConfig.apiKey && !!firebaseConfig.projectId
