# F-005 — API create-project.mjs

- [x] Arquivo runs/.meta/api/create-project.mjs existe e exporta createProject
- [x] createProject({slug, name, workspace, specs, harness}) cria project.json válido
- [x] JSON gerado contém version:1, todos os campos obrigatórios e artifacts padrão
- [x] Formato structured: cria runs/{slug}/project.json com mkdir do diretório
- [x] Formato flat: cria runs/{slug}.json
- [x] Lança erro se arquivo já existir no destino
- [x] Lança erro se validação falhar (campo obrigatório ausente)
- [x] Funciona como CLI: node runs/.meta/api/create-project.mjs --slug x --name y ...
- [x] CLI aceita --max-turns (dash) como alias de max_turns (underscore)
