import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Lets `npm run dev` serve /api/ocr locally with the same code Vercel runs,
// so you don't need `vercel dev`. Reads ANTHROPIC_API_KEY from .env.local.
function localApi(env: Record<string, string>): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/ocr', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        let body = ''
        for await (const chunk of req) body += chunk
        res.setHeader('Content-Type', 'application/json')
        try {
          const { runOcr, splitDataUrl } = await server.ssrLoadModule('/server/ocr.ts')
          const { image, mode } = JSON.parse(body)
          const { mediaType, base64 } = splitDataUrl(image)
          const result = await runOcr({
            imageBase64: base64,
            mediaType,
            mode,
            apiKey: env.ANTHROPIC_API_KEY,
            model: env.ANTHROPIC_MODEL,
          })
          res.end(JSON.stringify(result))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApi(env)],
  }
})
