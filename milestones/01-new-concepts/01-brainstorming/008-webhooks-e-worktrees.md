# Webhooks Fan-Out e Worktrees

## Webhooks (notificação)

Configurados no `agent-harness.json` do workspace. Array de endpoints com fan-out e tolerância a falha:

```jsonc
"notifications": [
  { "url": "https://meu-monitor.com/webhook", "events": ["completed", "stopped", "error"] },
  { "url": "https://slack.com/...", "events": ["completed"] },
  { "url": "http://localhost:3000/api/runs/notify", "events": ["*"] }
]
```

- Chamados sequencialmente ao final do loop ou em transições de estado relevantes
- Erros individuais são ignorados (try/catch por webhook) — um falhando não impede os outros
- `events` filtra quais eventos disparam o webhook (`*` = todos)
- Fire-and-forget, sem retry (retry com backoff é futuro)

## Worktrees para Execução Paralela (futuro)

Worktrees ficam dentro da sessão da feature:

```
.sessions/F-006/
├── checklist.md
├── output.jsonl
├── pid
├── started_at
├── finished_at
└── worktree/          ← git worktree da feature
```

- `.sessions/` já está no `.gitignore` — tudo contido
- Cleanup natural: feature termina, faz merge, remove worktree
- Se a sessão é descartada, o diretório já está contido

## Garantia de .gitignore

O initializer (ou a API determinística) deve verificar e adicionar `.sessions/` ao `.gitignore` do workspace se não estiver lá. É garantia do sistema, não responsabilidade do usuário.
