import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Back, NoteLines, Shell, timeAgo } from '../components/ui'
import { useApp } from '../lib/app'
import { APP_NAME, folderById, tone, topicById } from '../lib/content'

export function NotePage() {
  const { id = '' } = useParams()
  const { noteById, session, bookmarks, toggleBookmark, posts } = useApp()
  const [showPhoto, setShowPhoto] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const n = noteById(id)
  if (!n) return <Shell><h1>Loading…</h1><p>If this doesn’t load, the note may be in another class.</p><Back to="/archive">Class archive</Back></Shell>
  const t = topicById(n.topic)
  const f = t && folderById(t.folder)
  const teacher = session?.role === 'teacher'
  const corrected = n.original_lines && JSON.stringify(n.original_lines.map((l) => [l.type, l.value])) !== JSON.stringify(n.lines.map((l) => [l.type, l.value]))
  const related = posts.filter((p) => p.note_id === n.id)
  const marked = bookmarks.includes(n.id)

  return (
    <Shell>
      <div className="spread" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1>{n.title}</h1>
          <p className="sub" style={{ marginBottom: 0 }}>
            <Link to="/archive">Class archive</Link> &nbsp;/&nbsp; {f && <Link to={`/folder/${f.id}`}>{f.name}</Link>} &nbsp;/&nbsp; {t && f && f.topics.length > 1 && (<><Link to={`/topic/${t.id}`}>{t.name}</Link> &nbsp;/&nbsp; </>)}{n.kind}
          </p>
        </div>
        <div className="row no-print">
          {!teacher && (
            <button className="pill" onClick={() => toggleBookmark(n.id)} aria-pressed={marked}>
              {marked ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
          )}
          <Link className="pill" to={`/print/${n.id}`}>Print preview</Link>
        </div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        {t && <span className="tag tone" style={tone(t.color)}>{t.name}</span>}
        {!n.builtIn && <span className="tag">Board photo · {timeAgo(n.created_at)}</span>}
        {!n.builtIn && <span className="tag solid">Checked by teacher</span>}
      </div>

      <div className={n.photo_url && showPhoto ? 'grid-2' : ''} style={{ marginTop: 22 }}>
        {n.photo_url && showPhoto && (
          <div>
            <h2>Original board photo</h2>
            <div className="photo-frame">
              <img src={n.photo_url} alt="Original board photo" />
            </div>
          </div>
        )}
        <div>
          {n.photo_url && showPhoto && <h2>Checked notes</h2>}
          <div className="card">
            {n.figure && <img className="note-figure" src={n.figure} alt={`Diagram for ${n.title}`} />}
            <NoteLines lines={n.lines} />
            {n.diagram && <p className="muted" style={{ fontSize: 15 }}>Diagram on the board: {n.diagram}</p>}
          </div>
        </div>
      </div>

      <div className="row no-print" style={{ marginTop: 16 }}>
        {n.photo_url && (
          <button className="pill sm" onClick={() => setShowPhoto((v) => !v)}>
            {showPhoto ? 'Hide board photo' : 'Show original board photo'}
          </button>
        )}
        {teacher && corrected && (
          <button className="pill sm" onClick={() => setShowOriginal((v) => !v)}>
            {showOriginal ? 'Hide' : 'Show'} AI transcription before your corrections
          </button>
        )}
      </div>
      {showOriginal && n.original_lines && (
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="mono sm" style={{ marginBottom: 10 }}>Version history · before corrections</div>
          <NoteLines lines={n.original_lines} highlightUncertain />
        </div>
      )}

      {n.student_work.length > 0 && (
        <>
          <h2 style={{ marginTop: 36 }}>From classmates</h2>
          <div className="grid-2">
            {n.student_work.map((w) => (
              <div key={w.post_id} className="panel">
                <img src={w.photo_url} alt="Classmate's work" style={{ maxHeight: 260, display: 'block', margin: '0 auto' }} />
                <p style={{ marginBottom: 0 }}>{w.caption}</p>
                <div className="mono sm" style={{ marginTop: 6 }}>Shared with permission · {w.author}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="spread no-print" style={{ marginTop: 36 }}>
        <h2>Questions about these notes</h2>
        {!teacher && (
          <Link className="pill primary" to={`/discussion/new?topic=${n.topic}&note=${n.id}`}>
            Ask the class a question
          </Link>
        )}
      </div>
      {related.length ? (
        related.map((p) => (
          <Link key={p.id} to={`/discussion?post=${p.id}`} className="listcard">
            <span>
              <strong>{p.title}</strong> <span className="muted">· {p.author_name}</span>
            </span>
            <span>→</span>
          </Link>
        ))
      ) : (
        <div className="panel no-print">No questions yet.</div>
      )}
    </Shell>
  )
}

export function PrintPreview() {
  const { id = '' } = useParams()
  const { noteById } = useApp()
  const n = noteById(id)
  if (!n) return <Navigate to="/archive" replace />
  const t = topicById(n.topic)
  const date = new Date(n.builtIn ? n.created_at : n.updated_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  return (
    <Shell nav={false}>
      <div className="spread no-print" style={{ marginTop: 28 }}>
        <Link className="pill" to={`/note/${n.id}`}>← Back to file</Link>
        <button className="pill primary" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>
      <h1 className="no-print">Print preview</h1>
      <div className="print-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <span>{APP_NAME.toUpperCase()}</span>
          <span>{t?.name} · {date}</span>
        </div>
        <h2 style={{ fontSize: 28, marginTop: 24 }}>{n.title}</h2>
        <NoteLines lines={n.lines} />
        {n.student_work.map((w) => (
          <div key={w.post_id} style={{ marginTop: 16 }}>
            <img src={w.photo_url} alt="" style={{ maxHeight: 220 }} />
            <p style={{ margin: '4px 0' }}>Classmate example: {w.caption}</p>
          </div>
        ))}
        <div style={{ marginTop: 28, fontWeight: 700 }}>My notes &amp; questions</div>
        <div className="write-space" />
        <div className="write-space" />
        <div className="write-space" />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 18 }}>
          {APP_NAME} · {n.kind} · version of {date}
        </div>
      </div>
    </Shell>
  )
}
