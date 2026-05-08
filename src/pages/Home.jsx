import { useNavigate } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import './Home.css'

const MODULES = [
  {
    path: '/flashcards',
    icon: '🃏',
    title: 'Vocabulary',
    titleHe: 'אוצר מילים',
    desc: 'Learn key AMIR words',
    descHe: 'מילות מפתח מהמבחן',
    color: '#2563eb',
    time: '5 min'
  },
  {
    path: '/sentence',
    icon: '✍️',
    title: 'Sentence Completion',
    titleHe: 'שלמות משפט',
    desc: 'Fill in the missing word',
    descHe: 'בחר את המילה החסרה',
    color: '#e84c3d',
    time: '10 min',
    hot: true
  },
  {
    path: '/restatements',
    icon: '🔄',
    title: 'Restatements',
    titleHe: 'ניסוח מחדש',
    desc: 'Same meaning, different words',
    descHe: 'אותה משמעות, מילים אחרות',
    color: '#7c3aed',
    time: '10 min',
    hot: true
  },
  {
    path: '/reading',
    icon: '📖',
    title: 'Reading Comprehension',
    titleHe: 'הבנת הנקרא',
    desc: 'Real AMIR passages & questions',
    descHe: 'קטעי קריאה ושאלות אמתיות',
    color: '#059669',
    time: '15 min'
  },
  {
    path: '/mock',
    icon: '📝',
    title: 'Full Mock Test',
    titleHe: 'מבחן אמ"יר מלא',
    desc: 'Timed practice exam',
    descHe: 'סימולציה של המבחן האמיתי',
    color: '#d97706',
    time: '25 min'
  },
  {
    path: '/tutor',
    icon: '🤖',
    title: 'AI Tutor',
    titleHe: 'מורה AI',
    desc: 'Ask anything in Hebrew',
    descHe: 'שאל כל שאלה בעברית',
    color: '#0891b2',
    time: 'Anytime'
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { progress, level, xpInLevel, estimatedScore } = useProgress()

  const daysLeft = 60 // ~2 months

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-badge">אמי"ר · AMIR TEST PREP</div>
        <h1 className="home-title">Pass<br/>English.</h1>
        <p className="home-sub">60-day program · Built for IDF soldiers · עברית support</p>

        <div className="home-stats">
          <div className="stat-card">
            <span className="stat-num">{daysLeft}</span>
            <span className="stat-label">Days Left<br/><small>ימים שנותרו</small></span>
          </div>
          <div className="stat-card stat-card--accent">
            <span className="stat-num">{estimatedScore}</span>
            <span className="stat-label">Est. Score<br/><small>ציון משוער</small></span>
          </div>
          <div className="stat-card">
            <span className="stat-num">Lv.{level}</span>
            <span className="stat-label">{progress.xp} XP<br/><small>ניקוד</small></span>
          </div>
        </div>
      </header>

      <div className="home-tip">
        <span className="tip-icon">💡</span>
        <span>
          <strong>AMIR has 3 sections:</strong> Sentence Completion · Restatement · Reading Comprehension
          <span className="hebrew-label">3 חלקים: השלמת משפטים · ניסוח מחדש · הבנת הנקרא</span>
        </span>
      </div>

      <div className="home-grid">
        {MODULES.map(m => (
          <button key={m.path} className="module-card" onClick={() => navigate(m.path)}
            style={{ '--mc': m.color }}>
            {m.hot && <span className="module-hot">🔥 KEY</span>}
            <div className="module-icon">{m.icon}</div>
            <div className="module-info">
              <div className="module-title">{m.title}</div>
              <div className="module-title-he">{m.titleHe}</div>
              <div className="module-desc">{m.desc}</div>
            </div>
            <div className="module-time">{m.time}</div>
          </button>
        ))}
      </div>

      <div className="home-score-guide card">
        <h3>🎯 AMIR Score Guide <span className="hebrew-label">מדריך ציונים</span></h3>
        <div className="score-bars">
          {[
            { range: '150–174', label: 'Below passing', labelHe: 'מתחת לסף', pct: 15, color: '#ef4444' },
            { range: '175–199', label: 'Basic level', labelHe: 'רמה בסיסית', pct: 40, color: '#f97316' },
            { range: '200–219', label: 'Good — passes most requirements', labelHe: 'עובר רוב דרישות', pct: 65, color: '#eab308' },
            { range: '220–250', label: 'Excellent', labelHe: 'מצוין', pct: 100, color: '#22c55e' },
          ].map(s => (
            <div key={s.range} className="score-row">
              <span className="score-range">{s.range}</span>
              <div className="score-bar-wrap">
                <div className="score-bar" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
              <div className="score-labels">
                <span>{s.label}</span>
                <span className="hebrew-label">{s.labelHe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
