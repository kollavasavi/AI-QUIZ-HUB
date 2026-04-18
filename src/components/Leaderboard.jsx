import React, { useEffect } from 'react'
import { CATEGORIES } from '../constants/categories'

const AVATAR_COLORS = ['#7c6af0','#22d3a0','#f0b429','#f05162','#22d3ee','#a855f7']
const DIFF_ICONS    = { easy: '🟢', medium: '🟡', hard: '🔴' }
const FILTERS       = ['all', ...CATEGORIES.map(c => c.name)]

export default function Leaderboard({ entries, loading, filter, error, onFilter, onLoad, playerName }) {
  useEffect(() => { onLoad() }, [])

  return (
    <>
      <div className="lb-header">
        <h2>🏆 Rankings</h2>
      </div>

      <div className="filter-group" style={{ marginBottom: 24, flexWrap: 'wrap', display: 'flex', gap: 6 }}>
        {FILTERS.map(t => (
          <button
            key={t}
            className={`filter-btn ${filter === t ? 'active' : ''}`}
            onClick={() => onFilter(t)}
          >
            {t === 'all' ? 'All Topics' : t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-state" style={{ padding: 40 }}>
          <div className="spinner" />
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <span style={{ fontSize: 28 }}>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="empty-state">
          <span style={{ fontSize: 40 }}>🏆</span>
          <p>No scores yet. Play a quiz to be first!</p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="lb-list">
          {entries.map((e, i) => {
            const rank     = i + 1
            const isMe     = e.uid ? e.uid === entries.find(x => x.name === playerName)?.uid : e.name === playerName
            const rankStr  = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank
            const initials = e.name?.slice(0, 2).toUpperCase() || '??'
            const col      = AVATAR_COLORS[i % AVATAR_COLORS.length]
            return (
              <div key={e.id || i} className={`lb-row ${isMe ? 'me' : ''}`}>
                <div className={`lb-rank ${rank <= 3 ? `rank-${rank}` : ''}`}>{rankStr}</div>
                <div className="lb-avatar" style={{ background: col + '22', color: col }}>{initials}</div>
                <div className="lb-name">
                  <div className="name">
                    {e.name} {isMe && <span style={{ color: 'var(--accent)', fontSize: 11 }}>(you)</span>}
                  </div>
                  <div className="topic">{e.topic} {DIFF_ICONS[e.difficulty] || ''} · {e.pct}% accuracy</div>
                </div>
                <div className="lb-score">
                  <div className="pts">{e.score}</div>
                  <div className="acc">{e.correct}/{e.total} correct</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
