# PRP-005 — API list-projects.mjs

## Objetivo

Implementar o endpoint `list-projects.mjs` que descobre e lista todos os projetos configurados nos dois formatos suportados (flat e structured).

## Execution Mode

`implementar`

## Contexto

Atualmente o comando `/run:status` lê arquivos JSON diretamente de `runs/` fazendo glob manual. O novo sistema usa o módulo `discovery.mjs` (PRP-002) para discovery e `load-project.mjs` (PRP-004) para carregar cada projeto encontrado.

A API vive em `runs/.meta/api/list-projects.mjs` e depende de:
- `runs/.meta/lib/discovery.mjs` (PRP-002) — busca nos dois formatos
- `runs/.meta/api/load-project.mjs` (PRP-004) — carregamento e validação

## Especificação

### Interface

**Como CLI:**
```bash
node runs/.meta/api/list-projects.mjs
node runs/.meta/api/list-projects.mjs --runs-dir /path/to/runs
node runs/.meta/api/list-projects.mjs --format json
node runs/.meta/api/list-projects.mjs --format table
```

**Como módulo ES:**
```javascript
import { listProjects } from '../api/list-projects.mjs'

const projects = await listProjects({ runsDir: 'runs/' })
```

### Parâmetros

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| runsDir | string | `runs/` (relativo ao cwd) | Diretório de runs |
| format | string | `table` | Formato de saída CLI: `table` ou `json` |

### Fluxo de execução

1. Chamar `discoverProjects(runsDir)` para obter lista de paths
2. Para cada path, chamar `loadProject(path)` — projetos inválidos são listados com erro
3. Montar lista resumida com: `slug`, `name`, `workspace`, `harness`, `format` (flat/structured)
4. Retornar a lista

### Saída

**CLI (table):**
```
Slug            Name                Workspace                    Harness       Format
agiliza-mvp     Agiliza — MVP       D:\sources\agiliza           claude-code   structured
gestao-rh       Gestão de Pessoas   D:\sources\gestao            claude-code   flat
```

**CLI (json):** array JSON com os mesmos campos

**Import:** array de objetos `ProjectSummary`:

```typescript
{
  slug: string
  name: string
  workspace: string
  harness: string
  format: 'flat' | 'structured'
  _source: string    // Path do project.json
  _error?: string    // Erro de validação, se houver
}
```

**Requisitos:** OSD054, OSD028, OSD029, OSD056, OSD057

## Limites

- Não carregar artefatos do workspace (features.json, estado) — isso é `get-status.mjs` (PRP-007)
- Projetos com `project.json` inválido devem aparecer na lista com `_error`, não serem ignorados
- Não filtrar projetos — listar todos os encontrados
- O diretório `runs/.meta/` e `runs/workspaces/` devem ser excluídos do discovery (já tratado pelo `discovery.mjs`)
