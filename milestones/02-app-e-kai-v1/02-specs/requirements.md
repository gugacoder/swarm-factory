# E-Kai - Requisitos do Sistema

Requisitos no padrao OSD (O Sistema Deve) para o app de gestao PWA Mobile-First com copilot agentico Kai.

## Legenda

- **RF**: Requisito Funcional
- **RNF**: Requisito Nao Funcional

---

## Autenticacao e Usuarios

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD001 | O sistema deve permitir login com email e senha |
| OSD002 | O sistema deve manter sessao ativa via JWT com refresh token |
| OSD003 | O sistema deve permitir logout com invalidacao do refresh token |
| OSD004 | O sistema deve exibir perfil do usuario logado com nome e email |
| OSD005 | O sistema deve permitir alteracao de senha pelo usuario |

---

## Projetos

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD020 | O sistema deve listar todos os projetos com slug, nome, harness e formato |
| OSD021 | O sistema deve criar um novo projeto com slug, nome, workspace, specs, harness e parametros |
| OSD022 | O sistema deve validar o project.json contra o schema antes de salvar |
| OSD023 | O sistema deve impedir criacao de projeto com slug duplicado |
| OSD024 | O sistema deve permitir edicao dos parametros de um projeto (max_turns, max_iterations, max_features, max_retries, model) |
| OSD025 | O sistema deve exibir detalhes de um projeto incluindo paths resolvidos e configuracao do agente |
| OSD026 | O sistema deve permitir exclusao de um projeto (com confirmacao) |
| OSD027 | O sistema deve permitir selecao do harness (claude-code, opencode, codex) ao criar projeto |
| OSD028 | O sistema deve permitir selecao do scaffold (postgres-n8n ou null para externo) ao criar projeto |
| OSD029 | O sistema deve exibir o workspace resolvido (absoluto) de cada projeto |

---

## Workspaces

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD050 | O sistema deve inicializar o workspace de um projeto (criar diretorios, gerar agent-harness.json, copiar harness scripts) |
| OSD051 | O sistema deve exibir o estado do workspace (not_initialized, initialized, idle, running) |
| OSD052 | O sistema deve copiar os commands do harness para o workspace ao inicializar |
| OSD053 | O sistema deve criar o diretorio .sessions/ e o .gitignore ao inicializar |
| OSD054 | O sistema deve gerar o agent-harness.json com paths absolutos resolvidos |
| OSD055 | O sistema deve permitir re-inicializar um workspace (com confirmacao de sobrescrita) |

---

## Loop e Execucao

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD070 | O sistema deve iniciar o loop autonomo (Ralph Wiggum) de um projeto |
| OSD071 | O sistema deve parar o loop de forma graceful (criando .stop no workspace) |
| OSD072 | O sistema deve forcar parada do loop (kill do PID) |
| OSD073 | O sistema deve exibir se o loop esta ativo com PID, iteracao atual e horario de inicio |
| OSD074 | O sistema deve permitir configurar MAX_TURNS antes de iniciar o loop |
| OSD075 | O sistema deve permitir configurar MODEL antes de iniciar o loop |
| OSD076 | O sistema deve despachar uma sessao manual (uma feature por vez) |
| OSD077 | O sistema deve exibir logs do loop em tempo real via streaming |
| OSD078 | O sistema deve detectar loop travado (sem progresso por mais de 10 minutos) e notificar |
| OSD079 | O sistema deve permitir rotacao de contexto de uma feature (limpar estado e reiniciar) |

---

## Monitoramento

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD100 | O sistema deve exibir status de todos os projetos em um dashboard com cards |
| OSD101 | O sistema deve exibir a contagem de features por status (pending, in_progress, failing, blocked, skipped, passing) |
| OSD102 | O sistema deve exibir barra de progresso percentual (passing/total) por projeto |
| OSD103 | O sistema deve atualizar o status em tempo real via SSE ou WebSocket |
| OSD104 | O sistema deve exibir grafico de evolucao de features passing ao longo do tempo |
| OSD105 | O sistema deve listar todas as features de um projeto com id, titulo, status, prioridade e dependencias |
| OSD106 | O sistema deve permitir filtrar features por status |
| OSD107 | O sistema deve exibir o agent-progress.txt de cada projeto |
| OSD108 | O sistema deve exibir metricas agregadas (total projetos, total features, taxa de sucesso global) |

---

