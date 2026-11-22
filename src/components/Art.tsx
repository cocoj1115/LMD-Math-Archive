// Illustrations from the team's "Math Visual Library" (Figma: Design Research Zine, node 45:488).
// Shapes are the original vector paths exported from Figma. Labels, which were outlined text in
// Figma, are re-set as live DM Mono text. Everything is drawn in currentColor so each
// illustration takes its concept's ink colour.
import { tone, type ArtKind, type Duotone } from '../lib/content'

/** path, flags: t = thin 1.3 stroke, f = filled + stroked, F = fill only, w = white stroke, d = dashed */
type P = [string, string?]
type G = [number, number, P[]] // translate x, y, paths
type L = [number, number, number, number, string, number?] // label box x, y, w, h, text, optional font size

interface Drawing {
  vb: [number, number, number, number]
  groups: G[]
  labels: L[]
}

const CIRCLE_37 = 'M37 19C37 28.9 28.9 37 19 37C9.1 37 1 28.9 1 19C1 9.1 9.1 1 19 1C28.9 1 37 9.1 37 19Z'
const glyphRow = (x: number, y: number): G[] => [
  [x, y, [[CIRCLE_37], ['M1 19H37', 't'], ['M19 1V37', 't']]],
  [x + 51, y, [[CIRCLE_37], ['M19 1C23.8 1 28.4 2.9 31.7 6.3C35.1 9.6 37 14.2 37 19C37 23.8 35.1 28.4 31.7 31.7C28.4 35.1 23.8 37 19 37V1Z', 'F']]],
  [x + 102, y, [[CIRCLE_37], ['M7 31L31 7']]],
  [x + 153, y, [[CIRCLE_37], ['M19 24C21.8 24 24 21.8 24 19C24 16.2 21.8 14 19 14C16.2 14 14 16.2 14 19C14 21.8 16.2 24 19 24Z', 'F']]],
]

