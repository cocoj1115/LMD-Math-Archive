import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/ui'
import { useApp } from '../lib/app'
import { TOPICS } from '../lib/content'
import type { Post } from '../lib/types'
import { PostCard } from './Discussion'

function ShareTools({ p }: { p: Post }) {
  const { setShareStatus, notes, addStudentWork } = useApp()
  const targets = notes.filter((n) => !n.builtIn && n.topic === p.topic)
  const [noteId, setNoteId] = useState(p.note_id && targets.some((n) => n.id === p.note_id) ? p.note_id : targets[0]?.id ?? '')
  const [caption, setCaption] = useState(p.title)
  const added = notes.some((n) => n.student_work.some((w) => w.post_id === p.id))
  if (!p.photo_url || p.role !== 'student') return null

  return (
    <div className="inset" style={{ marginTop: 12 }}>
      <div className="mono sm" style={{ marginBottom: 8 }}>Add this work to the class notes</div>
      {added ? (
        <span>✓ Added to the class notes (name hidden).</span>
      ) : !p.share_status ? (
        <button className="pill sm" onClick={() => setShareStatus(p.id, 'asked')}>
          Ask {p.author_name} before sharing
        </button>
      ) : p.share_status === 'asked' ? (
        <span>Waiting for {p.author_name} to say yes or no…</span>
      ) : p.share_status === 'no' ? (
        <span>{p.author_name} chose not to share this work.</span>
      ) : targets.length === 0 ? (
        <span>
          {p.author_name} said yes. Publish board notes for this topic first, then add the work to them.{' '}
          <Link to="/t/capture">Capture board notes</Link>
        </span>
      ) : (
        <div className="row">
          <select className="text" style={{ width: 'auto' }} value={noteId} onChange={(e) => setNoteId(e.target.value)}>
            {targets.map((n) => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>
          <input className="text" style={{ width: 280 }} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption for classmates" />
          <button className="pill sm primary" disabled={!noteId} onClick={() => addStudentWork(noteId, p, caption)}>
            Add to notes
          </button>
        </div>
      )}
    </div>
  )
}

export function Questions() {
  const { posts, replies } = useApp()
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const student = posts.filter((p) => p.role === 'student')
  const answered = (p: Post) => replies.some((r) => r.post_id === p.id && r.role === 'teacher')
  const shown = student.filter((p) => filter === 'all' || !answered(p))

  return (
    <Shell>
      <h1>Student questions</h1>
      <p className="sub">Grouped by math concept. Topics with several questions may be worth revisiting in a later lesson.</p>
      <div className="row" style={{ marginBottom: 20 }}>
        <button className={`pill sm${filter === 'open' ? ' primary' : ''}`} onClick={() => setFilter('open')}>
          Needs a reply ({student.filter((p) => !answered(p)).length})
        </button>
        <button className={`pill sm${filter === 'all' ? ' primary' : ''}`} onClick={() => setFilter('all')}>
          All ({student.length})
        </button>
      </div>
      {shown.length === 0 && <div className="panel">No questions {filter === 'open' ? 'waiting for a reply' : 'yet'}.</div>}
      {TOPICS.map((t) => {
        const qs = shown.filter((p) => p.topic === t.id)
        if (!qs.length) return null
        const total = student.filter((p) => p.topic === t.id).length
        return (
          <section key={t.id} style={{ marginBottom: 34 }}>
            <div className="spread" style={{ alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>
                {t.name} <span className="muted" style={{ fontWeight: 400 }}>· {total} question{total > 1 ? 's' : ''}</span>
              </h2>
              {total >= 2 && <span className="tag warn">Common question — consider explaining in class</span>}
            </div>
            {qs.map((p) => (
              <PostCard key={p.id} p={p} teacherTools={<ShareTools p={p} />} />
            ))}
          </section>
        )
      })}
    </Shell>
  )
}
