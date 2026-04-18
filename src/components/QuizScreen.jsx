import React, { useEffect, useState } from 'react'
import Timer from './Timer'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizScreen({ quiz, cat, onAnswer, onTimeout, onNext, onBack, onRetry, startTimer }) {
  const [selected,   setSelected]   = useState(null)
  const [showHint,   setShowHint]   = useState(false)
  const [wasCorrect, setWasCorrect] = useState(null)

  const q     = quiz.questions[quiz.currentQ]
  const total = quiz.questions.length

  useEffect(() => {
    setSelected(null)
    setShowHint(false)
    setWasCorrect(null)
    if (q && !quiz.loading) startTimer(onTimeout)
  }, [quiz.currentQ, q])

  if (quiz.loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Generating questions with AI...</p>
      </div>
    )
  }

  if (quiz.error) {
    return (
      <div className="loading-state">
        <p style={{ color: 'var(--red)', marginBottom: 16 }}>Error: {quiz.error}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="next-btn" style={{ maxWidth: 200 }} onClick={onRetry}>Retry</button>
          <button className="next-btn" style={{ maxWidth: 200 }} onClick={onBack}>← Go Back</button>
        </div>
      </div>
    )
  }

  if (!q) return null

  const handleSelect = (idx) => {
    if (quiz.answered) return
    setSelected(idx)
    const correct = onAnswer(idx, q.answer)
    setWasCorrect(correct)
  }

  const btnClass = (idx) => {
    if (!quiz.answered) return 'option-btn'
    if (idx === q.answer) return 'option-btn correct'
    if (idx === selected)  return 'option-btn wrong'
    return 'option-btn'
  }

  return (
    <div>
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="quiz-meta">
          <div className="quiz-topic">{cat?.name}</div>
          <div className="quiz-progress-text">Question {quiz.currentQ + 1} of {total}</div>
          {quiz.questionSource === 'fallback' && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-dim)' }}>
              Using backup questions (API quota exceeded)
            </div>
          )}
        </div>
        {quiz.streak >= 2 && (
          <div className="streak-bar">
            <span>🔥</span>
            <span className="streak-label">Streak</span>
            <span className="streak-val">{quiz.streak}</span>
          </div>
        )}
        <Timer timeLeft={quiz.timeLeft} />
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${(quiz.currentQ / total) * 100}%` }} />
      </div>

      <div className="question-card">
        <div className="q-num">Q{quiz.currentQ + 1}</div>
        <div className="q-text">{q.q}</div>
        {!showHint && !quiz.answered && (
          <button className="hint-btn" onClick={() => setShowHint(true)}>💡 Hint</button>
        )}
        {showHint && <div className="hint-box">{q.hint}</div>}
      </div>

      <div className="options-grid">
        {q.options.map((opt, i) => (
          <button key={i} className={btnClass(i)} disabled={quiz.answered} onClick={() => handleSelect(i)}>
            <span className="opt-letter">{LETTERS[i]}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      {quiz.answered && (
        <div className="explain-box">
          <strong>{wasCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong> {q.explain}
        </div>
      )}

      <button className="next-btn" disabled={!quiz.answered} onClick={onNext}>
        {quiz.currentQ + 1 >= total ? 'See Results →' : 'Next Question →'}
      </button>
    </div>
  )
}