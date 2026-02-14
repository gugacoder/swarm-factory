import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as projectService from '../../services/project-service.js';

export const getStatus = tool(
  async ({ slug }) => {
    const status = await projectService.getStatus(slug);
    return JSON.stringify(status);
  },
  {
    name: 'get_status',
    description:
      'Obtém status detalhado de um projeto: estado do workspace (not_initialized, initialized, idle, running), informações do loop (PID, iteração), contagem de features por status e progresso percentual. Use quando o usuário pergunta sobre um projeto específico, quer saber se o loop está rodando, ou quer ver o progresso. Requer o slug do projeto.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto (ex: "meu-projeto")'),
    }),
  },
);
