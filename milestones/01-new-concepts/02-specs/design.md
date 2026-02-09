# Swarm Factory — Design e Arquitetura (Runs v2)

Decisões técnicas e arquiteturais para a reestruturação do módulo Runs.

---

## Stack Principal

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Runtime | Node.js (ES Modules) | JSON é cidadão de primeira classe; cross-platform sem Git Bash |
| Scripts | `.mjs` | Consistência: uma linguagem em toda a stack; error handling estruturado |
| Validação | zod ou ajv | Schema validation em runtime antes de qualquer operação |
| Processo | `node:child_process` | Spawn de agentes (claude, opencode, codex) |
| Filesystem | `node:fs/promises` | Operações async de arquivo |
| CLI parsing | `node:util.parseArgs` | Sem dependências externas para CLI |

---

## Estrutura do Módulo Runs

```
runs/
├── .meta/
│   ├── api/                         # SDK DETERMINÍSTICA
│   │   ├── create-project.mjs       # Cria project.json
│   │   ├── load-project.mjs         # Lê, valida, resolve paths
│   │   ├── init-workspace.mjs       # Gera artefatos no destino
│   │   ├── list-projects.mjs        # Discovery nos dois formatos
│   │   └── get-status.mjs           # Estado atual via artefatos
│   │
│   ├── harnesses/                   # TEMPLATES POR AGENTE
│   │   ├── claude-code/
│   │   │   ├── agent-harness.mjs    # Script do loop
│   │   │   └── commands/vibe/       # Templates de commands
│   │   │       ├── initialize.md
│   │   │       └── code.md
│   │   ├── opencode/
│   │   │   └── ...
│   │   └── codex/
│   │       └── ...
│   │
│   ├── schema/
│   │   ├── project.schema.json      # Schema do project.json
│   │   └── features.schema.json     # Schema do features.json
│   │
│   └── lib/                         # CÓDIGO COMPARTILHADO
│       ├── paths.mjs                # Resolução de paths
│       ├── validate.mjs             # Validação de schemas
│       ├── discovery.mjs            # Busca de projetos nos dois formatos
│       └── artifacts.mjs            # Geração e leitura de artefatos
│
├── {project}_{milestone}.json       # Formato flat
├── {project}/
│   └── {milestone}/
│       └── project.json             # Formato structured
│
└── workspaces/                      # Workspaces de prototipação
```

---

## Estrutura do Workspace Destino (após init)

```
workspace/
├── agent-harness.json               # Config resolvida (autônomo)
├── agent-harness.mjs                # Script do loop (copiado do harness)
├── agent-setup.mjs                  # Script de setup (opcional)
├── features.json                    # Tracking de features
├── agent-progress.txt               # Log textual de progresso
├── .sessions/                       # ← no .gitignore
│   ├── .current-milestone
│   └── {feature-id}/
│       ├── checklist.md
│       ├── output.jsonl
│       ├── pid
│       ├── started_at
│       ├── finished_at
│       └── worktree/               # (futuro) git worktree isolado
│
└── .claude/commands/vibe/           # (ou .opencode/ ou equiv.)
    ├── initialize.md
    └── code.md
```

---

## Fluxo de Criação de Projeto

1. Operador invoca `create-project.mjs` com parâmetros (via CLI ou via thin wrapper do agente)
2. API valida parâmetros contra o schema
3. API resolve paths (relativos ao workspace, absolutos direto)
4. API escreve `project.json` no formato escolhido (flat ou structured)
5. API retorna o objeto do projeto validado

---

## Fluxo de Inicialização de Workspace

1. API lê e valida `project.json` via `load-project.mjs`
2. API identifica a versão e determina quais artefatos existem
3. API cria diretórios necessários (`mkdir -p` equivalente)
4. API gera `agent-harness.json` com paths resolvidos
5. API copia `agent-harness.mjs` do template do harness escolhido
6. API gera comandos do harness no destino (`.claude/commands/vibe/` etc.)
7. API verifica e adiciona `.sessions/` ao `.gitignore`
8. API registra versão nos artefatos gerados
9. **A partir daqui, a LLM entra**: initializer lê specs e gera `features.json`

---

## Fluxo do Ralph Wiggum Loop (unificado)

