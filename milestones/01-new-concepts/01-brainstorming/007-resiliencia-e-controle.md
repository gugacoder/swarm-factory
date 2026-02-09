# Resiliência e Controle

## Gutter Detection (detecção de falha repetitiva)

Quando o agente falha repetidamente na mesma feature, o loop intervém:

1. **Falhou X vezes** (default: 5, configurável) → força rotação de contexto (mata a sessão, spawna nova com contexto limpo)
2. **Falhou outras X vezes** após rotação → pula a feature (marca como `skipped`)

O valor X é configurável no agent config pra permitir ajuste conforme a complexidade do projeto.

### O que é rotação de contexto

Matar a sessão atual do agente e spawnar uma nova, limpa. O agente começa do zero — lê `agent-progress.txt`, `features.json`, entende o estado, e tenta a mesma feature com perspectiva fresca. O princípio do Ralph Wiggum: o estado está nos arquivos, não na cabeça do agente.

A diferença da rotação normal entre iterações é que a gutter detection **antecipa** — em vez de deixar o agente gastar todo o `max_turns` falhando da mesma forma, detecta o padrão e corta mais cedo.

## Guardrails / Lições Aprendidas

Arquivo estruturado onde o agente registra lições de falhas pra iterações futuras. Lido explicitamente no startup do coder agent, escrito após falhas. Reduz erros repetidos entre sessões.

## Rollback em Falha de Feature

Se o agente faz bagunça (feature parcial, testes quebrados) e a sessão termina, a próxima iteração herda o estado quebrado. Em vez de confiar no prompt "CORRIJA PRIMEIRO", o loop pode fazer `git stash` ou `git reset` automático pro último commit limpo quando uma sessão falha.

## Status de Feature Mais Rico

Hoje: `failing` / `passing` (binário).
Proposta: `pending`, `in_progress`, `failing`, `blocked`, `skipped`, `passing`.

- `in_progress` — previne que runs concorrentes peguem a mesma feature
- `skipped` — marcada pelo gutter detection após falhas consecutivas
- `blocked` — dependências não satisfeitas (pode ser computado, não precisa persistir)

## max_features como Parâmetro

Incluir `max_features` no agent config:

```jsonc
"agent": {
  "harness": "claude-code",
  "model": null,
  "max_turns": 50,
  "max_iterations": null,
  "max_features": null,
  "max_retries": 5
}
```

- `max_features: null` → sem limite (roda até acabar)
- `max_features: 1` → para depois de completar 1 feature
- `max_retries: 5` → tentativas por feature antes de rotação/skip

## Validação de Schema em Runtime

A API determinística valida o project.json contra o schema na leitura usando `ajv` ou `zod`. Erros de validação são reportados antes de qualquer operação.

## Execução Paralela (futuro)

Múltiplos agentes rodando features sem conflito de dependência simultaneamente. Cada agente trabalha num `git worktree` isolado do mesmo repo. O loop cria worktrees, spawna agentes, e faz merge após conclusão. Complexidade significativa — item de futuro.

## Webhook / Notificação

Configurado no `agent-harness.json` do workspace (não no project.json do Runs). O destino é autônomo — qualquer pessoa que roda o loop pode configurar notificação sem precisar do sistema de Runs.

## Replay de Sessão

O JSONL de cada sessão permite reproduzir step-by-step o que o agente fez. Essa funcionalidade pertence ao app de monitoramento, não ao Runs. Runs garante que o JSONL está lá; quem consome é o monitor.
