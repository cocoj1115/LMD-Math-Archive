import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArtWindow, ConceptBadge } from '../components/Art'
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

  const roles: { r: Role; label: string; points: string[]; main: ArtKind; tile: ArtKind; note: string; color: Duotone; tileColor: Duotone }[] = [
    {
      r: 'student', label: 'I’m a student', main: 'notes', tile: 'bubble', note: 'today’s board', color: DUOTONES.sky, tileColor: DUOTONES.red,
      points: ['See what was on the board', 'Open worked examples and worksheets', 'Ask a question when you’re stuck'],
    },
    {
      r: 'teacher', label: 'I’m a teacher', main: 'board', tile: 'phone', note: 'after class', color: DUOTONES.green, tileColor: DUOTONES.orange,
      points: ['Snap the board after class', 'Fix any formula the photo got wrong', 'See questions by topic'],
    },
  ]

  return (
    <Shell nav={false}>
      <div className="entry">
        <div className="entry-roles">
          {roles.map((x) => (
            <div key={x.r} className="role-block">
              <button type="button" className={`gcard role${role === x.r ? ' selected' : ''}`} onClick={() => setRole(x.r)} aria-pressed={role === x.r} aria-expanded={role === x.r}>
                <h3>{x.label}</h3>
                <ul className="checks" style={tone(x.color)}>
                  {x.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <div className="scene" aria-hidden="true">
                  <span className="scene-note">
                    {x.note}
                    <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M1 3C8 1 16 2 22 9" strokeDasharray="2 3" /><path d="M17 9.5L22.5 9.5L21.5 4" /></svg>
                  </span>
                  <ArtWindow kind={x.main} color={x.color} className="scene-main" />
                  <span className="scene-tile" style={tone(x.tileColor)}>
                    <ConceptBadge kind={x.tile} size={68} labels />
                  </span>
                </div>
              </button>
              {/* the sign-in form opens right under the card you picked */}
              {role === x.r && (
                <form
                  className="entry-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go()
                  }}
                >
                  <label className="field">
                    <span>{x.r === 'student' ? 'First name' : 'Your name'}</span>
                    <input className="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={x.r === 'student' ? 'e.g. Maya' : 'e.g. Ms. Rivera'} autoFocus />
                  </label>
                  <label className="field">
                    <span>Class code</span>
                    <input className="text" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" />
                  </label>
                  <button className="btn-solid entry-btn" type="submit">
                    {x.r === 'student' ? 'Join class →' : 'Open teacher view →'}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
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
      <div className="hero inside" style={{ marginTop: 56, minHeight: 380, padding: '56px 48px' }}>
        <div className="mono">{s.kicker}</div>
        <h1 style={{ fontSize: 80 }}>{s.title}</h1>
        <p style={{ fontSize: 22, maxWidth: 480 }}>{s.body}</p>
        <ArtWindow kind={s.art} color={{ bg: s.bg, ink: s.ink }} className="hero-art" />
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