const DRAWINGS: Record<string, Drawing> = {
  'unit-circle': {
    vb: [44, 144, 284, 224],
    groups: [
      [52, 152, [
        ['M160 84C160 126 126 160 84 160C42 160 8 126 8 84C8 42 42 8 84 8C126 8 160 42 160 84Z'],
        ['M1 84H168'], ['M84 167V1'], ['M84 84L138 30'],
        ['M116 84C116.1 79.8 115.4 75.5 113.8 71.6C112.3 67.6 109.9 64 107 61'],
        ['M138 34.5C140.5 34.5 142.5 32.5 142.5 30C142.5 27.5 140.5 25.5 138 25.5C135.5 25.5 133.5 27.5 133.5 30C133.5 32.5 135.5 34.5 138 34.5Z', 'f'],
      ]],
      ...glyphRow(49, 326),
    ],
    labels: [[144, 149, 10, 14, 'y'], [170, 213, 8, 14, 'θ'], [146, 211, 6, 9, '1'], [218, 171, 105, 13, '(cos θ, sin θ)'], [232, 211, 78, 11, 'x = cos θ'], [232, 236, 76, 14, 'y = sin θ'], [232, 261, 42, 10, 'r = 1']],
  },
  'reference-triangle': {
    vb: [742, 150, 300, 164],
    groups: [
      [747, 165, [['M1 122H163V1L1 122Z'], ['M148 122V107H163', 't'], ['M23 122C23.4 117.7 25 113.6 27.7 110.3C30.3 106.9 33.9 104.4 38 103', 't']]],
      [977.4, 155.3, [
        ['M0.6 46.6H59.6V0.7L0.6 46.6Z', 't'], ['M49.6 46.6V36.6H59.6', 't'],
        ['M0.6 89.7H59.6V43.6L0.6 89.7Z', 'ft'], ['M49.6 89.7V79.7H59.6', 'w'],
        ['M0.6 133.7H59.6V87.7L0.6 133.7Z', 'dt'], ['M49.6 133.7V123.7H59.6', 't'],
      ]],
    ],
    labels: [[810, 199, 8, 12, '1'], [919, 225, 40, 10, 'sin θ'], [813, 298, 43, 11, 'cos θ'], [786, 264, 8, 14, 'θ']],
  },
  'sine-cosine': {
    vb: [42, 416, 328, 200],
    groups: [
      [47, 419, [
        ['M1 108H307'], ['M35 175V1'],
        ['M35 108C57 108 67 52 96 52C125 52 135 164 167 164C199 164 208 52 239 52C270 52 282 108 303 108'],
        ['M35 52C57 52 67 164 96 164C125 164 135 52 167 52C199 52 208 164 239 164C270 164 282 52 303 52', 'd'],
        ['M35 52H42', 't'], ['M35 164H42', 't'],
      ]],
      [262, 429, [['M1 1H42']]],
      [262, 451, [['M1 1H42', 'd']]],
    ],
    labels: [[53, 458, 5, 8, '1'], [47, 580, 14, 8, '−1'], [73, 539, 6, 8, '0'], [140, 597, 30, 15, 'π/2'], [208, 601, 10, 9, 'π'], [281, 596, 41, 15, '3π/2'], [338, 596, 21, 14, '2π'], [357, 523, 9, 9, 'x'], [315, 424, 45, 13, 'sin(x)'], [315, 445, 49, 14, 'cos(x)']],
  },
  'radians-degrees': {
    vb: [394, 420, 306, 196],
    groups: [
      [426, 424, [
        ['M119 81C119 113.6 92.6 140 60 140C27.4 140 1 113.6 1 81C1 48.4 27.4 22 60 22C92.6 22 119 48.4 119 81Z'],
        ['M60 81V1'], ['M60 81H132'], ['M60 6C79.9 6 99 13.9 113 28C127.1 42 135 61.1 135 81'],
        ['M60 86C62.8 86 65 83.8 65 81C65 78.2 62.8 76 60 76C57.2 76 55 78.2 55 81C55 83.8 57.2 86 60 86Z', 'f'],
      ]],
      ...glyphRow(397, 574),
    ],
    labels: [[544, 429, 8, 14, 'θ'], [575, 443, 110, 11, '180° = π rad'], [575, 470, 122, 12, '360° = 2π rad'], [574, 497, 110, 11, 'π rad = 180°']],
  },
  'right-triangles': {
    vb: [754, 708, 288, 166],
    groups: [
      [778, 715, [['M1 1V131H131L1 1Z'], ['M1 115H17V131', 't']]],
      [978.4, 749.3, [
        ['M0.6 34.6H46.6V0.7L0.6 34.6Z', 't'],
        ['M0.6 77.7H46.6V43.6L0.6 77.7Z', 'ft'], ['M36.6 77.7V67.7H46.6', 'w'],
        ['M0.6 120.7H46.6V86.7L0.6 120.7Z', 'dt'],
      ]],
    ],
    labels: [[762, 775, 8, 10, 'a'], [842, 853, 9, 14, 'b'], [844, 762, 9, 10, 'c'], [926, 737, 110, 12, 'a² + b² = c²']],
  },
}

