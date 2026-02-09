# PRP-012 — Worktrees e Sessões (Futuro)

## Objetivo

Declarar a estrutura de worktrees dentro das sessões de features e preparar o sistema para execução paralela futura, sem implementar a execução paralela em si.

## Execution Mode

`implementar`

## Contexto

O sistema atual cria sessões por feature em `.sessions/{feature-id}/` com arquivos de tracking (started_at, finished_at, output.jsonl, pid). As specs preveem que cada sessão contenha um git worktree isolado, permitindo que features sejam desenvolvidas em branches separadas sem conflito.

O `session_template` definido no er.md já declara `worktree` como diretório. O `init-workspace.mjs` (PRP-006) já cria a estrutura de sessão. Este PRP garante que:

1. A declaração de worktree esteja presente e correta
2. O `.gitignore` trate `.sessions/` adequadamente
3. O loop crie o diretório de worktree na sessão (sem popular)
4. O monitor possa localizar worktrees via `project.json`

## Especificação

### session_template com worktree

O `session_template` no `agent-harness.json` (gerado pelo PRP-006) deve declarar:

```json
{
  "session_template": {
    "pattern": "./.sessions/{feature-id}/",
    "files": ["checklist.md", "output.jsonl", "pid", "started_at", "finished_at"],
    "dirs": ["worktree"]
  }
}
```

### Criação do diretório worktree

Quando o loop (PRP-008) cria uma sessão para uma feature, deve criar todos os diretórios declarados no `session_template.dirs`:

```
.sessions/F-003/
├── checklist.md
├── output.jsonl
├── pid
├── started_at
├── finished_at
└── worktree/          ← diretório vazio criado pelo loop
```

O diretório `worktree/` é criado vazio. A criação do git worktree real será implementada em milestone futuro.

### .gitignore

O `init-workspace.mjs` (PRP-006) já adiciona `.sessions/` ao `.gitignore`. Este PRP não precisa de alteração adicional.

### Discovery de worktrees pelo monitor

O sistema de monitoramento pode encontrar worktrees via:

1. Ler `agent-harness.json` → `artifacts.sessions` (path do diretório de sessões)
2. Ler `agent-harness.json` → `session_template.dirs` (confirmar que `worktree` está declarado)
3. Listar subdiretórios de `.sessions/` → cada um é uma feature
4. Dentro de cada feature, o diretório `worktree/` é o path do worktree

**Requisitos:** OSD170–OSD173

## Limites

- Não criar git worktrees reais (`git worktree add`) — apenas o diretório vazio
- Não implementar execução paralela — apenas preparar a estrutura
- Não implementar merge de worktrees
- Não implementar dev server por worktree
- Não adicionar lógica no loop para detectar se o worktree está populado
- O diretório `worktree/` vazio é um placeholder para implementação futura
