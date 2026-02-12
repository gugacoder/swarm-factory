# PRP-006 — Backend Kai Agent (LangGraph)

## Objetivo

Implementar o agent copilot Kai como graph LangGraph.js com 12 tools, endpoint de chat com streaming, e registro de execucoes.

## Execution Mode

`implementar`

## Contexto

O PRP-004 criou os services de projetos/loops/sessoes. O PRP-002 criou as tabelas `kai_conversations`, `kai_messages`, `kai_tool_calls` e `kai_executions`. A arquitetura do agent esta definida em `design.md` secao Kai com graph `classify → reason → [act | skip] → respond`. As refs de LangGraph estao em `04-refs/agents/langgraph-agents.md` com exemplos de tools, graph state, structured output e OpenRouter config. Modelo primario: `google/gemini-2.0-flash-001`. Modelo de resposta: `anthropic/claude-3-haiku`. Provider: OpenRouter.

## Especificacao

### Dependencias

Instalar em `apps/backbone`: `@langchain/langgraph`, `@langchain/openai`, `@langchain/core`

### Kai Config (apps/backbone/src/kai/config.ts)

- `OPENROUTER_API_KEY` do env
- `PRIMARY_MODEL`: `google/gemini-2.0-flash-001` (classificacao e reasoning)
- `RESPONSE_MODEL`: `anthropic/claude-3-haiku` (geracao de resposta)
- `FALLBACK_MODEL`: `openai/gpt-4o-mini`
- OpenRouter base URL: `https://openrouter.ai/api/v1`
- Instanciar `ChatOpenAI` com `configuration.baseURL` e `configuration.apiKey` conforme ref `langgraph-agents.md` secao 6

### Kai Tools (apps/backbone/src/kai/tools/)

12 tools, cada uma em arquivo separado, usando `tool()` de `@langchain/core/tools` com schema Zod. Cada tool chama o service correspondente do PRP-004.

| Arquivo | Tool name | Input | Descricao para o LLM |
|---------|-----------|-------|----------------------|
| list-projects.ts | list_projects | nenhum | Lista todos os projetos da fabrica com slug, nome, harness e formato |
| get-status.ts | get_status | `{ slug }` | Obtem status detalhado de um projeto: estado, loop, contagem de features, progresso |
| create-project.ts | create_project | `{ slug, name, workspace, specs, harness }` | Cria um novo projeto na fabrica |
| init-workspace.ts | init_workspace | `{ slug }` | Inicializa o workspace de um projeto (diretorios, harness, commands) |
| start-loop.ts | start_loop | `{ slug, maxTurns?, model? }` | Inicia o loop autonomo Ralph Wiggum de um projeto |
| stop-loop.ts | stop_loop | `{ slug, force? }` | Para o loop de um projeto. force=true mata imediatamente |
| read-features.ts | read_features | `{ slug }` | Le features.json do projeto com status de cada feature |
| read-session.ts | read_session | `{ slug, sessionId }` | Le output.jsonl de uma sessao especifica (timeline de eventos) |
| read-progress.ts | read_progress | `{ slug }` | Le agent-progress.txt do projeto (progresso acumulado) |
| read-logs.ts | read_logs | `{ slug, tail? }` | Le ultimas linhas de log do loop ativo |
| adjust-params.ts | adjust_params | `{ slug, maxTurns?, model?, maxRetries? }` | Ajusta parametros do projeto para proxima iteracao |
| rotate-context.ts | rotate_context | `{ slug, featureId }` | Rotaciona contexto de uma feature travada (limpa estado, reinicia) |

Cada descricao de tool deve ser detalhada e indicar quando usar/nao usar, conforme best practices da ref `langgraph-agents.md` secao 1.

### Kai Prompts (apps/backbone/src/kai/prompts.ts)

- `SYSTEM_PROMPT`: Define Kai como copilot da fabrica de software. Tom amigavel mas preciso. Responde em pt-BR. Explica o que faz antes de agir. Menciona dados concretos (numeros, slugs, status).
- `CLASSIFY_PROMPT`: Classifica intent da mensagem (query, action, diagnostic, recommendation, greeting)
- `REASON_PROMPT`: Decide tools baseado na intent e no conteudo. Regras: greeting = nenhuma tool; query = tools de leitura; action = tools de escrita; diagnostic = read_features + read_session + read_progress + read_logs.

### Kai Agent Graph (apps/backbone/src/kai/agent.ts)

Graph LangGraph conforme `design.md`:

```
__start__ → classify → reason → [act | skip] → respond → __end__
```

**State** conforme `design.md` secao Kai State (message, conversationHistory, intent, toolsToUse, toolResults, response, error).

**Nodes:**
- `classify` — usa PRIMARY_MODEL com structured output para extrair intent
- `reason` — usa PRIMARY_MODEL com structured output para decidir tools
- `act` — executa tools sequencialmente, coleta resultados com timing
- `respond` — usa RESPONSE_MODEL para gerar resposta final em linguagem natural, incluindo dados das tool results

**Conditional edge** entre reason e act/skip: se `toolsToUse` vazio, vai direto para respond.

**Error handling:** se qualquer node falha, setar `error` no state e prosseguir para respond com mensagem de fallback.

### Kai Route (apps/backbone/src/routes/kai.ts)

- `POST /api/kai/chat` — body `{ conversationId?, message }` (OSD241)
- Se `conversationId` nulo, cria nova conversa
- Salva mensagem do usuario em `kai_messages`
- Invoca o graph com a mensagem e historico
- Streaming via SSE: envia tokens parciais do node `respond` (OSD242)
- Apos conclusao, salva mensagem da Kai, tool calls e kai_execution no banco
- Response final: `{ conversationId, messageId }`

- `GET /api/kai/conversations` — lista conversas do usuario
- `GET /api/kai/conversations/:id/messages` — mensagens de uma conversa

### Registro de Execucoes (RNF020)

Para cada invocacao do graph, inserir em `kai_executions`: intent classificada, modelo usado, duracao total, numero de tools chamadas, sucesso/erro. Para cada tool call, inserir em `kai_tool_calls`: tool_name, input, output, duration_ms, status.

### Verificacao

POST para `/api/kai/chat` com message "liste meus projetos" retorna streaming de resposta com tool call `list_projects` visivel. Conversa persistida no banco.

## Limites

- Nao implementar modo proativo neste PRP (sera feito no PRP-011)
- Nao implementar UI do chat (sera feito no PRP-010)
- Nao criar tools alem das 12 listadas
- Nao usar LangChain agents pre-built (createReactAgent) — construir o graph manualmente com StateGraph
- Nao armazenar API keys no banco — ler do env
- Nao alterar services do PRP-004 — apenas importar e chamar
