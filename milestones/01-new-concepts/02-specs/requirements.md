# Swarm Factory — Requisitos do Sistema (Runs v2)

Requisitos para a reestruturação do módulo Runs: separação de módulos, API determinística em MJS, novo formato de projeto, ciclo de vida completo, resiliência e controle.

---

## Separação de Módulos

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD001 | O sistema deve tratar Projects, Runs e Scaffolds como módulos completamente independentes |
| OSD002 | O módulo Projects deve funcionar exclusivamente como catálogo de especificações (brainstorming, specs, PRPs, refs) |
| OSD003 | O módulo Scaffolds deve funcionar exclusivamente como gestor de stacks tecnológicas para criação de aplicativos |
| OSD004 | O módulo Runs deve funcionar como sistema autônomo do Ralph Wiggum Loop, sem dependência dos outros módulos |
| OSD005 | O módulo Runs deve oferecer sua própria SDK executável manualmente sem ferramentas externas |

---

## Formato de Projeto (project.json)

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD020 | O sistema deve adotar um novo formato `project.json` portável, auto-descritivo e versionado |
| OSD021 | O `project.json` deve conter os campos `version`, `slug`, `name`, `description`, `specs`, `workspace`, `agent` e `artifacts` |
| OSD022 | O campo `slug` deve ser um identificador machine-friendly usado como chave em APIs, dashboards e logs |
| OSD023 | O campo `specs` deve apontar para o diretório de requisitos (specs, PRPs, refs), relativo ao workspace ou absoluto |
| OSD024 | O campo `workspace` deve conter o caminho absoluto para o diretório de desenvolvimento |
| OSD025 | O campo `artifacts` deve declarar explicitamente todos os artefatos conhecidos com tipo (`file`/`dir`) e path |
| OSD026 | O campo `version` deve definir quais artefatos existem para aquela versão |
| OSD027 | O sistema deve resolver paths relativos (`./` ou `../`) a partir do `workspace` e paths absolutos diretamente |
| OSD028 | O sistema deve suportar dois formatos de arquivo: `runs/{project}_{milestone}.json` (flat) e `runs/{project}/{milestone}/project.json` (structured) |
| OSD029 | Ambos os formatos de arquivo devem produzir o mesmo objeto em memória |
| OSD030 | O `project.json` não deve conter referência a scaffolds |
| OSD031 | Todos os comandos do sistema devem ler paths declarados no `project.json` em vez de assumir paths hardcoded |

---

## API Determinística

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD050 | O sistema deve implementar uma API em `.mjs` que viva dentro de `runs/.meta/api/` |
| OSD051 | A API deve expor `create-project.mjs` para criar `project.json` com parâmetros recebidos |
| OSD052 | A API deve expor `load-project.mjs` para ler, validar e resolver paths do `project.json` |
| OSD053 | A API deve expor `init-workspace.mjs` para gerar artefatos no workspace baseado na versão |
| OSD054 | A API deve expor `list-projects.mjs` para discovery nos dois formatos suportados |
| OSD055 | A API deve expor `get-status.mjs` para determinar estado atual lendo artefatos |
| OSD056 | A API deve ser invocável via CLI diretamente (ex: `node runs/.meta/api/create-project.mjs --slug x`) |
| OSD057 | A API deve ser importável como módulo ES por outros sistemas |
| OSD058 | Os comandos do Claude Code devem se tornar thin wrappers que coletam parâmetros e chamam a API |
| OSD059 | A API deve validar o `project.json` contra o schema na leitura usando validação estruturada (ajv ou zod) |

---

## MJS como Padrão

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD070 | Toda a stack do Runs deve usar `.mjs` — SDK, API, e harness gerado no workspace |
| OSD071 | O `agent-harness.sh` deve ser substituído por `agent-harness.mjs` |
| OSD072 | A invocação do loop deve ser `node agent-harness.mjs` em vez de `bash agent-harness.sh` |
| OSD073 | Todos os scripts da API devem usar ES Modules com imports `node:` prefixados |

---

## Ciclo de Vida e Artefatos

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD090 | O sistema deve manter dois níveis de JSON: `project.json` (fábrica) e `agent-harness.json` (workspace) |
| OSD091 | O `agent-harness.json` deve conter paths resolvidos que tornam o workspace autônomo |
| OSD092 | O workspace deve funcionar independentemente do swarm-factory após inicialização |
| OSD093 | O loop deve ser unificado — não deve existir modo separado Code vs Loop |
| OSD094 | O parâmetro `max_features: 1` deve substituir o conceito de "sessão manual" |
| OSD095 | O parâmetro `max_features: null` deve representar execução sem limite |
| OSD096 | O parâmetro `max_iterations: null` deve representar loop infinito |
| OSD097 | Os artefatos de projeto devem incluir: `harness_config`, `harness_script`, `setup_script`, `features`, `progress` |
| OSD098 | Os artefatos de runtime devem incluir: `state`, `pid` |
| OSD099 | Os artefatos de sessão devem incluir: `sessions` (dir), `current_milestone` |
| OSD100 | O `session_template` deve definir o padrão de sessão por feature com: `checklist.md`, `output.jsonl`, `pid`, `started_at`, `finished_at` |
| OSD101 | A API de inicialização deve gerar comandos específicos do harness escolhido no workspace destino |
| OSD102 | Se Claude Code → gerar `.claude/commands/vibe/`; se OpenCode → gerar `.opencode/commands/`; se Codex → estrutura equivalente |
| OSD103 | Os arquivos gerados no destino devem carregar a versão corrente |
| OSD104 | A cada inicialização, artefatos no destino devem ser sobrescritos com a versão corrente |

