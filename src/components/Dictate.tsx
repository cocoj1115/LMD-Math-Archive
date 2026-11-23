import { useEffect, useRef, useState } from 'react'

// Minimal typing for the Web Speech API (Chrome / Edge / Safari)
type SpeechRec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}

function getRecognizer(): SpeechRec | null {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec }
  const C = w.SpeechRecognition || w.webkitSpeechRecognition
  return C ? new C() : null
}

/** "Record by voice" — speech becomes editable question text. */
export function Dictate({ onText, onUsed }: { onText: (text: string) => void; onUsed?: () => void }) {
  const [on, setOn] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const recRef = useRef<SpeechRec | null>(null)
  const supported = typeof window !== 'undefined' && !!getRecognizer()

  useEffect(() => () => recRef.current?.stop(), [])

  if (!supported) return <span className="muted" style={{ fontSize: 14 }}>Voice input needs Chrome or Edge.</span>

  const toggle = () => {
    if (on) {
      recRef.current?.stop()
      return
    }
    const rec = getRecognizer()!
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = false
    rec.onresult = (e) => {
      let text = ''
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript
      if (text.trim()) {
        onText(text.trim())
        onUsed?.()
      }
    }
    rec.onend = () => setOn(false)
    rec.onerror = (e) => {
      setErr(e.error === 'not-allowed' ? 'Microphone blocked — allow it in the browser.' : `Voice error: ${e.error}`)
      setOn(false)
    }
    recRef.current = rec
    setErr(null)
    rec.start()
    setOn(true)
  }

  return (
    <span className="row">
      <button type="button" className={`pill mic${on ? ' primary' : ''}`} onClick={toggle} aria-pressed={on}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
        {on ? 'Stop recording' : 'Record by voice'}
      </button>
      {err && <span style={{ color: 'var(--warn)', fontSize: 14 }}>{err}</span>}
    </span>
  )
}