/** Law of Sines / Law of Cosines: drawn in the same style (the library has no oblique triangle). */
const EXTRA: Record<'sines' | 'cosines', Drawing> = {
  sines: {
    vb: [-4, 0, 294, 162],
    groups: [[0, 0, [
      ['M14 136H160L112 24Z'],
      ['M40 136C40.2 131.4 38.6 126.6 35.6 123', 't'],
      ['M138 136C138.6 129.8 141.6 124 146 120.5', 't'],
      ['M14 140.5C16.5 140.5 18.5 138.5 18.5 136C18.5 133.5 16.5 131.5 14 131.5C11.5 131.5 9.5 133.5 9.5 136C9.5 138.5 11.5 140.5 14 140.5Z', 'F'],
      ['M160 140.5C162.5 140.5 164.5 138.5 164.5 136C164.5 133.5 162.5 131.5 160 131.5C157.5 131.5 155.5 133.5 155.5 136C155.5 138.5 157.5 140.5 160 140.5Z', 'F'],
    ]]],
    labels: [[0, 144, 9, 14, 'A'], [164, 144, 9, 14, 'B'], [107, 4, 9, 14, 'C'], [143, 70, 8, 12, 'a'], [50, 70, 8, 12, 'b'], [176, 60, 108, 13, 'a/sin A ='], [176, 82, 92, 13, 'b/sin B']],
  },
  cosines: {
    vb: [0, 0, 290, 162],
    groups: [[0, 0, [
      ['M12 136H160L100 24Z'],
      ['M86 50C93 56 103 57 112 51', 't'],
      ['M100 28.5C102.5 28.5 104.5 26.5 104.5 24C104.5 21.5 102.5 19.5 100 19.5C97.5 19.5 95.5 21.5 95.5 24C95.5 26.5 97.5 28.5 100 28.5Z', 'F'],
    ]]],
    labels: [[96, 2, 9, 14, 'C'], [40, 72, 8, 12, 'b'], [136, 72, 8, 12, 'a'], [66, 144, 44, 14, 'c = ?'], [170, 60, 112, 13, 'c² = a² + b²'], [170, 82, 106, 13, '− 2ab cos C']],
  },
}

/**
 * Role illustrations for the entry screen, drawn in the library's style so their meaning matches the role.
 * Student = a worksheet page + a question bubble (find notes, ask the class).
 * Teacher = a board with a formula inside a camera viewfinder + a phone (capture the board).
 */
const ROLES: Record<'notes' | 'bubble' | 'board' | 'phone', Drawing> = {
  // Student main window: a class-notes page with the board formula and a sketch
  notes: {
    vb: [0, 0, 300, 170],
    groups: [[0, 0, [
      ['M40 10H226L260 44V164H40Z'], ['M226 10V44H260', 't'],
      ['M60 104H236M60 122H236M60 140H180', 't'],
      ['M190 98H244L226 58Z', 't'],
    ]]],
    labels: [[60, 24, 80, 10, 'BOARD NOTES · 5.3', 10], [60, 58, 120, 14, 'c² = a² + b²', 14], [60, 82, 120, 14, '− 2ab cos C', 14]],
  },
  // Student satellite: a question bubble
  bubble: {
    vb: [0, 0, 60, 60],
    groups: [[0, 0, [['M12 10H48C52.4 10 56 13.6 56 18V36C56 40.4 52.4 44 48 44H28L18 54V44H12C7.6 44 4 40.4 4 36V18C4 13.6 7.6 10 12 10Z']]]],
    labels: [[23, 14, 14, 24, '?', 26]],
  },
  // Teacher main window: the board, framed by a camera viewfinder
  board: {
    vb: [0, 0, 300, 170],
    groups: [[0, 0, [
      ['M36 24H264V138H36Z'], ['M90 138V156M210 138V156', 't'], ['M70 156H230', 't'],
      ['M196 124H250L232 68Z', 't'],
      ['M20 28V12H38M262 12H280V28M20 134V150H38M280 134V150H262'],
    ]]],
    labels: [[52, 48, 120, 14, 'c² = a² + b²', 14], [52, 74, 120, 14, '− 2ab cos C', 14], [52, 104, 80, 10, 'a = 5, b = 7', 11]],
  },
  // Teacher satellite: a phone camera
  phone: {
    vb: [0, 0, 60, 60],
    groups: [[0, 0, [
      ['M20 4H40C43.3 4 46 6.7 46 10V50C46 53.3 43.3 56 40 56H20C16.7 56 14 53.3 14 50V10C14 6.7 16.7 4 20 4Z'],
      ['M30 30C34.4 30 38 26.4 38 22C38 17.6 34.4 14 30 14C25.6 14 22 17.6 22 22C22 26.4 25.6 30 30 30Z'],
      ['M30 50C31.7 50 33 48.7 33 47C33 45.3 31.7 44 30 44C28.3 44 27 45.3 27 47C27 48.7 28.3 50 30 50Z', 'F'],
    ]]],
    labels: [],
  },
}

