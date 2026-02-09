# F-001 — Schemas JSON e módulo de validação

- [x] Arquivo runs/.meta/schema/project.schema.json existe e é JSON Schema válido
- [x] Arquivo runs/.meta/schema/features.schema.json existe e é JSON Schema válido
- [x] Arquivo runs/.meta/lib/validate.mjs existe e exporta validateProject, validateFeatures, loadSchema
- [x] validateProject() retorna { valid: true } para um project.json válido conforme exemplo do PRP-001
- [x] validateProject() retorna { valid: false, errors: [...] } para JSON com campos ausentes ou inválidos
- [x] validateFeatures() retorna { valid: true } para um features.json válido conforme exemplo do PRP-001
- [x] validateFeatures() retorna { valid: false, errors: [...] } para features com status inválido
- [x] ajv está instalado como dependência no package.json
- [x] Schemas são carregados via import.meta.url com node:fs/promises
