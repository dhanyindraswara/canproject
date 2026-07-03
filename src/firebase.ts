// Firebase initialization. Everything is lazily created only when the config
// has been filled in (firebaseEnabled). In local mode these are all null and
// the app falls back to localStorage.

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { firebaseConfig, firebaseEnabled } from './firebaseConfig'

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

if (firebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
    storageInstance = getStorage(app)
  } catch (e) {
    // If init fails for any reason, stay in local mode rather than bricking.
    console.error('Firebase init failed — falling back to local mode', e)
    app = null
    authInstance = null
    dbInstance = null
    storageInstance = null
  }
}

export const auth = authInstance
export const db = dbInstance
export const storage = storageInstance
// Re-export a runtime flag that is only true when init actually succeeded.
export const firebaseReady = firebaseEnabled && !!app
