// Built-in class materials for Math 3 / City of Bridges.
// Teacher-published board notes from the database are merged into these folders.
import type { Note } from './types'

/** Product name: change it here and everywhere updates */
export const APP_NAME = 'Chalkback'
export const APP_TAGLINE = 'Your class board, back whenever you need it'

/**
 * Duotone pairs from the team's Discovery Research Zine (Figma "Design Research Zine").
 * Each concept gets one pastel background + one ink colour, used together everywhere
 * (folder, topic header, tags, illustrations) so students can recognise a concept by colour.
 */
export const DUOTONES = {
  blue: { bg: '#E6E6E6', ink: '#002BFF' }, // zine cover · brand
  red: { bg: '#EECED8', ink: '#DD0C00' },
  brown: { bg: '#D5F2BC', ink: '#824326' },
  green: { bg: '#D8EDF2', ink: '#0B8246' },
  sky: { bg: '#FFF584', ink: '#0966DF' },
  orange: { bg: '#F5EBFF', ink: '#EF6801' },
} as const
export type Duotone = { readonly bg: string; readonly ink: string }

export type ArtKind = 'unit-circle' | 'radians' | 'sine' | 'reference' | 'sines' | 'cosines' | 'triangles' | 'notes' | 'bubble' | 'board' | 'phone'

export interface Topic {
  id: string
  name: string
  folder: string // folder id in the Class archive
  lesson?: string
  summary: string
  color: Duotone
  art: ArtKind
}

export interface Folder {
  id: string
  name: string
  topics: string[]
  color: Duotone
  art: ArtKind
}

export const TOPICS: Topic[] = [
  { id: 'radians-degrees', name: 'Radians & Degrees', folder: 'radians-degrees', summary: 'Convert between degrees and radians.', color: DUOTONES.orange, art: 'radians' },
  { id: 'unit-circle', name: 'Unit Circle', folder: 'unit-circle', summary: 'Points on the circle are (cos θ, sin θ).', color: DUOTONES.red, art: 'unit-circle' },
  { id: 'trig-graphs', name: 'Trig Graphs', folder: 'trig-graphs', summary: 'Read sine and cosine as graphs.', color: DUOTONES.brown, art: 'sine' },
  { id: 'special-angles', name: 'Special Angles', folder: 'special-angles', summary: 'Exact values at π/6, π/4, π/3.', color: DUOTONES.green, art: 'reference' },
  { id: 'law-of-sines', name: 'Law of Sines', folder: 'solving-triangles', lesson: 'LESSON 5.1', summary: 'You know a side and the angle across from it.', color: DUOTONES.sky, art: 'sines' },
  { id: 'law-of-cosines', name: 'Law of Cosines', folder: 'solving-triangles', lesson: 'LESSON 5.3', summary: 'You know two sides and the angle between them — or all three sides.', color: DUOTONES.blue, art: 'cosines' },
]

export const FOLDERS: Folder[] = [
  { id: 'radians-degrees', name: 'Radians & Degrees', topics: ['radians-degrees'], color: DUOTONES.orange, art: 'radians' },
  { id: 'unit-circle', name: 'Unit Circle', topics: ['unit-circle'], color: DUOTONES.red, art: 'unit-circle' },
  { id: 'trig-graphs', name: 'Trig Graphs', topics: ['trig-graphs'], color: DUOTONES.brown, art: 'sine' },
  { id: 'special-angles', name: 'Special Angles', topics: ['special-angles'], color: DUOTONES.green, art: 'reference' },
  { id: 'solving-triangles', name: 'Solving triangles', topics: ['law-of-sines', 'law-of-cosines'], color: DUOTONES.sky, art: 'triangles' },
]

export const topicById = (id: string) => TOPICS.find((t) => t.id === id)
/** CSS custom properties for a concept's duotone: use as style={tone(t)} */
export const tone = (c?: Duotone) => (c ? ({ '--tone-bg': c.bg, '--tone-ink': c.ink } as React.CSSProperties) : undefined)
export const folderById = (id: string) => FOLDERS.find((f) => f.id === id)

export interface WorkedExample {
  topic: string
  title: string
  formula: string // LaTeX
  prompt: string
  steps: string[] // may contain inline $LaTeX$
  hint: string
  triangle: { A: string; B: string; C: string; a: string; b: string; c: string; angleA?: string; angleB?: string; angleC?: string }
}

export const EXAMPLES: Record<string, WorkedExample> = {
  'law-of-sines': {
    topic: 'law-of-sines',
    title: 'Start with an opposite pair',
    formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B}',
    prompt: 'Find side b when A = 30°, B = 45°, and a = 8.',
    steps: [
      'Match each side to its opposite angle.',
      'Substitute: $\\frac{8}{\\sin 30^\\circ} = \\frac{b}{\\sin 45^\\circ}$',
      'Multiply by $\\sin 45^\\circ$: $b = 8\\sqrt{2} \\approx 11.3$',
    ],
    hint: 'Start by circling a known side–angle pair.',
    triangle: { A: 'A', B: 'B', C: 'C', a: 'a = 8', b: 'b = ?', c: '', angleA: '30°', angleB: '45°' },
  },
  'law-of-cosines': {
    topic: 'law-of-cosines',
    title: 'Use the angle between the sides',
    formula: 'c^2 = a^2 + b^2 - 2ab\\cos C',
    prompt: 'Find side c when a = 5, b = 7, and C = 60°.',
    steps: [
      'C is the angle between sides a and b.',
      'Substitute: $c^2 = 5^2 + 7^2 - 2(5)(7)\\cos 60^\\circ$',
      'Simplify: $c^2 = 39$, so $c = \\sqrt{39} \\approx 6.2$',
    ],
    hint: 'Start by marking the angle between the given sides.',
    triangle: { A: 'A', B: 'B', C: 'C', a: 'a = 5', b: 'b = 7', c: 'c = ?', angleC: '60°' },
  },
}

