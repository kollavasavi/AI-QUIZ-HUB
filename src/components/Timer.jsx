import React from 'react'
import { TIMER_SECONDS } from '../constants/categories'

export default function Timer({ timeLeft }) {
  const r         = 22
  const dashArray = 2 * Math.PI * r
  const offset    = dashArray * (1 - timeLeft / TIMER_SECONDS)
  const color     = timeLeft > 10 ? 'var(--accent)' : timeLeft > 5 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="timer-ring">
      <svg width="54" height="54" viewBox="0 0 54 54" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="27" cy="27" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle
          cx="27" cy="27" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={dashArray}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <div className="timer-num" style={{ color }}>{timeLeft}</div>
    </div>
  )
}