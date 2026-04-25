import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const clientDir = join(__dirname, 'dist/client')

const mimeTypes = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

const { default: app } = await import('./dist/server/server.js')

const server = createServer(async (req, res) => {
  // Try to serve static file from dist/client
  const filePath = join(clientDir, req.url.split('?')[0])
  if (existsSync(filePath) && !filePath.endsWith('/')) {
    try {
      const data = await readFile(filePath)
      const ext = extname(filePath)
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
        'Cache-Control': req.url.includes('/assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache'
      })
      res.end(data)
      return
    } catch {}
  }

  // Fall through to SSR handler
  const request = new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method)
      ? undefined
      : await new Promise((resolve) => {
          const chunks = []
          req.on('data', (c) => chunks.push(c))
          req.on('end', () => resolve(Buffer.concat(chunks)))
        })
  })

  const response = await app.fetch(request)
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(Buffer.from(await response.arrayBuffer()))
})

const port = process.env.PORT ?? 3000
const host = process.env.HOST ?? '0.0.0.0'
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`)
})
