// Shared OCR logic used by both the Vercel function (api/ocr.ts)
// and the local dev server (vite.config.ts). Runs on the server only:
// the Anthropic API key never reaches the browser.
import Anthropic from '@anthropic-ai/sdk'

export type OcrMode = 'board' | 'student'

export interface OcrLine {
  type: 'text' | 'math'
  /** Plain text for text lines, LaTeX (no $ delimiters) for math lines */
  value: string
  /** true when the model was unsure about this line, so the teacher should check it */
  uncertain?: boolean
}

export interface OcrResult {
  title: string
  concept: string
  lines: OcrLine[]
  /** short description of any diagram in the photo (kept as an image, described for accessibility) */
  diagram?: string
}

const CONCEPTS = [
  'law-of-sines',
  'law-of-cosines',
  'unit-circle',
  'radians-degrees',
  'trig-graphs',
  'special-angles',
]

const PROMPTS: Record<OcrMode, string> = {
  board: `This is a photo of a high school Math 3 teacher's whiteboard or chalkboard (trigonometry unit: Law of Sines, Law of Cosines, unit circle, radians, trig graphs, special angles).
Transcribe EVERYTHING written on the board, top to bottom, left to right, as a list of lines.
- Each formula or equation is its own "math" line, written in LaTeX (no $ signs). Use \\sin, \\cos, \\theta, \\frac, ^\\circ etc.
- Words and sentences are "text" lines. If a line mixes words and a formula, split it into a text line and a math line.
- Do NOT fix or improve the teacher's math. Transcribe what is written, even if it looks wrong.
- Set "uncertain": true on any line where the handwriting is hard to read or you had to guess.
- If there is a diagram (triangle, unit circle, graph), describe it in one sentence in "diagram", including labels you can read.
- "title": a short title a teacher would give these notes (e.g. "Law of Cosines — SAS example").
- "concept": the best match from this list: ${CONCEPTS.join(', ')}.`,
  student: `This is a photo of a high school student's handwritten homework attempt (trigonometry: Law of Sines, Law of Cosines, unit circle, etc.).
Transcribe the student's work line by line, exactly as written, including mistakes. Do NOT correct it and do NOT solve the problem.
- Each formula/equation step is a "math" line in LaTeX (no $ signs). Words are "text" lines.
- Set "uncertain": true on lines that are hard to read.
- If there is a diagram, describe it in one sentence in "diagram".
- "title": a short label like "Attempt at Law of Cosines problem".
- "concept": the best match from this list: ${CONCEPTS.join(', ')}.`,
}

const FORMAT = `Reply with ONLY a JSON object, no markdown fences, in exactly this shape:
{"title": string, "concept": string, "diagram": string, "lines": [{"type": "text" | "math", "value": string, "uncertain": boolean}]}`

export async function runOcr(opts: {
  imageBase64: string
  mediaType: string
  mode: OcrMode
  apiKey: string | undefined
  model?: string
}): Promise<OcrResult> {
  if (!opts.apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to .env.local (local) or Vercel → Settings → Environment Variables.')
  }
  const client = new Anthropic({ apiKey: opts.apiKey })
  const msg = await client.messages.create({
    model: opts.model || 'claude-sonnet-5-5',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: opts.mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: opts.imageBase64,
            },
          },
          { type: 'text', text: `${PROMPTS[opts.mode]}\n\n${FORMAT}` },
        ],
      },
    ],
  })

  const text = msg.content
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('')
    .trim()
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
  let parsed: OcrResult
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Could not read the transcription. Try a clearer photo.')
  }
  return {
    title: parsed.title || 'Board notes',
    concept: CONCEPTS.includes(parsed.concept) ? parsed.concept : 'law-of-cosines',
    diagram: parsed.diagram || '',
    lines: (parsed.lines || [])
      .filter((l) => l && typeof l.value === 'string' && l.value.trim())
      .map((l) => ({ type: l.type === 'math' ? 'math' : 'text', value: l.value, uncertain: !!l.uncertain })),
  }
}

/** Accepts a data URL ("data:image/jpeg;base64,...") and splits it. */
export function splitDataUrl(dataUrl: string): { mediaType: string; base64: string } {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl)
  if (!m) throw new Error('Image must be a base64 data URL')
  return { mediaType: m[1], base64: m[2] }
}