## Sessoes e Replay

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD130 | O sistema deve listar sessoes de um projeto (pasta .sessions/) |
| OSD131 | O sistema deve exibir o output.jsonl de uma sessao em formato de timeline |
| OSD132 | O sistema deve permitir filtrar eventos da sessao por tipo (tool_call, message, error) |
| OSD133 | O sistema deve exibir duracao e resultado de cada sessao |
| OSD134 | O sistema deve exibir qual feature foi trabalhada em cada sessao |
| OSD135 | O sistema deve permitir copiar trechos do output de uma sessao |

---

## Kai - Copilot Agentico

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD150 | O sistema deve fornecer interface de chat com a Kai em formato conversacional |
| OSD151 | O sistema deve implementar Kai como agent LangGraph com tool calling |
| OSD152 | O sistema deve disponibilizar para a Kai a tool de listar projetos |
| OSD153 | O sistema deve disponibilizar para a Kai a tool de consultar status de um projeto |
| OSD154 | O sistema deve disponibilizar para a Kai a tool de iniciar/parar loop |
| OSD155 | O sistema deve disponibilizar para a Kai a tool de criar projeto |
| OSD156 | O sistema deve disponibilizar para a Kai a tool de inicializar workspace |
| OSD157 | O sistema deve disponibilizar para a Kai a tool de ler features.json |
| OSD158 | O sistema deve disponibilizar para a Kai a tool de ler output.jsonl de sessoes |
| OSD159 | O sistema deve disponibilizar para a Kai a tool de ler agent-progress.txt |
| OSD160 | O sistema deve disponibilizar para a Kai a tool de ler logs do loop |
| OSD161 | O sistema deve disponibilizar para a Kai a tool de ajustar parametros (max_turns, model, max_retries) |
| OSD162 | O sistema deve disponibilizar para a Kai a tool de rotacionar contexto de uma feature |
| OSD163 | O sistema deve permitir que a Kai diagnostique falhas ("por que a feature F-007 esta falhando?") |
| OSD164 | O sistema deve permitir que a Kai recomende ajustes de parametros baseado em padroes observados |
| OSD165 | O sistema deve exibir as tool calls da Kai de forma transparente na interface de chat |
| OSD166 | O sistema deve usar OpenRouter como provider de LLM para a Kai |
| OSD167 | O sistema deve suportar fallback de modelo na Kai (primario e secundario) |
| OSD168 | O sistema deve registrar todas as execucoes da Kai com timing e resultado |
| OSD169 | O sistema deve permitir que a Kai opere proativamente (modo autonomo configuravel) |

---

## Notificacoes e Alertas

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD190 | O sistema deve notificar quando uma feature muda de status |
| OSD191 | O sistema deve notificar quando o loop de um projeto inicia ou para |
| OSD192 | O sistema deve notificar quando o loop atinge o limite de iteracoes |
| OSD193 | O sistema deve notificar quando uma feature excede max_retries |
| OSD194 | O sistema deve exibir notificacoes como toast na interface |
| OSD195 | O sistema deve suportar push notifications (PWA) quando o app nao esta em foco |

---

## PWA e Mobile

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD210 | O sistema deve ser instalavel como PWA em dispositivos moveis e desktop |
| OSD211 | O sistema deve usar service worker para cache de assets estaticos |
| OSD212 | O sistema deve funcionar com navegacao mobile-first (bottom navigation em mobile, sidebar colapsavel em desktop) |
| OSD213 | O sistema deve exibir breadcrumb bar para navegacao hierarquica (sem topbar) |
| OSD214 | O sistema deve maximizar a area util do app (sem header fixo alem do breadcrumb) |
| OSD215 | O sistema deve usar Drawer/Sheet para acoes em mobile (ao inves de modais) |
| OSD216 | O sistema deve suportar pull-to-refresh para atualizar dados |
| OSD217 | O sistema deve suportar gestos de swipe em listas (swipe para acoes rapidas) |
| OSD218 | O sistema deve garantir touch targets de no minimo 44x44px |

---

## API e Integracoes

