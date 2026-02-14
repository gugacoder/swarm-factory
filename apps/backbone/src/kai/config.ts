import { ChatOpenAI } from '@langchain/openai';

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const PRIMARY_MODEL = 'google/gemini-2.0-flash-001';
export const RESPONSE_MODEL = 'anthropic/claude-3-haiku';
export const FALLBACK_MODEL = 'openai/gpt-4o-mini';

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY não configurada');
  return key;
}

export function createModel(model: string, temperature = 0): ChatOpenAI {
  return new ChatOpenAI({
    model,
    temperature,
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
      apiKey: getApiKey(),
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:8100',
        'X-Title': 'E-Kai',
      },
    },
  });
}

export function getPrimaryModel(): ChatOpenAI {
  return createModel(PRIMARY_MODEL);
}

export function getResponseModel(): ChatOpenAI {
  return createModel(RESPONSE_MODEL, 0.7);
}

export function getFallbackModel(): ChatOpenAI {
  return createModel(FALLBACK_MODEL, 0.7);
}
