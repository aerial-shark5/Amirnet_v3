import { useProgress } from '../hooks/useProgress'
import { VOCAB_WORDS } from '../data/vocabulary'
import './Progress.css'

export default function Progress() {
  const { progress, level, xpInLevel, accuracy, estimatedScore, resetProgress } = useProgress()

  const wrongWords = Object.entries(progress.wrongWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const mockScores = progress.mockTests.slice(-5)
  const passScore = 200

  return (
    <div className="progress-page">
      <div className="progress-hero">
        <h2>Your Progress</h2>
        <p className="hebrew-label" style={{ marginTop: 2 }}>ההתקדמות שלך</p>
        <div className="level-display">
          <div className="level-ring">
            <span className="level-num">Lv.{level}</span>
            <svg viewBox="0 0 80 80" className="level-svg">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--mint)" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - xpInLevel / 100)}`}
                transform="rotate(-90 40 40)"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{progress.xp} total XP · {xpInLevel}% to next level</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="sb-num">{estimatedScore}</div>
          <div className="sb-label">Est. AMIR Score<br/><small>ציון אמ"יר משוער</small></div>
          <div className={`sb-badge ${estimatedScore >= passScore ? 'badge-green' : 'badge-red'}`}>
            {estimatedScore >= passScore ? '✓ Passing' : `${passScore - estimatedScore} pts away`}
          </div>
        </div>
        <div className="stat-box">
          <div className="sb-num">{accuracy}%</div>
          <div className="sb-label">Accuracy<br/><small>אחוז נכונות</small></div>
        </div>
        <div className="stat-box">
          <div className="sb-num">{progress.flashcardsLearned.length}</div>
          <div className="sb-label">Words Learned<br/><small>{VOCAB_WORDS.length} total</small></div>
        </div>
        <div className="stat-box">
          <div className="sb-num">{progress.totalQuestions}</div>
          <div className="sb-label">Questions Done<br/><small>שאלות שנעשו</small></div>
        </div>
      </div>

      {/* Vocab progress */}
      <div className="card" style={{ margin: '0 16px 16px' }}>
        <h3>Vocabulary Progress <span className="hebrew-label">התקדמות מילים</span></h3>
        <div className="vocab-progress-bar">
          <div className="vocab-progress-fill" style={{ width: `${(progress.flashcardsLearned.length / VOCAB_WORDS.length) * 100}%` }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
          {progress.flashcardsLearned.length} / {VOCAB_WORDS.length} words
        </div>
      </div>

      {/* Weak spots */}
      {wrongWords.length > 0 && (
        <div className="card" style={{ margin: '0 16px 16px' }}>
          <h3>⚠️ Weak Spots — Review These! <span className="hebrew-label">נקודות חולשה</span></h3>
          <div className="weak-list">
            {wrongWords.map(([word, count]) => {
              const w = VOCAB_WORDS.find(v => v.word === word)
              return (
                <div key={word} className="weak-item">
                  <div>
                    <span className="weak-word">{word}</span>
                    {w && <span className="weak-hebrew">{w.hebrew}</span>}
                  </div>
                  <span className="weak-count">✗ {count}x</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mock test history */}
      {mockScores.length > 0 && (
        <div className="card" style={{ margin: '0 16px 16px' }}>
          <h3>📝 Mock Test History <span className="hebrew-label">היסטוריית מבחנים</span></h3>
          {mockScores.map((test, i) => {
            const pct = Math.round((test.score / test.total) * 100)
            return (
              <div key={i} className="mock-history-row">
                <span>Test {i + 1}</span>
                <div className="mh-bar-wrap">
                  <div className="mh-bar" style={{ width: `${pct}%`, background: pct >= 70 ? '#22c55e' : '#ef4444' }} />
                </div>
                <span>{test.score}/{test.total} ({pct}%)</span>
              </div>
            )
          })}
        </div>
      )}

      {/* 60-day plan */}
      <div className="card" style={{ margin: '0 16px 16px' }}>
        <h3>📅 60-Day Study Plan <span className="hebrew-label">תוכנית לימוד</span></h3>
        <div className="study-plan">
          {[
            { weeks: 'Week 1–2', focus: 'Vocabulary + Sentence Completion basics', focusHe: 'אוצר מילים + בסיסי השלמת משפטים' },
            { weeks: 'Week 3–4', focus: 'Restatements — key word strategy', focusHe: 'ניסוח מחדש — אסטרטגיית מילת מפתח' },
            { weeks: 'Week 5–6', focus: 'Reading Comprehension + full mock tests', focusHe: 'הבנת הנקרא + מבחנים מלאים' },
            { weeks: 'Week 7–8', focus: 'Timed practice + weak spots only', focusHe: 'תרגול בזמן + נקודות חולשה בלבד' },
          ].map((row, i) => (
            <div key={i} className="plan-row">
              <span className="plan-weeks">{row.weeks}</span>
              <div>
                <div className="plan-focus">{row.focus}</div>
                <div className="hebrew-label">{row.focusHe}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <button className="btn" style={{ width: '100%', justifyContent: 'center', color: '#ef4444', borderColor: '#ef4444' }}
          onClick={() => { if (confirm('Reset all progress?')) resetProgress() }}>
          Reset Progress | אפס התקדמות
        </button>
      </div>
    </div>
  )
}
