# F-004 — Biblioteca compartilhada — artifacts.mjs

- [x] Arquivo runs/.meta/lib/artifacts.mjs existe e exporta getDefaultArtifacts, getDefaultSessionTemplate, ensureArtifactDirs, readArtifact
- [x] getDefaultArtifacts(1) retorna Record com todos os 9 artefatos da versão 1 conforme er.md
- [x] getDefaultSessionTemplate(1) retorna { pattern, files, dirs } com worktree em dirs
- [x] ensureArtifactDirs cria diretórios para artefatos do tipo dir
- [x] readArtifact lê conteúdo de artefato file e retorna null se não existir
- [x] Usa apenas node: built-ins
