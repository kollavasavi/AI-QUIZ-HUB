import { useState, useCallback } from 'react'
import { saveScore, fetchLeaderboard } from '../services/firebase'

export function useLeaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter,  setFilter]  = useState('all')
  const [error, setError] = useState('')

  const load = useCallback(async (topic = 'all') => {
    setLoading(true)
    setError('')
    try {
      setEntries(await fetchLeaderboard(topic))
    } catch (e) {
      console.error('Leaderboard fetch failed:', e)
      setEntries([])
      setError(e?.message || 'Failed to load leaderboard data from Firebase.')
    } finally {
      setLoading(false)
    }
  }, [])

  const submit = useCallback(async (entry) => {
    await saveScore(entry)
  }, [])

  const changeFilter = useCallback((topic) => {
    setFilter(topic)
    load(topic)
  }, [load])

  return { entries, loading, filter, error, load, submit, changeFilter }
}
