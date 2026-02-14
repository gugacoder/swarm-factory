import { StateGraph, Annotation, END } from '@langchain/langgraph';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { getPrimaryModel, getResponseModel, getFallbackModel } from './config.js';
import { SYSTEM_PROMPT, CLASSIFY_PROMPT, REASON_PROMPT } from './prompts.js';

// Tools
import { listProjects } from './tools/list-projects.js';
import { getStatus } from './tools/get-status.js';
import { createProject } from './tools/create-project.js';
import { initWorkspace } from './tools/init-workspace.js';
import { startLoop } from './tools/start-loop.js';
import { stopLoop } from './tools/stop-loop.js';
import { readFeatures } from './tools/read-features.js';
import { readSession } from './tools/read-session.js';
import { readProgress } from './tools/read-progress.js';
import { readLogs } from './tools/read-logs.js';
import { adjustParams } from './tools/adjust-params.js';
import { rotateContext } from './tools/rotate-context.js';

// Mapa de tools por nome
const TOOLS_MAP: Record<string, any> = {
  list_projects: listProjects,
  get_status: getStatus,
  create_project: createProject,
  init_workspace: initWorkspace,
  start_loop: startLoop,
  stop_loop: stopLoop,
  read_features: readFeatures,
  read_session: readSession,
  read_progress: readProgress,
  read_logs: readLogs,
  adjust_params: adjustParams,
  rotate_context: rotateContext,
};

const ALL_TOOLS = Object.values(TOOLS_MAP);

// State annotation
const KaiState = Annotation.Root({
  message: Annotation<string>(),
  conversationHistory: Annotation<Array<{ role: string; content: string }>>({
    reducer: (_, v) => v,
    default: () => [],
  }),
  intent: Annotation<string>({
    reducer: (_, v) => v,
    default: () => '',
  }),
  toolsToUse: Annotation<Array<{ name: string; args: Record<string, any> }>>({
    reducer: (_, v) => v,
    default: () => [],
  }),
  toolResults: Annotation<Array<{ name: string; result: string; duration_ms: number; status: string }>>({
    reducer: (_, v) => v,
    default: () => [],
  }),
  response: Annotation<string>({
    reducer: (_, v) => v,
    default: () => '',
  }),
  error: Annotation<string>({
    reducer: (_, v) => v,
    default: () => '',
  }),
});

// Node: classify
async function classify(state: typeof KaiState.State) {
  try {
    const model = getPrimaryModel();
    const messages = [
      new SystemMessage(CLASSIFY_PROMPT),
      new HumanMessage(state.message),
    ];
    const result = await model.invoke(messages);
    const content = typeof result.content === 'string' ? result.content : '';
    const intent = content.trim().toLowerCase().replace(/[^a-z_]/g, '');

    const validIntents = ['greeting', 'query', 'action', 'diagnostic', 'recommendation'];
    return { intent: validIntents.includes(intent) ? intent : 'query' };
  } catch (e: any) {
    return { error: `Erro na classificação: ${e.message}`, intent: 'greeting' };
  }
}

// Node: reason
async function reason(state: typeof KaiState.State) {
  if (state.intent === 'greeting') {
    return { toolsToUse: [] };
  }

  try {
    const model = getPrimaryModel();

    const toolDescriptions = ALL_TOOLS.map(
      (t) => `- ${t.name}: ${t.description}`,
    ).join('\n');

    const messages = [
      new SystemMessage(
        `${REASON_PROMPT}\n\n## Tools disponíveis\n\n${toolDescriptions}\n\nResponda APENAS com JSON array: [{"name": "tool_name", "args": {...}}].\nSe nenhuma tool for necessária, responda com [].`,
      ),
      new HumanMessage(
        `Intenção: ${state.intent}\nMensagem: ${state.message}`,
      ),
    ];

    const result = await model.invoke(messages);
    const content = typeof result.content === 'string' ? result.content : '';

    // Extrair JSON do response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        // Filtrar tools válidas
        const valid = parsed.filter(
          (t: any) => t.name && TOOLS_MAP[t.name],
        );
        return { toolsToUse: valid };
      }
    }

    return { toolsToUse: [] };
  } catch (e: any) {
    return { error: `Erro no reasoning: ${e.message}`, toolsToUse: [] };
  }
}

// Node: act
async function act(state: typeof KaiState.State) {
  const results: typeof state.toolResults = [];

  for (const toolCall of state.toolsToUse) {
    const toolFn = TOOLS_MAP[toolCall.name];
    if (!toolFn) {
      results.push({
        name: toolCall.name,
        result: `Tool "${toolCall.name}" não encontrada`,
        duration_ms: 0,
        status: 'error',
      });
      continue;
    }

    const start = Date.now();
    try {
      const result = await toolFn.invoke(toolCall.args || {});
      results.push({
        name: toolCall.name,
        result: typeof result === 'string' ? result : JSON.stringify(result),
        duration_ms: Date.now() - start,
        status: 'success',
      });
    } catch (e: any) {
      results.push({
        name: toolCall.name,
        result: e.message,
        duration_ms: Date.now() - start,
        status: 'error',
      });
    }
  }

  return { toolResults: results };
}

// Node: respond
async function respond(state: typeof KaiState.State) {
  try {
    let model;
    try {
      model = getResponseModel();
    } catch {
      model = getFallbackModel();
    }

    // Montar contexto com histórico + tool results
    const historyMessages = state.conversationHistory.map((m) =>
      m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
    );

    let contextInfo = '';
    if (state.error) {
      contextInfo += `\n\n[ERRO INTERNO]: ${state.error}`;
    }
    if (state.toolResults.length > 0) {
      contextInfo += '\n\n[RESULTADOS DAS FERRAMENTAS]:\n';
      for (const tr of state.toolResults) {
        contextInfo += `\n### ${tr.name} (${tr.status}, ${tr.duration_ms}ms)\n${tr.result}\n`;
      }
    }

    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...historyMessages,
      new HumanMessage(state.message + contextInfo),
    ];

    const result = await model.invoke(messages);
    const content = typeof result.content === 'string' ? result.content : '';

    return { response: content };
  } catch (e: any) {
    // Fallback absoluto
    try {
      const fallback = getFallbackModel();
      const result = await fallback.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(state.message),
      ]);
      const content = typeof result.content === 'string' ? result.content : '';
      return { response: content };
    } catch {
      return {
        response: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente em instantes.',
      };
    }
  }
}

// Conditional edge: reason → act ou skip (direto para respond)
function shouldAct(state: typeof KaiState.State): string {
  return state.toolsToUse.length > 0 ? 'act' : 'respond';
}

// Build graph
function buildGraph() {
  const graph = new StateGraph(KaiState)
    .addNode('classify', classify)
    .addNode('reason', reason)
    .addNode('act', act)
    .addNode('respond', respond)
    .addEdge('__start__', 'classify')
    .addEdge('classify', 'reason')
    .addConditionalEdges('reason', shouldAct, {
      act: 'act',
      respond: 'respond',
    })
    .addEdge('act', 'respond')
    .addEdge('respond', '__end__');

  return graph.compile();
}

// Singleton
let compiledGraph: ReturnType<typeof buildGraph> | null = null;

export function getKaiGraph() {
  if (!compiledGraph) {
    compiledGraph = buildGraph();
  }
  return compiledGraph;
}

export type KaiStateType = typeof KaiState.State;
export { KaiState };
