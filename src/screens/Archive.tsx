import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArtWindow, Asterisk, ConceptBadge, Target } from '../components/Art'
import { Shell } from '../components/ui'
import { useApp } from '../lib/app'
import { TOPICS, WORKSHEETS, folderById, tone, topicById } from '../lib/content'
import type { Note } from '../lib/types'


function useFolderNotes(folderId: string) {
  const { notes } = useApp()
  const f = folderById(folderId)
  return f ? notes.filter((n) => f.topics.includes(n.topic)) : []
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`

/** This week: a wide card whose two illustration windows are the two topics themselves (labelled + clickable). */
function ThisWeek() {
  const f = folderById('solving-triangles')!
  const sines = topicById('law-of-sines')!
  const cosines = topicById('law-of-cosines')!
  return (
    <div className="gcard wide thisweek">
      <div className="tw-text">
        <span className="sticker" aria-label="This week">This<br />week</span>
        <h3>{f.name}</h3>
        <p>Lessons 5.1 and 5.3</p>
        <Link to={`/folder/${f.id}`} className="pill">Open folder →</Link>
      </div>
      <div className="aw-link second">
        <ArtWindow kind="sines" color={sines.color} title={`${sines.name} · 5.1`} />
      </div>
      <div className="aw-link first">
        <ArtWindow kind="cosines" color={cosines.color} title={`${cosines.name} · 5.3`} />
      </div>
    </div>
  )
}

/** Earlier units: a horizontal shelf grouped by month (no exact dates), newest on the left — scroll right to go back in time. */
const PREVIOUS: { month: string; ids: string[] }[] = [
  { month: 'November', ids: ['trig-graphs', 'special-angles'] },
  { month: 'October', ids: ['unit-circle', 'radians-degrees'] },
]

function UnitCard({ id }: { id: string }) {
  const f = folderById(id)!
  const notes = useFolderNotes(id)
  return (
    <Link to={`/folder/${id}`} className="unit-card" style={tone(f.color)}>
      {/* angular folder outline: tab with a slanted edge */}
      <svg className="unit-shape" viewBox="0 0 300 200" aria-hidden="true">
        <path d="M1 199V3.5L3.5 1H118L138 25H296.5L299 27.5V196.5L296.5 199Z" />
      </svg>
      <span className="unit-name">{f.name}</span>
      <span className="unit-foot">
        <span className="tag tone">{plural(notes.length, 'file')}</span>
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  )
}

function PreviousWeeks() {
  const shelf = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })
  const update = () => {
    const el = shelf.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 })
  }
  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const go = (dir: 1 | -1) => shelf.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  return (
    <section>
      <div className="section-head">
        <h2>Previous weeks</h2>
        <div className="row" style={{ gap: 8 }}>
          <button className="round-btn" onClick={() => go(-1)} disabled={edge.start} aria-label="Newer">←</button>
          <button className="round-btn" onClick={() => go(1)} disabled={edge.end} aria-label="Earlier">→</button>
        </div>
      </div>
      <div className="shelf" ref={shelf} onScroll={update}>
        {PREVIOUS.map((g) => (
          <div key={g.month} className="shelf-group">
            <span className="shelf-month">{g.month}</span>
            <div className="shelf-row">
              {g.ids.map((id) => (
                <UnitCard key={id} id={id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Archive() {
  const { error } = useApp()
  return (
    <Shell>
      <div className="zine-head">
        <h1>Class archive</h1>
        {/* zine margin marks: loose doodles, no frame */}
        <span className="zine-marks" aria-hidden="true">
          <Target size={30} />
          <Asterisk size={28} />
        </span>
        {/* hand-drawn arrow with a small loop, like the designer's portfolio */}
        <svg className="zine-arrow" viewBox="0 0 240 150" aria-hidden="true">
          <path d="M232 14 C 190 4, 150 8, 128 26 C 112 40, 118 58, 134 52 C 150 46, 138 26, 118 32 C 80 44, 40 70, 24 132" />
          <path d="M12 118 L24 136 L37 121" className="tip" />
        </svg>
      </div>
      {error && <div className="banner warn">Could not load class data: {error}</div>}
      <ThisWeek />
      <PreviousWeeks />
    </Shell>
  )
}

/** One item in the archive. Every kind of class material (board notes, handouts, slides…) is listed the same way. */
export interface Material {
  id: string
  to: string
  title: string
  kind: string
  topic: string
  date?: string
  starred?: boolean
  extra?: string
  thumb?: string
}

/** All materials for the given topics: teacher notes + the original class handouts, newest first. */
export function useMaterials(topicIds: string[]): Material[] {
  const { notes, bookmarks } = useApp()
  const fromNotes: Material[] = notes
    .filter((n) => topicIds.includes(n.topic))
    .map((n) => ({
      id: n.id,
      to: `/note/${n.id}`,
      title: n.title,
      kind: n.kind,
      topic: n.topic,
      date: n.created_at,
      starred: bookmarks.includes(n.id),
      thumb: n.photo_url ?? n.figure ?? undefined,
      extra: n.student_work.length ? plural(n.student_work.length, 'classmate example') : undefined,
    }))
  const handouts: Material[] = topicIds
    .filter((id) => WORKSHEETS[id])
    .map((id) => ({ id: `ws-${id}`, to: `/worksheet/${id}/1`, title: WORKSHEETS[id].title, kind: 'Handout', topic: id, date: '2026-11-19T15:00:00Z', thumb: WORKSHEETS[id].pages[0] }))
  return [...fromNotes, ...handouts].sort((x, y) => (y.date ?? '').localeCompare(x.date ?? ''))
}

export function MaterialRow({ m, showTopic = false }: { m: Material; showTopic?: boolean }) {
  const t = topicById(m.topic)
  return (
    <Link to={m.to} className="listcard material" style={tone(t?.color)}>
      {m.thumb ? (
        <span className={`thumb-mini kind-${m.kind.toLowerCase().replace(/\s+/g, '-')}`}>
          <img src={m.thumb} alt="" />
        </span>
      ) : (
        <KindGlyph kind={m.kind} />
      )}
      <div style={{ flex: 1 }}>
        <div className="title">
          {m.title} {m.starred && <span title="Bookmarked">★</span>}
        </div>
        <div className="kind">
          {m.kind}
          {m.extra && ` · ${m.extra}`}
        </div>
      </div>
      <div className="row">
        {showTopic && t && <span className="tag tone">{t.name}</span>}
        <span aria-hidden="true">→</span>
      </div>
    </Link>
  )
}

/** Thin line drawing for materials without a picture (zine style: no tile, no shadow). */
function KindGlyph({ kind }: { kind: string }) {
  const slides = /slide/i.test(kind)
  return (
    <span className="thumb-mini glyph" aria-hidden="true">
      <svg viewBox="0 0 72 56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {slides ? (
          <>
            <rect x="12" y="10" width="48" height="30" rx="2" />
            <path d="M36 40v7M27 47h18" />
            <path d="M20 32l9-9 7 6 9-11 7 8" strokeDasharray="3 3" />
          </>
        ) : (
          <>
            <path d="M22 6h22l8 8v36H22z" />
            <path d="M44 6v8h8" />
            <path d="M28 22h18M28 29h18M28 36h12" />
          </>
        )}
      </svg>
    </span>
  )
}

/** Kept for search / other lists: a note shown as a material row. */
export function NoteRow({ n }: { n: Note }) {
  const { bookmarks } = useApp()
  return (
    <MaterialRow
      showTopic
      m={{ id: n.id, to: `/note/${n.id}`, title: n.title, kind: n.kind, topic: n.topic, starred: bookmarks.includes(n.id) }}
    />
  )
}

export function Folder() {
  const { id = '' } = useParams()
  const f = folderById(id)
  const materials = useMaterials(f?.topics ?? [])
  const [only, setOnly] = useState<string | null>(null) // topic filter for "All materials"
  if (!f) return <Shell><h1>Folder not found</h1></Shell>
  const multi = f.topics.length > 1
  const shown = only ? materials.filter((m) => m.topic === only) : materials
  return (
    <Shell>
      <div className="crumb">
        <Link to="/archive">Class archive</Link> &nbsp;/&nbsp; {f.name}
      </div>
      <h1>{f.name}</h1>
      {multi && (
        <div className="section-first topic-cards">
          {f.topics.map((tid) => {
            const t = topicById(tid)!
            return (
              <Link key={tid} to={`/topic/${tid}`} className="topic-card2">
                <div>
                  <div className="lesson">{t.lesson?.replace('LESSON', 'Lesson')}</div>
                  <h3>{t.name}</h3>
                </div>
                <ArtWindow kind={t.art} color={t.color} />
                <p>{t.summary}</p>
              </Link>
            )
          })}
        </div>
      )}
      <section className={multi ? 'section' : 'section-first'}>
        {multi && (
          <div className="materials-head">
            <h2>All materials</h2>
            <div className="filter-row" role="group" aria-label="Filter by topic">
              <button type="button" className={`pill sm${only === null ? ' primary' : ''}`} aria-pressed={only === null} onClick={() => setOnly(null)}>
                All
              </button>
              {f.topics.map((tid) => {
                const t = topicById(tid)!
                return (
                  <button key={tid} type="button" className={`pill sm chip${only === tid ? ' primary' : ''}`} style={tone(t.color)} aria-pressed={only === tid} onClick={() => setOnly(tid)}>
                    {t.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {shown.length === 0 ? (
          <div className="empty">Nothing here yet.</div>
        ) : (
          shown.map((m) => <MaterialRow key={m.id} m={m} showTopic={multi && !only} />)
        )}
      </section>
    </Shell>
  )
}

export function TopicMap() {
  const { posts } = useApp()
  const node = (id: string) => {
    const t = topicById(id)!
    const q = posts.filter((p) => p.topic === id).length
    const to = t.folder === 'solving-triangles' ? `/topic/${id}` : `/folder/${t.folder}`
    return (
      <Link to={to} className="panel lift row" style={{ textDecoration: 'none', minWidth: 250, flexWrap: 'nowrap', ...tone(t.color) }}>
        <ConceptBadge kind={t.art} size={60} />
        <div>
          <div style={{ fontSize: 22, letterSpacing: '-0.02em' }}>{t.name}</div>
          <div className="mono sm" style={{ marginTop: 4, color: 'var(--muted)' }}>
            {t.lesson} {q > 0 && `${t.lesson ? '· ' : ''}${plural(q, 'question')}`}
          </div>
        </div>
      </Link>
    )
  }
  const arrow = <span style={{ fontSize: 26 }}>→</span>
  return (
    <Shell>
      <h1>Topic map</h1>
      <div className="card stack">
        <div className="mono sm">Earlier in the unit</div>
        <div className="row">
          {node('radians-degrees')}
          {arrow}
          {node('unit-circle')}
          {arrow}
          <div className="stack">
            {node('special-angles')}
            {node('trig-graphs')}
          </div>
        </div>
        <div className="mono sm" style={{ marginTop: 28 }}>This week · Solving triangles</div>
        <div className="row">
          {node('law-of-sines')}
          {arrow}
          {node('law-of-cosines')}
        </div>
      </div>
    </Shell>
  )
}

/** Search across class notes, concepts and discussion posts */
export function Search() {
  const { notes, posts } = useApp()
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()
  const hit = (...xs: (string | null | undefined)[]) => !!q && xs.some((x) => x?.toLowerCase().includes(q))
  const topics = TOPICS.filter((t) => hit(t.name, t.summary))
  const ns = notes.filter((n) => hit(n.title, n.kind, ...n.lines.map((l) => l.value), topicById(n.topic)?.name))
  const ps = posts.filter((p) => hit(p.title, p.body, topicById(p.topic)?.name))
  return (
    <Shell>
      <h1>Search</h1>
      <p className="sub">{q ? `Results for “${params.get('q')}”` : 'Type a concept, a formula word, or a question.'}</p>
      {q && topics.length + ns.length + ps.length === 0 && <div className="panel">Nothing found. Try “cosine”, “radians”, or “triangle”.</div>}
      {topics.length > 0 && (
        <>
          <h2>Concepts</h2>
          {topics.map((t) => (
            <Link key={t.id} to={t.folder === 'solving-triangles' ? `/topic/${t.id}` : `/folder/${t.folder}`} className="listcard" style={tone(t.color)}>
              <ConceptBadge kind={t.art} size={52} />
              <div style={{ flex: 1 }}>
                <div className="title">{t.name}</div>
                <div className="muted">{t.summary}</div>
              </div>
              <span>→</span>
            </Link>
          ))}
        </>
      )}
      {ns.length > 0 && (
        <>
          <h2 style={{ marginTop: 32 }}>Materials</h2>
          {ns.map((n) => (
            <NoteRow key={n.id} n={n} />
          ))}
        </>
      )}
      {ps.length > 0 && (
        <>
          <h2 style={{ marginTop: 32 }}>Discussion</h2>
          {ps.map((p) => (
            <Link key={p.id} to={`/discussion?post=${p.id}`} className="listcard" style={tone(topicById(p.topic)?.color)}>
              {topicById(p.topic) && <ConceptBadge kind={topicById(p.topic)!.art} size={52} />}
              <div style={{ flex: 1 }}>
                <div className="title">{p.title}</div>
                <div className="muted">{p.author_name}</div>
              </div>
              <span>→</span>
            </Link>
          ))}
        </>
      )}
    </Shell>
  )
}

