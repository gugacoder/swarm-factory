F-013 — Thin wrappers — slash commands reescritos
- [x] create.md reescrito como thin wrapper que invoca create-project.mjs
- [x] setup.md reescrito: invoca init-workspace.mjs + /vibe:initialize
- [x] code.md reescrito: invoca agent-harness.mjs com MAX_FEATURES=1
- [x] loop.md reescrito: invoca agent-harness.mjs sem limite
- [x] status.md reescrito: invoca get-status.mjs ou list-projects.mjs
- [x] Cada command tem no máximo ~30 linhas de markdown
- [x] Nenhum command reimplementa lógica — apenas coleta params e invoca API
