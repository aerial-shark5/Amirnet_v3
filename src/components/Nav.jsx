import { useNavigate, useLocation } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import './Nav.css'

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Home', labelHe: 'בית' },
  { path: '/flashcards', icon: '🃏', label: 'Words', labelHe: 'מילים' },
  { path: '/sentence', icon: '✍️', label: 'Fill-In', labelHe: 'השלמה' },
  { path: '/restatements', icon: '🔄', label: 'Restate', labelHe: 'ניסוח מחדש' },
  { path: '/reading', icon: '📖', label: 'Reading', labelHe: 'הבנת הנקרא' },
  { path: '/mock', icon: '📝', label: 'Mock Test', labelHe: 'מבחן' },
  { path: '/progress', icon: '📊', label: 'Progress', labelHe: 'התקדמות' },
  { path: '/tutor', icon: '🤖', label: 'AI Tutor', labelHe: 'מורה AI' },
]

export default function Nav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { progress, level, xpInLevel } = useProgress()

  return (
    <nav className="nav">
      <div className="nav-xp">
        <span className="nav-level">Lv.{level}</span>
        <div className="nav-xp-bar">
          <div className="nav-xp-fill" style={{ width: `${xpInLevel}%` }} />
        </div>
        <span className="nav-xp-num">{progress.xp} XP</span>
      </div>
      <div className="nav-items">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className="nav-label-he">{item.labelHe}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
