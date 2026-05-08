import { useState, useEffect } from 'react'

const STORAGE_KEY = 'amir_progress'

const defaultProgress = {
  xp: 0,
  streak: 0,
  lastStudied: null,
  flashcardsLearned: [],
  wrongWords: {},
  sentenceScores: [],
  restatementScores: [],
  readingScores: [],
  mockTests: [],
  totalQuestions: 0,
  totalCorrect: 0,
}

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress
    } catch {
      return defaultProgress
    }
  })

  const save = (updated) => {
    setProgress(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const addXP = (amount) => {
    save({ ...progress, xp: progress.xp + amount })
  }

  const markFlashcard = (wordId, known) => {
    const wrongWords = { ...progress.wrongWords }
    if (!known) {
      wrongWords[wordId] = (wrongWords[wordId] || 0) + 1
    } else {
      delete wrongWords[wordId]
    }
    const learned = known
      ? [...new Set([...progress.flashcardsLearned, wordId])]
      : progress.flashcardsLearned.filter(id => id !== wordId)
    save({ ...progress, flashcardsLearned: learned, wrongWords, xp: progress.xp + (known ? 5 : 0) })
  }

  const recordAnswer = (type, questionId, correct) => {
    const wrongWords = { ...progress.wrongWords }
    if (!correct) {
      wrongWords[questionId] = (wrongWords[questionId] || 0) + 1
    }
    const updated = {
      ...progress,
      wrongWords,
      totalQuestions: progress.totalQuestions + 1,
      totalCorrect: progress.totalCorrect + (correct ? 1 : 0),
      xp: progress.xp + (correct ? 10 : 2),
    }
    save(updated)
  }

  const recordMockTest = (score, total) => {
    const mockTests = [...progress.mockTests, { score, total, date: Date.now() }]
    save({ ...progress, mockTests, xp: progress.xp + score * 5 })
  }

  const resetProgress = () => save(defaultProgress)

  const accuracy = progress.totalQuestions > 0
    ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100)
    : 0

  const level = Math.floor(progress.xp / 100) + 1
  const xpInLevel = progress.xp % 100
  const estimatedScore = 150 + Math.min(100, Math.round(accuracy * 1.1))

  return {
    progress,
    addXP,
    markFlashcard,
    recordAnswer,
    recordMockTest,
    resetProgress,
    accuracy,
    level,
    xpInLevel,
    estimatedScore,
  }
}
