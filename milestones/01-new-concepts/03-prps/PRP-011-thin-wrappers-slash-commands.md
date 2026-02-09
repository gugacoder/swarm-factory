# PRP-011 — Thin Wrappers (Slash Commands)

## Objetivo

Reescrever os slash commands da fábrica (`/run:create`, `/run:setup`, `/run:code`, `/run:loop`, `/run:status`) como thin wrappers que coletam parâmetros via chat e delegam à API determinística.

## Execution Mode

`implementar`

## Contexto

Atualmente os slash commands em `.claude/commands/run/` contêm lógica de negócio embarcada — criam JSONs, resolvem paths, copiam arquivos, executam scripts. Com a nova arquitetura, toda essa lógica migrou para a API MJS (`runs/.meta/api/`). Os commands se tornam thin wrappers que:

1. Coletam parâmetros conversacionalmente (conveniência)
2. Invocam a API via `node runs/.meta/api/{script}.mjs --flags`
3. Reportam resultado ao usuário

Os commands atuais estão em:
- `.claude/commands/run/create.md`
- `.claude/commands/run/setup.md`
- `.claude/commands/run/code.md`
- `.claude/commands/run/loop.md`
- `.claude/commands/run/status.md`

## Especificação

### /run:create

**Coleta:** slug, name, workspace, specs, harness, model, max_turns (via conversa)
**Invoca:** `node runs/.meta/api/create-project.mjs --slug X --name Y ...`
**Reporta:** JSON do projeto criado

O command deve instruir o agente a:
1. Perguntar ao usuário os campos obrigatórios (slug, name, workspace, specs, harness)
2. Oferecer defaults para campos opcionais (max_turns=50, max_retries=5)
3. Construir o comando CLI
4. Executar via bash
5. Mostrar resultado

### /run:setup

**Coleta:** path ou slug do projeto
**Invoca:** `node runs/.meta/api/init-workspace.mjs --slug X`
**Pós-invocação:** Executar o initializer (LLM) para gerar `features.json`

O command deve:
1. Identificar o projeto (slug ou path)
2. Executar a API determinística
3. Após sucesso, executar `/vibe:initialize` no workspace para gerar features
4. Reportar resultado

### /run:code

**Coleta:** path ou slug do projeto
**Invoca:** `cd {workspace} && MAX_FEATURES=1 node agent-harness.mjs`

O command deve:
1. Identificar o projeto
2. Carregar o projeto via API para obter workspace
3. Executar o harness MJS com `MAX_FEATURES=1`
4. É essencialmente um atalho para "rodar o loop uma vez"

### /run:loop

**Coleta:** path ou slug do projeto
**Invoca:** `cd {workspace} && node agent-harness.mjs`

O command deve:
1. Identificar o projeto
2. Carregar o projeto via API para obter workspace
3. Executar o harness MJS sem limite de features
4. Informar como fazer graceful stop (`touch .stop`)

### /run:status

**Coleta:** slug do projeto (opcional — sem slug, lista todos)
**Invoca:**
- Com slug: `node runs/.meta/api/get-status.mjs --slug X`
- Sem slug: `node runs/.meta/api/list-projects.mjs` seguido de status de cada um

**Reporta:** Tabela formatada com estado de cada projeto

### Padrão do thin wrapper

Cada command `.md` deve seguir este padrão:

```markdown
# /run:{comando}

[Descrição curta do que faz]

## Instruções

1. [Etapa de coleta de parâmetros]
2. Construir comando: `node runs/.meta/api/{script}.mjs --flags`
3. Executar via Bash
4. [Etapas pós-execução se houver]
5. Reportar resultado ao usuário

## Notas

- Toda a lógica de negócio está na API — o command apenas coleta e invoca
- Em caso de erro, mostrar a mensagem da API ao usuário
```

**Requisitos:** OSD058, RNF010

## Limites

- Não reimplementar lógica que já está na API — apenas invocar
- Não adicionar validação extra nos commands — a API já valida
- Não alterar a estrutura de diretórios dos commands (`.claude/commands/run/`)
- Cada command deve ter no máximo ~30 linhas de markdown
- Não criar novos commands — apenas reescrever os existentes
- Os commands `vibe:*` (initialize, code) que são copiados para o workspace continuam inalterados — eles já funcionam de forma standalone