export const WORKSHEETS: Record<string, { title: string; pages: string[] }> = {
  'law-of-sines': { title: 'A Telltale Sign', pages: ['/assets/sines-p1.png', '/assets/sines-p2.png'] },
  'law-of-cosines': { title: '“Fixing” Pythagoras', pages: ['/assets/cosines-p1.png', '/assets/cosines-p2.png'] },
}

const t0 = '2026-11-02T15:00:00Z'
const base = { class_code: '*', student_work: [], created_at: t0, updated_at: t0, builtIn: true }

export const BUILT_IN_NOTES: Note[] = [
  {
    ...base,
    created_at: '2026-11-20T15:00:00Z',
    updated_at: '2026-11-20T15:00:00Z',
    id: 'lesson-5-1-board',
    topic: 'law-of-sines',
    lesson: 'LESSON 5.1',
    title: 'Lesson 5.1 Board Notes',
    kind: 'Board notes',
    lines: [
      { type: 'text', value: 'Law of Sines works for any triangle, not just right triangles.' },
      { type: 'math', value: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}' },
      { type: 'text', value: 'Each side goes with the angle across from it.' },
      { type: 'text', value: 'Use it when you know a side and the angle across from it.' },
      { type: 'text', value: 'The three angles add to 180°.' },
      { type: 'math', value: 'A + B + C = 180^\\circ' },
      { type: 'text', value: 'Example: A = 30°, B = 45°, a = 8. Find b.' },
      { type: 'math', value: '\\frac{8}{\\sin 30^\\circ} = \\frac{b}{\\sin 45^\\circ}' },
      { type: 'math', value: 'b = \\frac{8 \\sin 45^\\circ}{\\sin 30^\\circ} \\approx 11.3' },
    ],
  },
  {
    ...base,
    created_at: '2026-11-20T15:00:00Z',
    updated_at: '2026-11-20T15:00:00Z',
    id: 'lesson-5-3-board',
    topic: 'law-of-cosines',
    lesson: 'LESSON 5.3',
    title: 'Lesson 5.3 Board Notes',
    kind: 'Board notes',
    lines: [
      { type: 'text', value: 'Pythagoras only works for right triangles. For any triangle:' },
      { type: 'math', value: 'c^2 = a^2 + b^2 - 2ab\\cos C' },
      { type: 'text', value: 'C is the angle between sides a and b.' },
      { type: 'text', value: 'Use it when you know two sides and the angle between them, or all three sides.' },
      { type: 'text', value: 'Example: a = 5, b = 7, C = 60°. Find c.' },
      { type: 'math', value: 'c^2 = 5^2 + 7^2 - 2(5)(7)\\cos 60^\\circ = 39' },
      { type: 'math', value: 'c = \\sqrt{39} \\approx 6.2' },
    ],
  },
  {
    ...base,
    id: 'radians-and-degrees',
    topic: 'radians-degrees',
    title: 'Radians and Degrees',
    kind: 'Class notes',
    lines: [
      { type: 'text', value: 'A full turn is 360° or 2π radians.' },
      { type: 'math', value: '360^\\circ = 2\\pi' },
      { type: 'text', value: 'Multiply degrees by π/180 to convert to radians.' },
      { type: 'math', value: '60^\\circ \\times \\frac{\\pi}{180} = \\frac{\\pi}{3}' },
    ],
  },
  {
    ...base,
    id: 'intro-unit-circle',
    topic: 'unit-circle',
    title: 'Introduction to the Unit Circle',
    kind: 'Slides',
    lines: [
      { type: 'text', value: 'The unit circle has radius 1.' },
      { type: 'text', value: 'At angle θ, the point is (cos θ, sin θ).' },
      { type: 'math', value: '(x, y) = (\\cos\\theta, \\sin\\theta)' },
      { type: 'text', value: 'Cosine is the horizontal coordinate. Sine is the vertical coordinate.' },
    ],
  },
  {
    ...base,
    id: 'unit-circle-board',
    topic: 'unit-circle',
    title: 'Unit Circle Board Notes',
    kind: 'Board notes',
    lines: [
      { type: 'text', value: 'Points on the unit circle' },
      { type: 'math', value: 'x = \\cos\\theta \\qquad y = \\sin\\theta' },
      { type: 'text', value: 'At θ = π/3, the point is:' },
      { type: 'math', value: '\\left(\\tfrac{1}{2}, \\tfrac{\\sqrt{3}}{2}\\right)' },
    ],
  },
  {
    ...base,
    id: 'reading-trig-graphs',
    topic: 'trig-graphs',
    title: 'Reading Trig Graphs',
    kind: 'Slides',
    lines: [
      { type: 'text', value: 'Plot the y-coordinate as the angle increases.' },
      { type: 'text', value: 'At 0, π/2, π, 3π/2, and 2π, sine is 0, 1, 0, −1, and 0.' },
      { type: 'text', value: 'The graph repeats after one full turn.' },
    ],
  },
  {
    ...base,
    id: 'special-angles-practice',
    topic: 'special-angles',
    title: 'Special Angles Practice',
    kind: 'Handout',
    lines: [
      { type: 'text', value: 'Mark π/6, π/4, and π/3 on a unit circle.' },
      { type: 'text', value: 'Use a reference triangle to find each pair of coordinates.' },
      { type: 'text', value: 'Check: at π/4, both coordinates are √2/2.' },
      { type: 'math', value: '\\left(\\tfrac{\\sqrt{2}}{2}, \\tfrac{\\sqrt{2}}{2}\\right)' },
    ],
  },
]
