/**
 * Realtime transport switch: Firestore (WebSocket-backed SDK) vs HTTP polling + memory API.
 */

export function isFirestoreLiveIntent(): boolean {
  return process.env.NEXT_PUBLIC_LIVE_TRANSPORT === 'firestore'
}

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}

export function shouldSubscribeFirestore(): boolean {
  return isFirestoreLiveIntent() && isFirebaseClientConfigured()
}
