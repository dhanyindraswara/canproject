// Firebase initialization. Everything is lazily created only when the config
// has been filled in (firebaseEnabled). In local mode these are all null and
// the app falls back to localStorage.

import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, signOut, type Auth } from 'firebase/auth'
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

let secondaryCounter = 0

// Create a new Email/Password account WITHOUT signing out the current admin.
// Uses a throwaway secondary Firebase app so the primary session is untouched.
export async function createAuthUser(email: string, password: string): Promise<string> {
  if (!firebaseReady) throw new Error('Firebase belum aktif')
  secondaryCounter += 1
  const secondary = initializeApp(firebaseConfig, `secondary-${secondaryCounter}`)
  const secAuth = getAuth(secondary)
  try {
    const cred = await createUserWithEmailAndPassword(secAuth, email, password)
    await signOut(secAuth)
    return cred.user.uid
  } finally {
    await deleteApp(secondary)
  }
}
