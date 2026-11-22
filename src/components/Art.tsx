// Line-art illustrations redrawn from the team's "Math Visual Library" (Design Research Zine, Figma).
// Thin strokes + DM Mono labels, drawn in currentColor so each one takes its concept's ink colour.
import type { ArtKind } from '../lib/content'

const mono = { fontFamily: 'DM Mono, monospace' }
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Label({ x, y, children, size = 11, anchor = 'start' }: { x: number; y: number; children: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fontSize={size} fill="currentColor" textAnchor={anchor} style={mono}>
      {children}
    </text>
  )
}

/** 01 Unit circle */
function UnitCircle() {
  return (
    <>
      <circle cx="70" cy="80" r="52" {...S} />
      <line x1="8" y1="80" x2="132" y2="80" {...S} />
      <line x1="70" y1="18" x2="70" y2="142" {...S} />
      <line x1="70" y1="80" x2="104" y2="41" {...S} />
      <circle cx="104" cy="41" r="4" fill="currentColor" />
      <path d="M84 80 A14 14 0 0 0 79 69" {...S} />
      <Label x={86} y={74} size={10}>θ</Label>
      <Label x={74} y={16} size={10}>y</Label>
      <Label x={136} y={84} size={10}>x</Label>
      <Label x={112} y={34} size={10}>(cos θ, sin θ)</Label>
      <Label x={156} y={78} size={10}>x = cos θ</Label>
      <Label x={156} y={94} size={10}>y = sin θ</Label>
      <Label x={156} y={110} size={10}>r = 1</Label>
    </>
  )
}

/** 05 Radians / degrees */
function Radians() {
  return (
    <>
      <circle cx="70" cy="85" r="48" {...S} />
      <path d="M70 37 A48 48 0 0 1 118 85" {...S} strokeWidth={6} opacity={0.25} />
      <path d="M70 25 L70 37 M70 25 A60 60 0 0 1 130 85 L118 85" {...S} />
      <line x1="70" y1="85" x2="118" y2="85" {...S} />
      <circle cx="70" cy="85" r="4" fill="currentColor" />
      <Label x={110} y={36} size={11}>θ</Label>
      <Label x={142} y={68} size={10}>180° = π rad</Label>
      <Label x={142} y={86} size={10}>360° = 2π rad</Label>
      <Label x={142} y={104} size={10}>π rad = 180°</Label>
    </>
  )
}

/** 04 Sine / cosine */
function Sine() {
  const sin = Array.from({ length: 61 }, (_, i) => {
    const x = 20 + i * 3.4
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${(80 - 38 * Math.sin((i / 60) * 4 * Math.PI)).toFixed(1)}`
  }).join(' ')
  const cos = Array.from({ length: 61 }, (_, i) => {
    const x = 20 + i * 3.4
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${(80 - 38 * Math.cos((i / 60) * 4 * Math.PI)).toFixed(1)}`
  }).join(' ')
  return (
    <>
      <line x1="14" y1="80" x2="238" y2="80" {...S} />
      <line x1="20" y1="28" x2="20" y2="132" {...S} />
      <path d={sin} {...S} />
      <path d={cos} {...S} strokeDasharray="5 4" />
      <line x1="170" y1="20" x2="196" y2="20" {...S} />
      <line x1="170" y1="34" x2="196" y2="34" {...S} strokeDasharray="5 4" />
      <Label x={200} y={24} size={10}>sin(x)</Label>
      <Label x={200} y={38} size={10}>cos(x)</Label>
      <Label x={62} y={148} size={10}>π/2</Label>
      <Label x={122} y={148} size={10}>π</Label>
      <Label x={168} y={148} size={10}>3π/2</Label>
      <Label x={218} y={148} size={10}>2π</Label>
    </>
  )
}

/** 03 Reference triangle */
function Reference() {
  return (
    <>
      <polygon points="20,130 170,130 170,30" {...S} />
      <polyline points="158,130 158,118 170,118" {...S} />
      <path d="M48 130 A28 28 0 0 0 45 117" {...S} />
      <Label x={52} y={124} size={11}>θ</Label>
      <Label x={86} y={70} size={11}>1</Label>
      <Label x={176} y={84} size={11}>sin θ</Label>
      <Label x={80} y={148} size={11}>cos θ</Label>
      <polygon points="200,60 236,60 236,30" {...S} />
      <polygon points="200,100 236,100 236,70" fill="currentColor" stroke="currentColor" strokeWidth={1.6} />
      <polygon points="200,140 236,140 236,110" {...S} strokeDasharray="4 3" />
    </>
  )
}

