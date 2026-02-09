# F-011 — Resiliência e gutter detection

- [x] retries é incrementado em features.json após cada falha
- [x] Após max_retries falhas: rotação de contexto executada
- [x] Rotação registra no agent-progress.txt: [ROTAÇÃO] Feature {id}
- [x] Rollback executado conforme config: git stash (default), git reset --hard, ou none
- [x] Rollback registrado no agent-progress.txt: [ROLLBACK] ...
- [x] Após max_retries*2 falhas: feature marcada como skipped
- [x] Skip registrado no agent-progress.txt: [SKIP] Feature {id}
- [x] agent-guardrails.md criado/atualizado com lições aprendidas (fatos, não interpretações)
- [x] Feature skipped bloqueia naturalmente dependentes (skipped não satisfaz dependências)
