# PRP-004 — API load-project.mjs

## Objetivo

Implementar o endpoint `load-project.mjs` que lê, valida e resolve paths de um `project.json`, retornando um objeto pronto para uso por qualquer consumer.

## Execution Mode

`implementar`

## Contexto

Atualmente os slash commands leem JSONs de run diretamente e resolvem paths de forma ad hoc dentro de cada comando. O novo sistema centraliza essa lógica em um módulo que é o ponto de entrada para qualquer operação que precise de dados do projeto.

A API vive em `runs/.meta/api/load-project.mjs` e depende de:
- `runs/.meta/lib/validate.mjs` (PRP-001) — validação do schema
- `runs/.meta/lib/paths.mjs` (PRP-002) — resolução de paths

## Especificação

### Interface

**Como CLI:**
```bash
node runs/.meta/api/load-project.mjs runs/agiliza-mvp/project.json
node runs/.meta/api/load-project.mjs --slug agiliza-mvp
```

**Como módulo ES:**
```javascript
import { loadProject } from '../api/load-project.mjs'

const project = await loadProject('runs/agiliza-mvp/project.json')
const project = await loadProject({ slug: 'agiliza-mvp', runsDir: 'runs/' })
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| path | string | Caminho direto para o `project.json` |
| slug | string | Slug do projeto — usa `discovery.mjs` para encontrar o path |
| runsDir | string | Diretório de runs (default: `runs/` relativo ao swarm-factory) |

Aceita `path` OU `slug` — não ambos.

### Fluxo de execução

1. Se recebeu `slug`, usar `resolveProjectPath()` do `discovery.mjs` para encontrar o path
2. Se não encontrou, lançar erro
3. Ler o arquivo JSON do path encontrado
4. Validar contra `project.schema.json` via `validateProject()`
5. Se inválido, lançar erro com detalhes de validação
6. Resolver todos os paths:
   - `specs` → resolver relativo ao `workspace`
   - Cada artefato em `artifacts` → resolver path relativo ao `workspace`
7. Retornar objeto enriquecido:

```typescript
{
  // Todos os campos originais do project.json
  ...projectJson,
  // Campos adicionais computados
  _source: string,          // Path absoluto de onde o project.json foi lido
  _resolved: {
    specs: string,           // Path absoluto resolvido de specs
    artifacts: Record<string, string>  // Paths absolutos dos artefatos
  }
}
```

### Saída

**Sucesso (CLI):** imprimir JSON enriquecido em stdout
**Sucesso (import):** retornar o objeto enriquecido
**Erro:** lançar Error com mensagem descritiva

**Requisitos:** OSD052, OSD056, OSD057, OSD059, OSD027, OSD031, RNF005, RNF008

## Limites

- Não modificar o `project.json` no disco — apenas ler
- Não verificar se os paths resolvidos existem no filesystem — apenas resolver
- Não carregar `features.json` ou qualquer artefato do workspace — apenas resolver os paths
- Campos adicionais computados devem ter prefixo `_` para distinguir do JSON original

## Exemplos

### Carregamento direto

```javascript
const p = await loadProject('runs/agiliza-mvp/project.json')
// p.slug === 'agiliza-mvp'
// p.workspace === 'D:\\sources\\agiliza'
// p._resolved.specs === 'D:\\sources\\agiliza\\milestones\\01-mvp'
// p._resolved.artifacts.features === 'D:\\sources\\agiliza\\features.json'
```

### Carregamento por slug

```javascript
const p = await loadProject({ slug: 'agiliza-mvp', runsDir: 'D:\\swarm-factory\\runs' })
// Mesmo resultado — encontra o path automaticamente
```

### Erro — JSON inválido

```
Error: project.json inválido em runs/agiliza-mvp/project.json:
  - agent.harness: deve ser um dos valores: claude-code, opencode, codex
  - version: campo obrigatório
```
