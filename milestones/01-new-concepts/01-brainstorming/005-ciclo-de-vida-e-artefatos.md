# Ciclo de Vida e Artefatos Completos

## Dois níveis de JSON

### project.json (vive no Runs)
Controle macro do processo e do método. Contém slug, name, description, version, specs, workspace, agent config e a declaração completa de artifacts. É o arquivo da fábrica — quem orquestra.

### agent-harness.json (vive no workspace destino)
Versão simplificada com os paths resolvidos. Torna o workspace autônomo. Uma pessoa que nunca ouviu falar do swarm-factory abre o workspace, tem tudo lá, e roda o loop sozinha sem depender de qualquer ferramenta externa.

## Autonomia do destino

O sistema de Runs cria a estrutura no destino, mas a partir daí o destino é independente. O workspace só precisa do `agent-harness.mjs` e dos comandos `vibe:*` pra operar. Qualquer pessoa pode executar o Ralph Wiggum Loop no seu projeto sem o sistema de Runs — Runs é conveniência de criação e gestão, não dependência de execução.

## Não existe modo separado Code vs Loop

É tudo Ralph Wiggum Loop com controle de execução:
- `max_iterations: null` → infinito
- `max_iterations: 5` → para depois de 5 iterações
- `max_features: 1` → para depois de completar 1 feature (executar "só a próxima")

"Rodar uma sessão manual" é simplesmente `max_features: 1`.

## Artefatos completos (v1)

Regra: todos os artefatos conhecidos devem estar declarados no project.json. Uma ferramenta de monitoramento pode tirar proveito disso.

```jsonc
"artifacts": {

  // --- Artefatos de projeto (gerados pelo initializer) ---
  "harness_config":  { "type": "file", "path": "./agent-harness.json" },
  "harness_script":  { "type": "file", "path": "./agent-harness.mjs" },
  "setup_script":    { "type": "file", "path": "./agent-setup.mjs" },
  "features":        { "type": "file", "path": "./features.json" },
  "progress":        { "type": "file", "path": "./agent-progress.txt" },

  // --- Artefatos de runtime (gerados pelo loop) ---
  "state":             { "type": "file", "path": "./agent-harness.state" },
  "pid":               { "type": "file", "path": "./agent-harness.pid" },

  // --- Sessões ---
  "sessions":          { "type": "dir",  "path": "./.sessions" },
  "current_milestone": { "type": "file", "path": "./.sessions/.current-milestone" },

  // --- Template de sessão por feature ---
  "session_template": {
    "pattern": "./.sessions/{feature-id}/",
    "files": [
      "checklist.md",
      "output.jsonl",
      "pid",
      "started_at",
      "finished_at"
    ]
  },

  // --- Comandos do harness (copiados/gerados conforme harness) ---
  // Exemplo para claude-code:
  "commands": {
    "initialize": { "type": "file", "path": "./.claude/commands/vibe/initialize.md" },
    "code":       { "type": "file", "path": "./.claude/commands/vibe/code.md" }
  }
}
```

### Paths dos commands por harness

- **Claude Code**: `.claude/commands/vibe/`
- **OpenCode**: `.opencode/commands/vibe/`
- **Codex**: estrutura equivalente

A semântica é a mesma (`initialize`, `code`), o path muda conforme o harness escolhido.

### Sobreposição

Na estrutura do destino não existem versões diferentes dos artefatos — só existe o último que foi produzido. A cada inicialização, os arquivos são sobrescritos com a versão corrente.
