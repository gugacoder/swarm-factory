import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as loopService from '../../services/loop-service.js';

export const stopLoop = tool(
  async ({ slug, force }) => {
    const result = await loopService.stop(slug, force);
    return JSON.stringify(result);
  },
  {
    name: 'stop_loop',
    description:
      'Para o loop autônomo de um projeto. Por padrão faz graceful stop (cria arquivo .stop, o loop para após terminar a feature atual). Com force=true mata o processo imediatamente. Use quando o usuário quer parar o desenvolvimento ou quando algo está errado. Prefira graceful (sem force) a menos que o usuário peça explicitamente para forçar.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto'),
      force: z
        .boolean()
        .optional()
        .default(false)
        .describe('Se true, mata o processo imediatamente em vez de graceful stop'),
    }),
  },
);
