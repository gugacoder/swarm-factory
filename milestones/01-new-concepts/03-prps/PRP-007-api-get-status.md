# PRP-007 — API get-status.mjs

## Objetivo

Implementar o endpoint `get-status.mjs` que determina o estado atual de um projeto lendo seus artefatos no workspace.

## Execution Mode

`implementar`

## Contexto

Atualmente o comando `/run:status` lê `features.json` diretamente com snippets Node inline e conta features por status. O novo sistema centraliza essa lógica em uma API que lê todos os artefatos declarados e computa o estado completo.

A API vive em `runs/.meta/api/get-status.mjs` e depende de:
- `runs/.meta/api/load-project.mjs` (PRP-004) — carregamento do projeto
- `runs/.meta/lib/validate.mjs` (PRP-001) — validação de features.json
- `runs/.meta/lib/artifacts.mjs` (PRP-002) — leitura de artefatos

## Especificação

### Interface

**Como CLI:**
```bash
node runs/.meta/api/get-status.mjs runs/agiliza-mvp/project.json
node runs/.meta/api/get-status.mjs --slug agiliza-mvp
node runs/.meta/api/get-status.mjs --slug agiliza-mvp --format json
```

**Como módulo ES:**
```javascript
import { getStatus } from '../api/get-status.mjs'

const status = await getStatus('runs/agiliza-mvp/project.json')
```

### Parâmetros

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| path | string | — | Caminho direto para `project.json` |
| slug | string | — | Slug do projeto (alternativa ao path) |
| format | string | table | Formato de saída CLI: `table` ou `json` |

### Fluxo de execução

1. Carregar projeto via `loadProject()`
2. Verificar se o workspace existe — se não, retornar estado `not_initialized`
3. Ler `features.json` do workspace (path resolvido do artefato `features`)
   - Se não existir, retornar estado `initialized` (workspace criado mas sem features)
4. Validar `features.json` contra schema
5. Computar contagem por status:
   - pending, in_progress, failing, blocked, skipped, passing
6. Verificar se o loop está ativo:
   - Ler arquivo PID (artefato `pid`)
   - Se existir, verificar se o processo está rodando (cross-platform)
7. Ler estado do loop (artefato `state`) se existir
8. Montar e retornar objeto de status

### Objeto de retorno

```typescript
{
  slug: string
  name: string
  workspace: string
  state: 'not_initialized' | 'initialized' | 'idle' | 'running'
  loop: {
    active: boolean
    pid: number | null
    iteration: number | null
    started_at: string | null
  }
  features: {
    total: number
    pending: number
    in_progress: number
    failing: number
    blocked: number
    skipped: number
    passing: number
  }
  progress: number    // Porcentagem (passing / total * 100), arredondada
}
```

### Determinação de `state`

| Condição | State |
|----------|-------|
| Workspace não existe | `not_initialized` |
| Workspace existe mas sem `features.json` | `initialized` |
| `features.json` existe e loop não ativo | `idle` |
| `features.json` existe e loop ativo (PID rodando) | `running` |

### Verificação de PID cross-platform

- Windows: usar `tasklist /FI "PID eq {pid}"` via `node:child_process.execSync`
- Unix: usar `kill -0 {pid}` (signal 0 — não mata, só verifica)
- Detectar SO via `node:os.platform()`

**Requisitos:** OSD055, OSD098, OSD126, OSD056, OSD057, RNF003

## Limites

- Não modificar nenhum artefato — apenas ler
- Não listar detalhes individuais de cada feature — apenas contagem por status
- Não ler logs de sessão (output.jsonl) — isso é responsabilidade do dashboard
- Se `features.json` existir mas for inválido, retornar erro — não tentar corrigir

## Exemplos

### Saída CLI (table)

```
Projeto: Agiliza — MVP (agiliza-mvp)
Workspace: D:\sources\agiliza
Estado: running (PID 12345, iteração 7, desde 2026-02-09T10:30:00Z)

Features:
  Total:       15
  Passing:      8 ██████████░░░░░░  53%
  Failing:      1
  In Progress:  1
  Pending:      3
  Blocked:      1
  Skipped:      1
```

### Saída JSON

```json
{
  "slug": "agiliza-mvp",
  "name": "Agiliza — MVP",
  "workspace": "D:\\sources\\agiliza",
  "state": "running",
  "loop": {
    "active": true,
    "pid": 12345,
    "iteration": 7,
    "started_at": "2026-02-09T10:30:00Z"
  },
  "features": {
    "total": 15,
    "pending": 3,
    "in_progress": 1,
    "failing": 1,
    "blocked": 1,
    "skipped": 1,
    "passing": 8
  },
  "progress": 53
}
```
