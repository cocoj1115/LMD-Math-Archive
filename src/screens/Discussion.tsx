import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnchorPreview } from '../components/Annotate'
import { Dictate } from '../components/Dictate'
import { PhotoInput } from '../components/PhotoInput'
import { NoteLines, Shell } from '../components/ui'
import { useApp } from '../lib/app'
import { TOPICS, tone, topicById } from '../lib/content'
import { transcribe } from '../lib/ocr'
import type { Line, Post } from '../lib/types'

export function PostCard({ p, open: openInit = false, teacherTools }: { p: Post; open?: boolean; teacherTools?: React.ReactNode }) {
  const { replies, addReply, session, setShareStatus, noteById } = useApp()
  const [open, setOpen] = useState(openInit)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [bigPhoto, setBigPhoto] = useState(false)
  const [showLines, setShowLines] = useState(false)
  const mine = replies.filter((r) => r.post_id === p.id)
  const t = topicById(p.topic)
  const note = p.note_id ? noteById(p.note_id) : undefined
  const isAuthor = p.author_id === session?.deviceId

  return (
    <article className="post" id={`post-${p.id}`}>
      <div className="mono sm row" style={{ gap: 8 }}>
        <span className="tag tone" style={tone(t?.color)}>{t?.name ?? p.topic}</span>
        {p.role === 'teacher' && 'Teacher'}
        {note && !p.anchor && (
          <>
            {' '}· about <Link to={`/note/${note.id}`}>{note.title}</Link>
          </>
        )}
      </div>
      <h3 style={{ margin: '8px 0 6px' }}>{p.title}</h3>
      <AnchorPreview p={p} />
      {p.body && <p style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>{p.body}</p>}
      {p.photo_url && (
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <button className="linkbtn" onClick={() => setBigPhoto(true)} aria-label="Enlarge photo of work">
            <img className="thumb" src={p.photo_url} alt="Photo of paper attempt" />
          </button>
          {p.photo_lines && p.photo_lines.length > 0 && (
            <button className="pill sm" onClick={() => setShowLines((v) => !v)}>
              {showLines ? 'Hide' : 'Show'} typed version
            </button>
          )}
        </div>
      )}
      {showLines && p.photo_lines && (
        <div className="inset" style={{ marginTop: 10 }}>
          <NoteLines lines={p.photo_lines} />
        </div>
      )}
      <div className="mono sm" style={{ marginTop: 10 }}>
        {p.author_name} · {mine.length} repl{mine.length === 1 ? 'y' : 'ies'}
      </div>

      {isAuthor && p.share_status === 'asked' && (
        <div className="banner">
          <strong>Your teacher would like to add your work to the class notes</strong> so classmates can learn from it. Your name will not be shown.
          <div className="row" style={{ marginTop: 10 }}>
            <button className="pill sm primary" onClick={() => setShareStatus(p.id, 'yes')}>Yes, share it</button>
            <button className="pill sm" onClick={() => setShareStatus(p.id, 'no')}>No thanks</button>
          </div>
        </div>
      )}
      {isAuthor && p.share_status === 'yes' && <div className="mono sm" style={{ marginTop: 8 }}>You agreed to share this work.</div>}

      {teacherTools}

      {open ? (
        <>
          {mine.map((r) => (
            <div key={r.id} className={`reply${r.role === 'teacher' ? ' teacher' : ''}`}>
              <strong>{r.role === 'teacher' ? `${r.author_name} (teacher)` : r.author_name}</strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{r.body}</div>
            </div>
          ))}
          <form
            style={{ marginTop: 14 }}
            onSubmit={async (e) => {
              e.preventDefault()
              if (!text.trim()) return
              setBusy(true)
              try {
                await addReply(p.id, text.trim())
                setText('')
              } finally {
                setBusy(false)
              }
            }}
          >
            <textarea className="text" style={{ minHeight: 70 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply" />
            <div className="row" style={{ marginTop: 8 }}>
              <button className="pill sm primary" disabled={busy || !text.trim()}>Post reply</button>
              <button type="button" className="pill sm" onClick={() => setOpen(false)}>Close</button>
            </div>
          </form>
        </>
      ) : (
        <button className="pill sm" style={{ marginTop: 12 }} onClick={() => setOpen(true)}>
          {mine.length ? `Read replies (${mine.length})` : 'Write a reply'}
        </button>
      )}

      {bigPhoto && p.photo_url && (
        <div className="modal-bg" onClick={() => setBigPhoto(false)}>
          <div className="modal">
            <img src={p.photo_url} alt="Photo of paper attempt" />
          </div>
        </div>
      )}
    </article>
  )
}

export function Discussion() {
  const { posts, session } = useApp()
  const [params, setParams] = useSearchParams()
  const topic = params.get('topic') || ''
  const focus = params.get('post')
  const list = posts.filter((p) => !topic || p.topic === topic)

  useEffect(() => {
    if (focus) document.getElementById(`post-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focus, posts.length])

  return (
    <Shell>
      <div className="spread" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1>Class discussion</h1>
          {topic && <p className="sub" style={{ marginBottom: 0 }}>{topicById(topic)?.name}</p>}
        </div>
        {session?.role === 'student' && (
          <Link className="pill primary" to={`/discussion/new${topic ? `?topic=${topic}` : ''}`}>New post</Link>
        )}
      </div>
      <div className="row" style={{ margin: '22px 0' }}>
        <button className={`pill sm${!topic ? ' primary' : ''}`} onClick={() => setParams({})}>All</button>
        {TOPICS.map((t) => (
          <button key={t.id} className={`pill sm chip${topic === t.id ? ' primary' : ''}`} style={tone(t.color)} onClick={() => setParams({ topic: t.id })}>
            {t.name}
          </button>
        ))}
      </div>
      {list.length === 0 ? <div className="panel">No posts yet.</div> : list.map((p) => <PostCard key={p.id} p={p} open={p.id === focus} />)}
    </Shell>
  )
}

export function NewPost() {
  const { addPost, uploadPhoto, notes } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [topic, setTopic] = useState(params.get('topic') || 'law-of-cosines')
  const [noteId, setNoteId] = useState(params.get('note') || '')
  const anchor = (() => {
    try {
      return params.get('anchor') ? (JSON.parse(params.get('anchor')!) as Post['anchor']) : null
    } catch {
      return null
    }
  })()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [voice, setVoice] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoLines, setPhotoLines] = useState<Line[] | null>(null)
  const [reading, setReading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const topicNotes = notes.filter((n) => n.topic === topic)

  const onPhoto = async (d: string) => {
    setPhoto(d)
    setPhotoLines(null)
    setReading(true)
    try {
      const r = await transcribe(d, 'student')
      setPhotoLines(r.lines)
    } catch {
      setPhotoLines(null) // the photo still posts; typed version is optional
    } finally {
      setReading(false)
    }
  }

  const submit = async () => {
    if (!title.trim()) {
      setErr('Write your question first.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const photo_url = photo ? await uploadPhoto(photo) : null
      const id = await addPost({ topic, note_id: noteId || null, title: title.trim(), body: body.trim(), photo_url, photo_lines: photoLines, voice, anchor })
      navigate(`/discussion?post=${id}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <Shell>
      <h1>New post</h1>
      {anchor && <AnchorPreview p={{ id: 'draft', anchor } as Post} />}
      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'start' }}>
        <div className="card">
          <div className="grid-2" style={{ gap: 16 }}>
            <label className="field">
              <span>1. Math concept</span>
              <select className="text" value={topic} onChange={(e) => { setTopic(e.target.value); setNoteId('') }}>
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Class notes it’s about (optional)</span>
              <select className="text" value={noteId} onChange={(e) => setNoteId(e.target.value)}>
                <option value="">—</option>
                {topicNotes.map((n) => (
                  <option key={n.id} value={n.id}>{n.title}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>2. Your question</span>
            <input className="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Why do I get a negative number for c²?" />
          </label>
          <label className="field">
            <span>What is unclear? Which step?</span>
            <textarea className="text" value={body} onChange={(e) => setBody(e.target.value)} placeholder="I got to step 2 and then…" />
          </label>
          <Dictate
            onText={(t) => setBody((b) => (b ? `${b} ${t}` : t))}
            onUsed={() => setVoice(true)}
          />
        </div>

        <div className="card">
          <h2>3. Photo of your work <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></h2>
          {photo ? (
            <>
              <div className="photo-frame">
                <img src={photo} alt="Your paper attempt" />
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="pill sm" onClick={() => { setPhoto(null); setPhotoLines(null) }}>Remove photo</button>
              </div>
              {reading && (
                <p className="row"><span className="spinner" /> Reading your work…</p>
              )}
              {photoLines && photoLines.length > 0 && (
                <div className="inset" style={{ marginTop: 10 }}>
                  <div className="mono sm" style={{ marginBottom: 8 }}>Typed version</div>
                  <NoteLines lines={photoLines} />
                </div>
              )}
            </>
          ) : (
            <PhotoInput onPhoto={onPhoto} uploadLabel="Upload photo" cameraLabel="Use camera" dropzone hint="Leave your name out." />
          )}
        </div>
      </div>
      {err && <div className="banner warn">{err}</div>}
      <div className="row" style={{ marginTop: 22 }}>
        <button className="pill" onClick={() => navigate(-1)}>Cancel</button>
        <button className="pill primary" onClick={submit} disabled={busy}>
          {busy ? 'Posting…' : 'Post question'}
        </button>
      </div>
    </Shell>
  )
}
