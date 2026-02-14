import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as loopService from '../../services/loop-service.js';

export const startLoop = tool(
  async ({ slug, maxTurns, model }) => {
    const result = await loopService.start(slug, { maxTurns, model });
    return JSON.stringify(result);
  },
  {
    name: 'start_loop',
    description:
      'Inicia o loop autônomo Ralph Wiggum de um projeto. O loop seleciona features elegíveis e spawna o agente para implementá-las uma a uma. Use quando o usuário quer iniciar o desenvolvimento autônomo. Parâmetros opcionais: maxTurns (limite de turns por sessão), model (modelo LLM a usar). NÃO use se o loop já está rodando — verifique com get_status primeiro.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto'),
      maxTurns: z.number().optional().describe('Limite de turns por sessão do agente'),
      model: z.string().optional().describe('Modelo LLM a usar (ex: "claude-sonnet-4-5-20250929")'),
    }),
  },
);
