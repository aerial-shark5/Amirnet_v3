import { useState, useRef } from 'react'
import { READING_PASSAGES } from '../data/questions'
import { useProgress } from '../hooks/useProgress'
import { explainQuestion } from '../utils/claude'
import './QuizPage.css'
import './ReadingComp.css'

export default function ReadingComp() {
  const { recordAnswer } = useProgress()
  const [passageIdx, setPassageIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [aiExplanation, setAiExplanation] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [passageDone, setPassageDone] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const [showFullText, setShowFullText] = useState(false)
  const [showHebrew, setShowHebrew] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const passage = READING_PASSAGES[passageIdx]
  const q = passage?.questions[qIdx]

  const handleSelect = (i) => {
    if (showResult) return
    setSelected(i)
    setShowResult(true)
    const correct = i === q.answer
    recordAnswer('reading', q.id, correct)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const next = () => {
    if (qIdx + 1 >= passage.questions.length) {
      if (passageIdx + 1 >= READING_PASSAGES.length) setAllDone(true)
      else setPassageDone(true)
    } else {
      setQIdx(i => i + 1)
      setSelected(null)
      setShowResult(false)
      setAiExplanation('')
      setShowHebrew(false)
    }
  }

  const nextPassage = () => {
    stopReading()
    setPassageIdx(i => i + 1)
    setQIdx(0)
    setSelected(null)
    setShowResult(false)
    setAiExplanation('')
    setPassageDone(false)
    setShowFullText(false)
    setShowHebrew(false)
  }

  const getExplanation = async () => {
    setLoadingAI(true)
    try { setAiExplanation(await explainQuestion(q.text, q.options, q.answer, selected)) }
    catch { setAiExplanation('Could not load.') }
    setLoadingAI(false)
  }

  // TTS with pause/resume
  const startReading = () => {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(passage.text)
    u.lang = 'en-US'; u.rate = 0.78
    u.onend = () => { setIsReading(false); setIsPaused(false) }
    speechSynthesis.speak(u)
    setIsReading(true)
    setIsPaused(false)
  }

  const pauseReading = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resumeReading = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stopReading = () => {
    speechSynthesis.cancel()
    setIsReading(false)
    setIsPaused(false)
  }

  if (allDone) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="quiz-page">
        <div className="quiz-done card animate-up">
          <div className="done-emoji">{pct >= 70 ? '🎉' : '📚'}</div>
          <h2>Reading Complete!</h2>
          <p className="done-hebrew">סיימת את הבנת הנקרא!</p>
          <div className="done-score">{score.correct}/{score.total}</div>
          <div className="done-pct">{pct}%</div>
          <div className="reading-tips" style={{marginTop:16,textAlign:'right'}}>
            <h4>📌 AMIR Reading Tips | טיפים</h4>
            <ul>
              <li><strong>Read questions FIRST</strong><span className="hebrew-label">קרא שאלות קודם!</span></li>
              <li><strong>"Mainly about"</strong> = overall topic<span className="hebrew-label">מצא הנושא הכללי</span></li>
              <li><strong>"Purpose of paragraph"</strong> = why does it exist?<span className="hebrew-label">למה הפסקה קיימת?</span></li>
              <li><strong>"Replaced by"</strong> = find synonym<span className="hebrew-label">מצא מילה נרדפת</span></li>
              <li><strong>"According to text"</strong> = answer is IN the text<span className="hebrew-label">התשובה בטקסט!</span></li>
            </ul>
          </div>
          <button className="btn btn-primary" style={{marginTop:16}} onClick={() => window.location.reload()}>Practice Again</button>
        </div>
      </div>
    )
  }

  if (passageDone) {
    return (
      <div className="quiz-page">
        <div className="quiz-done card animate-up">
          <div className="done-emoji">✓</div>
          <h2>Passage Complete!</h2>
          <p className="done-hebrew">סיימת את הקטע!</p>
          <button className="btn btn-primary" style={{marginTop:20}} onClick={nextPassage}>Next Passage →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div>
          <h2>Reading Comprehension</h2>
          <p className="quiz-subtitle">הבנת הנקרא — קטע {passageIdx + 1}/{READING_PASSAGES.length}</p>
        </div>
        <div className="quiz-score-badge">{score.correct}/{score.total}</div>
      </div>

      <div className="passage-box">
        <div className="passage-title">
          <div>
            <span>📄 {passage.title}</span>
            {passage.titleHe && <div style={{fontSize:12,opacity:0.85,direction:'rtl'}}>{passage.titleHe}</div>}
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}>
            {/* TTS Controls */}
            {!isReading && <button className="passage-btn" onClick={startReading}>🔊 Read</button>}
            {isReading && !isPaused && <button className="passage-btn pause-btn" onClick={pauseReading}>⏸ Pause</button>}
            {isReading && isPaused && <button className="passage-btn resume-btn" onClick={resumeReading}>▶️ Resume</button>}
            {isReading && <button className="passage-btn stop-btn" onClick={stopReading}>⏹ Stop</button>}
            <button className="passage-btn" onClick={() => setShowFullText(!showFullText)}>
              {showFullText ? '▲' : '▼ Expand'}
            </button>
          </div>
        </div>
        <div className={`passage-text ${showFullText ? 'expanded' : ''}`}>
          {passage.text.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
        </div>
        {passage.summaryHe && (
          <div className="passage-tip">📝 סיכום: {passage.summaryHe}</div>
        )}
      </div>

      <div className="reading-q-num">Question {qIdx + 1} of {passage.questions.length}</div>

      {/* Hebrew toggle */}
      <div className="hebrew-toggle-row">
        <button className={`hebrew-toggle-btn ${showHebrew ? 'active' : ''}`} onClick={() => setShowHebrew(!showHebrew)}>
          {showHebrew ? '🇮🇱 Hebrew ON' : '🇮🇱 Hebrew OFF'}
          <span className="hebrew-label">{showHebrew ? 'עברית פועלת' : 'לחץ להצגת עברית'}</span>
        </button>
      </div>

      <div className="quiz-card card">
        <div className="original-label">Question | שאלה</div>
        <div style={{fontSize:17,lineHeight:1.8,fontWeight:700}}>{q.text}</div>
        {showHebrew && q.textHe && <div className="original-hebrew">{q.textHe}</div>}
      </div>

      <div className="options-grid">
        {q.options.map((opt, i) => {
          let cls = 'option-btn'
          if (showResult) {
            if (i === q.answer) cls += ' correct'
            else if (i === selected) cls += ' wrong'
          }
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
            {selected === q.answer ? '✓ Correct! נכון!' : `✗ Answer: option ${q.answer + 1}`}
          </div>
          <p className="result-explain">{q.explanation}</p>
          <p className="result-explain-he">{q.explanationHe}</p>
          {!aiExplanation && (
            <button className="btn" style={{marginTop:10}} onClick={getExplanation} disabled={loadingAI}>
              {loadingAI ? <><span className="spinner" /> Loading...</> : '🤖 AI Explanation'}
            </button>
          )}
          {aiExplanation && <div className="ai-explain animate-up">{aiExplanation}</div>}
          <button className="btn btn-primary next-btn" onClick={next}>
            {qIdx + 1 < passage.questions.length ? 'Next Question →' : 'Next Passage →'} | הבא
          </button>
        </div>
      )}
    </div>
  )
}