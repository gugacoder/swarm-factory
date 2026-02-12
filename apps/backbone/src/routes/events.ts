import { Hono } from 'hono';
import { eventService, type SSEEvent } from '../services/event-service.js';
import type { UserPayload } from '../services/auth-service.js';

type Env = { Variables: { user: UserPayload } };

const events = new Hono<Env>();

// GET /api/events — SSE endpoint autenticado
events.get('/', (c) => {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  function write(text: string) {
    writer.write(encoder.encode(text)).catch(() => {
      // Client desconectou
    });
  }

  // Enviar evento SSE formatado
  function sendEvent(event: SSEEvent) {
    if (event.type === 'heartbeat') {
      write(`: keepalive\n\n`);
    } else {
      write(`id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
    }
  }

  // Registrar client
  const clientId = eventService.addClient(sendEvent, () => {
    writer.close().catch(() => {});
  });

  // Enviar comment inicial para confirmar conexão
  write(`: connected\n\n`);

  // Cleanup quando client desconecta
  c.req.raw.signal.addEventListener('abort', () => {
    eventService.removeClient(clientId);
    writer.close().catch(() => {});
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
});

export default events;
