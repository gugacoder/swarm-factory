import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as projectService from '../../services/project-service.js';

export const listProjects = tool(
  async () => {
    const projects = await projectService.list();
    return JSON.stringify(projects);
  },
  {
    name: 'list_projects',
    description:
      'Lista todos os projetos da fábrica com slug, nome, harness e formato. Use quando o usuário quer ver quais projetos existem, perguntar sobre o estado geral da fábrica, ou antes de agir sobre um projeto específico. NÃO use para obter detalhes de um projeto individual — use get_status para isso.',
    schema: z.object({}),
  },
);
