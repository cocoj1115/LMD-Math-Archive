import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArtWindow } from '../components/Art'
import { DUOTONES, type Duotone } from '../lib/content'
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

  const roles: { r: Role; label: string; hint: string; color: Duotone }[] = [
    { r: 'student', label: 'Student', hint: 'Find class notes and worked examples, and ask the class when you’re stuck.', color: DUOTONES.sky },
    { r: 'teacher', label: 'Teacher', hint: 'Capture the board after class, check the formulas, and answer questions.', color: DUOTONES.green },
  ]

  return (
    <Shell nav={false}>
      <div className="entry">
        <h1 className="entry-title">Choose your view</h1>
        <div className="entry-roles">
          {roles.map(({ r, label, hint, color }) => (
            <button key={r} type="button" className={`gcard role${role === r ? ' selected' : ''}`} onClick={() => setRole(r)} aria-pressed={role === r}>
              <h3>{label}</h3>
              <ArtWindow kind={r} color={color} />
              <div className="gfoot">{hint}</div>
            </button>
          ))}
        </div>

        {role && (
          <form
            className="entry-form"
            onSubmit={(e) => {
              e.preventDefault()
              go()
            }}
          >
            <label className="field">
              <span>{role === 'student' ? 'First name' : 'Your name'}</span>
              <input className="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={role === 'student' ? 'e.g. Maya' : 'e.g. Ms. Rivera'} autoFocus />
            </label>
            <label className="field">
              <span>Class code</span>
              <input className="text" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" />
            </label>
            <button className="btn-solid entry-btn" type="submit">
              {role === 'student' ? 'Join class →' : 'Open teacher view →'}
            </button>
          </form>
        )}
      </div>
    </Shell>
  )
}

const STEPS = [
  { kicker: 'Your class', title: 'Class archive', body: 'Find the worksheets, examples, and board notes from class.', art: 'unit-circle', bg: '#E6E6E6', ink: '#002BFF' },
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
