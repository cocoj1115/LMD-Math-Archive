// Vercel serverless function: POST /api/ocr  { image: dataURL, mode: 'board' | 'student' }
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runOcr, splitDataUrl, type OcrMode } from '../server/ocr.js'

export const config = { maxDuration: 60 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  try {
    const { image, mode } = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
      image: string
      mode: OcrMode
    }
    const { mediaType, base64 } = splitDataUrl(image)
    const result = await runOcr({
      imageBase64: base64,
      mediaType,
      mode: mode === 'student' ? 'student' : 'board',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL,
    })
    res.status(200).json(result)
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
}
