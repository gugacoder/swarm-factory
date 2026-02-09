## F-006 — API load-project.mjs

- [x] Arquivo runs/.meta/api/load-project.mjs existe e exporta loadProject
- [x] loadProject(path) le, valida e retorna objeto com _source e _resolved
- [x] loadProject({ slug, runsDir }) encontra projeto via discovery e carrega
- [x] _resolved.specs contem path absoluto resolvido
- [x] _resolved.artifacts contem todos os paths absolutos dos artefatos
- [x] Lanca erro se JSON invalido com detalhes de validacao
- [x] Lanca erro se slug nao encontrado
- [x] Funciona como CLI: node runs/.meta/api/load-project.mjs runs/slug/project.json