### RF - Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD230 | O sistema deve expor a SDK (.mjs) como REST API via Hono |
| OSD231 | O sistema deve fornecer endpoint POST /api/projects para criar projeto |
| OSD232 | O sistema deve fornecer endpoint GET /api/projects para listar projetos |
| OSD233 | O sistema deve fornecer endpoint GET /api/projects/:slug para detalhes do projeto |
| OSD234 | O sistema deve fornecer endpoint GET /api/projects/:slug/status para status com features |
| OSD235 | O sistema deve fornecer endpoint POST /api/projects/:slug/init para inicializar workspace |
| OSD236 | O sistema deve fornecer endpoint POST /api/projects/:slug/loop/start para iniciar loop |
| OSD237 | O sistema deve fornecer endpoint POST /api/projects/:slug/loop/stop para parar loop |
| OSD238 | O sistema deve fornecer endpoint GET /api/projects/:slug/sessions para listar sessoes |
| OSD239 | O sistema deve fornecer endpoint GET /api/projects/:slug/sessions/:id para replay de sessao |
| OSD240 | O sistema deve fornecer endpoint GET /api/events via SSE para atualizacoes em tempo real |
| OSD241 | O sistema deve fornecer endpoint POST /api/kai/chat para interagir com a Kai |
| OSD242 | O sistema deve responder com streaming na rota da Kai (tokens parciais via SSE) |
| OSD243 | O sistema deve autenticar todas as rotas /api/* com JWT |

---

## RNF - Requisitos Nao Funcionais

### Performance

| ID | Requisito |
|----|-----------|
| RNF001 | O sistema deve carregar a pagina inicial (dashboard) em menos de 2 segundos (LCP) |
| RNF002 | O sistema deve atualizar o status de features em menos de 1 segundo apos mudanca no filesystem |
| RNF003 | O sistema deve suportar ate 20 projetos simultaneos sem degradacao perceptivel |
| RNF004 | O sistema deve virtualizar listas com mais de 50 itens |
| RNF005 | O sistema deve responder a interacoes do usuario em menos de 100ms (INP) |

### Seguranca

| ID | Requisito |
|----|-----------|
| RNF006 | O sistema deve armazenar senhas com bcrypt (cost factor >= 12) |
| RNF007 | O sistema deve usar HTTP-only cookies para refresh tokens |
| RNF008 | O sistema deve validar e sanitizar todo input de usuario com Zod |
| RNF009 | O sistema deve implementar rate limiting nas rotas de autenticacao (5 tentativas/minuto) |
| RNF010 | O sistema deve usar CORS restritivo (origin explicito) |

### Disponibilidade

| ID | Requisito |
|----|-----------|
| RNF011 | O sistema deve reconectar automaticamente SSE em caso de desconexao |
| RNF012 | O sistema deve exibir estado offline com opcao de retry quando sem conexao |
| RNF013 | O sistema deve persistir estado local (ultimo dashboard visto) via localStorage |

### Mobile e PWA

| ID | Requisito |
|----|-----------|
| RNF014 | O sistema deve atingir score >= 90 no Lighthouse para PWA |
| RNF015 | O sistema deve funcionar em Chrome, Safari e Firefox mobile (ultimas 2 versoes) |
| RNF016 | O sistema deve ter contraste minimo de 4.5:1 para texto |
| RNF017 | O sistema deve ser navegavel por teclado |
| RNF018 | O sistema deve suportar dark mode |

### Observabilidade

| ID | Requisito |
|----|-----------|
| RNF019 | O sistema deve logar todas as chamadas da API com timestamp, metodo, rota e status |
| RNF020 | O sistema deve logar todas as execucoes da Kai com execution_id, tools usadas e duracao |
| RNF021 | O sistema deve exibir health check em GET /api/health |
| RNF022 | O sistema deve rastrear erros do frontend com stack trace e contexto |

---

## Rastreabilidade

| Modulo | Requisitos |
|--------|------------|
| Autenticacao e Usuarios | OSD001-OSD005 |
| Projetos | OSD020-OSD029 |
| Workspaces | OSD050-OSD055 |
| Loop e Execucao | OSD070-OSD079 |
| Monitoramento | OSD100-OSD108 |
| Sessoes e Replay | OSD130-OSD135 |
| Kai - Copilot Agentico | OSD150-OSD169 |
| Notificacoes e Alertas | OSD190-OSD195 |
| PWA e Mobile | OSD210-OSD218 |
| API e Integracoes | OSD230-OSD243 |
| RNF - Performance | RNF001-RNF005 |
| RNF - Seguranca | RNF006-RNF010 |
| RNF - Disponibilidade | RNF011-RNF013 |
| RNF - Mobile e PWA | RNF014-RNF018 |
| RNF - Observabilidade | RNF019-RNF022 |
