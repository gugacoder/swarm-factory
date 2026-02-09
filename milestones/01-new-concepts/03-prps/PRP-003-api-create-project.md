# PRP-003 — API create-project.mjs

## Objetivo

Implementar o endpoint `create-project.mjs` que cria um `project.json` validado a partir de parâmetros recebidos via CLI ou import.

## Execution Mode

`implementar`

## Contexto

Atualmente a criação de runs é feita pelo slash command `/run:create` que gera manualmente um JSON baseado no schema `run.schema.json`. O novo sistema substitui isso por uma API determinística em MJS que valida contra o schema, resolve paths e escreve o arquivo no formato correto.

A API vive em `runs/.meta/api/create-project.mjs` e depende de:
- `runs/.meta/lib/validate.mjs` (PRP-001) — validação do schema
- `runs/.meta/lib/paths.mjs` (PRP-002) — resolução de paths
- `runs/.meta/lib/artifacts.mjs` (PRP-002) — artefatos padrão por versão

## Especificação

### Interface

**Como CLI:**
```bash
node runs/.meta/api/create-project.mjs \
  --slug agiliza-mvp \
  --name "Agiliza — MVP" \
  --workspace "D:\sources\agiliza" \
  --specs "./milestones/01-mvp" \
  --harness claude-code \
  --format structured
```

**Como módulo ES:**
```javascript
import { createProject } from '../api/create-project.mjs'

const project = await createProject({
  slug: 'agiliza-mvp',
  name: 'Agiliza — MVP',
  workspace: 'D:\\sources\\agiliza',
  specs: './milestones/01-mvp',
  harness: 'claude-code',
  format: 'structured'
})
```

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| slug | string | sim | — | Identificador machine-friendly |
| name | string | sim | — | Nome humano do projeto |
| description | string | não | null | Contexto sobre o projeto |
| workspace | string | sim | — | Caminho absoluto do workspace |
| specs | string | sim | — | Caminho para specs (relativo ao workspace ou absoluto) |
| harness | string | sim | — | Agente a usar (claude-code, opencode, codex) |
| model | string | não | null | Modelo do agente |
| max_turns | integer | não | 50 | Turns por sessão |
| max_iterations | integer | não | null | Iterações do loop |
| max_features | integer | não | null | Features a completar |
| max_retries | integer | não | 5 | Tentativas por feature |
| format | string | não | structured | Formato: `flat` ou `structured` |

### Fluxo de execução

1. Parsear argumentos (CLI via `node:util.parseArgs`, import via objeto direto)
2. Montar objeto `project.json` com:
   - `version: 1`
   - Campos recebidos nos parâmetros
   - `agent` montado a partir dos campos `harness`, `model`, `max_turns`, `max_iterations`, `max_features`, `max_retries`
   - `artifacts` preenchido com `getDefaultArtifacts(1)` do `artifacts.mjs`
3. Validar contra `project.schema.json` via `validateProject()`
4. Se inválido, lançar erro com detalhes de validação
5. Determinar path de escrita conforme formato:
   - Flat: `runs/{slug}.json`
   - Structured: `runs/{slug}/project.json` (criar diretório se necessário)
6. Verificar se já existe arquivo no destino — se sim, lançar erro (não sobrescrever)
7. Escrever JSON formatado (indent 2)
8. Retornar o objeto do projeto

### Saída

**Sucesso (CLI):** imprimir JSON do projeto criado em stdout
**Sucesso (import):** retornar o objeto do projeto
**Erro:** lançar Error com mensagem descritiva

### CLI parsing

Usar `node:util.parseArgs` com `strict: true`. Parâmetros com `_` (underline) no nome aceitam também `-` (dash) na CLI: `--max-turns` → `max_turns`.

**Requisitos:** OSD050, OSD051, OSD056, OSD057, OSD020–OSD029, RNF001, RNF002, RNF009

## Limites

- Não inicializar o workspace — isso é responsabilidade do `init-workspace.mjs` (PRP-006)
- Não validar se o `workspace` ou `specs` existem no filesystem — apenas validar formato
- Não sobrescrever `project.json` existente — lançar erro
- Não migrar runs antigos — o formato antigo continua válido para o `discovery.mjs`
- Não adicionar dependências externas — usar apenas `node:` built-ins + `ajv` (já instalado pelo PRP-001)

## Exemplos

### Criação no formato structured

```bash
node runs/.meta/api/create-project.mjs \
  --slug meu-app \
  --name "Meu App" \
  --workspace "/home/user/meu-app" \
  --specs "./docs/specs" \
  --harness claude-code
```

Cria: `runs/meu-app/project.json`

### Criação no formato flat

```bash
node runs/.meta/api/create-project.mjs \
  --slug meu-app \
  --name "Meu App" \
  --workspace "/home/user/meu-app" \
  --specs "./docs/specs" \
  --harness claude-code \
  --format flat
```

Cria: `runs/meu-app.json`

### Erro — slug já existe

```
Error: Projeto já existe em runs/meu-app/project.json. Use outro slug ou remova o existente.
```
