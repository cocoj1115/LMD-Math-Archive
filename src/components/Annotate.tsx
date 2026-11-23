import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../lib/app'
import { WORKSHEETS } from '../lib/content'
import type { Anchor, Line, Post } from '../lib/types'
import { TeX } from './ui'

/**
 * Student annotations: ask about one line of a note, or pin a question to a spot on an image
 * (a worksheet page, the original board photo, a worked-example diagram).
 * Questions are ordinary posts with an `anchor`, so they also show up in Class discussion.
 */

const sameSpot = (a: Anchor | null | undefined, material: string, image?: string) =>
  !!a && a.material === material && (a.kind === 'line' ? image === undefined : a.image === image)

/** Small inline composer. Posts straight away; "Add a photo or voice" opens the full form with the anchor kept. */
function QuickAsk({ anchor, topic, noteId, onDone, onCancel }: { anchor: Anchor; topic: string; noteId?: string | null; onDone: (id: string) => void; onCancel: () => void }) {
  const { addPost } = useApp()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => ref.current?.focus(), [])
  const full = `/discussion/new?topic=${topic}${noteId ? `&note=${noteId}` : ''}&anchor=${encodeURIComponent(JSON.stringify(anchor))}`
  const post = async () => {
    if (!text.trim()) return
    setBusy(true)
    const id = await addPost({ topic, note_id: noteId ?? null, title: text.trim(), body: '', photo_url: null, photo_lines: null, voice: false, anchor })
    onDone(id)
  }
  return (
    <div className="quick-ask" onClick={(e) => e.stopPropagation()}>
      <textarea
        ref={ref}
        className="text"
        rows={3}
        placeholder="What’s unclear here?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) post()
          if (e.key === 'Escape') onCancel()
        }}
      />
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <Link className="linkbtn sm" to={full}>Add a photo or voice</Link>
        <div className="row" style={{ gap: 8 }}>
          <button className="pill sm" onClick={onCancel}>Cancel</button>
          <button className="pill sm primary" disabled={busy || !text.trim()} onClick={post}>Post</button>
        </div>
      </div>
    </div>
  )
}

/** The questions already asked at one spot. */
function SpotThread({ posts }: { posts: Post[] }) {
  const { replies } = useApp()
  return (
    <div className="spot-thread" onClick={(e) => e.stopPropagation()}>
      {posts.map((p) => {
        const n = replies.filter((r) => r.post_id === p.id).length
        return (
          <Link key={p.id} to={`/discussion?post=${p.id}`} className={`spot-q${n ? '' : ' open-q'}`}>
            <span>{p.title}</span>
            <span className="mono sm">{p.author_name} · {n} repl{n === 1 ? 'y' : 'ies'} →</span>
          </Link>
        )
      })}
    </div>
  )
}

