import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

function hubPlugin(): PluginOption {
  return {
    name: 'hub-routes',
    configureServer(server) {
      server.middlewares.use('/hub/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ status: 'ok' }))
      })
      server.middlewares.use('/', (req, res, next) => {
        if (req.url === '/' || req.url === '') {
          res.writeHead(302, { Location: '/hub' })
          res.end()
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  base: '/hub/',
  plugins: [react(), hubPlugin()],
  server: {
    port: parseInt(process.env.HUB_PORT || '9000'),
    host: true,
    proxy: {
      '/health': {
        target: `http://localhost:${process.env.BACKBONE_PORT || '9090'}`,
      },
      '/backbone': {
        target: `http://localhost:${process.env.BACKBONE_PORT || '9090'}`,
      },
      '/landing': {
        target: `http://localhost:${process.env.LANDING_PORT || '3000'}`,
      },
    },
  },
})