/** Oblique triangle with an opposite side–angle pair (Law of Sines) */
function Sines() {
  return (
    <>
      <polygon points="16,128 150,128 108,32" {...S} />
      <path d="M42 128 A26 26 0 0 0 38 115" {...S} />
      <path d="M128 128 A22 22 0 0 1 139 110" {...S} />
      <circle cx="16" cy="128" r="3.5" fill="currentColor" />
      <circle cx="150" cy="128" r="3.5" fill="currentColor" />
      <circle cx="108" cy="32" r="3.5" fill="currentColor" />
      <Label x={4} y={146} size={11}>A</Label>
      <Label x={152} y={146} size={11}>B</Label>
      <Label x={104} y={24} size={11}>C</Label>
      <Label x={134} y={78} size={11}>a</Label>
      <Label x={52} y={76} size={11}>b</Label>
      <Label x={162} y={70} size={10}>a/sin A</Label>
      <Label x={162} y={86} size={10}>= b/sin B</Label>
    </>
  )
}

/** Triangle with the included angle marked (Law of Cosines) */
function Cosines() {
  return (
    <>
      <polygon points="12,128 150,128 96,32" {...S} />
      <path d="M84 52 A22 22 0 0 0 108 54" {...S} />
      <circle cx="96" cy="32" r="3.5" fill="currentColor" />
      <Label x={92} y={24} size={11}>C</Label>
      <Label x={42} y={76} size={11}>b</Label>
      <Label x={128} y={78} size={11}>a</Label>
      <Label x={64} y={146} size={11}>c = ?</Label>
      <Label x={160} y={70} size={10}>c² = a² + b²</Label>
      <Label x={160} y={86} size={10}>− 2ab cos C</Label>
    </>
  )
}

/** 09 Right triangles */
function Triangles() {
  return (
    <>
      <polygon points="30,130 30,30 150,130" {...S} />
      <polyline points="30,118 42,118 42,130" {...S} />
      <Label x={14} y={84} size={11}>a</Label>
      <Label x={86} y={148} size={11}>b</Label>
      <Label x={96} y={74} size={11}>c</Label>
      <Label x={168} y={44} size={10}>a² + b² = c²</Label>
      <polygon points="186,80 226,80 226,56" {...S} />
      <polygon points="186,112 226,112 226,88" fill="currentColor" stroke="currentColor" strokeWidth={1.6} />
      <polygon points="186,144 226,144 226,120" {...S} strokeDasharray="4 3" />
    </>
  )
}

const ART: Record<ArtKind, () => React.JSX.Element> = {
  'unit-circle': UnitCircle,
  radians: Radians,
  sine: Sine,
  reference: Reference,
  sines: Sines,
  cosines: Cosines,
  triangles: Triangles,
}

export function Art({ kind, width = 240, className }: { kind: ArtKind; width?: number | string; className?: string }) {
  const Draw = ART[kind]
  return (
    <svg viewBox="0 0 250 155" width={width} className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <Draw />
    </svg>
  )
}

/** The library's small symbol row: ⊕ ◐ ⊘ ⊙ */
export function Glyphs({ size = 22 }: { size?: number }) {
  const r = size / 2 - 1.5
  const c = size / 2
  const g = (k: number, child: React.ReactNode) => (
    <svg key={k} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={c} cy={c} r={r} {...S} />
      {child}
    </svg>
  )
  return (
    <span style={{ display: 'inline-flex', gap: 6 }}>
      {g(0, <><line x1={c - r} y1={c} x2={c + r} y2={c} {...S} /><line x1={c} y1={c - r} x2={c} y2={c + r} {...S} /></>)}
      {g(1, <path d={`M${c} ${c - r} A${r} ${r} 0 0 1 ${c} ${c + r} Z`} fill="currentColor" />)}
      {g(2, <line x1={c - r * 0.7} y1={c + r * 0.7} x2={c + r * 0.7} y2={c - r * 0.7} {...S} />)}
      {g(3, <circle cx={c} cy={c} r={2.6} fill="currentColor" />)}
    </span>
  )
}

/** Concentric target + asterisk, used as small decorations */
export function Target({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="15" {...S} />
      <circle cx="17" cy="17" r="9.5" {...S} />
      <circle cx="17" cy="17" r="4" {...S} />
    </svg>
  )
}
export function Asterisk({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
      {[0, 45, 90, 135].map((a) => (
        <line key={a} x1="15" y1="2" x2="15" y2="28" {...S} transform={`rotate(${a} 15 15)`} />
      ))}
    </svg>
  )
}
