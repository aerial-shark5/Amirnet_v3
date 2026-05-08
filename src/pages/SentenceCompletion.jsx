import { useState } from 'react'
import { SENTENCE_COMPLETIONS } from '../data/questions'
import { useProgress } from '../hooks/useProgress'
import { explainQuestion, generateHint } from '../utils/claude'
import './QuizPage.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function SentenceCompletion() {
  const { recordAnswer } = useProgress()
  const [questions] = useState(() => shuffle(SENTENCE_COMPLETIONS))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [aiExplanation, setAiExplanation] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [hint, setHint] = useState('')
  const [loadingHint, setLoadingHint] = useState(false)
  const [done, setDone] = useState(false)
  const [showHebrew, setShowHebrew] = useState(false)

  const q = questions[index]

  const handleSelect = (optIdx) => {
    if (showResult) return
    setSelected(optIdx)
    setShowResult(true)
    const correct = optIdx === q.answer
    recordAnswer('sentence', q.id, correct)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const next = () => {
    if (index + 1 >= questions.length) setDone(true)
    else {
      setIndex(i => i + 1)
      setSelected(null)
      setShowResult(false)
      setAiExplanation('')
      setHint('')
      setShowHebrew(false)
    }
  }

  const getHint = async () => {
    setLoadingHint(true)
    try { setHint(await generateHint(q.sentence)) }
    catch { setHint('Could not load hint.') }
    setLoadingHint(false)
  }

  const getExplanation = async () => {
    if (aiExplanation) return
    setLoadingAI(true)
    try { setAiExplanation(await explainQuestion(q.sentence, q.options, q.answer, selected)) }
    catch { setAiExplanation('Could not load.') }
    setLoadingAI(false)
  }

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.8
    speechSynthesis.speak(u)
  }

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="quiz-page">
        <div className="quiz-done card animate-up">
          <div className="done-emoji">{pct >= 70 ? '🎉' : '💪'}</div>
          <h2>Section Complete!</h2>
          <p className="done-hebrew">סיימת את החלק!</p>
          <div className="done-score">{score.correct}/{score.total}</div>
          <div className="done-pct">{pct}%</div>
          <button className="btn btn-primary" style={{marginTop:20}} onClick={() => window.location.reload()}>Practice Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div>
          <h2>Sentence Completion</h2>
          <p className="quiz-subtitle">שלמות משפט — בחר את המילה המתאימה</p>
        </div>
        <div className="quiz-score-badge">{score.correct}/{score.total}</div>
      </div>

      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <div className="quiz-counter">{index + 1} of {questions.length}</div>
      <div className="quiz-section-tag">Section {q.section} · Sentence Completion · שלמות משפט</div>

      {/* Hebrew toggle */}
      <div className="hebrew-toggle-row">
        <button className={`hebrew-toggle-btn ${showHebrew ? 'active' : ''}`} onClick={() => setShowHebrew(!showHebrew)}>
          {showHebrew ? '🇮🇱 Hebrew ON' : '🇮🇱 Hebrew OFF'}
          <span className="hebrew-label">{showHebrew ? 'עברית פועלת' : 'לחץ להצגת עברית'}</span>
        </button>
      </div>

      <div className="quiz-card card">
        <div className="sentence-display">
          {q.sentence.split('___').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="blank-box">{showResult ? q.options[q.answer] : '___'}</span>
              )}
            </span>
          ))}
          <button className="speak-btn" onClick={() => speak(q.sentence.replace('___', q.options[q.answer]))}>🔊</button>
        </div>
        {showHebrew && q.sentenceHe && (
          <div className="sentence-hebrew">{q.sentenceHe.replace('___', showResult ? q.optionsHe[q.answer] : '___')}</div>
        )}
        {!showResult && !hint && (
          <button className="hint-btn" onClick={getHint} disabled={loadingHint}>
            {loadingHint ? <><span className="spinner" /> Loading...</> : '💡 Hint | רמז'}
          </button>
        )}
        {hint && <div className="hint-box animate-up">💡 {hint}</div>}
      </div>

      <div className="options-grid">
        {q.options.map((opt, i) => {
          let cls = 'option-btn'
          if (showResult) {
            if (i === q.answer) cls += ' correct'
            else if (i === selected) cls += ' wrong'
          }
          if (selected === i && !showResult) cls += ' selected'
          return (
            <button key={i} className={cls} onClick={() => handleSelect(i)}>
              <div className="opt-row">
                <span className="opt-num">{i + 1}</span>
                <span className="opt-text">{opt}</span>
                {showResult && i === q.answer && <span className="opt-check">✓</span>}
                {showResult && i === selected && i !== q.answer && <span className="opt-x">✗</span>}
              </div>
              {showHebrew && q.optionsHe && <span className="opt-hebrew">{q.optionsHe[i]}</span>}
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className={`result-box animate-up ${selected === q.answer ? 'correct-box' : 'wrong-box'}`}>
          <div className="result-title">
            {selected === q.answer ? '✓ Correct! נכון!' : `✗ The answer is: "${q.options[q.answer]}"`}
          </div>
          <p className="result-explain">{q.explanation}</p>
          <p className="result-explain-he">{q.explanationHe}</p>
          {!aiExplanation && (
            <button className="btn" style={{marginTop:10}} onClick={getExplanation} disabled={loadingAI}>
              {loadingAI ? <><span className="spinner" /> Loading...</> : '🤖 More explanation | הסבר נוסף'}
            </button>
          )}
          {aiExplanation && <div className="ai-explain animate-up">{aiExplanation}</div>}
          <button className="btn btn-primary next-btn" onClick={next}>
            {index + 1 < questions.length ? 'Next →' : 'See Results'} | הבא
          </button>
        </div>
      )}
    </div>
  )
}