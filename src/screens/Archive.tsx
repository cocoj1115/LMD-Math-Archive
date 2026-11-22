import { Link, useParams } from 'react-router-dom'
import { Back, Shell, timeAgo } from '../components/ui'
import { useApp } from '../lib/app'
import { Art } from '../components/Art'
import { FOLDERS, TOPICS, folderById, tone, topicById } from '../lib/content'
import type { Note } from '../lib/types'

const isNew = (n: Note) => !n.builtIn && Date.now() - new Date(n.created_at).getTime() < 3 * 86400_000

function useFolderNotes(folderId: string) {
  const { notes } = useApp()
  const f = folderById(folderId)
  return f ? notes.filter((n) => f.topics.includes(n.topic)) : []
}

function FolderCard({ id }: { id: string }) {
  const f = folderById(id)!
  const notes = useFolderNotes(id)
  const fresh = notes.some(isNew)
  const count = id === 'solving-triangles' ? `${f.topics.length} topics${notes.length ? ` · ${notes.length} note${notes.length > 1 ? "s" : ""}` : ''}` : `${notes.length} file${notes.length === 1 ? '' : 's'}`
  return (
    <Link to={`/folder/${id}`} className="folder" style={tone(f.color)}>
      {fresh && <span className="tag solid fnew">New</span>}
      <span className="fname">{f.name}</span>
      <Art kind={f.art} className="fart" />
      <span className="fcount">{count}</span>
    </Link>
  )
}

export function Archive() {
  const { session, loading, error } = useApp()
  return (
    <Shell>
      <h1>Class archive</h1>
      <p className="sub">
        Browse the class folders by topic.
        {session?.role === 'teacher' && ' New board notes you publish appear in their topic folder.'}
      </p>
      {error && <div className="banner warn">Could not load class data: {error}</div>}
      {loading && <span className="spinner" />}
      <div className="grid-folders">
        {FOLDERS.map((f) => (
          <FolderCard key={f.id} id={f.id} />
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
      <span className="swatch" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          {n.title} {bookmarks.includes(n.id) && <span title="Bookmarked">★</span>}
        </div>
        <div className="mono sm" style={{ marginTop: 4 }}>
          {n.kind}
          {!n.builtIn && ` · ${timeAgo(n.created_at)}`}
          {n.student_work.length > 0 && ` · ${n.student_work.length} classmate example${n.student_work.length > 1 ? 's' : ''}`}
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
      <div className="hero" style={tone(f.color)}>
        <div className="mono sm">
          <Link to="/archive">Class archive</Link> &nbsp;/&nbsp; {f.name}
        </div>
        <h1>{f.name}</h1>
        <p className="sub">{triangles ? 'Law of Sines and Law of Cosines — this week’s topics.' : topicById(f.topics[0])?.summary}</p>
        <Art kind={f.art} className="hero-art" />
      </div>
      <div style={{ height: 32 }} />
      {triangles && (
        <>
          <h2>Topics</h2>
          {f.topics.map((tid) => {
            const t = topicById(tid)!
            return (
              <Link key={tid} to={`/topic/${tid}`} className="listcard" style={tone(t.color)}>
                <span className="swatch" />
                <div style={{ flex: 1 }}>
                  <div className="mono sm">{t.lesson}</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{t.name}</div>
                  <div>{t.summary}</div>
                </div>
                <Art kind={t.art} width={150} className="no-print" />
                <span className="pill">Open topic →</span>
              </Link>
            )
          })}
          <h2 style={{ marginTop: 36 }}>Board notes from class</h2>
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
      <Link to={to} className="panel lift" style={{ display: 'block', textDecoration: 'none', minWidth: 220, background: t.color.bg, color: t.color.ink }}>
        <Art kind={t.art} width={150} />
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginTop: 6 }}>{t.name}</div>
        <div className="mono sm" style={{ marginTop: 4 }}>
          {t.lesson ?? 'Review'} {q > 0 && `· ${q} question${q > 1 ? 's' : ''}`}
        </div>
      </Link>
    )
  }
  const arrow = <span style={{ fontSize: 26 }}>→</span>
  return (
    <Shell>
      <h1>Topic map</h1>
      <p className="sub">Choose a topic to see the class materials connected to it.</p>
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
      <Back to="/archive">Class archive</Back>
      <p className="muted" style={{ fontSize: 14 }}>{TOPICS.length} topics</p>
    </Shell>
  )
}
