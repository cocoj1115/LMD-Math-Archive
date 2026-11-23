import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Back, RichText, Shell, TeX, Triangle } from '../components/ui'
import { useApp } from '../lib/app'
import { ArtWindow } from '../components/Art'
import { EXAMPLES, WORKSHEETS, topicById } from '../lib/content'
import { MaterialRow, useMaterials } from './Archive'

export function TopicPage() {
  const { id = '' } = useParams()
  const { posts } = useApp()
  const t = topicById(id)
  const materials = useMaterials([id])
  if (!t) return <Navigate to="/archive" replace />
  if (t.folder !== 'solving-triangles') return <Navigate to={`/folder/${t.folder}`} replace />
  const q = posts.filter((p) => p.topic === id)
  return (
    <Shell>
      <div className="crumb mono sm">
        <Link to="/archive">Class archive</Link> &nbsp;/&nbsp; <Link to="/folder/solving-triangles">Solving triangles</Link> &nbsp;/&nbsp; {t.name}
      </div>
      <div className="hero">
        <div className="mono sm">{t.lesson}</div>
        <h1>{t.name}</h1>
        <p className="sub">{t.summary}</p>
        <ArtWindow kind={t.art} color={t.color} className="hero-art" />
      </div>
      <h2 style={{ marginTop: 36 }}>Class materials</h2>
      {materials.length ? materials.map((m) => <MaterialRow key={m.id} m={m} />) : <div className="panel">Nothing here yet.</div>}
      <div className="spread" style={{ marginTop: 36 }}>
        <h2>Class questions</h2>
        <Link className="pill primary" to={`/discussion/new?topic=${id}`}>Ask the class a question</Link>
      </div>
      {q.length ? (
        <Link to={`/discussion?topic=${id}`} className="listcard">
          <span>
            {q.length} question{q.length > 1 ? 's' : ''} about {t.name} — latest: “{q[0].title}”
          </span>
          <span>→</span>
        </Link>
      ) : (
        <div className="panel">No questions yet.</div>
      )}
    </Shell>
  )
}

export function Example() {
  const { id = '' } = useParams()
  const ex = EXAMPLES[id]
  const t = topicById(id)
  if (!ex || !t) return <Navigate to="/archive" replace />
  return (
    <Shell nav={false}>
      <Back to={`/topic/${id}`}>{t.name}</Back>
      <div className="eyebrow">{t.name} / Worked example</div>
      <h1 className="tight" style={{ marginTop: 6 }}>{ex.title}</h1>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '355px 1fr', gap: 30, marginTop: 20 }}>
        <div className="inset" style={{ background: t.color.bg, color: t.color.ink, borderColor: t.color.ink }}>
          <Triangle t={ex.triangle} />
          <div style={{ fontSize: 20, marginTop: 6 }}>
            <TeX tex={ex.formula} />
          </div>
          <div className="mono sm" style={{ marginTop: 14 }}>Diagram not to scale</div>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 19, marginTop: 6 }}>{ex.prompt}</p>
          <ol style={{ paddingLeft: 22, fontSize: 18, lineHeight: 2.2 }}>
            {ex.steps.map((s, i) => (
              <li key={i}>
                <RichText text={s} />
              </li>
            ))}
          </ol>
          <p style={{ fontSize: 16 }}>{ex.hint}</p>
        </div>
      </div>
      <div className="row" style={{ marginTop: 18 }}>
        <Link className="pill" to={`/worksheet/${id}/1`}>Open class worksheet →</Link>
        <Link className="pill primary" to={`/discussion/new?topic=${id}`}>Ask the class a question</Link>
      </div>
    </Shell>
  )
}

export function Worksheet() {
  const { id = '', page = '1' } = useParams()
  const navigate = useNavigate()
  const ws = WORKSHEETS[id]
  const t = topicById(id)
  if (!ws || !t) return <Navigate to="/archive" replace />
  const p = Math.min(ws.pages.length, Math.max(1, Number(page)))
  const last = p === ws.pages.length
  return (
    <Shell nav={false}>
      <Back to={`/topic/${id}`}>Back to topic</Back>
      <div className="spread" style={{ alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">{t.lesson}</div>
          <h1 className="tight" style={{ marginTop: 6 }}>{t.name}</h1>
        </div>
        <button className="pill no-print" onClick={() => window.print()}>Print this page</button>
      </div>
      <div style={{ height: 1, background: 'var(--blue)', margin: '16px 0' }} />
      <div className="spread no-print" style={{ alignItems: 'center', marginBottom: 18 }}>
        <strong>
          Page {p} of {ws.pages.length}
        </strong>
        <div className="row">
          {p > 1 && <Link className="pill" to={`/worksheet/${id}/${p - 1}`}>← Previous page</Link>}
          {!last ? (
            <Link className="pill primary" to={`/worksheet/${id}/${p + 1}`}>Next page →</Link>
          ) : (
            <button className="pill primary" onClick={() => navigate(`/topic/${id}`)}>Done reading</button>
          )}
        </div>
      </div>
      <img className="worksheet" src={ws.pages[p - 1]} alt={`${ws.title}, page ${p}`} />
      <div className="row no-print" style={{ justifyContent: 'center', marginTop: 18 }}>
        <Link className="pill primary" to={`/discussion/new?topic=${id}`}>Ask the class a question</Link>
      </div>
    </Shell>
  )
}
