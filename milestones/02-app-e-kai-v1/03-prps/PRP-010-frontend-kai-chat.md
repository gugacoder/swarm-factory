# PRP-010 — Frontend Kai Chat

## Objetivo

Implementar a interface de chat com a Kai, incluindo streaming de respostas, exibicao de tool calls, historico de conversas e sugestoes.

## Execution Mode

`implementar`

## Contexto

O PRP-006 criou o endpoint `POST /api/kai/chat` com streaming SSE e endpoints de conversas. O PRP-007 criou a rota `/kai` com placeholder. O layout e mobile-first: tela cheia dedicada ao chat. A Kai responde em pt-BR com tool calls transparentes. A ref `langgraph-agents.md` mostra o padrao de tool calling e structured output.

## Especificacao

### Kai Hook (apps/hub/src/hooks/use-kai.ts)

- `useKai()` retorna:
  - `conversations` — lista de conversas
  - `currentConversation` — conversa ativa (id, messages)
  - `isStreaming` — se esta recebendo resposta
  - `sendMessage(text)` — envia mensagem e inicia streaming
  - `createConversation()` — cria nova conversa
  - `loadConversation(id)` — carrega conversa do historico

- Streaming: POST para `/api/kai/chat`, ler resposta como SSE stream (`ReadableStream`), acumular tokens parciais, atualizar mensagem progressivamente
- Ao finalizar, recarregar mensagens do banco para ter tool calls persistidas

### Kai Page (apps/hub/src/pages/kai.tsx)

Layout fullscreen de chat (sem margem lateral em mobile):

- Sidebar de conversas (desktop: coluna esquerda 280px; mobile: drawer)
- Area de chat principal
- Input fixo na parte inferior

**Sidebar de conversas:**
- Lista de conversas com titulo e data
- Botao "Nova Conversa"
- Conversa ativa destacada
- Em mobile: acessivel via botao hamburger no header do chat

### Chat Components (apps/hub/src/components/kai/)

**chat-window.tsx**
- Container principal do chat
- Scroll area com mensagens
- Auto-scroll para ultima mensagem
- Pull-to-refresh para recarregar historico

**message-bubble.tsx**
- Props: `{ role, content, toolCalls?, isStreaming? }`
- role=user: alinhado a direita, fundo primary
- role=assistant: alinhado a esquerda, fundo card
- Content renderizado com markdown basico (bold, code, lists)
- Cursor piscando quando isStreaming=true

**tool-call-card.tsx**
- Card colapsavel dentro de uma mensagem da Kai (OSD165)
- Header: icone de ferramenta + nome da tool + badge de status (success/error) + duracao
- Body (colapsavel): input JSON formatado + output JSON formatado
- Colapsado por default, expandir com click
- Estilo sutil (borda muted, fundo muted/10)

**suggestion-chips.tsx**
- Chips clicaveis abaixo da area de chat quando vazia (OB008)
- Sugestoes: "Listar meus projetos", "Status do meu loop", "Me ajude a criar um projeto", "O que voce pode fazer?"
- Desaparecem apos primeira mensagem enviada

**chat-input.tsx**
- Input de texto com botao de enviar
- Textarea auto-resize (max 4 linhas)
- Enviar com Enter (Shift+Enter para nova linha)
- Desabilitado enquanto streaming
- Touch target minimo 44px (OSD218)

### Streaming Implementation

1. POST `/api/kai/chat` com `{ conversationId, message }`
2. Ler response.body como `ReadableStream`
3. Decodificar chunks SSE: parsear linhas `data: {...}`
4. Tipos de chunks:
   - `{ type: "token", content: "..." }` — acumular no texto da mensagem
   - `{ type: "tool_call", name: "...", input: {...} }` — exibir card de tool em progresso
   - `{ type: "tool_result", name: "...", output: {...}, duration_ms: N }` — atualizar card da tool
   - `{ type: "done", conversationId: "...", messageId: "..." }` — finalizar streaming

### Verificacao

Enviar mensagem e receber resposta streaming. Tool calls aparecem como cards colapsaveis. Historico de conversas funciona. Sugestoes aparecem no chat vazio. Funciona em mobile (fullscreen) e desktop (com sidebar de conversas).

## Limites

- Nao implementar upload de arquivos ou imagens no chat
- Nao implementar voice input
- Nao implementar mensagens da Kai proativas (sera feito no PRP-011)
- Nao persistir mensagens em localStorage (banco e a fonte de verdade)
- Markdown rendering: bold, italic, code inline, code blocks, lists — sem tabelas ou imagens
- Nao implementar "typing indicator" alem do cursor piscando
