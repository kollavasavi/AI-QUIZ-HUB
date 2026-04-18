import React from 'react'

export default function ResultScreen({ quiz, cat, onHome, onRetry, onRankings }) {
  const total  = quiz.questions.length
  const pct    = total ? Math.round((quiz.correct / total) * 100) : 0
  const avgT   = quiz.timeTaken.length
    ? Math.round(quiz.timeTaken.reduce((a, b) => a + b, 0) / quiz.timeTaken.length)
    : 0

  const r         = 58
  const dashArray = 2 * Math.PI * r
  const offset    = dashArray * (1 - pct / 100)
  const ringColor = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)'
  const title     = pct >= 90 ? '🎉 Brilliant!' : pct >= 70 ? '👏 Well Done!' : pct >= 50 ? '📚 Good Effort' : pct >= 30 ? '💪 Keep Practicing' : '🔄 Try Again'

  return (
    <>
      <div className="result-card">
        <div className="score-ring">
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle
              cx="70" cy="70" r={r} fill="none"
              stroke={ringColor} strokeWidth="8"
              strokeDasharray={dashArray}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
            />
          </svg>
          <div className="score-text">
            <div className="score-pct">{pct}%</div>
            <div className="score-lbl">Score</div>
          </div>
        </div>

        <div className="result-title">{title}</div>
        <div className="result-sub">
          You answered {quiz.correct}/{total} correctly on {cat?.name}
        </div>

        <div className="stats-row">
          <div className="stat-chip"><div className="val green">{quiz.correct}</div><div className="lbl">Correct</div></div>
          <div className="stat-chip"><div className="val red">{quiz.wrong}</div><div className="lbl">Wrong</div></div>
          <div className="stat-chip"><div className="val amber">{quiz.score}</div><div className="lbl">Points</div></div>
          <div className="stat-chip"><div className="val">{avgT}s</div><div className="lbl">Avg Time</div></div>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn-secondary" onClick={onHome}>← Categories</button>
        <button className="btn-secondary" onClick={onRankings}>🏆 Rankings</button>
        <button className="btn-primary"   onClick={onRetry}>Play Again ↺</button>
      </div>
    </>
  )
}
