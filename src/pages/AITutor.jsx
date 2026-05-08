import { useState, useRef, useEffect } from 'react'
import { askClaude } from '../utils/claude'
import './AITutor.css'

const QUICK_QUESTIONS = [
  { q: "What is a 'restatement' question?", labelHe: "מהי שאלת ניסוח מחדש?" },
  { q: "How do I answer 'mainly about' questions in reading?", labelHe: "איך עונים על 'בעיקר עוסק ב'?" },
  { q: "What's the difference between 'however' and 'moreover'?", labelHe: "מה ההבדל בין however ל-moreover?" },
  { q: "How do I use context clues in sentence completion?", labelHe: "איך משתמשים ברמזים מהקונטקסט?" },
  { q: "Explain the word 'alleged' in simple terms", labelHe: "הסבר את המילה alleged בפשטות" },
  { q: "What score do I need to pass the AMIR test?", labelHe: "איזה ציון צריך כדי לעבור את האמי\"ר?" },
  { q: "Give me 5 important vocabulary words for the AMIR", labelHe: "תן לי 5 מילים חשובות לאמי\"ר" },
  { q: "What is the difference between 'convert' and 'transform'?", labelHe: "מה ההבדל בין convert ל-transform?" },
]

export default function AITutor() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `שלום! 👋 I'm your AMIR English tutor. I speak Hebrew too!\n\nYou can ask me anything about the test, English words, grammar, or study strategies. I'll always explain clearly and give you the Hebrew meaning too.\n\nמה תרצה לדעת היום?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const reply = await askClaude(
        msg,
        `You are a friendly, expert English tutor helping an Israeli IDF officer (30 years old, Hebrew speaker) prepare for the AMIR (אמי"ר) English proficiency test.
The AMIR test has 3 question types: Sentence Completion (שלמות משפט), Restatements (ניסוח מחדש), and Reading Comprehension (הבנת הנקרא).
ALWAYS include Hebrew translations for key words and concepts. Be very warm and encouraging.
Keep responses clear and practical — this person needs to pass the test in 2 months.
Format nicely for mobile: use short paragraphs, bold key words.`
      )
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, could not connect. Make sure your API key is set in Vercel.' }])
    }
    setLoading(false)
  }

  return (
    <div className="tutor-page">
      <div className="tutor-header">
        <div className="tutor-avatar">🤖</div>
        <div>
          <h2>AI English Tutor</h2>
          <p>מורה לאנגלית · שואל בעברית, עונה בשתיים</p>
        </div>
      </div>

      <div className="quick-questions">
        <div className="quick-label">Quick questions | שאלות מהירות:</div>
        <div className="quick-btns">
          {QUICK_QUESTIONS.map((q, i) => (
            <button key={i} className="quick-btn" onClick={() => send(q.q)}>
              {q.q}
              <span className="quick-btn-he">{q.labelHe}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && <span className="msg-avatar">🤖</span>}
            <div className="msg-bubble">
              {msg.content.split('\n').map((line, j) => (
                <p key={j} style={{ margin: j === 0 ? 0 : '6px 0 0' }}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <span className="msg-avatar">🤖</span>
            <div className="msg-bubble loading-bubble">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything... שאל כל שאלה"
          disabled={loading}
        />
        <button className="chat-send" onClick={() => send()} disabled={loading || !input.trim()}>
          {loading ? <span className="spinner" /> : '↑'}
        </button>
      </div>
    </div>
  )
}
