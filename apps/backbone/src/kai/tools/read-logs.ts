import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as loopService from '../../services/loop-service.js';

export const readLogs = tool(
  async ({ slug, tail }) => {
    const logs = await loopService.getLogs(slug, tail);
    return logs || 'Nenhum log disponível.';
  },
  {
    name: 'read_logs',
    description:
      'Lê as últimas linhas de log do loop ativo de um projeto. Use para monitorar o que o loop está fazendo agora, ou para ver saída recente. Parâmetro tail opcional limita o número de linhas retornadas (default: todas). Use com tail=50 para ver apenas as últimas 50 linhas.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto'),
      tail: z.number().optional().describe('Número de linhas a retornar (últimas N linhas)'),
    }),
  },
);
