# F-014 — Worktrees e sessões — declaração e estrutura

- [x] session_template em agent-harness.json contém 'worktree' em dirs
- [x] Loop cria .sessions/{feature-id}/worktree/ como diretório vazio
- [x] .sessions/ presente no .gitignore do workspace
- [x] Monitor pode localizar worktrees via agent-harness.json → session_template → dirs
- [x] Diretório worktree/ é apenas placeholder — nenhuma lógica de git worktree
