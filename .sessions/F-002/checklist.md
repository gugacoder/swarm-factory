# F-002 — Biblioteca compartilhada — paths.mjs

- [x] Arquivo runs/.meta/lib/paths.mjs existe e exporta resolvePath, resolveArtifacts, normalizeSlashes
- [x] resolvePath('D:\sources\app', './features.json') retorna 'D:\sources\app\features.json'
- [x] resolvePath('D:\sources\app', 'D:\specs\mvp') retorna 'D:\specs\mvp' (absoluto direto)
- [x] resolvePath('/home/user/project', '../shared/specs') retorna '/home/user/shared/specs'
- [x] resolveArtifacts resolve todos os paths de artefatos de relativos para absolutos
- [x] normalizeSlashes funciona para separadores Windows e Linux
- [x] Usa apenas node: built-ins (node:path)
