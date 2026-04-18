import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db  = getDatabase(app)
export const auth = getAuth(app)

export async function saveScore({ name, topic, score, correct, total, pct, difficulty, uid, email }) {
  const payload = { name, topic, score, correct, total, pct, difficulty, uid, email, timestamp: Date.now() }
  const result = await push(ref(db, 'scores'), payload)
  return { id: result.key, ...payload }
}

export async function fetchLeaderboard(filterTopic = 'all', limit = 50) {
  const snap = await get(ref(db, 'scores'))
  if (!snap.exists()) return []

  // Realtime DB returns push-keyed objects under /scores.
  const raw = snap.val()
  const entries = Object.entries(raw)
    .map(([id, value]) => ({ id, ...(value || {}) }))
    .filter(e => e && typeof e === 'object')

  const filtered = filterTopic === 'all'
    ? entries
    : entries.filter(e => e.topic === filterTopic)

  return filtered
    .sort((a, b) => {
      const scoreDiff = Number(b.score || 0) - Number(a.score || 0)
      if (scoreDiff !== 0) return scoreDiff
      return Number(b.timestamp || 0) - Number(a.timestamp || 0)
    })
    .slice(0, limit)
}