/** Note text where every line can be asked about. */
export function AnnotatableLines({ lines, material, topic, noteId }: { lines: Line[]; material: string; topic: string; noteId?: string | null }) {
  const { posts, session, replies } = useApp()
  const [params] = useSearchParams()
  const focus = params.get('focus')
  const here = posts.filter((p) => sameSpot(p.anchor, material))
  const answered = (qs: Post[]) => qs.every((p) => replies.some((r) => r.post_id === p.id))
  const focused = here.find((p) => p.id === focus)
  const [asking, setAsking] = useState<number | null>(null)
  const [open, setOpen] = useState<number | null>(focused && focused.anchor?.kind === 'line' ? focused.anchor.index : null)
  const student = session?.role === 'student'

  return (
    <div>
      {lines.map((l, i) => {
        const qs = here.filter((p) => p.anchor?.kind === 'line' && p.anchor.index === i)
        const active = asking === i || open === i
        return (
          <div key={i} id={`line-${i}`} className={`ann-line${active ? ' active' : ''}${qs.length ? ' has-q' : ''}`}>
            <div className="ann-row">
              <div className={`note-line ${l.type}`}>{l.type === 'math' ? <TeX tex={l.value} display /> : l.value}</div>
              <div className="ann-tools no-print">
                {qs.length > 0 && (
                  <button className={`ann-count${answered(qs) ? '' : ' open-q'}`} onClick={() => { setOpen(open === i ? null : i); setAsking(null) }} aria-label={`${qs.length} question${qs.length > 1 ? 's' : ''} about this line`}>
                    {qs.length}
                  </button>
                )}
                {student && (
                  <button className="ann-ask" onClick={() => { setAsking(asking === i ? null : i); setOpen(null) }} aria-label="Ask about this line" title="Ask about this line">
                    ?
                  </button>
                )}
              </div>
            </div>
            {open === i && qs.length > 0 && <SpotThread posts={qs} />}
            {asking === i && (
              <QuickAsk
                anchor={{ kind: 'line', material, index: i, text: l.value, math: l.type === 'math' }}
                topic={topic}
                noteId={noteId}
                onCancel={() => setAsking(null)}
                onDone={() => {
                  setAsking(null)
                  setOpen(i)
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/** An image where a click drops a pin and opens a question box. */
export function PinImage({ src, alt, material, image, topic, noteId, className }: { src: string; alt: string; material: string; image: string; topic: string; noteId?: string | null; className?: string }) {
  const { posts, session, replies } = useApp()
  const [params] = useSearchParams()
  const focus = params.get('focus')
  const pins = posts.filter((p) => sameSpot(p.anchor, material, image))
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null)
  const [open, setOpen] = useState<string | null>(pins.some((p) => p.id === focus) ? focus : null)
  const student = session?.role === 'student'
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && open === focus) wrap.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [open, focus])

  const place = (e: MouseEvent<HTMLDivElement>) => {
    if (!student) return
    const r = e.currentTarget.getBoundingClientRect()
    setDraft({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
    setOpen(null)
  }
  const popSide = (x: number) => (x > 58 ? 'left' : 'right')

  return (
    <div className={`pin-wrap ${className ?? ''}`} ref={wrap}>
      {student && <div className="pin-hint mono sm no-print">Click anywhere to ask about that spot</div>}
      <div className={`pin-stage${student ? ' can-pin' : ''}`} onClick={place}>
        <img src={src} alt={alt} draggable={false} />
        {pins.map((p, k) => {
          const a = p.anchor as Extract<Anchor, { kind: 'pin' }>
          return (
            <div key={p.id} className="pin-at" style={{ left: `${a.x}%`, top: `${a.y}%` }}>
              <button
                className={`pin${open === p.id ? ' on' : ''}${replies.some((r) => r.post_id === p.id) ? '' : ' open-q'}`}
                onClick={(e) => { e.stopPropagation(); setOpen(open === p.id ? null : p.id); setDraft(null) }}
                aria-label={`Question: ${p.title}`}
              >
                {k + 1}
              </button>
              {open === p.id && (
                <div className={`pin-pop ${popSide(a.x)}`}>
                  <SpotThread posts={[p]} />
                </div>
              )}
            </div>
          )
        })}
        {draft && (
          <div className="pin-at" style={{ left: `${draft.x}%`, top: `${draft.y}%` }}>
            <span className="pin draft">?</span>
            <div className={`pin-pop ${popSide(draft.x)}`}>
              <QuickAsk
                anchor={{ kind: 'pin', material, image, x: Math.round(draft.x * 10) / 10, y: Math.round(draft.y * 10) / 10 }}
                topic={topic}
                noteId={noteId}
                onCancel={() => setDraft(null)}
                onDone={(id) => {
                  setDraft(null)
                  setOpen(id)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Where an anchored question points: a label, a link back to the exact spot, and a preview. */
export function anchorInfo(a: Anchor, noteTitle: (id: string) => string | undefined, postId: string) {
  let title = noteTitle(a.material) ?? 'Class material'
  let to = `/note/${a.material}?focus=${postId}`
  let src: string | undefined
  if (a.material.startsWith('ws-')) {
    const topic = a.material.slice(3)
    const page = a.kind === 'pin' ? Number(a.image.replace('p', '')) || 1 : 1
    title = `${WORKSHEETS[topic]?.title ?? 'Worksheet'}, page ${page}`
    to = `/worksheet/${topic}/${page}?focus=${postId}`
    src = WORKSHEETS[topic]?.pages[page - 1]
  }
  return { title, to, src }
}

/** "About" strip shown on a question in the discussion. */
export function AnchorPreview({ p }: { p: Post }) {
  const { noteById } = useApp()
  if (!p.anchor) return null
  const a = p.anchor
  const n = a.material.startsWith('ws-') ? undefined : noteById(a.material)
  const { title, to, src } = anchorInfo(a, (id) => noteById(id)?.title, p.id)
  const img = a.kind === 'pin' ? src ?? (a.image === 'photo' ? n?.photo_url ?? undefined : a.image === 'figure' ? n?.figure ?? undefined : undefined) : undefined
  return (
    <Link to={to} className="anchor-preview">
      {a.kind === 'pin' && img && (
        <span className="anchor-crop" style={{ backgroundImage: `url(${img})`, backgroundPosition: `${a.x}% ${a.y}%` }}>
          {/* with background-position p%, the image's p% point sits at the box's p% point */}
          <i style={{ left: `${a.x}%`, top: `${a.y}%` }} />
        </span>
      )}
      <span className="anchor-text">
        <span className="mono sm">About · {title}</span>
        {a.kind === 'line' && (a.math ? <span className="anchor-quote"><TeX tex={a.text} /></span> : <span className="anchor-quote">“{a.text}”</span>)}
        {a.kind === 'pin' && <span className="anchor-quote">A spot on the {a.image === 'photo' ? 'board photo' : a.image === 'figure' ? 'diagram' : 'page'}</span>}
      </span>
      <span aria-hidden="true">→</span>
    </Link>
  )
}
