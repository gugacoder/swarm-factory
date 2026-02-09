# PRP-009 — Resiliência e Gutter Detection

## Objetivo

Adicionar ao loop MJS (`agent-harness.mjs`) a lógica de gutter detection, rotação de contexto, rollback automático e arquivo de guardrails/lições aprendidas.

## Execution Mode

`implementar`

## Contexto

O loop MJS base (PRP-008) já implementa o ciclo de seleção, spawn e tracking de features. Este PRP adiciona a camada de resiliência que intervém quando o agente falha repetidamente em uma feature.

O loop bash atual (`ralph-wiggum-loop.sh`) não possui gutter detection — quando o agente falha, ele simplesmente retenta a mesma feature indefinidamente. As specs definem um mecanismo de detecção e intervenção conforme design.md (seção "Fluxo do Ralph Wiggum Loop").

## Especificação

### Gutter Detection

Após cada tentativa falhada de uma feature, o loop deve:

1. Incrementar `retries` na feature dentro de `features.json`
2. Comparar `retries` com `max_retries` (default: 5, configurável em `agent.max_retries`)
3. Se `retries >= max_retries` e **não houve rotação** ainda → executar rotação de contexto
4. Se `retries >= max_retries * 2` (ou seja, falhou após rotação) → marcar como `skipped`

### Rotação de Contexto

Quando disparada:

1. Registrar no `agent-progress.txt`: `[ROTAÇÃO] Feature {id}: {retries} falhas consecutivas — rotação de contexto`
2. Executar rollback (se habilitado):
   - `git stash` no workspace para preservar mudanças parciais
   - Ou `git reset` ao último commit limpo
   - Registrar no progress: `[ROLLBACK] git stash executado`
3. Zerar contadores internos da sessão (não o `retries` da feature)
4. A próxima iteração do loop vai selecionar a mesma feature (se elegível), mas com contexto limpo
5. Marcar feature como `failing` (manter elegível para re-seleção)

### Decisão de rollback

O rollback é controlado por um campo no `agent-harness.json`:

```json
{
  "agent": {
    "rollback": "stash"  // "stash" | "reset" | "none"
  }
}
```

| Valor | Comportamento |
|-------|--------------|
| `stash` | `git stash push -m "gutter-{feature-id}-{timestamp}"` |
| `reset` | `git reset --hard HEAD` (último commit) |
| `none` | Não faz rollback — apenas rotação de contexto |

Default: `stash`

### Skip de Feature

Quando `retries >= max_retries * 2`:

1. Marcar feature como `skipped` em `features.json`
2. Registrar no `agent-progress.txt`: `[SKIP] Feature {id}: {retries} falhas — feature pulada`
3. Registrar no guardrails: lição aprendida com o ID da feature e o motivo

### Guardrails (lições aprendidas)

Arquivo `agent-guardrails.md` no workspace (adicionado como artefato):

- Lido pelo loop no startup
- Escrito após cada skip ou rotação
- Formato markdown com seções datadas:

```markdown
# Guardrails — Lições Aprendidas

## 2026-02-09T10:30:00Z — Feature F-003

- **Problema:** Falha ao implementar validação de formulário — loop infinito de correções no Zod schema
- **Ação:** Rotação de contexto + stash
- **Resultado:** Feature pulada após 10 tentativas

## 2026-02-09T08:00:00Z — Feature F-001

- **Problema:** Conflito de dependência com react-hook-form
- **Ação:** Rotação de contexto
- **Resultado:** Passou após rotação
```

O conteúdo é **gerado pelo loop** (lógica determinística), não pela LLM. Registra fatos, não interpretações.

**Requisitos:** OSD120–OSD125, OSD128, OSD131

## Limites

- Não alterar a lógica de seleção de features — apenas adicionar a lógica pós-falha
- Não implementar rollback como primeiro recurso — só após `max_retries` falhas
- O rollback via `git reset --hard` deve exigir configuração explícita (`rollback: "reset"`) — não ser default
- Não apagar sessões anteriores durante rotação — preservar histórico
- O guardrails é escrito pelo loop, não pela LLM — registrar apenas fatos observáveis (quantidade de falhas, ação tomada)
- Não bloquear features dependentes de uma feature `skipped` — `skipped` não satisfaz dependências, logo dependentes ficam `blocked` naturalmente

## Exemplos

### Sequência de gutter detection

```
Iteração 1: F-003 → falha (retries: 1)
Iteração 2: F-003 → falha (retries: 2)
Iteração 3: F-003 → falha (retries: 3)
Iteração 4: F-003 → falha (retries: 4)
Iteração 5: F-003 → falha (retries: 5) → ROTAÇÃO + git stash
Iteração 6: F-003 → falha (retries: 6)  ← contexto limpo
Iteração 7: F-003 → falha (retries: 7)
...
Iteração 10: F-003 → falha (retries: 10) → SKIP
Iteração 11: F-004 → próxima feature elegível
```

### agent-progress.txt

```
[2026-02-09T10:30:00Z] [INICIO] Feature F-003: Validação de formulários
[2026-02-09T10:35:00Z] [FALHA] Feature F-003: tentativa 1
[2026-02-09T10:40:00Z] [FALHA] Feature F-003: tentativa 5
[2026-02-09T10:40:01Z] [ROTAÇÃO] Feature F-003: 5 falhas consecutivas — rotação de contexto
[2026-02-09T10:40:02Z] [ROLLBACK] git stash push -m "gutter-F-003-20260209T104002Z"
[2026-02-09T11:00:00Z] [FALHA] Feature F-003: tentativa 10
[2026-02-09T11:00:01Z] [SKIP] Feature F-003: 10 falhas — feature pulada
```
