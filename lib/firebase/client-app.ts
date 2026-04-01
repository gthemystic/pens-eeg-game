'use client'

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

let app: FirebaseApp | null = null

export function getLiveFirestoreApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null
  if (app) return app
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  if (!apiKey || !projectId || !appId) return null
  if (getApps().length > 0) {
    app = getApp()
    return app
  }
  app = initializeApp({
    apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId,
  })
  return app
}

export function getLiveClientFirestore(): Firestore | null {
  const a = getLiveFirestoreApp()
  if (!a) return null
  return getFirestore(a)
}