/** Which library drawing each concept uses */
const KIND: Record<ArtKind, Drawing> = {
  'unit-circle': DRAWINGS['unit-circle'],
  radians: DRAWINGS['radians-degrees'],
  sine: DRAWINGS['sine-cosine'],
  reference: DRAWINGS['reference-triangle'],
  triangles: DRAWINGS['right-triangles'],
  sines: EXTRA.sines,
  cosines: EXTRA.cosines,
  notes: ROLES.notes,
  bubble: ROLES.bubble,
  board: ROLES.board,
  phone: ROLES.phone,
}

function pathProps(flags = '') {
  return {
    strokeWidth: flags.includes('t') ? 1.3 : 2,
    stroke: flags.includes('F') ? 'none' : flags.includes('w') ? '#fff' : 'currentColor',
    fill: flags.includes('f') || flags.includes('F') ? 'currentColor' : 'none',
    strokeDasharray: flags.includes('d') ? '6 5' : undefined,
  }
}

function Draw({ d, labels = true }: { d: Drawing; labels?: boolean }) {
  return (
    <>
      <g strokeLinecap="round" strokeLinejoin="round">
        {d.groups.map(([x, y, paths], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {paths.map(([p, f], j) => (
              <path key={j} d={p} {...pathProps(f)} />
            ))}
          </g>
        ))}
      </g>
      {labels && (
        <g fill="currentColor" style={{ fontFamily: 'DM Mono, monospace' }}>
          {d.labels.map(([x, y, w, h, s, fixed], i) => {
            const size = fixed ?? Math.min(16, Math.max(9, w / (s.length * 0.6)))
            return (
              <text key={i} x={x} y={y + Math.min(h, size * 0.8)} fontSize={size}>
                {s}
              </text>
            )
          })}
        </g>
      )}
    </>
  )
}

export function Art({ kind, width = 240, className }: { kind: ArtKind; width?: number | string; className?: string }) {
  const d = KIND[kind]
  return (
    <svg viewBox={d.vb.join(' ')} width={width} className={className} aria-hidden="true" fill="none">
      <Draw d={d} />
    </svg>
  )
}

/* ---------- Small library symbols ---------- */
export function Glyphs({ size = 22 }: { size?: number }) {
  return (
    <svg width={(size * 192) / 38} height={size} viewBox="-1 -1 194 40" aria-hidden="true" fill="none">
      <Draw d={{ vb: [0, 0, 192, 38], groups: glyphRow(0, 0), labels: [] }} />
    </svg>
  )
}

export function Target({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="17" cy="17" r="15" />
      <circle cx="17" cy="17" r="9.5" />
      <circle cx="17" cy="17" r="4" />
    </svg>
  )
}

export function Asterisk({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {[0, 45, 90, 135].map((a) => (
        <line key={a} x1="15" y1="2" x2="15" y2="28" transform={`rotate(${a} 15 15)`} />
      ))}
    </svg>
  )
}

/**
 * Concept badge: a small tile in the concept's duotone with a black outline and a hard
 * shadow, like Gumroad's app-icon tiles. Replaces the old vertical colour bars.
 */
export function ConceptBadge({ kind, size = 56, labels = false }: { kind: ArtKind; size?: number; labels?: boolean }) {
  const d = KIND[kind]
  return (
    <span className="badge-tile" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox={d.vb.join(' ')} width="100%" height="100%" fill="none">
        <Draw d={d} labels={labels} />
      </svg>
    </span>
  )
}

/**
 * Gumroad-style "app window": white title bar with three dots, concept-coloured body,
 * 2px black outline and a hard shadow. Used for illustrations on cards and page heroes.
 */
export function ArtWindow({ kind, color, className, style }: { kind: ArtKind; color: Duotone; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`art-window ${className ?? ''}`} style={{ ...tone(color), ...style }} aria-hidden="true">
      <div className="aw-bar">
        <i />
        <i />
        <i />
      </div>
      <div className="aw-body">
        <Art kind={kind} width="100%" />
      </div>
    </div>
  )
}
