import { useState, useEffect, useRef } from 'react'
import { SENTENCE_COMPLETIONS, RESTATEMENTS, READING_PASSAGES } from '../data/questions'
import { useProgress } from '../hooks/useProgress'
import './MockTest.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const SECTION_TIME = 25 * 60 // 25 minutes

export default function MockTest() {
  const { recordMockTest } = useProgress()
  const [phase, setPhase] = useState('intro') // intro | test | results
  const [section, setSection] = useState(0) // 0,1,2
  const [timeLeft, setTimeLeft] = useState(SECTION_TIME)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)
  const timerRef = useRef(null)

  // Build 3 sections like real AMIR
  const sections = [
    {
      label: 'Section 1', labelHe: 'פרק 1', time: SECTION_TIME,
      questions: [
        ...shuffle(SENTENCE_COMPLETIONS).slice(0, 11).map(q => ({ ...q, type: 'sc' })),
        ...shuffle(RESTATEMENTS).slice(0, 6).map(q => ({ ...q, type: 'rs' })),
        ...shuffle(READING_PASSAGES[0].questions).slice(0, 5).map(q => ({ ...q, type: 'rc', passageId: 'rp1' })),
      ]
    },
    {
      label: 'Section 2', labelHe: 'פרק 2', time: SECTION_TIME,
      questions: [
        ...shuffle(SENTENCE_COMPLETIONS).slice(0, 12).map(q => ({ ...q, type: 'sc' })),
        ...shuffle(RESTATEMENTS).slice(0, 7).map(q => ({ ...q, type: 'rs' })),
        ...shuffle(READING_PASSAGES[1].questions).slice(0, 4).map(q => ({ ...q, type: 'rc', passageId: 'rp2' })),
      ]
    },
    {
      label: 'Section 3', labelHe: 'פרק 3', time: SECTION_TIME,
      questions: [
        ...shuffle(SENTENCE_COMPLETIONS).slice(0, 12).map(q => ({ ...q, type: 'sc' })),
        ...shuffle(RESTATEMENTS).slice(0, 7).map(q => ({ ...q, type: 'rs' })),
        ...shuffle(READING_PASSAGES[2].questions).slice(0, 4).map(q => ({ ...q, type: 'rc', passageId: 'rp3' })),
      ]
    }
  ]

  const startTest = () => {
    setPhase('test')
    setSection(0)
    setTimeLeft(SECTION_TIME)
    setAnswers({})
  }

  useEffect(() => {
    if (phase !== 'test') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          nextSection()
          return SECTION_TIME
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, section])

  const nextSection = () => {
    clearInterval(timerRef.current)
    if (section + 1 >= sections.length) {
      finishTest()
    } else {
      setSection(s => s + 1)
      setTimeLeft(SECTION_TIME)
    }
  }

  const finishTest = () => {
    clearInterval(timerRef.current)
    let correct = 0, total = 0
    sections.forEach((sec, si) => {
      sec.questions.forEach((q, qi) => {
        const key = `${si}-${qi}`
        total++
        if (answers[key] === q.answer) correct++
      })
    })
    const raw = correct
    const estimated = rawToScore(raw)
    setResults({ correct, total, raw, estimated })
    recordMockTest(correct, total)
    setPhase('results')
  }

  const rawToScore = (raw) => {
    // Simplified conversion table from actual AMIR booklet
    const table = [150,151,152,153,154,154,155,156,157,157,158,159,160,160,161,162,163,164,164,165,166,167,167,168,169,170,171,172,173,173,174,175,176,177,178,179,181,182,184,185,186,187,189,190,191,192,193,195,196,197,198,199,201,202,203,204,206,207,208,210,211,212,214,215,216,217,219,220,222,223,225,226,228,229,230,232,234,235,237,239,241,243,244,246,248,250]
    return table[Math.min(raw, table.length - 1)] || 150
  }

  const setAnswer = (sectionIdx, qIdx, answer) => {
    setAnswers(prev => ({ ...prev, [`${sectionIdx}-${qIdx}`]: answer }))
  }

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const timerClass = timeLeft < 300 ? 'timer-red' : timeLeft < 600 ? 'timer-yellow' : ''

  if (phase === 'intro') return <MockIntro onStart={startTest} />
  if (phase === 'results') return <MockResults results={results} sections={sections} answers={answers} />

  const currentSection = sections[section]

  return (
    <div className="mock-page">
      <div className="mock-header">
        <div className="mock-section-info">
          <span className="mock-section-label">{currentSection.label}</span>
          <span className="mock-section-label-he">{currentSection.labelHe}</span>
        </div>
        <div className={`mock-timer ${timerClass}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
        <button className="btn btn-accent mock-submit" onClick={nextSection}>
          {section < sections.length - 1 ? 'Finish Section →' : 'Finish Test ✓'}
        </button>
      </div>

      <div className="mock-progress">
        {Object.keys(answers).filter(k => k.startsWith(section + '-')).length} / {currentSection.questions.length} answered
        <span className="hebrew-label">ענו על</span>
      </div>

      <div className="mock-questions">
        {currentSection.questions.map((q, qi) => {
          const answered = answers[`${section}-${qi}`]
          return (
            <div key={qi} className={`mock-q ${answered !== undefined ? 'mock-q-answered' : ''}`}>
              <div className="mock-q-num">
                {qi + 1}
                <span className={`mock-type-tag mock-type-${q.type}`}>
                  {q.type === 'sc' ? 'Completion' : q.type === 'rs' ? 'Restatement' : 'Reading'}
                </span>
              </div>

              {q.type === 'rc' && (
                <div className="mock-passage-ref">
                  📄 {READING_PASSAGES.find(p => p.id === q.passageId)?.title}
                  {' '}<a className="mock-read-link" onClick={() => {
                    const p = READING_PASSAGES.find(p => p.id === q.passageId)
                    alert(p?.text || '')
                  }}>Read passage ▸</a>
                </div>
              )}

              <div className="mock-q-text">
                {q.type === 'sc' ? q.sentence : q.type === 'rs' ? (
                  <span><em>Original:</em> {q.original}</span>
                ) : q.text}
              </div>

              <div className="mock-options">
                {q.options.map((opt, oi) => (
                  <button key={oi}
                    className={`mock-opt ${answered === oi ? 'mock-opt-selected' : ''}`}
                    onClick={() => setAnswer(section, qi, oi)}>
                    <span className="mock-opt-num">{oi + 1}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MockIntro({ onStart }) {
  return (
    <div className="mock-intro">
      <div className="card" style={{ margin: 16 }}>
        <h2>📝 Full Mock Test</h2>
        <p className="hebrew-label" style={{ marginBottom: 16 }}>מבחן אמיר מלא לסימולציה</p>

        <div className="mock-intro-grid">
          <div className="mock-intro-item">
            <span className="mii-icon">📋</span>
            <div><strong>3 Sections</strong><br/><small>3 פרקים</small></div>
          </div>
          <div className="mock-intro-item">
            <span className="mii-icon">⏱</span>
            <div><strong>25 min each</strong><br/><small>25 דקות לפרק</small></div>
          </div>
          <div className="mock-intro-item">
            <span className="mii-icon">❓</span>
            <div><strong>~30 questions</strong><br/><small>~30 שאלות לפרק</small></div>
          </div>
        </div>

        <div className="mock-types">
          <div className="mock-type-row">
            <span className="mock-type-tag mock-type-sc">Completion</span>
            <span>Fill in the missing word · <span dir="rtl">השלמת משפטים</span></span>
          </div>
          <div className="mock-type-row">
            <span className="mock-type-tag mock-type-rs">Restatement</span>
            <span>Same meaning, different words · <span dir="rtl">ניסוח מחדש</span></span>
          </div>
          <div className="mock-type-row">
            <span className="mock-type-tag mock-type-rc">Reading</span>
            <span>Answer from the passage · <span dir="rtl">הבנת הנקרא</span></span>
          </div>
        </div>

        <div className="mock-score-targets" style={{ margin: '16px 0' }}>
          <h4>🎯 Target scores | יעדי ציון</h4>
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div><strong>200+</strong> — passes most university requirements | עובר רוב דרישות</div>
            <div><strong>220+</strong> — excellent, opens all tracks | מצוין, פותח את כל המסלולים</div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px' }} onClick={onStart}>
          Start Test Now → | התחל
        </button>
      </div>
    </div>
  )
}

function MockResults({ results, sections, answers }) {
  const { correct, total, raw, estimated } = results
  const pct = Math.round((correct / total) * 100)
  const passed = estimated >= 200

  return (
    <div className="mock-results">
      <div className="results-header" style={{ background: passed ? '#15803d' : '#dc2626' }}>
        <div className="results-emoji">{passed ? '🎉' : '💪'}</div>
        <h2>{passed ? 'Great Score!' : 'Keep Practicing!'}</h2>
        <p>{passed ? 'אתה בדרך הנכונה!' : 'תמשיך להתאמן!'}</p>
      </div>

      <div style={{ padding: 16 }}>
        <div className="results-score-grid">
          <div className="results-score-card results-score-main">
            <div className="rsc-num">{estimated}</div>
            <div className="rsc-label">Estimated AMIR Score<br/><small>ציון אמ"יר משוער</small></div>
          </div>
          <div className="results-score-card">
            <div className="rsc-num">{correct}/{total}</div>
            <div className="rsc-label">Correct Answers<br/><small>תשובות נכונות</small></div>
          </div>
          <div className="results-score-card">
            <div className="rsc-num">{pct}%</div>
            <div className="rsc-label">Accuracy<br/><small>אחוז הצלחה</small></div>
          </div>
        </div>

        <div className="results-breakdown">
          <h3>Section Breakdown | פירוט לפי פרק</h3>
          {sections.map((sec, si) => {
            const secCorrect = sec.questions.filter((q, qi) => answers[`${si}-${qi}`] === q.answer).length
            const secTotal = sec.questions.length
            const secPct = Math.round((secCorrect / secTotal) * 100)
            return (
              <div key={si} className="sec-row">
                <span>{sec.label}</span>
                <div className="sec-bar-wrap">
                  <div className="sec-bar" style={{ width: `${secPct}%`, background: secPct >= 70 ? '#22c55e' : secPct >= 50 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <span>{secCorrect}/{secTotal} ({secPct}%)</span>
              </div>
            )
          })}
        </div>

        <div className="results-advice card" style={{ marginTop: 16 }}>
          <h4>📌 What to focus on next | מה להתמקד בהמשך</h4>
          {pct < 60 && <p>• Work on <strong>Vocabulary Flashcards</strong> daily — knowing words is the foundation.</p>}
          {pct < 70 && <p>• Practice <strong>Sentence Completion</strong> — pick words by context, not just guess.</p>}
          {pct < 80 && <p>• Read <strong>Reading Comprehension</strong> passages carefully, answer from the text only.</p>}
          {pct >= 80 && <p>• Excellent! Focus on timing — try to finish each section in under 20 minutes.</p>}
        </div>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
          onClick={() => window.location.reload()}>
          Take Test Again ↺ | בחינה מחדש
        </button>
      </div>
    </div>
  )
}
