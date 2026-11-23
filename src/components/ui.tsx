import katex from 'katex'
import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { APP_NAME } from '../lib/content'
import { useApp } from '../lib/app'
import type { Line } from '../lib/types'

/* ---------- Math rendering ---------- */
export function TeX({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore' }),
    [tex, display],
  )
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

/** Text with inline $LaTeX$ segments */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('$') && p.endsWith('$') ? <TeX key={i} tex={p.slice(1, -1)} /> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  )
}

export function NoteLines({ lines, highlightUncertain = false }: { lines: Line[]; highlightUncertain?: boolean }) {
  return (
    <div>
      {lines.map((l, i) => (
        <div key={i} className={`note-line ${l.type}${highlightUncertain && l.uncertain ? ' uncertain' : ''}`}>
          {l.type === 'math' ? <TeX tex={l.value} display /> : l.value}
        </div>
      ))}
    </div>
  )
}

/* ---------- Shell: Gumroad-style two-row navigation ---------- */
export function Shell({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  const { session, signOut, posts, replies } = useApp()
  const navigate = useNavigate()
  const loc = useLocation()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const teacher = session?.role === 'teacher'
  const unanswered = posts.filter((p) => p.role === 'student' && !replies.some((r) => r.post_id === p.id && r.role === 'teacher')).length
  const tab = ({ isActive }: { isActive: boolean }) => `tab${isActive ? ' active' : ''}`
  // "Class archive" stays active anywhere inside the archive (folders, topics, notes, search)
  const path = loc.pathname
  const inArchive = ['/archive', '/folder/', '/topic/', '/note/', '/search'].some((p) => path === p || path.startsWith(p))

  return (
    <>
      <header className="topbar no-print">
        <Link to={session ? '/archive' : '/'} className="wordmark">
          {APP_NAME}
        </Link>
        {session && nav && (
          <form
            className="searchbar"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/search?q=${encodeURIComponent(q.trim())}`)
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" strokeLinecap="round" />
            </svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes, concepts, questions" aria-label="Search" />
          </form>
        )}
        {!(session && nav) && <span style={{ marginLeft: 'auto' }} />}
        {session && nav && (
          <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
            <button
              className="btn-outline"
              title={`${teacher ? 'Teacher' : 'Student'} · ${session.name} · ${session.classCode}`}
              onClick={() => {
                signOut()
                navigate('/')
              }}
            >
              {session.name} · Switch
            </button>
            {teacher ? (
              <Link className="btn-solid" to="/t/capture">Capture board</Link>
            ) : (
              <Link className="btn-solid" to="/discussion/new">Ask a question</Link>
            )}
          </div>
        )}
      </header>
      <div className="header-rule" />
      {session && nav && (
        <nav className="tabsrow no-print" aria-label="Sections">
          {teacher ? (
            <>
              <NavLink className={() => `tab${inArchive ? ' active' : ''}`} to="/archive">Class archive</NavLink>
              <NavLink className={tab} to="/t/capture">Board notes</NavLink>
              <NavLink className={tab} to="/t/questions">
                Questions {unanswered > 0 && <span className="count">{unanswered}</span>}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink className={tab} to="/map">Topic map</NavLink>
              <NavLink className={() => `tab${inArchive ? ' active' : ''}`} to="/archive">Class archive</NavLink>
              <NavLink className={tab} to="/discussion">Discussion</NavLink>
            </>
          )}
        </nav>
      )}
      <main className="page">{children}</main>
    </>
  )
}

export function Back({ to, children }: { to: string; children: ReactNode }) {
  return (
    <div className="no-print" style={{ marginTop: 28 }}>
      <Link className="pill" to={to}>
        ← {children}
      </Link>
    </div>
  )
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/* ---------- Worked-example triangle ---------- */
export function Triangle({ t }: { t: { A: string; B: string; C: string; a: string; b: string; c: string; angleA?: string; angleB?: string; angleC?: string } }) {
  // A bottom-left, B bottom-right, C top
  const A = [30, 190], B = [300, 190], C = [210, 30]
  return (
    <svg viewBox="0 0 330 230" width="100%" style={{ maxWidth: 330 }} aria-label="Labeled triangle, not to scale">
      <polygon points={`${A} ${B} ${C}`} fill="none" stroke="var(--blue)" strokeWidth="2" />
      <g fontFamily="DM Mono, monospace" fontSize="15" fill="var(--blue)">
        <text x={A[0] - 20} y={A[1] + 8}>{t.A}</text>
        <text x={B[0] + 8} y={B[1] + 8}>{t.B}</text>
        <text x={C[0] - 4} y={C[1] - 10}>{t.C}</text>
        {/* side a is opposite A (B–C), b opposite B (A–C), c opposite C (A–B) */}
        <text x={262} y={105}>{t.a}</text>
        <text x={70} y={100}>{t.b}</text>
        {t.c && <text x={140} y={215}>{t.c}</text>}
        {t.angleA && <text x={A[0] + 30} y={A[1] - 8}>{t.angleA}</text>}
        {t.angleB && <text x={B[0] - 62} y={B[1] - 8}>{t.angleB}</text>}
        {t.angleC && <text x={C[0] - 18} y={C[1] + 32}>{t.angleC}</text>}
      </g>
    </svg>
  )
}
