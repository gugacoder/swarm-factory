import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { sneakPeekPlugin } from './src/plugin'

const workspace = path.resolve(__dirname, '..')
const runsDir = path.resolve(workspace, 'runs')

export default defineConfig({
  plugins: [react(), sneakPeekPlugin(workspace, runsDir)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8081,
    host: true,
  },
})
