import React, { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './services/firebase'
import Header       from './components/Header'
import CategoryGrid from './components/CategoryGrid'
import QuizScreen   from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import Leaderboard  from './components/Leaderboard'
import LoginPage    from './components/LoginPage'
import { useQuiz }        from './hooks/useQuiz'
import { useLeaderboard } from './hooks/useLeaderboard'

export default function App() {
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab,         setTab]         = useState('home')
  const [difficulty,  setDifficulty]  = useState('easy')
  const [currentCat,  setCurrentCat]  = useState(null)

  const quizHook = useQuiz()
  const lbHook   = useLeaderboard()

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
  }, [])

  if (authLoading) return (
    <div className="loading-state" style={{ height: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  if (!user) return <LoginPage />

  const playerName = user.displayName || user.email?.split('@')[0] || 'Player'

  const handleSelectCat = async (cat) => {
    setCurrentCat(cat)
    setTab('quiz')
    await quizHook.load(cat.topic, difficulty)
  }

  const handleRetryQuiz = async () => {
    if (!currentCat) return
    setTab('quiz')
    await quizHook.load(currentCat.topic, difficulty)
  }

  const handleNext = async () => {
    const { quiz } = quizHook
    const isLast = quiz.currentQ + 1 >= quiz.questions.length
    if (isLast) {
      const final = quizHook.quizRef.current
      setTab('results')
      try {
        await lbHook.submit({
          name:       playerName,
          topic:      currentCat?.name,
          score:      final.score,
          correct:    final.correct,
          total:      final.questions.length,
          pct:        final.questions.length ? Math.round((final.correct / final.questions.length) * 100) : 0,
          difficulty,
          uid:        user.uid,
          email:      user.email,
        })
        await lbHook.load()
      } catch (e) {
        console.error('Score save failed:', e.code, e.message)
      }
    } else {
      quizHook.next()
    }
  }

  const handleHome = () => { quizHook.reset(); setTab('home') }

  const handleViewRankings = () => { setTab('leaderboard'); lbHook.load() }

  const handleTab = (t) => {
    if (t === 'leaderboard') { setTab('leaderboard'); lbHook.load() }
    else handleHome()
  }

  return (
    <>
      <div className="grain" />
      <div className="glow-bg a" />
      <div className="glow-bg b" />

      <div className="app">
        <Header
          tab={tab === 'leaderboard' ? 'leaderboard' : 'home'}
          onTab={handleTab}
          onLogout={() => signOut(auth)}
          userName={playerName}
        />

        {tab === 'home' && (
          <div className="screen">
            <CategoryGrid difficulty={difficulty} onDifficulty={setDifficulty} onSelect={handleSelectCat} />
          </div>
        )}

        {tab === 'quiz' && (
          <div className="screen">
            <QuizScreen
              quiz={quizHook.quiz}
              cat={currentCat}
              onAnswer={(idx, correctIdx) => quizHook.answer(idx, correctIdx)}
              onTimeout={() => quizHook.timeout()}
              onNext={handleNext}
              onBack={handleHome}
              onRetry={handleRetryQuiz}
              startTimer={quizHook.startTimer}
            />
          </div>
        )}

        {tab === 'results' && (
          <div className="screen">
            <ResultScreen
              quiz={quizHook.quiz}
              cat={currentCat}
              onHome={handleHome}
              onRetry={() => handleSelectCat(currentCat)}
              onRankings={handleViewRankings}
            />
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="screen">
            <Leaderboard
              entries={lbHook.entries}
              loading={lbHook.loading}
              filter={lbHook.filter}
              error={lbHook.error}
              onFilter={lbHook.changeFilter}
              onLoad={lbHook.load}
              playerName={playerName}
            />
          </div>
        )}
      </div>
    </>
  )
}
