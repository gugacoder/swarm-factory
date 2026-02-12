import { serve } from '@hono/node-server';
import app from './app.js';
import { eventService } from './services/event-service.js';
import { startWatching } from './services/watcher-service.js';

const port = parseInt(process.env.BACKBONE_PORT || '9090');

// Iniciar serviços de real-time
eventService.start();
startWatching().catch((err) => {
  console.error('[watcher] Erro ao iniciar monitoramento:', err.message);
});

console.log(`Backbone rodando na porta ${port}`);
serve({ fetch: app.fetch, port });