---

## Resiliência e Controle

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD120 | O loop deve implementar gutter detection (detecção de falha repetitiva por feature) |
| OSD121 | Após X falhas consecutivas (default: 5, configurável via `max_retries`), o loop deve forçar rotação de contexto |
| OSD122 | Rotação de contexto deve matar a sessão atual e spawnar nova com contexto limpo |
| OSD123 | Após X falhas adicionais pós-rotação, o loop deve pular a feature (marcar como `skipped`) |
| OSD124 | O sistema deve manter um arquivo de guardrails/lições aprendidas, lido no startup e escrito após falhas |
| OSD125 | O loop deve poder executar rollback automático (`git stash` ou `git reset`) pro último commit limpo quando uma sessão falha |
| OSD126 | O status de feature deve suportar os estados: `pending`, `in_progress`, `failing`, `blocked`, `skipped`, `passing` |
| OSD127 | O estado `in_progress` deve prevenir que runs concorrentes peguem a mesma feature |
| OSD128 | O estado `skipped` deve ser atribuído pelo gutter detection após falhas consecutivas |
| OSD129 | O estado `blocked` deve ser computado a partir de dependências não satisfeitas |
| OSD130 | O campo `max_features` deve ser incluído na configuração do agente |
| OSD131 | O campo `max_retries` deve ser incluído na configuração do agente |

---

## Webhooks e Notificações

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD150 | O `agent-harness.json` deve suportar configuração de webhooks no campo `notifications` |
| OSD151 | Os webhooks devem ser configurados como array de endpoints com URL e filtro de eventos |
| OSD152 | Os eventos suportados devem incluir: `completed`, `stopped`, `error` e wildcard `*` |
| OSD153 | Os webhooks devem ser disparados sequencialmente ao final do loop ou em transições de estado |
| OSD154 | Erros individuais de webhook devem ser ignorados (try/catch por webhook) sem impedir os demais |
| OSD155 | Os webhooks devem operar em modo fire-and-forget, sem retry |

---

## Worktrees e Execução Paralela (futuro)

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD170 | O `session_template` deve declarar `worktree` como artefato de diretório |
| OSD171 | Worktrees devem ficar dentro da sessão da feature (`.sessions/{feature-id}/worktree/`) |
| OSD172 | O initializer deve verificar e adicionar `.sessions/` ao `.gitignore` do workspace |
| OSD173 | O sistema de monitoramento deve poder usar o worktree declarado para subir preview isolado por feature |

---

## Documentação de Integração

### RF — Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OSD190 | O sistema deve manter documentação de uso e integração do módulo Runs |
| OSD191 | A documentação deve cobrir: criação de projeto, inicialização de workspace, execução do loop, consulta de estado, parada graceful, e artefatos disponíveis |
| OSD192 | A documentação deve tratar Runs como caixa preta — documentar a interface externa, não a implementação interna |

---

## RNF — Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| RNF001 | Toda a stack deve usar ES Modules (`.mjs`) com Node.js built-ins prefixados com `node:` |
| RNF002 | JSON deve ser a operação central do sistema — leitura e escrita nativas sem dependências externas como `jq` |
| RNF003 | O sistema deve ser cross-platform — rodar em Windows sem Git Bash/MSYS2 |
| RNF004 | Error handling deve ser estruturado via try/catch |
| RNF005 | O `project.json` deve ser a única fonte da verdade para paths e configuração |
| RNF006 | Artefatos gerados devem carregar a versão que os produziu |
| RNF007 | O workspace destino deve ser autocontido após inicialização — independente do swarm-factory |
| RNF008 | Validação de schema deve ocorrer em runtime antes de qualquer operação |
| RNF009 | Lógica determinística (criar dirs, escrever JSONs, copiar scripts) não deve depender de LLM |
| RNF010 | A LLM deve ser usada apenas para coleta de parâmetros via chat, geração semântica de features, e o loop de codificação |
| RNF011 | Idioma do texto: pt-BR; idioma de código: inglês |
| RNF012 | Arquivos devem seguir `kebab-case` |
| RNF013 | Commits devem seguir Conventional Commits em pt-BR |

---

## Rastreabilidade

| Módulo | Requisitos |
|--------|------------|
| Separação de Módulos | OSD001–OSD005 |
| Formato de Projeto | OSD020–OSD031 |
| API Determinística | OSD050–OSD059 |
| MJS como Padrão | OSD070–OSD073 |
| Ciclo de Vida e Artefatos | OSD090–OSD104 |
| Resiliência e Controle | OSD120–OSD131 |
| Webhooks e Notificações | OSD150–OSD155 |
| Worktrees (futuro) | OSD170–OSD173 |
| Documentação de Integração | OSD190–OSD192 |
| Não Funcionais | RNF001–RNF013 |