```
              ┌──────────────┐
              │  Início      │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │ Ler config   │  ← agent-harness.json
              │ Ler features │  ← features.json
              └──────┬───────┘
                     ▼
              ┌──────────────┐    features_done >= max_features?
              │ Selecionar   │──── SIM ──→ FIM
              │ próxima      │
              │ feature      │──── NENHUMA ELEGÍVEL ──→ FIM
              └──────┬───────┘
                     │ feature selecionada
                     ▼
              ┌──────────────┐
              │ Marcar       │  status: in_progress
              │ in_progress  │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │ Spawnar      │  max_turns por sessão
              │ agente       │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │ Testes       │
              │ passaram?    │
              └──┬───────┬───┘
                SIM     NÃO
                 │       │
                 ▼       ▼
           ┌─────────┐ ┌──────────────┐
           │ passing  │ │ retries++    │
           │ count++  │ │ >= max?      │
           └────┬────┘ └──┬───────┬───┘
                │        NÃO    SIM
                │         │      │
                │         │      ▼
                │         │  ┌──────────────┐
                │         │  │ Rotação?     │
                │         │  │ Já rotou?    │
                │         │  └──┬───────┬───┘
                │         │   NÃO     SIM
                │         │    │       │
                │         │    ▼       ▼
                │         │  rotação  skipped
                │         │    │
                │         ▼    ▼
                └────→ LOOP (volta pra seleção)
```

---

## Consumers da API

| Consumer | Coleta de Parâmetros | Invocação |
|----------|---------------------|-----------|
| CLI direto | `--flags` | `node runs/.meta/api/create-project.mjs --slug x` |
| Claude Code commands | Chat conversacional | Thin wrapper → API |
| Dashboard/monitor | UI forms | Import da SDK |
| Scripts de automação | Programático | Import da SDK |

---

## Resolução de Paths

Regra única e consistente:

| Tipo de path | Resolução |
|--------------|-----------|
| Relativo (`./` ou `../`) | A partir do `workspace` |
| Absoluto | Usa direto |

Aplica-se a: `specs`, todos os paths em `artifacts`, e qualquer referência no JSON.

---

## Versionamento de Artefatos

| Aspecto | Decisão |
|---------|---------|
| Campo `version` | Inteiro no `project.json` — define quais artefatos existem |
| Artefatos gerados | Carregam a versão dentro deles (metadata) |
| Sobreposição | A cada init, sobrescreve com a versão corrente |
| Compatibilidade | Novas versões podem adicionar artefatos; remoção é breaking change |

---

## Separação LLM vs Determinístico

| Operação | Executado por |
|----------|---------------|
| Criar `project.json` | API determinística |
| Criar estrutura de artefatos | API determinística |
| Copiar/gerar scripts do harness | API determinística |
| Listar projetos | API determinística |
| Ler status | API determinística |
| Validar schemas | API determinística |
| Coletar parâmetros via chat | LLM (conveniência) |
| Gerar `features.json` a partir de specs | LLM (semântica) |
| Implementar features (o loop) | LLM (codificação) |
| Registrar guardrails/lições | LLM (reflexão) |

---

## Configuração do Agente

```jsonc
"agent": {
  "harness": "claude-code",     // Qual agente usar
  "model": null,                // Modelo (null = default do agente)
  "max_turns": 50,              // Turns por sessão de agente
  "max_iterations": null,       // Iterações totais do loop (null = sem limite)
  "max_features": null,         // Features a completar (null = sem limite, 1 = "sessão manual")
  "max_retries": 5              // Tentativas por feature antes de rotação/skip
}
```

---

## Convenções de Código

| Item | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos | kebab-case | `create-project.mjs` |
| Variáveis/funções | camelCase | `loadProject()` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_MAX_RETRIES` |
| Campos JSON | snake_case | `max_turns`, `feature_id` |
| Imports Node.js | Prefixo `node:` | `import { readFile } from 'node:fs/promises'` |
| Módulos | ES Modules (`.mjs`) | `import/export` |
| Error handling | try/catch estruturado | Sem `set -e` ou `|| exit 1` |

---

## Harnesses Suportados

| Harness | Estrutura de Comandos | Invocação |
|---------|----------------------|-----------|
| `claude-code` | `.claude/commands/vibe/` | `claude --command vibe:code` |
| `opencode` | `.opencode/commands/vibe/` | via opencode CLI |
| `codex` | Estrutura equivalente | via codex CLI |

A semântica dos comandos (`initialize`, `code`) é a mesma entre harnesses. O path muda conforme o harness.

---

## Rastreabilidade

| Componente | Requisitos |
|------------|------------|
| Stack | OSD070–OSD073, RNF001–RNF004 |
| Estrutura Runs | OSD050–OSD057, OSD001–OSD005 |
| Estrutura Workspace | OSD090–OSD104, RNF007 |
| Fluxo de Criação | OSD020–OSD031, OSD051 |
| Fluxo de Init | OSD053, OSD101–OSD104, OSD172 |
| Fluxo do Loop | OSD093–OSD096, OSD120–OSD131 |
| Consumers | OSD056–OSD058, OSD190–OSD192 |
| Resolução de Paths | OSD027, RNF005 |
| Versionamento | OSD026, OSD103, RNF006 |
| LLM vs Determinístico | RNF009, RNF010 |
| Configuração do Agente | OSD130, OSD131 |
| Convenções | RNF011–RNF013 |
