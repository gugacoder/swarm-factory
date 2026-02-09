# PRP-001 — Schemas e Validação

## Objetivo

Criar os JSON Schemas e o módulo de validação que sustentam todo o sistema Runs v2 — `project.schema.json`, `features.schema.json` e o validador em MJS.

## Execution Mode

`implementar`

## Contexto

O sistema atual possui `runs/.meta/run.schema.json` com um schema simplificado (campos `name`, `project`, `milestone`, `harness`, `location`, `params`). Esse schema será **substituído** pelo novo `project.schema.json` que reflete o formato `project.json` definido nas specs.

Não existe schema para `features.json` — as features são lidas ad hoc por snippets Node inline no `ralph-wiggum-loop.sh`.

A estrutura de destino é:

```
runs/.meta/
├── schema/
│   ├── project.schema.json
│   └── features.schema.json
└── lib/
    └── validate.mjs
```

## Especificação

### project.schema.json

Deve validar o formato `project.json` conforme er.md (entidade `project.json`):

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| version | integer | sim | >= 1 |
| slug | string | sim | Pattern: `^[a-z0-9][a-z0-9-]*$` (machine-friendly) |
| name | string | sim | min 1 char |
| description | string \| null | não | — |
| specs | string | sim | Caminho para specs (relativo ou absoluto) |
| workspace | string | sim | Caminho absoluto para o diretório de desenvolvimento |
| agent | object | sim | Sub-schema AgentConfig |
| artifacts | object | sim | Record de artefatos com tipo e path |

Sub-schema **AgentConfig** (campo `agent`):

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| harness | string | sim | Enum: `claude-code`, `opencode`, `codex` |
| model | string \| null | não | — |
| max_turns | integer \| null | não | >= 1 quando inteiro |
| max_iterations | integer \| null | não | >= 1 quando inteiro |
| max_features | integer \| null | não | >= 1 quando inteiro |
| max_retries | integer | não | >= 1, default: 5 |

Sub-schema **Artifact** (cada valor em `artifacts`):

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| type | string | sim | Enum: `file`, `dir` |
| path | string | sim | min 1 char |

Sub-schema **SessionTemplate** (campo `session_template` dentro de `artifacts`):

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| pattern | string | sim | Padrão de path com `{feature-id}` |
| files | string[] | sim | Nomes dos arquivos por sessão |
| dirs | string[] | não | Nomes dos diretórios por sessão |

**Requisitos:** OSD020–OSD031, OSD059

### features.schema.json

Deve validar o `features.json` conforme er.md (entidade `feature`):

A raiz é um array de objetos feature. Cada feature:

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| id | string | sim | Pattern: `^F-\d{3}$` |
| title | string | sim | min 1 char |
| description | string | sim | — |
| status | string | sim | Enum: `pending`, `in_progress`, `failing`, `blocked`, `skipped`, `passing` |
| priority | integer | sim | >= 1 |
| dependencies | string[] | não | Array de IDs de features |
| retries | integer | não | >= 0, default: 0 |
| prp_ids | string[] | não | IDs de PRPs de origem |

**Requisitos:** OSD126–OSD129

### validate.mjs

Módulo de validação que:

- Exporta `validateProject(data)` — valida contra `project.schema.json`
- Exporta `validateFeatures(data)` — valida contra `features.schema.json`
- Cada função retorna `{ valid: boolean, errors: string[] }`
- Usa `ajv` como validador (é JSON Schema, não Zod — pois os schemas também servem para documentação e tooling externo)
- Schemas são lidos do filesystem via `node:fs/promises` com path relativo ao módulo (`import.meta.url`)
- Exporta também `loadSchema(name)` para carregar schemas avulsos

**Requisitos:** OSD059, RNF001, RNF008

## Limites

- Não implementar resolução de paths — isso é responsabilidade do `paths.mjs` (PRP-002)
- Não implementar leitura de `project.json` do disco — isso é responsabilidade do `load-project.mjs` (PRP-004)
- O schema antigo `run.schema.json` deve ser mantido intacto durante essa implementação — a migração acontece em outro momento
- Não adicionar dependências externas além de `ajv` (se não existir no projeto, incluir instrução de instalação)
- Não criar testes automatizados — o escopo é schema + validador

## Exemplos

### project.json válido (versão 1)

```json
{
  "version": 1,
  "slug": "agiliza-mvp",
  "name": "Agiliza — MVP",
  "description": "Primeiro MVP do sistema de gestão ágil",
  "specs": "./milestones/01-mvp",
  "workspace": "D:\\sources\\agiliza",
  "agent": {
    "harness": "claude-code",
    "model": null,
    "max_turns": 50,
    "max_iterations": null,
    "max_features": null,
    "max_retries": 5
  },
  "artifacts": {
    "harness_config": { "type": "file", "path": "./agent-harness.json" },
    "harness_script": { "type": "file", "path": "./agent-harness.mjs" },
    "features": { "type": "file", "path": "./features.json" },
    "progress": { "type": "file", "path": "./agent-progress.txt" },
    "state": { "type": "file", "path": "./agent-harness.state" },
    "pid": { "type": "file", "path": "./agent-harness.pid" },
    "sessions": { "type": "dir", "path": "./.sessions" }
  }
}
```

### features.json válido

```json
[
  {
    "id": "F-001",
    "title": "Autenticação com email e senha",
    "description": "Implementar login, registro e logout",
    "status": "pending",
    "priority": 1,
    "dependencies": [],
    "retries": 0,
    "prp_ids": ["PRP-001"]
  }
]
```
