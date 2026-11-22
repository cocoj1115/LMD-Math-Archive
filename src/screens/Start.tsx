import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArtWindow } from '../components/Art'
import { Shell } from '../components/ui'
import { useApp } from '../lib/app'
import type { Role } from '../lib/types'

export function Start() {
  const { session, start } = useApp()
  const last = localStorage.getItem('visual-archive:lastCode') || 'MATH3'
  const [sName, setSName] = useState('')
  const [sCode, setSCode] = useState(last)
  const [tName, setTName] = useState('')
  const [tCode, setTCode] = useState(last)

  if (session) {
    const seen = localStorage.getItem('visual-archive:introSeen')
    return <Navigate to={session.role === 'teacher' ? '/t/capture' : seen ? '/archive' : '/welcome/1'} replace />
  }

  const go = (role: Role, name: string, code: string) => {
    localStorage.setItem('visual-archive:lastCode', code.trim().toUpperCase())
    start(role, name, code) // re-render redirects to the role's home screen
  }

  return (
    <Shell nav={false}>
      <div className="entry">
        <form
          className="entry-panel"
          onSubmit={(e) => {
            e.preventDefault()
            go('student', sName, sCode)
          }}
        >
          <h2>Student</h2>
          <label className="field">
            <span>Class code</span>
            <input className="text" value={sCode} onChange={(e) => setSCode(e.target.value)} autoCapitalize="characters" />
          </label>
          <label className="field">
            <span>First name</span>
            <input className="text" value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g. Maya" autoFocus />
          </label>
          <button className="btn-solid entry-btn" type="submit">Join class →</button>
        </form>
        <form
          className="entry-panel"
          onSubmit={(e) => {
            e.preventDefault()
            go('teacher', tName, tCode)
          }}
        >
          <h2>Teacher</h2>
          <label className="field">
            <span>Class code</span>
            <input className="text" value={tCode} onChange={(e) => setTCode(e.target.value)} autoCapitalize="characters" />
          </label>
          <label className="field">
            <span>Your name</span>
            <input className="text" value={tName} onChange={(e) => setTName(e.target.value)} placeholder="e.g. Ms. Rivera" />
          </label>
          <button className="btn-outline entry-btn" type="submit">Open teacher view →</button>
        </form>
      </div>
    </Shell>
  )
}

const STEPS = [
  { kicker: 'Your Math 3', title: 'Class archive', body: 'Find the worksheets, examples, and board notes from class.', art: 'unit-circle', bg: '#E6E6E6', ink: '#002BFF' },
  { kicker: 'Choose', title: 'A topic', body: 'Open the lesson you’re working on or catching up on.', art: 'triangles', bg: '#FFF584', ink: '#0966DF' },
  { kicker: 'Find your', title: 'Next step', body: 'Follow a worked example, try the class worksheet, or ask the class when you’re stuck.', art: 'sine', bg: '#EECED8', ink: '#DD0C00' },
] as const

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
      <div className="hero" style={{ marginTop: 56, minHeight: 380, padding: '56px 48px' }}>
        <div className="mono">{s.kicker}</div>
        <h1 style={{ fontSize: 80 }}>{s.title}</h1>
        <p style={{ fontSize: 22, maxWidth: 480 }}>{s.body}</p>
        <ArtWindow kind={s.art} color={{ bg: s.bg, ink: s.ink }} className="hero-art" style={{ top: 'auto', bottom: -26, width: 380 }} />
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
