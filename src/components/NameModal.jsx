import React, { useState } from 'react'

export default function NameModal({ onSubmit }) {
  const [name, setName] = useState('')

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Submit Score</h3>
        <p>Enter your name to save your score to the leaderboard.</p>
        <input
          type="text"
          placeholder="Your name..."
          maxLength={20}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
          autoFocus
        />
        <button
          className="next-btn"
          style={{ marginTop: 0 }}
          disabled={!name.trim()}
          onClick={() => onSubmit(name.trim())}
        >
          Save to Leaderboard 🏆
        </button>
      </div>
    </div>
  )
}