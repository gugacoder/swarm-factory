# PRP-002 — Biblioteca Compartilhada (lib/)

## Objetivo

Criar os módulos utilitários compartilhados que todas as APIs do Runs v2 consomem: resolução de paths, discovery de projetos e gerenciamento de artefatos.

## Execution Mode

`implementar`

## Contexto

Atualmente não existe nenhum módulo compartilhado — cada script (loop bash, snippets node inline) reimplementa lógica de leitura de JSON, resolução de paths e contagem de features ad hoc.

A estrutura de destino é:

```
runs/.meta/lib/
├── paths.mjs         # Resolução de paths
├── discovery.mjs     # Busca de projetos nos dois formatos
└── artifacts.mjs     # Geração e leitura de artefatos
```

O módulo `validate.mjs` já existe neste ponto (PRP-001).

## Especificação

### paths.mjs

Funções de resolução de paths conforme design.md (seção "Resolução de Paths"):

| Função | Assinatura | Descrição |
|--------|-----------|-----------|
| `resolvePath` | `(basePath: string, targetPath: string) => string` | Se `targetPath` começa com `./` ou `../`, resolve relativo a `basePath`. Se absoluto, retorna direto. |
| `resolveArtifacts` | `(workspace: string, artifacts: Record) => Record` | Aplica `resolvePath` em cada artefato, retornando paths absolutos |
| `normalizeSlashes` | `(path: string) => string` | Normaliza separadores para o SO corrente (cross-platform) |

Regras:
- Usar `node:path` para todas as operações de path
- `resolvePath` deve funcionar em Windows e Linux (RNF003)
- Não deve verificar se o path existe — apenas resolver

**Requisitos:** OSD027, RNF003, RNF005

### discovery.mjs

Funções de busca de projetos conforme design.md (seção "Formatos de project.json"):

| Função | Assinatura | Descrição |
|--------|-----------|-----------|
| `discoverProjects` | `(runsDir: string) => ProjectEntry[]` | Busca projetos nos dois formatos |
| `resolveProjectPath` | `(runsDir: string, identifier: string) => string \| null` | Dado um slug ou nome, encontra o path do `project.json` |

`ProjectEntry`:

```typescript
{
  path: string       // Path absoluto do project.json
  format: 'flat' | 'structured'
}
```

Formato flat: `runs/{project}_{milestone}.json` — qualquer `.json` na raiz de `runs/` (exceto dentro de `.meta/` e `workspaces/`)

Formato structured: `runs/{project}/{milestone}/project.json` — subdiretórios com `project.json` dentro

Ambos os formatos devem ser retornados na mesma lista.

**Requisitos:** OSD028, OSD029, OSD054

### artifacts.mjs

Funções para gerar e ler a estrutura de artefatos no workspace:

| Função | Assinatura | Descrição |
|--------|-----------|-----------|
| `getDefaultArtifacts` | `(version: number) => Record` | Retorna artefatos padrão para a versão |
| `getDefaultSessionTemplate` | `(version: number) => SessionTemplate` | Retorna template de sessão padrão para a versão |
| `ensureArtifactDirs` | `(workspace: string, artifacts: Record) => void` | Cria diretórios de artefatos que são do tipo `dir` |
| `readArtifact` | `(workspace: string, artifacts: Record, key: string) => string \| null` | Lê conteúdo de um artefato do tipo `file` |

Artefatos padrão da versão 1 conforme er.md (seção "Artefatos por Versão"):

| Chave | Tipo | Path |
|-------|------|------|
| harness_config | file | `./agent-harness.json` |
| harness_script | file | `./agent-harness.mjs` |
| setup_script | file | `./agent-setup.mjs` |
| features | file | `./features.json` |
| progress | file | `./agent-progress.txt` |
| state | file | `./agent-harness.state` |
| pid | file | `./agent-harness.pid` |
| sessions | dir | `./.sessions` |
| current_milestone | file | `./.sessions/.current-milestone` |

**Requisitos:** OSD025, OSD026, OSD097–OSD100

## Limites

- Não implementar lógica de negócio (criação de projeto, inicialização) — apenas utilitários
- Não acessar o filesystem para verificar existência de paths em `paths.mjs` — apenas resolver strings
- Não adicionar dependências externas — usar apenas `node:` built-ins
- Não ler/validar `project.json` — isso é feito pela API `load-project.mjs` usando `validate.mjs`
- `discovery.mjs` deve usar `node:fs/promises` com `readdir` — não usar `glob` ou libs externas
- Cada módulo deve ser importável individualmente e não depender de estado global

## Exemplos

### Resolução de paths

```
resolvePath("D:\\sources\\agiliza", "./features.json")
→ "D:\\sources\\agiliza\\features.json"

resolvePath("D:\\sources\\agiliza", "D:\\specs\\mvp")
→ "D:\\specs\\mvp"

resolvePath("/home/user/project", "../shared/specs")
→ "/home/user/shared/specs"
```

### Discovery

```
discoverProjects("D:\\swarm-factory\\runs")
→ [
    { path: "D:\\swarm-factory\\runs\\agiliza_mvp.json", format: "flat" },
    { path: "D:\\swarm-factory\\runs\\gestao\\01-mvp\\project.json", format: "structured" }
  ]
```
