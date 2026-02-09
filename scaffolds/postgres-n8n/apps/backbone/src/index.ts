import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { connect } from 'node:net'

const app = new Hono()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface CheckResult {
  status: 'ok' | 'down'
  latency: number
  port: number
}

async function httpCheck(url: string, port: number, timeout = 3000): Promise<CheckResult> {
  const start = Date.now()
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeout) })
    return { status: res.ok ? 'ok' : 'down', latency: Date.now() - start, port }
  } catch {
    return { status: 'down', latency: Date.now() - start, port }
  }
}

function tcpCheck(host: string, port: number, timeout = 3000): Promise<CheckResult> {
  return new Promise((resolve) => {
    const start = Date.now()
    const socket = connect(port, host, () => {
      socket.destroy()
      resolve({ status: 'ok', latency: Date.now() - start, port })
    })
    socket.setTimeout(timeout)
    socket.on('timeout', () => {
      socket.destroy()
      resolve({ status: 'down', latency: Date.now() - start, port })
    })
    socket.on('error', () => {
      socket.destroy()
      resolve({ status: 'down', latency: Date.now() - start, port })
    })
  })
}

// ---------------------------------------------------------------------------
// Redirect raiz → /backbone (acesso direto pela porta)
// ---------------------------------------------------------------------------
app.get('/', (c) => c.redirect('/backbone'))

// ---------------------------------------------------------------------------
// Health unificado — Caddy expõe em /health
// ---------------------------------------------------------------------------
app.get('/health', async (c) => {
  const env = (key: string, fallback: string) => process.env[key] || fallback

  const hubPort = parseInt(env('HUB_PORT', '9000'))
  const landingPort = parseInt(env('LANDING_PORT', '3000'))
  const pgPort = parseInt(env('POSTGRES_PORT', '5432'))
  const n8nPort = parseInt(env('N8N_PORT', '5678'))
  const bbPort = parseInt(env('BACKBONE_PORT', '9090'))

  const [hub, landing, postgres, n8n] = await Promise.all([
    httpCheck(`http://${env('HUB_HOST', 'localhost')}:${hubPort}/hub/health`, hubPort),
    httpCheck(`http://${env('LANDING_HOST', 'localhost')}:${landingPort}/landing/health`, landingPort),
    tcpCheck(env('POSTGRES_HOST', 'localhost'), pgPort),
    httpCheck(`http://${env('N8N_HOST', 'localhost')}:${n8nPort}/healthz`, n8nPort),
  ])

  const backbone: CheckResult = { status: 'ok', latency: 0, port: bbPort }

  const services = { hub, backbone, landing, postgres, n8n }
  const allOk = Object.values(services).every((s) => s.status === 'ok')

  return c.json(
    { status: allOk ? 'ok' : 'degraded', services },
    allOk ? 200 : 503,
  )
})

// ---------------------------------------------------------------------------
// Backbone routes
// ---------------------------------------------------------------------------
const api = new Hono()

api.get('/', (c) => c.text('Backbone'))
api.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/backbone', api)

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const port = parseInt(process.env.BACKBONE_PORT || '9090')
console.log(`Backbone rodando na porta ${port}`)
serve({ fetch: app.fetch, port })
