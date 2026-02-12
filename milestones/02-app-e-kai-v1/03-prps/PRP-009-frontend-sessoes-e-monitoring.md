# PRP-009 — Frontend Sessoes e Monitoring

## Objetivo

Implementar as paginas de replay de sessao (timeline de eventos), viewer de logs, e graficos de monitoring.

## Execution Mode

`implementar`

## Contexto

O PRP-008 criou a estrutura de tabs no detalhe do projeto com placeholder para sessoes. Os endpoints `GET /api/projects/:slug/sessions` e `GET /api/projects/:slug/sessions/:id` existem (PRP-004). O output.jsonl contem linhas JSON com eventos do agent (tool calls, mensagens, erros). O `ui-guide.md` define padroes de estados (loading, empty, error).

## Especificacao

### Sessions Page (apps/hub/src/pages/projects/[slug]/sessions.tsx)

Substitui o placeholder da tab Sessoes no PRP-008.

**Lista de sessoes:**
- Tabela/lista com: data, feature trabalhada, duracao, resultado (sucesso/falha) (OSD130, OSD133, OSD134)
- Badge de resultado (passing = verde, failing = vermelho)
- Click abre replay da sessao
- Empty state se nao ha sessoes

**Replay de sessao (modal fullscreen ou pagina):**
- Timeline vertical de eventos em ordem cronologica (OSD131)
- Cada evento como card com:
  - Timestamp relativo ("+2m 15s")
  - Tipo: badge (tool_call = azul, message = cinza, error = vermelho)
  - Conteudo: texto da mensagem ou detalhes da tool call (nome + input + output colapsavel)
- Filtro por tipo de evento com checkboxes (OSD132)
- Botao de copiar conteudo de cada evento (OSD135)
- Indicacao visual de erros (borda vermelha, icone AlertCircle)

### Event Components (apps/hub/src/components/sessions/)

**session-timeline.tsx**
- Recebe array de eventos
- Renderiza lista vertical com linha conectora entre eventos
- Suporta filtro por tipo

**event-card.tsx**
- Card individual de evento
- Props: `{ timestamp, type, content, metadata? }`
- Tool call: exibe nome da tool, input (JSON colapsavel), output (JSON colapsavel)
- Message: exibe texto com markdown rendering basico
- Error: estilo destructive com stack trace (se disponivel)

**session-header.tsx**
- Barra com: feature trabalhada, duracao total, resultado
- Botoes: filtros por tipo, fechar

### Progress Chart (apps/hub/src/components/monitoring/progress-chart.tsx)

Grafico de evolucao de features passing ao longo do tempo (OSD104).
- Area Chart (shadcn/recharts)
- Eixo X: timestamps (sessoes)
- Eixo Y: quantidade de features passing
- Dados computados a partir do historico de sessoes

### Progress Viewer (apps/hub/src/components/monitoring/progress-viewer.tsx)

Viewer do agent-progress.txt (OSD107, US016).
- Texto monospacado (font-mono)
- Scroll automatico para o final quando conteudo muda
- Atualizacao via polling (a cada 5s quando loop ativo)
- Max-height com scroll interno
- Botao de copiar tudo

### Status Cards (apps/hub/src/components/monitoring/status-cards.tsx)

Cards de contagem por status na tab features (OSD101).
- 6 mini-cards: pending, in_progress, failing, blocked, skipped, passing
- Cada um com: icone, label, contagem
- Cor semantica por status
- Clicavel (filtra tabela de features)

### Virtual List (se necessario)

Se sessoes ou eventos ultrapassarem 50 itens, usar `@tanstack/react-virtual` (RNF004).

### Verificacao

Replay de sessao exibe timeline com tool calls, mensagens e erros. Filtro funciona. Copiar funciona. Progress chart renderiza. Progress viewer mostra texto atualizado.

## Limites

- Nao modificar componentes do PRP-008 (apenas substituir placeholders)
- Nao implementar busca global de sessoes (apenas por projeto)
- Nao implementar diff entre sessoes
- Nao adicionar player de audio/video (output.jsonl e texto)
- Markdown rendering basico: bold, code inline, code blocks — nao instalar biblioteca de markdown pesada
