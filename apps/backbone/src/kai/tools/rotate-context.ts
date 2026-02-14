import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as projectService from '../../services/project-service.js';

export const rotateContext = tool(
  async ({ slug, featureId }) => {
    const result = await projectService.rotateFeature(slug, featureId);
    return JSON.stringify(result);
  },
  {
    name: 'rotate_context',
    description:
      'Rotaciona o contexto de uma feature travada — reseta o status para failing e zera retries, permitindo que o loop tente novamente com contexto limpo. Use quando uma feature está com muitas falhas consecutivas, o usuário pede para resetar, ou como parte de um diagnóstico. Requer slug do projeto e ID da feature (ex: "F-021"). NÃO use em features com status passing — isso perderia progresso.',
    schema: z.object({
      slug: z.string().describe('Slug do projeto'),
      featureId: z.string().describe('ID da feature (ex: "F-021")'),
    }),
  },
);
