# API Determinística do Runs

## Problema

Hoje toda a lógica de criação de projetos, inicialização de workspaces e gestão de artefatos está embutida em comandos do Claude Code (prompts markdown). Isso significa que operações determinísticas — criar diretórios, escrever JSONs, copiar scripts — dependem de uma LLM. É desperdício e introduz variabilidade onde não deveria existir.

## Separação de camadas

A LLM é útil para coletar parâmetros via conversa (conveniência humana) e para tarefas semânticas (ler specs, gerar features, codar). Mas uma vez que os parâmetros estão coletados, tudo que vem depois é determinístico.

A solução é uma API em `.mjs` que vive dentro de `runs/.meta/`. Runs é autônomo — oferece sua própria SDK, executável manualmente sem precisar de qualquer ferramenta externa.

## Superfície da API

```
runs/.meta/api/
├── create-project.mjs      # Cria project.json com os parâmetros recebidos
├── load-project.mjs         # Lê e valida project.json, resolve paths
├── init-workspace.mjs       # Gera artefatos no workspace baseado na versão
├── list-projects.mjs        # Discovery nos dois formatos suportados
└── get-status.mjs           # Lê artefatos pra determinar estado atual
```

## Consumers da API

Qualquer consumer coleta parâmetros à sua maneira e invoca a mesma API:
- **Claude Code commands**: coleta via chat, chama a API
- **CLI direto**: `node runs/.meta/api/create-project.mjs --slug x --name y ...`
- **Outros sistemas**: importam os módulos e invocam as funções

Os comandos do Claude Code se tornam thin wrappers — coletam parâmetros e chamam a API. Respeitam o princípio DRY: a lógica existe em um lugar só.

## Onde a LLM ainda é necessária

- Coleta de parâmetros via chat (conveniência humana)
- Geração de `features.json` a partir das specs (leitura semântica dos PRPs)
- O loop em si (o agente codando)

## Onde a LLM é desperdício

- Criar `project.json` — preencher um template
- Criar estrutura de artefatos no workspace — `mkdir` e `writeFile`
- Copiar/gerar scripts do harness — determinístico
- Listar projetos — glob + parse
- Ler status — ler artefatos e computar estado

## Geração de comandos do harness no destino

Quando o workspace é inicializado, a API gera a estrutura de comandos específica do harness escolhido:

- Se **Claude Code** → gera `.claude/commands/` com os comandos da versão corrente
- Se **OpenCode** → gera `.opencode/commands/`
- Se **Codex** → gera a estrutura equivalente

Os arquivos gerados no destino carregam a versão. O workspace resultante é autocontido — quem abre o workspace tem tudo que precisa pra operar, sem depender do swarm-factory.

## Autonomia do Runs

Runs funciona por si só. Deve ser possível:
- Criar um projeto manualmente (escrever o JSON)
- Inicializar um workspace via CLI (`node init-workspace.mjs projeto.json`)
- Executar o loop sem nenhuma ferramenta externa

Qualquer sistema que queira interagir com Runs (dashboards, monitores, orquestradores) consome a SDK. Runs não sabe da existência deles.
