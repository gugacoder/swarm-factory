import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as projectService from '../../services/project-service.js';

export const createProject = tool(
  async ({ slug, name, workspace, specs, harness }) => {
    const result = await projectService.create({ slug, name, workspace, specs, harness });
    return JSON.stringify(result);
  },
  {
    name: 'create_project',
    description:
      'Cria um novo projeto na fábrica. Requer slug (kebab-case), nome, workspace (path absoluto do código), specs (path dos PRPs/specs), e harness (claude-code, opencode ou codex). Use quando o usuário quer criar um projeto novo. NÃO use se o projeto já existe — verifique antes com list_projects.',
    schema: z.object({
      slug: z.string().describe('Slug único em kebab-case (ex: "meu-app-v1")'),
      name: z.string().describe('Nome legível do projeto'),
      workspace: z.string().describe('Path absoluto do diretório do código'),
      specs: z.string().describe('Path absoluto do diretório de specs/PRPs'),
      harness: z.string().describe('Tipo de harness: "claude-code", "opencode" ou "codex"'),
    }),
  },
);
