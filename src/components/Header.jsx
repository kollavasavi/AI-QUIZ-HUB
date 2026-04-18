import React from 'react'

export default function Header({ tab, onTab, onLogout, userName }) {
  return (
    <div className="header">
      <div className="logo">
        Quiz<span>Hub</span> <span className="logo-ai">AI</span>
      </div>
      <div className="nav-tabs">
        {['home', 'leaderboard'].map((t, i) => (
          <button
            key={t}
            className={`nav-tab ${tab === t ? 'active' : ''}`}
            onClick={() => onTab(t)}
          >
            {i === 0 ? 'Play' : 'Rankings'}
          </button>
        ))}
      </div>
      <div className="user-info">
        <span className="user-name">{userName}</span>
        <button className="logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  )
}