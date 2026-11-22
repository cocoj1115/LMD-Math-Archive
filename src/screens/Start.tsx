import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Shell } from '../components/ui'
import { useApp } from '../lib/app'
import type { Role } from '../lib/types'

export function Start() {
  const { session, start } = useApp()
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState(() => localStorage.getItem('visual-archive:lastCode') || 'MATH3')

  if (session) {
    const seen = localStorage.getItem('visual-archive:introSeen')
    return <Navigate to={session.role === 'teacher' ? '/t/capture' : seen ? '/archive' : '/welcome/1'} replace />
  }

  const go = () => {
    if (!role) return
    localStorage.setItem('visual-archive:lastCode', code.trim().toUpperCase())
    start(role, name, code) // re-render redirects to the role's home screen
  }

  return (
    <Shell nav={false}>
      <h1 style={{ marginTop: 120 }}>Choose your view</h1>
      <div className="grid-2" style={{ marginTop: 32, maxWidth: 760 }}>
        {(['student', 'teacher'] as Role[]).map((r) => (
          <button key={r} className={`role-card${role === r ? ' selected' : ''}`} onClick={() => setRole(r)}>
            <div className="big">{r === 'student' ? 'Student' : 'Teacher'}</div>
            <div style={{ marginTop: 8 }}>
              {r === 'student' ? 'Find class notes, worked examples, and ask questions.' : 'Capture board notes, correct them, and answer questions.'}
            </div>
          </button>
        ))}
      </div>
      {role && (
        <form
          className="card"
          style={{ marginTop: 24, maxWidth: 760 }}
          onSubmit={(e) => {
            e.preventDefault()
            go()
          }}
        >
          <div className="grid-2" style={{ gap: 20 }}>
            <label className="field">
              <span>{role === 'student' ? 'Your first name' : 'Your name'}</span>
              <input className="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={role === 'student' ? 'e.g. Maya' : 'e.g. Ms. Rivera'} autoFocus />
            </label>
            <label className="field">
              <span>Class code</span>
              <input className="text" value={code} onChange={(e) => setCode(e.target.value)} />
            </label>
          </div>
          <button className="pill primary" type="submit">
            Continue →
          </button>
        </form>
      )}
    </Shell>
  )
}

const STEPS = [
  { kicker: 'YOUR MATH 3', title: 'CLASS ARCHIVE', body: 'Find the worksheets, examples, and board notes from class.' },
  { kicker: 'CHOOSE', title: 'A TOPIC', body: 'Open the lesson you’re working on or catching up on.' },
  { kicker: 'FIND YOUR', title: 'NEXT STEP', body: 'Follow a worked example, try the class worksheet, or ask the class when you’re stuck.' },
]

export function Welcome() {
  const n = Math.min(3, Math.max(1, Number(useParams().step) || 1))
  const s = STEPS[n - 1]
  const done = () => localStorage.setItem('visual-archive:introSeen', '1')
  return (
    <Shell nav={false}>
      <div className="spread" style={{ marginTop: 28 }}>
        <span className="mono">{n} of 3</span>
        <Link className="linkbtn" to="/archive" onClick={done}>
          Skip intro
        </Link>
      </div>
      <div style={{ marginTop: 90 }}>
        <div className="mono">{s.kicker}</div>
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.title}</div>
        <p style={{ fontSize: 22, maxWidth: 560 }}>{s.body}</p>
      </div>
      <div className="row" style={{ marginTop: 40 }}>
        {n > 1 && (
          <Link className="pill" to={`/welcome/${n - 1}`}>
            ← Back
          </Link>
        )}
        {n < 3 ? (
          <Link className="pill primary" to={`/welcome/${n + 1}`}>
            Next →
          </Link>
        ) : (
          <Link className="pill primary" to="/archive" onClick={done}>
            Browse topics →
          </Link>
        )}
      </div>
    </Shell>
  )
}
