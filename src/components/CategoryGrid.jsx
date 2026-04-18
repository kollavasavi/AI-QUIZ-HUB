import React from 'react'
import { CATEGORIES, DIFFICULTY_LEVELS, QUESTION_COUNT } from '../constants/categories'

export default function CategoryGrid({ difficulty, onDifficulty, onSelect }) {
  return (
    <>
      <div className="hero">
        <h1>Test Your <em>Intelligence</em></h1>
        <p>AI-powered quizzes across every topic. Compete, learn, and climb the leaderboard.</p>
      </div>

      <div className="diff-row">
        <span className="diff-label">Difficulty:</span>
        {DIFFICULTY_LEVELS.map(d => (
          <button
            key={d}
            className={`diff-btn ${difficulty === d ? 'active' : ''}`}
            onClick={() => onDifficulty(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="category-grid">
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className="cat-card"
            style={{ '--cat-color': cat.color }}
            onClick={() => onSelect(cat)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <div className="cat-name">{cat.name}</div>
            <div className="cat-desc">{cat.desc}</div>
            <span className="cat-badge">{QUESTION_COUNT} Questions</span>
          </div>
        ))}
      </div>
    </>
  )
}