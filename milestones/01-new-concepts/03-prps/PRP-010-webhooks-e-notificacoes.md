# PRP-010 — Webhooks e Notificações

## Objetivo

Adicionar ao loop MJS (`agent-harness.mjs`) o disparo de webhooks configurados no `agent-harness.json`, notificando consumers externos sobre transições de estado.

## Execution Mode

`implementar`

## Contexto

O loop MJS (PRP-008) e o sistema de resiliência (PRP-009) já produzem as transições de estado. Este PRP adiciona a camada de notificação que envia HTTP POSTs para endpoints configurados.

A configuração de webhooks vive no `agent-harness.json` do workspace (campo `notifications`), não no `project.json`. Isso permite que o desenvolvedor destino configure notificações sem acesso à fábrica.

## Especificação

### Configuração

Campo `notifications` no `agent-harness.json`:

```json
{
  "notifications": [
    {
      "url": "https://n8n.example.com/webhook/runs",
      "events": ["completed", "stopped", "error"]
    },
    {
      "url": "https://discord.com/api/webhooks/xxx",
      "events": ["*"]
    }
  ]
}
```

### Eventos suportados

| Evento | Quando é disparado |
|--------|--------------------|
| `completed` | Loop terminou — todas as features processadas ou `max_features` atingido |
| `stopped` | Graceful stop via `.stop` file |
| `error` | Erro não tratado no loop |
| `feature_done` | Uma feature passou para `passing` |
| `feature_skip` | Uma feature foi marcada como `skipped` |
| `*` | Wildcard — recebe todos os eventos |

### Payload do webhook

```json
{
  "event": "feature_done",
  "timestamp": "2026-02-09T10:30:00Z",
  "project": {
    "slug": "agiliza-mvp",
    "name": "Agiliza — MVP"
  },
  "data": {
    "feature_id": "F-003",
    "feature_title": "Validação de formulários",
    "iteration": 5,
    "features_done": 8,
    "features_total": 15,
    "exit_reason": null
  }
}
```

Para eventos de loop (`completed`, `stopped`, `error`), `data.feature_id` é null e `data.exit_reason` contém o motivo.

### Implementação

Função `notifyWebhooks(config, event, data)`:

1. Filtrar `notifications` cujos `events` incluem o evento ou `*`
2. Para cada webhook filtrado:
   a. Montar payload JSON
   b. Enviar HTTP POST com `Content-Type: application/json`
   c. Usar `fetch` nativo do Node.js (disponível a partir do Node 18)
   d. Wrap em try/catch individual — erro de um webhook não impede os demais
   e. Timeout de 10 segundos por webhook
3. Sem retry — fire-and-forget
4. Logar resultado no `agent-progress.txt`:
   - `[WEBHOOK] POST {url} → {status}` (sucesso)
   - `[WEBHOOK] POST {url} → ERRO: {message}` (falha)

### Pontos de integração no loop

| Ponto | Evento |
|-------|--------|
| Feature marcada como `passing` | `feature_done` |
| Feature marcada como `skipped` | `feature_skip` |
| Loop encerrou normalmente | `completed` |
| Graceful stop executado | `stopped` |
| Erro não tratado no catch global | `error` |

**Requisitos:** OSD150–OSD155

## Limites

- Não implementar retry — fire-and-forget conforme spec
- Não validar URL dos webhooks — aceitar qualquer string que o fetch aceite
- Não enviar webhooks de forma paralela — sequencial (um por vez) para simplicidade
- Não implementar autenticação customizada (headers, tokens) — apenas POST simples
- Não tratar webhooks como funcionalidade crítica — falha de webhook não deve afetar o loop
- Não adicionar dependências externas — usar `fetch` nativo do Node.js
