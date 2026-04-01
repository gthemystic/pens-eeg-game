import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let db: Firestore | null = null

export function isAdminFirestoreConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim())
}

export function getAdminFirestore(): Firestore {
  if (db) return db
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON missing (service account JSON string)')
  }
  const cred = JSON.parse(raw) as Record<string, string>
  if (getApps().length === 0) {
    initializeApp({ credential: cert(cred) })
  }
  db = getFirestore()
  return db
}
