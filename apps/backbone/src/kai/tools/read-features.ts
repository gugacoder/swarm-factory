import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as projectService from '../../services/project-service.js';

export const readFeatures = tool(
  async ({ slug }) => {
    const features = await projectService.getFeatures(slug);
    return JSON.stringify(features);
  },
  {
    name: 'read_features',
    description:
      'Lê o features.json do projeto com status de cada feature (passing, failing, pending, blocked, skipped, in_progress), prioridade e dependências. Use para diagnósticos, ver quais features estão travadas, entender o pipeline de desenvolvimento, ou antes de recomendar ações. Retorna array completo de features.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto'),
    }),
  },
);
