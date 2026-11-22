import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArtWindow, Asterisk, ConceptBadge } from '../components/Art'
import { DUOTONES, tone, type ArtKind, type Duotone } from '../lib/content'
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

  const roles: { r: Role; label: string; hint: string; kind: ArtKind; color: Duotone }[] = [
    { r: 'student', label: 'I’m a student', hint: 'Find class notes and ask questions', kind: 'cosines', color: DUOTONES.sky },
    { r: 'teacher', label: 'I’m a teacher', hint: 'Capture the board and answer questions', kind: 'reference', color: DUOTONES.green },
  ]

  return (
    <Shell nav={false}>
      <div className="entry">
        {/* small decorations */}
        <div className="deco" style={{ left: -70, top: 30, transform: 'rotate(-12deg)', ...tone(DUOTONES.red) }}><ConceptBadge kind="unit-circle" size={72} /></div>
        <div className="deco" style={{ right: -60, top: 0, transform: 'rotate(10deg)', ...tone(DUOTONES.orange) }}><ConceptBadge kind="radians" size={64} /></div>
        <div className="deco" style={{ right: -90, top: 230, transform: 'rotate(-6deg)', ...tone(DUOTONES.brown) }}><ConceptBadge kind="sine" size={56} /></div>
        <div className="deco muted" style={{ left: -40, top: 250 }}><Asterisk size={26} /></div>

        <h1 className="entry-title">Choose your view</h1>
        <div className="entry-roles">
          {roles.map(({ r, label, hint, kind, color }) => (
            <button key={r} type="button" className={`role-card${role === r ? ' selected' : ''}`} onClick={() => setRole(r)} aria-pressed={role === r} style={tone(color)}>
              <ConceptBadge kind={kind} size={64} />
              <span>
                <span className="big">{label}</span>
                <span className="hint">{hint}</span>
              </span>
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
