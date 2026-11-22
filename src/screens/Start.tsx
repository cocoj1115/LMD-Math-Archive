import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArtWindow, ConceptBadge } from '../components/Art'
import { DUOTONES, tone } from '../lib/content'
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
      <div className="start-hero">
        <div className="float" style={{ left: 10, top: 40, transform: 'rotate(-12deg)', ...tone(DUOTONES.red) }}><ConceptBadge kind="unit-circle" size={96} /></div>
        <div className="float" style={{ right: 20, top: 20, transform: 'rotate(10deg)', ...tone(DUOTONES.sky) }}><ConceptBadge kind="triangles" size={84} /></div>
        <div className="float" style={{ left: 120, top: 250, transform: 'rotate(8deg)', ...tone(DUOTONES.brown) }}><ConceptBadge kind="sine" size={70} /></div>
        <div className="float" style={{ right: 110, top: 240, transform: 'rotate(-8deg)', ...tone(DUOTONES.orange) }}><ConceptBadge kind="radians" size={76} /></div>
        <div className="mono" style={{ marginBottom: 18 }}>Math 3 · City of Bridges</div>
        <h1>Your class,<br />all in one place</h1>
        <p className="sub">Board notes, worked examples, worksheets, and questions from Math 3, organized by topic.</p>
      </div>
      <h2 style={{ textAlign: 'center', marginTop: 40 }}>Choose your view</h2>
      <div className="grid-2" style={{ marginTop: 8, maxWidth: 900, marginInline: 'auto' }}>
        {(['student', 'teacher'] as Role[]).map((r) => (
          <button key={r} className={`gcard role${role === r ? ' selected' : ''}`} style={{ minHeight: 260, textAlign: 'left', cursor: 'pointer', font: 'inherit' }} onClick={() => setRole(r)}>
            <h3>{r === 'student' ? 'Student' : 'Teacher'}</h3>
            <ArtWindow kind={r === 'student' ? 'cosines' : 'reference'} color={r === 'student' ? DUOTONES.blue : DUOTONES.green} />
            <div className="gfoot">
              {r === 'student' ? 'Find class notes and worked examples, and ask the class when you’re stuck.' : 'Capture the board after class, check the formulas, and answer questions.'}
            </div>
          </button>
        ))}
      </div>
      {role && (
        <form
          className="card"
          style={{ marginTop: 24, maxWidth: 900, marginInline: 'auto' }}
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
          <button className="btn-solid" type="submit">
            Continue →
          </button>
        </form>
      )}
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
