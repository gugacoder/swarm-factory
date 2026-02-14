import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.HUB_PORT || '8100'),
    host: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.BACKBONE_PORT || '8101'}`,
        changeOrigin: true,
      },
    },
  },
});
