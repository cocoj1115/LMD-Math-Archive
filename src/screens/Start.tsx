import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArtWindow, ConceptBadge } from '../components/Art'
import { APP_NAME, DUOTONES, tone, type ArtKind, type Duotone } from '../lib/content'
import { Shell } from '../components/ui'
import { useApp } from '../lib/app'
import type { Role } from '../lib/types'

export function Start() {
  const { session, start } = useApp()
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState(() => localStorage.getItem('visual-archive:lastCode') || 'MATH3')

  if (session) {
    // Students see the intro on every sign-in (each test participant should get it)
    return <Navigate to={session.role === 'teacher' ? '/t/capture' : '/welcome/1'} replace />
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

/*
 * Onboarding: rebuilt 1:1 from Figma "Wire-frame" → V3 / Welcome / 1–3 (nodes 40:66, 40:100, 40:120).
 * Positions and sizes are the Figma values on a 1120×760 artboard, scaled to fit the window.
 * Each page uses a different duotone from the Design Research Zine.
 */
interface Btn { label: string; to: string; x: number; w: number; solid?: boolean }
interface Step {
  line1: string
  strip: string
  desc: string
  bg: string
  ink: string
  box: { left: number; top: number; w: number; h: number; rw: number; rot: number }
  txt: { left: number; top: number; w: number; h: number }
  buttons: Btn[]
}

const STEPS: Step[] = [
  {
    line1: 'YOUR CLASS', strip: 'CLASS ARCHIVE', desc: 'Find the worksheets and examples you used in class.',
    bg: '#E6E6E6', ink: '#002BFF',
    box: { left: 55.01, top: 330.47, w: 509.97, h: 96.07, rw: 508, rot: -1.48 },
    txt: { left: 67.01, top: 330.78, w: 485.8, h: 88.45 },
    buttons: [{ label: 'Skip intro', to: '/archive', x: 853, w: 116 }, { label: 'Next  →', to: '/welcome/2', x: 981, w: 99, solid: true }],
  },
  {
    line1: 'CHOOSE', strip: 'A TOPIC', desc: 'Open the lesson you’re working on or catching up on.',
    bg: '#EECED8', ink: '#DD0C00',
    box: { left: 54.09, top: 330.4, w: 269.82, h: 96.2, rw: 266, rot: 2.87 },
    txt: { left: 66.43, top: 331, w: 245.5, h: 88.01 },
    buttons: [
      { label: '← Back', to: '/welcome/1', x: 744, w: 97 },
      { label: 'Skip intro', to: '/archive', x: 853, w: 116 },
      { label: 'Next  →', to: '/welcome/3', x: 981, w: 99, solid: true },
    ],
  },
  {
    line1: 'FIND YOUR', strip: 'NEXT STEP', desc: 'Follow a worked example or try the class worksheet.',
    bg: '#D8EDF2', ink: '#0B8246',
    box: { left: 54.73, top: 331.19, w: 356.54, h: 94.62, rw: 354, rot: -1.89 },
    txt: { left: 66.72, top: 331.59, w: 332.32, h: 86.83 },
    buttons: [{ label: '← Back', to: '/welcome/2', x: 788, w: 97 }, { label: 'Browse topics  →', to: '/archive', x: 897, w: 183, solid: true }],
  },
]

/** Scale the 1120px artboard to the width of the "screen" it sits in */
function useFitWidth(ref: React.RefObject<HTMLDivElement | null>, w: number) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / w))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, w])
  return scale
}

export function Welcome() {
  const n = Math.min(3, Math.max(1, Number(useParams().step) || 1))
  const s = STEPS[n - 1]
  const body = useRef<HTMLDivElement>(null)
  const scale = useFitWidth(body, 1120)
  const navigate = useNavigate()
  const { session } = useApp()
  const ink = { color: s.ink }

  // keyboard: → next, ← back, Esc skip
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigate(n < 3 ? `/welcome/${n + 1}` : '/archive')
      if (e.key === 'ArrowLeft' && n > 1) navigate(`/welcome/${n - 1}`)
      if (e.key === 'Escape') navigate('/archive')
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [n, navigate])

  return (
    <div className="wel-page">
      <header className="wel-top">
        <span className="wordmark">{APP_NAME}</span>
        <Link to="/archive" className="linkbtn">Skip intro</Link>
      </header>
      {/* the onboarding page is shown as a big "screen" on the normal page background */}
      <div className="wel-screen">
        <div className="wel-bar">
          <i />
          <i />
          <i />
          {/* progress: one segment per step */}
          <div className="wel-progress" aria-label={`Step ${n} of 3`}>
            {[1, 2, 3].map((k) => (
              <span key={k} className={k <= n ? 'on' : ''} style={k <= n ? { background: s.ink } : undefined} />
            ))}
          </div>
        </div>
        <div className="wel-body" ref={body} style={{ background: s.bg }}>
      {/* key={n} replays the entrance animation on every step */}
      <div key={n} className="wel-stage" style={{ transform: `scale(${scale})` }}>
        <p className="wel-brand" style={ink}>Hi{session?.name && session.name !== 'Student' ? `, ${session.name}` : ''}</p>
        <p className="wel-meta" style={ink}>WELCOME</p>
        <p className="wel-count" style={ink}>{n} of 3</p>
        <p className="wel-line1" style={ink}>{s.line1}</p>
        <div className="wel-rot" style={{ left: s.box.left, top: s.box.top, width: s.box.w, height: s.box.h }}>
          <div style={{ width: s.box.rw, height: 83, background: s.ink, transform: `rotate(${s.box.rot}deg)` }} />
        </div>
        <div className="wel-rot" style={{ left: s.txt.left, top: s.txt.top, width: s.txt.w, height: s.txt.h }}>
          <p className="wel-strip" style={{ transform: `rotate(${s.box.rot}deg)` }}>{s.strip}</p>
        </div>
        <p className="wel-desc" style={ink}>{s.desc}</p>
        {/* Zine margin / coordinate plot (exported from Figma) */}
        <svg className="wel-plot draw" width="200" height="148" viewBox="0 0 200 148" fill="none" stroke={s.ink} strokeWidth="1.6" aria-hidden="true">
          <path d="M5 73H194M97 4V142" />
          <path d="M149 73C149 101.7 125.7 125 97 125C68.3 125 45 101.7 45 73C45 44.3 68.3 21 97 21C125.7 21 149 44.3 149 73Z" />
          <path d="M97 73L98.5 71.5M134 73V70.9M100.8 69.2L103.8 66.2M106.1 63.9L109.1 60.9M111.3 58.7L114.4 55.6M116.6 53.4L119.7 50.3M121.9 48.1L124.9 45.1M127.2 42.8L130.2 39.8M132.5 37.5L134 36V38.1M134 41.3V45.5M134 48.7V52.9M134 56.1V60.3M134 63.5V67.7" />
        </svg>
        {s.buttons.map((b) => (
          <Link
            key={b.label}
            to={b.to}
            className="wel-btn"
            style={{ left: b.x, width: b.w, borderColor: s.ink, background: b.solid ? s.ink : '#fff', color: b.solid ? '#fff' : s.ink }}
          >
            {b.label}
          </Link>
        ))}
      </div>
        </div>
      </div>
    </div>
  )
}
