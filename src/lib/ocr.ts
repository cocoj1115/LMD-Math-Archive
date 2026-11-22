import type { Line } from './types'

export interface OcrResult {
  title: string
  concept: string
  diagram?: string
  lines: Line[]
}

export async function transcribe(image: string, mode: 'board' | 'student'): Promise<OcrResult> {
  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, mode }),
  })
  const data = await res.json().catch(() => ({ error: `Transcription failed (${res.status})` }))
  if (!res.ok) throw new Error(data.error || `Transcription failed (${res.status})`)
  return data as OcrResult
}
