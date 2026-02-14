import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as projectService from '../../services/project-service.js';

export const initWorkspace = tool(
  async ({ slug }) => {
    const result = await projectService.initWorkspace(slug);
    return JSON.stringify(result);
  },
  {
    name: 'init_workspace',
    description:
      'Inicializa o workspace de um projeto — cria diretórios, gera agent-harness.json, copia scripts do harness, gera commands. Use quando o usuário criou um projeto e quer prepará-lo para execução, ou quando o status do projeto é "not_initialized". NÃO use se o workspace já está inicializado.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto a inicializar'),
    }),
  },
);
