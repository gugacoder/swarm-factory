import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as sessionService from '../../services/session-service.js';

export const readSession = tool(
  async ({ slug, sessionId }) => {
    const events = await sessionService.get(slug, sessionId);
    // Limitar a últimos 50 eventos para não estourar contexto
    const limited = events.slice(-50);
    return JSON.stringify({
      total_events: events.length,
      showing_last: limited.length,
      events: limited,
    });
  },
  {
    name: 'read_session',
    description:
      'Lê o output.jsonl de uma sessão específica — timeline de eventos do agente (tool calls, mensagens, erros). Use para diagnóstico quando uma feature falhou e o usuário quer entender o que aconteceu. Requer slug do projeto e sessionId (geralmente o ID da feature, ex: "F-021"). Retorna os últimos 50 eventos.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto'),
      sessionId: z.string().describe('ID da sessão (geralmente ID da feature, ex: "F-021")'),
    }),
  },
);
