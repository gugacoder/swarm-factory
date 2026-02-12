# PRP-005 — Backend SSE e Real-Time

## Objetivo

Implementar o sistema de eventos em tempo real via Server-Sent Events, incluindo file watcher para mudancas no filesystem e endpoint SSE para o frontend.

## Execution Mode

`implementar`

## Contexto

O PRP-004 criou os services de projetos com acesso ao filesystem (features.json, agent-progress.txt, state.json). O frontend precisa receber atualizacoes em tempo real sem polling. A decisao tecnica vinculante (design.md) e usar SSE com chokidar para file watching. Os eventos estao definidos em `design.md` secao Real-Time (SSE).

## Especificacao

### Watcher Service (apps/backbone/src/services/watcher-service.ts)

Servico singleton que monitora o filesystem e emite eventos.

- Inicializa na startup do backbone
- Usa chokidar para observar mudancas em: `*/features.json`, `*/agent-progress.txt`, `*/state.json` dentro dos workspaces de todos os projetos conhecidos
- Debounce de 500ms por arquivo para evitar flooding
- Emite eventos internos via EventEmitter nativo do Node.js
- Detectar novos projetos quando um project.json e criado

**Eventos emitidos:**

| Evento interno | Trigger | Dados |
|---------------|---------|-------|
| `feature:status` | features.json modificado | `{ slug, featureId, oldStatus, newStatus }` (diff entre versao anterior e nova) |
| `loop:progress` | state.json modificado | `{ slug, iteration, feature }` |
| `loop:start` | PID detectado ativo | `{ slug, pid }` |
| `loop:stop` | PID nao encontrado | `{ slug, reason }` |

- Manter em memoria a ultima versao de cada features.json para computar diffs
- Quando features.json muda, comparar status de cada feature e emitir `feature:status` para cada feature que mudou

### Event Service (apps/backbone/src/services/event-service.ts)

- Gerencia conexoes SSE ativas
- Recebe eventos do WatcherService e distribui para todos os clients conectados
- Suporta multiplas conexoes simultaneas
- Remove conexoes fechadas

### Events Route (apps/backbone/src/routes/events.ts)

- `GET /api/events` — endpoint SSE autenticado (OSD240)
- Headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- Formato de cada evento: `event: {tipo}\ndata: {json}\n\n`
- Keepalive: enviar comment (`: keepalive\n\n`) a cada 30 segundos
- Fechar conexao quando client desconecta (req.signal.addEventListener 'abort')

### Notificacoes no Banco

Quando um evento `feature:status` com `newStatus === 'passing'` ou `feature_max_retries` e detectado, ou quando `loop:start` / `loop:stop` ocorrem, criar um registro na tabela `notifications` para o usuario (OSD190-OSD193).

### Verificacao

Abrir `curl -N http://localhost:9090/api/events` com token valido. Modificar um features.json manualmente. Verificar que o evento SSE aparece no curl em menos de 1 segundo (RNF002).

## Limites

- Nao usar WebSocket (decisao tecnica vinculante: SSE)
- Nao implementar push notifications neste PRP (sera feito no PRP-011)
- Nao monitorar arquivos fora dos workspaces dos projetos
- Debounce obrigatorio de 500ms — nao alterar esse valor
- Nao persistir eventos SSE — sao efemeros
