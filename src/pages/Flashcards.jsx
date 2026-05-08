import { useState, useEffect, useMemo } from 'react'
import { VOCAB_WORDS, CATEGORIES } from '../data/vocabulary'
import { useProgress } from '../hooks/useProgress'
import { explainWord } from '../utils/claude'
import './Flashcards.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Flashcards() {
  const { markFlashcard, progress } = useProgress()
  const [category, setCategory] = useState('all')
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [sessionStats, setSessionStats] = useState({ known: 0, unknown: 0 })
  const [animClass, setAnimClass] = useState('')

  // Randomized on every mount AND every category change
  const prioritized = useMemo(() => {
    const filtered = category === 'all' ? VOCAB_WORDS : VOCAB_WORDS.filter(w => w.category === category)
    const wrong = shuffle(filtered.filter(w => progress.wrongWords[w.word]))
    const unseen = shuffle(filtered.filter(w => !progress.wrongWords[w.word] && !progress.flashcardsLearned.includes(w.word)))
    const learned = shuffle(filtered.filter(w => progress.flashcardsLearned.includes(w.word)))
    return [...wrong, ...unseen, ...learned]
  }, [category])

  const card = prioritized[cardIndex % prioritized.length]

  const goNext = (known) => {
    if (known !== undefined) {
      markFlashcard(card.word, known)
      setSessionStats(s => ({ ...s, [known ? 'known' : 'unknown']: s[known ? 'known' : 'unknown'] + 1 }))
    }
    setAnimClass('slide-out')
    setTimeout(() => {
      setCardIndex(i => (i + 1) % prioritized.length)
      setFlipped(false)
      setAiExplanation('')
      setAnimClass('slide-in')
      setTimeout(() => setAnimClass(''), 300)
    }, 200)
  }

  const getAIExplanation = async () => {
    if (aiExplanation) return
    setLoadingAI(true)
    try {
      const res = await explainWord(card.word, card.example)
      setAiExplanation(res)
    } catch { setAiExplanation('Could not load AI explanation.') }
    setLoadingAI(false)
  }

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.85
    speechSynthesis.speak(u)
  }

  if (!card) return <div className="page-pad">No words in this category.</div>

  const learned = progress.flashcardsLearned.length
  const total = VOCAB_WORDS.length

  return (
    <div className="flashcards-page">
      <div className="fc-header">
        <h2>Vocabulary <span style={{fontSize:14,color:'var(--muted)',fontWeight:700}}>({total} words · סדר אקראי בכל פתיחה)</span></h2>
        <div className="fc-progress-info">
          {learned}/{total} learned · {sessionStats.known}✓ {sessionStats.unknown}✗ this session
        </div>
        <div className="fc-cats">
          {CATEGORIES.map(c => (
            <button key={c.id}
              className={`cat-btn ${category === c.id ? 'active' : ''}`}
              onClick={() => { setCategory(c.id); setCardIndex(0); setFlipped(false) }}>
              {c.label}
              <small>{c.labelHe}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="fc-counter">
        {cardIndex + 1} / {prioritized.length}
        {progress.wrongWords[card.word] ? <span className="fc-wrong-badge">⚠️ Review</span> : null}
      </div>

      <div className={`fc-card-wrap ${animClass}`} onClick={() => { setFlipped(!flipped); if (!flipped) speak(card.word) }}>
        <div className={`fc-card ${flipped ? 'flipped' : ''}`}>
          <div className="fc-front">
            <div className="fc-category-tag">{card.category}</div>
            <div className="fc-word">{card.word}</div>
            <button className="fc-speak" onClick={e => { e.stopPropagation(); speak(card.word) }}>🔊 Hear it</button>
            <p className="fc-tap-hint">Tap to see meaning<br/><small>לחץ לראות משמעות</small></p>
          </div>
          <div className="fc-back">
            <div className="fc-hebrew">{card.hebrew}</div>
            <div className="fc-example">
              <em>"{card.example}"</em>
              <button className="fc-speak-sm" onClick={e => { e.stopPropagation(); speak(card.example) }}>🔊</button>
            </div>
            <div className="fc-cat-tag">{card.category}</div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="fc-actions animate-up">
          <button className="btn" style={{ background:'#ffe4e6', border:'2px solid #ef4444' }}
            onClick={() => goNext(false)}>
            ✗ Still learning
            <small className="hebrew-label">עוד לומד</small>
          </button>
          <button className="btn" style={{ background:'#dcfce7', border:'2px solid #22c55e' }}
            onClick={() => goNext(true)}>
            ✓ I know this!
            <small className="hebrew-label">יודע!</small>
          </button>
        </div>
      )}

      {flipped && (
        <div className="fc-ai-section">
          {!aiExplanation && (
            <button className="btn btn-primary" onClick={getAIExplanation} disabled={loadingAI}>
              {loadingAI ? <><span className="spinner" /> Loading...</> : '🤖 Deep Explain (AI)'}
              <span className="hebrew-label">הסבר מעמיק</span>
            </button>
          )}
          {aiExplanation && (
            <div className="fc-ai-box animate-up">
              <div className="fc-ai-label">🤖 AI Explanation</div>
              <p>{aiExplanation}</p>
            </div>
          )}
        </div>
      )}

      <div className="fc-nav-btns">
        <button className="btn" onClick={() => goNext(undefined)}>Skip → <span className="hebrew-label">דלג</span></button>
      </div>
    </div>
  )
}