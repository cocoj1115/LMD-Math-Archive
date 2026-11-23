import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MathField } from '../components/MathField'
import { PhotoInput } from '../components/PhotoInput'
import { NoteLines, Shell, TeX } from '../components/ui'
import { useApp } from '../lib/app'
import { TOPICS, folderById, tone, topicById } from '../lib/content'
import { rotateDataUrl } from '../lib/image'
import { transcribe } from '../lib/ocr'
import type { Line } from '../lib/types'
import { NoteRow } from './Archive'

type Stage = 'empty' | 'preview' | 'reading' | 'review' | 'error'

export function Capture() {
  const { publishNote, uploadPhoto, notes } = useApp()
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('empty')
  const [photo, setPhoto] = useState<string | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [original, setOriginal] = useState<Line[]>([])
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('law-of-cosines')
  const [lesson, setLesson] = useState('')
  const [description, setDescription] = useState('')
  const [diagram, setDiagram] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const selectPhoto = (img: string) => {
    setPhoto(img)
    setLines([])
    setOriginal([])
    setTitle('')
    setDescription('')
    setDiagram('')
    setPreview(false)
    setErr(null)
    setStage('preview')
  }

  const read = async () => {
    if (!photo) return
    setStage('reading')
    setErr(null)
    try {
      const r = await transcribe(photo, 'board')
      setLines(r.lines)
      setOriginal(r.lines)
      setTitle(r.title)
      setTopic(r.concept)
      setLesson(topicById(r.concept)?.lesson ?? '')
      setDiagram(r.diagram ?? '')
      setStage('review')
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setStage('error')
    }
  }

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch, uncertain: patch.value !== undefined ? false : l.uncertain } : l)))
  const move = (i: number, d: -1 | 1) =>
    setLines((ls) => {
      const j = i + d
      if (j < 0 || j >= ls.length) return ls
      const c = [...ls]
      ;[c[i], c[j]] = [c[j], c[i]]
      return c
    })

  const toCheck = lines.filter((l) => l.uncertain).length

  const publish = async () => {
    if (!photo) return
    setPublishing(true)
    setErr(null)
    try {
      const photo_url = await uploadPhoto(photo)
      const id = await publishNote({
        topic,
        title: title.trim() || 'Classroom material',
        kind: 'Board notes',
        lesson,
        description: description.trim(),
        lines: lines.filter((l) => l.value.trim()),
        original_lines: original,
        diagram,
        photo_url,
      })
      navigate(`/t/published/${id}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setPublishing(false)
    }
  }

  const reset = () => {
    setStage('empty')
    setPhoto(null)
    setLines([])
    setOriginal([])
    setTitle('')
    setDescription('')
    setDiagram('')
    setErr(null)
  }

  const continueWithoutOcr = () => {
    setLines([])
    setOriginal([])
    setStage('review')
    setErr(null)
  }

  const mine = notes.filter((n) => !n.builtIn)

  return (
    <Shell>
      <div className="spread" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1>Add class material</h1>
          <p className="sub" style={{ marginBottom: 0 }}>
            Class archive{stage === 'review' ? ` / ${topicById(topic)?.name ?? ''}` : ''}
          </p>
        </div>
        {stage !== 'empty' && <PhotoInput onPhoto={selectPhoto} uploadLabel="Choose another image" cameraLabel="Retake photo" />}
      </div>

      {stage === 'empty' && (
        <div style={{ marginTop: 30 }}>
          <PhotoInput onPhoto={selectPhoto} dropzone primary="upload" hint="Upload a classroom image or use your camera. You can save the image as-is or transcribe it with OCR." />
          <h2 style={{ marginTop: 40 }}>Published class materials</h2>
          {mine.length ? mine.map((n) => <NoteRow key={n.id} n={n} />) : <div className="panel">Nothing published yet.</div>}
        </div>
      )}

      {stage !== 'empty' && (
        <div className="teacher-review-grid" style={{ marginTop: 30 }}>
          <div>
            <h2>Preview material</h2>
            <div className={`photo-frame${stage === 'review' ? ' sticky-ref' : ''}`}>{photo && <img src={photo} alt="Uploaded classroom material" />}</div>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="pill sm" disabled={stage === 'reading'} onClick={async () => photo && selectPhoto(await rotateDataUrl(photo))}>
                ↻ Rotate image
              </button>
              <button className="pill sm" onClick={reset}>Start over</button>
            </div>
            {diagram && stage === 'review' && lines.length > 0 && (
              <div className="panel" style={{ marginTop: 14 }}>
                <div className="mono sm">Diagram (kept as the photo)</div>
                <input className="text" style={{ marginTop: 8 }} value={diagram} onChange={(e) => setDiagram(e.target.value)} />
              </div>
            )}
          </div>

          <div>
            <div className="spread" style={{ alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{stage === 'review' ? 'Organize material' : 'Next step'}</h2>
              {stage === 'review' && (
                <button className="pill sm" onClick={() => setPreview((v) => !v)}>
                  {preview ? 'Edit transcription' : 'Preview as students see it'}
                </button>
              )}
            </div>
            <div className="panel" style={{ marginTop: 14, minHeight: 193 }}>
              {stage === 'preview' && (
                <>
                  <p style={{ marginTop: 0 }}>Your image is ready. Choose whether to transcribe it or save it as-is.</p>
                  <div className="row">
                    <button className="pill primary" onClick={read}>Transcribe with OCR</button>
                    <button className="pill" onClick={continueWithoutOcr}>Continue with image only</button>
                  </div>
                </>
              )}
              {stage === 'reading' && (
                <p className="row" role="status"><span className="spinner" /> Reading the image — text, formulas, and diagrams…</p>
              )}
              {stage === 'error' && (
                <>
                  <div className="banner warn" style={{ marginTop: 0 }}>{err}</div>
                  <div className="row" style={{ marginTop: 12 }}>
                    <button className="pill sm primary" onClick={read}>Try OCR again</button>
                    <button className="pill sm" onClick={continueWithoutOcr}>Continue with image only</button>
                  </div>
                </>
              )}
              {stage === 'review' && (
                <>
                  <label className="field">
                    <span>Title</span>
                    <input className="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Solving triangles practice" />
                  </label>
                  <div className="grid-2 teacher-fields">
                    <label className="field">
                      <span>Topic</span>
                      <select className="text" value={topic} onChange={(e) => {
                        setTopic(e.target.value)
                        setLesson(topicById(e.target.value)?.lesson ?? '')
                      }}>
                        {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </label>
                    <label className="field">
                      <span>Lesson (optional)</span>
                      <input className="text" value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="e.g. LESSON 5.3" />
                    </label>
                  </div>
                  <label className="field">
                    <span>Description (optional)</span>
                    <textarea className="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add context for students" rows={3} />
                  </label>
                  {lines.length > 0 ? preview ? (
                    <>
                      <h3>{title || 'Untitled board notes'}</h3>
                      <NoteLines lines={lines} />
                    </>
                  ) : (
                    <>
                      {toCheck > 0 ? (
                        <div className="banner warn" style={{ marginTop: 0, marginBottom: 12 }}>
                          {toCheck} line{toCheck > 1 ? 's were' : ' was'} hard to read. Check the highlighted line{toCheck > 1 ? 's' : ''} against the photo.
                        </div>
                      ) : (
                        <p className="muted" style={{ marginTop: 0, fontSize: 15 }}>Compare each line with the photo and fix anything that’s off.</p>
                      )}
                      {lines.map((l, i) => (
                        <div key={i} className={`editline${l.uncertain ? ' uncertain' : ''}`}>
                          <select value={l.type} onChange={(e) => setLine(i, { type: e.target.value as Line['type'] })} aria-label="Line type">
                            <option value="text">Text</option>
                            <option value="math">Formula</option>
                          </select>
                          {l.type === 'math' ? (
                            <MathField value={l.value} onChange={(v) => setLine(i, { value: v })} ariaLabel={`Formula line ${i + 1}`} />
                          ) : (
                            <input value={l.value} onChange={(e) => setLine(i, { value: e.target.value })} aria-label={`Text line ${i + 1}`} />
                          )}
                          <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}>
                            <button className="iconbtn" title="Move up" onClick={() => move(i, -1)}>↑</button>
                            <button className="iconbtn" title="Move down" onClick={() => move(i, 1)}>↓</button>
                            <button className="iconbtn" title="Delete line" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>×</button>
                          </div>
                        </div>
                      ))}
                      <div className="row" style={{ marginTop: 12 }}>
                        <button className="pill sm" onClick={() => setLines((ls) => [...ls, { type: 'text', value: '' }])}>+ Text line</button>
                        <button className="pill sm" onClick={() => setLines((ls) => [...ls, { type: 'math', value: '' }])}>+ Formula</button>
                      </div>
                      <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>
                        Formulas: type directly (e.g. <code>c^2=a^2+b^2-2ab\cos C</code>) — it turns into <TeX tex="c^2=a^2+b^2-2ab\cos C" />.
                      </p>
                    </>
                  ) : (
                    <p className="muted" style={{ marginBottom: 0 }}>Image-only material will be saved with the original image for students to view.</p>
                  )}
                </>
              )}
            </div>
            {stage === 'review' && (
              <>
                <div className="mono sm row" style={{ marginTop: 14, gap: 8 }}>
                  Goes to: {folderById(topicById(topic)?.folder ?? '')?.name} / <span className="tag tone" style={tone(topicById(topic)?.color)}>{topicById(topic)?.name}</span>
                </div>
                {err && <div className="banner warn">{err}</div>}
                <div className="row teacher-actions" style={{ marginTop: 12 }}>
                  <button className="pill primary" onClick={publish} disabled={publishing || !photo}>
                    {publishing ? 'Saving…' : 'Save to archive'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </Shell>
  )
}

export function Published() {
  const { id = '' } = useParams()
  const { noteById } = useApp()
  const n = noteById(id)
  const t = n && topicById(n.topic)
  const f = t && folderById(t.folder)
  return (
    <Shell>
      <h1 style={{ marginTop: 90 }}>Material saved</h1>
      <p className="sub">{n ? `“${n.title}” is available in the ${f?.name ?? 'class archive'} folder${t && f?.name !== t.name ? ` under ${t.name}` : ''}.` : 'Saving…'}</p>
      <div className="row">
        <Link className="pill primary" to={`/note/${id}`}>Open material</Link>
        <Link className="pill" to="/t/capture">Capture another</Link>
        <Link className="pill" to="/t/questions">Go to questions</Link>
      </div>
    </Shell>
  )
}
