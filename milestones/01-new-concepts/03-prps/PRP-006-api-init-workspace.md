# PRP-006 — API init-workspace.mjs

## Objetivo

Implementar o endpoint `init-workspace.mjs` que prepara o workspace destino com todos os artefatos, scripts e configurações necessários para o loop funcionar de forma autônoma.

## Execution Mode

`implementar`

## Contexto

Atualmente o setup de workspace é feito pelo slash command `/run:setup` que executa uma sequência manual de operações: cria diretórios, copia scripts, gera JSON de config, e chama o initializer (LLM) para gerar `features.json`. O novo sistema separa a parte determinística (este PRP) da parte semântica (geração de features, que continua na LLM via vibe:initialize).

A API vive em `runs/.meta/api/init-workspace.mjs` e depende de:
- `runs/.meta/api/load-project.mjs` (PRP-004) — carregamento do projeto
- `runs/.meta/lib/artifacts.mjs` (PRP-002) — artefatos padrão e session template
- `runs/.meta/lib/paths.mjs` (PRP-002) — resolução de paths

Estrutura de templates por harness (já existente em parte):

```
runs/.meta/harnesses/
├── claude-code/
│   ├── agent-harness.mjs       # Script do loop (novo, MJS)
│   └── commands/vibe/
│       ├── initialize.md
│       └── code.md
├── opencode/
│   └── ...
└── codex/
    └── ...
```

## Especificação

### Interface

**Como CLI:**
```bash
node runs/.meta/api/init-workspace.mjs runs/agiliza-mvp/project.json
node runs/.meta/api/init-workspace.mjs --slug agiliza-mvp
```

**Como módulo ES:**
```javascript
import { initWorkspace } from '../api/init-workspace.mjs'

await initWorkspace('runs/agiliza-mvp/project.json')
await initWorkspace({ slug: 'agiliza-mvp' })
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| path | string | Caminho direto para o `project.json` |
| slug | string | Slug do projeto (alternativa ao path) |

### Fluxo de execução

1. Carregar projeto via `loadProject()` (valida e resolve paths)
2. Criar diretório `workspace` se não existir
3. Gerar `agent-harness.json` no workspace com:
   - Todos os campos do `project.json`
   - Paths resolvidos para absolutos
   - Campo `notifications: []` (vazio — configurável pelo dev destino)
   - Campo `version` copiado do projeto
4. Copiar `agent-harness.mjs` do template do harness escolhido (`runs/.meta/harnesses/{harness}/agent-harness.mjs`)
5. Gerar comandos do harness no workspace destino:
   - Se `claude-code` → copiar `runs/.meta/harnesses/claude-code/commands/vibe/*.md` para `{workspace}/.claude/commands/vibe/`
   - Se `opencode` → copiar equivalente para `{workspace}/.opencode/commands/`
   - Se `codex` → estrutura equivalente
6. Criar diretórios de artefatos do tipo `dir` (ex: `.sessions/`)
7. Criar `.sessions/.current-milestone` com o slug do projeto
8. Adicionar `.sessions/` ao `.gitignore` do workspace (se existir `.gitignore` e a entrada não estiver lá; se não existir `.gitignore`, criar com essa entrada)
9. Criar `agent-progress.txt` vazio (se não existir)
10. Registrar versão em cada artefato gerado (como comentário no topo ou campo `_version` nos JSONs)

### agent-harness.json gerado

```json
{
  "_version": 1,
  "slug": "agiliza-mvp",
  "name": "Agiliza — MVP",
  "specs": "D:\\sources\\agiliza\\milestones\\01-mvp",
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
    "harness_config": "D:\\sources\\agiliza\\agent-harness.json",
    "harness_script": "D:\\sources\\agiliza\\agent-harness.mjs",
    "features": "D:\\sources\\agiliza\\features.json",
    "progress": "D:\\sources\\agiliza\\agent-progress.txt",
    "state": "D:\\sources\\agiliza\\agent-harness.state",
    "pid": "D:\\sources\\agiliza\\agent-harness.pid",
    "sessions": "D:\\sources\\agiliza\\.sessions"
  },
  "session_template": {
    "pattern": "./.sessions/{feature-id}/",
    "files": ["checklist.md", "output.jsonl", "pid", "started_at", "finished_at"],
    "dirs": ["worktree"]
  },
  "notifications": []
}
```

### Comportamento de reinicialização

- Se chamado em um workspace já inicializado, **sobrescrever** artefatos gerados (harness.json, harness.mjs, commands)
- **Não** sobrescrever `features.json` (pode ter progresso)
- **Não** sobrescrever `agent-progress.txt` (pode ter histórico)
- **Não** apagar `.sessions/` (pode ter sessões anteriores)

**Requisitos:** OSD053, OSD091, OSD092, OSD097–OSD104, OSD172, RNF007, RNF009

## Limites

- Não gerar `features.json` — isso é responsabilidade do initializer (LLM) via `vibe:initialize`
- Não executar o initializer — apenas preparar o workspace para que o initializer possa ser executado depois
- Não instalar dependências (npm install) — o workspace pode já ter suas deps
- Não alterar código existente no workspace — apenas criar/sobrescrever artefatos da fábrica
- Os templates de commands (`.md` files) devem ser copiados literalmente do harness — não modificar conteúdo
- Não remover o `agent-harness.sh` antigo se existir — manter backward compatibility temporária
