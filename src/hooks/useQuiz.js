import { useState, useRef, useCallback } from 'react'
import { generateQuestions } from '../services/claudeApi'
import { TIMER_SECONDS } from '../constants/categories'

const initialState = {
  questions:  [],
  currentQ:   0,
  score:      0,
  correct:    0,
  wrong:      0,
  streak:     0,
  maxStreak:  0,
  timeTaken:  [],
  answered:   false,
  selectedAnswer: null,
  timeLeft:   TIMER_SECONDS,
  loading:    false,
  error:      null,
  questionSource: 'api',
}

export function useQuiz() {
  const [quiz, setQuiz]  = useState(initialState)
  const timerRef         = useRef(null)
  const startTimeRef     = useRef(null)
  const quizRef          = useRef(initialState)

  const setQuizSync = (updater) => {
    setQuiz(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      quizRef.current = next
      return next
    })
  }

  const stopTimer = () => clearInterval(timerRef.current)

  const startTimer = useCallback((onTimeout, initialSeconds = TIMER_SECONDS) => {
    stopTimer()
    startTimeRef.current = Date.now()
    setQuizSync(q => ({ ...q, timeLeft: initialSeconds }))

    timerRef.current = setInterval(() => {
      setQuizSync(prev => {
        const next = prev.timeLeft - 1
        if (next <= 0) {
          clearInterval(timerRef.current)
          onTimeout()
          return { ...prev, timeLeft: 0 }
        }
        return { ...prev, timeLeft: next }
      })
    }, 1000)
  }, [])

  const load = useCallback(async (topic, difficulty) => {
    setQuizSync({ ...initialState, loading: true })
    stopTimer()
    try {
      const result = await generateQuestions(topic, difficulty)
      const questions = Array.isArray(result) ? result : (result?.questions || [])
      const source = Array.isArray(result) ? 'api' : result?.source
      setQuizSync(prev => ({ ...prev, questions, loading: false, questionSource: source || 'api' }))
      return questions
    } catch (e) {
      setQuizSync(prev => ({ ...prev, loading: false, error: e.message, questionSource: 'api' }))
      return null
    }
  }, [])

  const answer = useCallback((idx, correctIdx) => {
    stopTimer()
    const taken   = Math.round((Date.now() - startTimeRef.current) / 1000)
    const correct = idx === correctIdx

    setQuizSync(prev => {
      const streak    = correct ? prev.streak + 1 : 0
      const maxStreak = Math.max(prev.maxStreak, streak)
      const bonus     = correct
        ? Math.round(100 + ((TIMER_SECONDS - taken) / TIMER_SECONDS) * 50 + (streak > 1 ? streak * 10 : 0))
        : 0
      return {
        ...prev,
        answered:  true,
        selectedAnswer: idx,
        correct:   correct ? prev.correct + 1 : prev.correct,
        wrong:     correct ? prev.wrong       : prev.wrong + 1,
        streak,
        maxStreak,
        score:     prev.score + bonus,
        timeTaken: [...prev.timeTaken, taken],
      }
    })
    return correct
  }, [])

  const timeout = useCallback(() => {
    setQuizSync(prev => ({
      ...prev,
      answered:  true,
      selectedAnswer: null,
      wrong:     prev.wrong + 1,
      streak:    0,
      timeTaken: [...prev.timeTaken, TIMER_SECONDS],
    }))
  }, [])

  const next = useCallback(() => {
    setQuizSync(prev => ({ ...prev, currentQ: prev.currentQ + 1, answered: false, selectedAnswer: null, timeLeft: TIMER_SECONDS }))
  }, [])

  const hydrate = useCallback((savedQuiz) => {
    if (!savedQuiz || typeof savedQuiz !== 'object') return
    stopTimer()
    setQuizSync({ ...initialState, ...savedQuiz })
  }, [])

  const reset = () => { stopTimer(); quizRef.current = initialState; setQuiz(initialState) }

  return { quiz, quizRef, load, answer, timeout, next, reset, hydrate, startTimer, stopTimer }
}