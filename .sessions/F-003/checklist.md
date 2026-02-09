# F-003 — Biblioteca compartilhada — discovery.mjs

- [x] Arquivo runs/.meta/lib/discovery.mjs existe e exporta discoverProjects, resolveProjectPath
- [x] discoverProjects retorna array de { path, format } para ambos os formatos
- [x] Formato flat: detecta arquivos .json na raiz de runs/ (exceto .meta/ e workspaces/)
- [x] Formato structured: detecta project.json dentro de subdiretórios de runs/
- [x] resolveProjectPath encontra path por slug
- [x] resolveProjectPath retorna null se slug não encontrado
- [x] Usa apenas node: built-ins (node:fs/promises, node:path)
