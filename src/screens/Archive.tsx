import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArtWindow, ConceptBadge } from '../components/Art'
import { Shell, timeAgo } from '../components/ui'
import { useApp } from '../lib/app'
import { TOPICS, folderById, tone, topicById } from '../lib/content'
import type { Note } from '../lib/types'

const isNew = (n: Note) => !n.builtIn && Date.now() - new Date(n.created_at).getTime() < 3 * 86400_000

function useFolderNotes(folderId: string) {
  const { notes } = useApp()
  const f = folderById(folderId)
  return f ? notes.filter((n) => f.topics.includes(n.topic)) : []
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`

/** Gumroad-style card: title top-left, text bottom-left, illustration window on the right */
function ConceptCard({ id }: { id: string }) {
  const f = folderById(id)!
  const notes = useFolderNotes(id)
  const fresh = notes.some(isNew)
  const triangles = id === 'solving-triangles'
  return (
    <Link to={`/folder/${id}`} className={`gcard${triangles ? ' wide' : ''}`}>
      <div>
        {triangles && <span className="tag solid" style={{ marginBottom: 14, display: 'inline-flex' }}>This week</span>}
        <h3>{f.name}</h3>
      </div>
      {triangles ? (
        <>
          <ArtWindow kind="sines" color={topicById('law-of-sines')!.color} />
          <ArtWindow kind="cosines" color={topicById('law-of-cosines')!.color} className="second" />
        </>
      ) : (
        <ArtWindow kind={f.art} color={f.color} />
      )}
      <div className="gfoot">
        {triangles ? 'Law of Sines and Law of Cosines: worked examples, class worksheets, and board notes.' : topicById(f.topics[0])?.summary}
        <span className="mono">
          {triangles ? `2 topics · ${plural(notes.length, 'note')}` : plural(notes.length, 'file')}
          {fresh && ' · new board notes'}
        </span>
      </div>
    </Link>
  )
}

export function Archive() {
  const { session, error } = useApp()
  const order = ['solving-triangles', 'radians-degrees', 'unit-circle', 'trig-graphs', 'special-angles']
  return (
    <Shell>
      <h1>Class archive</h1>
      <p className="sub">
        Everything from class, by topic.
        {session?.role === 'teacher' && ' Board notes you publish appear in their topic.'}
      </p>
      {error && <div className="banner warn">Could not load class data: {error}</div>}
      <div className="bento">
        {order.map((id) => (
          <ConceptCard key={id} id={id} />
        ))}
      </div>
    </Shell>
  )
}

export function NoteRow({ n }: { n: Note }) {
  const { bookmarks } = useApp()
  const t = topicById(n.topic)
  return (
    <Link to={`/note/${n.id}`} className="listcard" style={tone(t?.color)}>
      {t && <ConceptBadge kind={t.art} size={52} />}
      <div style={{ flex: 1 }}>
        <div className="title">
          {n.title} {bookmarks.includes(n.id) && <span title="Bookmarked">★</span>}
        </div>
        <div className="mono sm" style={{ marginTop: 4, color: 'var(--muted)' }}>
          {n.kind}
          {!n.builtIn && ` · ${timeAgo(n.created_at)}`}
          {n.student_work.length > 0 && ` · ${plural(n.student_work.length, 'classmate example')}`}
        </div>
      </div>
      <div className="row">
        {t && <span className="tag tone">{t.name}</span>}
        {isNew(n) && <span className="tag solid">New</span>}
        <span>→</span>
      </div>
    </Link>
  )
}

export function Folder() {
  const { id = '' } = useParams()
  const f = folderById(id)
  const notes = useFolderNotes(id)
  if (!f) return <Shell><h1>Folder not found</h1></Shell>
  const triangles = id === 'solving-triangles'
  return (
    <Shell>
      <div className="hero">
        <div className="mono sm">
          <Link to="/archive">Class archive</Link> &nbsp;/&nbsp; {f.name}
        </div>
        <h1>{f.name}</h1>
        <p className="sub">{triangles ? 'Law of Sines and Law of Cosines — this week’s topics.' : topicById(f.topics[0])?.summary}</p>
        <ArtWindow kind={f.art} color={f.color} className="hero-art" />
      </div>
      <div style={{ height: 40 }} />
      {triangles && (
        <>
          <h2>Topics</h2>
          {f.topics.map((tid) => {
            const t = topicById(tid)!
            return (
              <Link key={tid} to={`/topic/${tid}`} className="listcard" style={tone(t.color)}>
                <ConceptBadge kind={t.art} size={64} />
                <div style={{ flex: 1 }}>
                  <div className="mono sm" style={{ color: 'var(--muted)' }}>{t.lesson}</div>
                  <div className="title" style={{ fontSize: 26 }}>{t.name}</div>
                  <div className="muted">{t.summary}</div>
                </div>
                <span className="pill">Open topic →</span>
              </Link>
            )
          })}
          <h2 style={{ marginTop: 40 }}>Board notes from class</h2>
        </>
      )}
      {notes.length === 0 ? (
        <div className="panel">No board notes yet. They appear here after the teacher publishes them.</div>
      ) : (
        notes.map((n) => <NoteRow key={n.id} n={n} />)
      )}
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
            {t.lesson ?? 'Review'} {q > 0 && `· ${q} question${q > 1 ? 's' : ''}`}
          </div>
        </div>
      </Link>
    )
  }
  const arrow = <span style={{ fontSize: 26 }}>→</span>
  return (
    <Shell>
      <h1>Topic map</h1>
      <p className="sub">How this unit’s topics connect. Choose one to see its class materials.</p>
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
          <h2 style={{ marginTop: 32 }}>Class notes</h2>
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

