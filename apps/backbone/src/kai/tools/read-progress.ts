import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as sessionService from '../../services/session-service.js';

export const readProgress = tool(
  async ({ slug }) => {
    const progress = await sessionService.getProgress(slug);
    return progress || 'Nenhum progresso registrado ainda.';
  },
  {
    name: 'read_progress',
    description:
      'Lê o agent-progress.txt do projeto — registro acumulado de tudo que o agente fez, decisões tomadas, rotações de contexto e erros. Use para entender o histórico completo de desenvolvimento, diagnosticar problemas recorrentes, ou quando o usuário pergunta "o que aconteceu?". Retorna texto puro.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto'),
    }),
  },
);
