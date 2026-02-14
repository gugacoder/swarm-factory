import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as projectService from '../../services/project-service.js';

export const adjustParams = tool(
  async ({ slug, maxTurns, model, maxRetries }) => {
    const result = await projectService.update(slug, {
      max_turns: maxTurns,
      model,
      max_retries: maxRetries,
    });
    return JSON.stringify(result);
  },
  {
    name: 'adjust_params',
    description:
      'Ajusta parâmetros do projeto para a próxima iteração do loop. Permite alterar max_turns (limite de turns por sessão), model (modelo LLM) e max_retries (tentativas antes de rotação de contexto). Use quando o usuário quer otimizar o loop, trocar de modelo, ou ajustar limites. NÃO use para alterar nome, slug ou workspace — esses são imutáveis.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto'),
      maxTurns: z.number().optional().describe('Novo limite de turns por sessão'),
      model: z.string().optional().describe('Novo modelo LLM (ex: "claude-sonnet-4-5-20250929")'),
      maxRetries: z.number().optional().describe('Novo limite de retries antes de rotação'),
    }),
  },
);
