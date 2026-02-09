# Swarm Factory — User Stories (Runs v2)

Histórias de usuário para a reestruturação do módulo Runs, organizadas por tipo de usuário.

---

## Operador da Fábrica

Pessoa que usa o swarm-factory para orquestrar projetos — cria runs, inicializa workspaces, monitora execução.

### US001 — Criar projeto via API determinística

**Como** operador da fábrica
**Quero** criar um `project.json` via CLI sem depender de LLM
**Para** ter criação rápida, consistente e reprodutível

**Critérios de Aceite:**
- [ ] `node runs/.meta/api/create-project.mjs --slug x --name y --workspace z` cria o JSON
- [ ] O JSON gerado contém todos os campos obrigatórios (version, slug, name, specs, workspace, agent, artifacts)
- [ ] O JSON é validado contra o schema antes de ser escrito
- [ ] Paths relativos são resolvidos a partir do workspace

**Requisitos:** OSD050, OSD051, OSD020, OSD021, OSD027, RNF009

---

### US002 — Criar projeto via chat (thin wrapper)

**Como** operador da fábrica
**Quero** usar `/run:create` para criar um projeto conversando com o agente
**Para** ter conveniência quando não sei todos os parâmetros de cabeça

**Critérios de Aceite:**
- [ ] O comando coleta parâmetros via conversa (slug, name, workspace, specs, model, max_turns)
- [ ] Após coleta, chama a API determinística — não cria JSON manualmente
- [ ] O resultado é idêntico ao da criação via CLI

**Requisitos:** OSD058, OSD051, RNF010

---

### US003 — Inicializar workspace via CLI

**Como** operador da fábrica
**Quero** inicializar um workspace com `node runs/.meta/api/init-workspace.mjs project.json`
**Para** preparar o ambiente de desenvolvimento sem depender de LLM

**Critérios de Aceite:**
- [ ] O `project.json` é lido e validado
- [ ] Todos os artefatos declarados na versão são criados no workspace
- [ ] `agent-harness.json` é gerado com paths resolvidos
- [ ] `agent-harness.mjs` é copiado/gerado no workspace
- [ ] Comandos do harness escolhido são gerados (`.claude/commands/vibe/` ou equivalente)
- [ ] `.sessions/` é adicionado ao `.gitignore` se ausente
- [ ] Arquivos gerados carregam a versão corrente

**Requisitos:** OSD053, OSD091, OSD101, OSD102, OSD103, OSD104, OSD172, RNF009

---

### US004 — Listar projetos

**Como** operador da fábrica
**Quero** listar todos os projetos configurados
**Para** ter visão geral do que está cadastrado

**Critérios de Aceite:**
- [ ] O comando descobre projetos nos dois formatos (flat e structured)
- [ ] Exibe slug, name, workspace e estado resumido
- [ ] Funciona via CLI (`node runs/.meta/api/list-projects.mjs`) e via comando do agente

**Requisitos:** OSD054, OSD028, OSD029

---

### US005 — Consultar status de um projeto

**Como** operador da fábrica
**Quero** consultar o estado atual de um run
**Para** saber quantas features passaram, quantas faltam, se o loop está rodando

**Critérios de Aceite:**
- [ ] O comando lê artefatos declarados no `project.json` para computar estado
- [ ] Exibe contagem por status de feature (pending, in_progress, failing, blocked, skipped, passing)
- [ ] Indica se o loop está ativo (via PID file)

**Requisitos:** OSD055, OSD126, OSD098

---

### US006 — Executar uma feature por vez

**Como** operador da fábrica
**Quero** rodar o loop com `max_features: 1`
**Para** implementar e testar uma feature de cada vez manualmente

**Critérios de Aceite:**
- [ ] O loop seleciona a próxima feature elegível
- [ ] Para após completar 1 feature (ou falhar definitivamente)
- [ ] Não existe conceito separado de "sessão manual" — é o mesmo loop com limite

**Requisitos:** OSD093, OSD094, OSD130

---

### US007 — Executar loop contínuo

**Como** operador da fábrica
**Quero** rodar o loop com `max_features: null` e `max_iterations: null`
**Para** deixar o agente trabalhando autonomamente até completar todas as features

**Critérios de Aceite:**
- [ ] O loop roda continuamente até esgotar features elegíveis
- [ ] Gutter detection intervém em features com falhas repetitivas
- [ ] Graceful stop via `.stop` file encerra após a feature atual

**Requisitos:** OSD095, OSD096, OSD120, OSD121

---

### US008 — Configurar limites do agente

**Como** operador da fábrica
**Quero** configurar `max_turns`, `max_iterations`, `max_features` e `max_retries` no `project.json`
**Para** controlar o comportamento e consumo de recursos do loop

**Critérios de Aceite:**
- [ ] Todos os campos aceitam `null` (sem limite) ou inteiro positivo
- [ ] `max_retries` define tentativas por feature antes de rotação/skip (default: 5)
- [ ] Validação rejeita valores inválidos no runtime

**Requisitos:** OSD130, OSD131, OSD059

---

## Desenvolvedor Destino

Pessoa que trabalha no workspace gerado — pode nunca ter ouvido falar do swarm-factory.

### US020 — Operar o loop sem o swarm-factory

**Como** desenvolvedor destino
**Quero** rodar o Ralph Wiggum Loop no meu projeto usando apenas os artefatos locais
**Para** não depender de qualquer ferramenta externa

**Critérios de Aceite:**
- [ ] `node agent-harness.mjs` inicia o loop sem referência ao swarm-factory
- [ ] `agent-harness.json` contém todos os paths resolvidos necessários
- [ ] Comandos `vibe:*` funcionam standalone no workspace
- [ ] Nenhum import ou path aponta para fora do workspace

**Requisitos:** OSD092, OSD091, OSD005, RNF007

---

### US021 — Usar comandos vibe standalone

**Como** desenvolvedor destino
**Quero** usar `/vibe:code` e `/vibe:initialize` no meu workspace
**Para** ter a experiência completa de coding assistido sem a fábrica

**Critérios de Aceite:**
- [ ] `/vibe:initialize` gera `features.json` a partir dos PRPs locais
- [ ] `/vibe:code` seleciona e implementa a próxima feature elegível
- [ ] Os comandos leem `agent-harness.json` para descobrir paths

**Requisitos:** OSD091, OSD092, OSD101

---

### US022 — Configurar notificações no workspace

**Como** desenvolvedor destino
**Quero** configurar webhooks no `agent-harness.json` do meu workspace
**Para** receber notificações quando features completam ou o loop para

**Critérios de Aceite:**
- [ ] Campo `notifications` aceita array de endpoints com URL e eventos
- [ ] Eventos suportados: `completed`, `stopped`, `error`, `*`
- [ ] Webhook falhando não interrompe o loop nem outros webhooks
- [ ] Funciona sem o sistema de Runs — é configuração local

**Requisitos:** OSD150, OSD151, OSD152, OSD153, OSD154, OSD155

---

### US023 — Consultar progresso via artefatos

**Como** desenvolvedor destino
**Quero** ler `features.json` e `agent-progress.txt` para entender o estado
**Para** saber o que já foi feito e o que falta sem precisar de dashboard

**Critérios de Aceite:**
- [ ] `features.json` reflete o estado atual de cada feature com status rico
- [ ] `agent-progress.txt` contém log textual do progresso
- [ ] Artefatos são atualizados em tempo real durante o loop

**Requisitos:** OSD097, OSD126

---

## Sistema de Monitoramento / Dashboard

Consumer externo que lê artefatos e integra com o Runs via SDK.

### US040 — Descobrir artefatos via project.json

**Como** sistema de monitoramento
**Quero** ler o `project.json` e saber exatamente quais artefatos existem e onde estão
**Para** monitorar o estado sem hardcodar paths

**Critérios de Aceite:**
- [ ] Todos os artefatos conhecidos estão declarados em `artifacts`
- [ ] Cada artefato tem `type` (file/dir) e `path` resolvível
- [ ] O `session_template` declara o padrão de cada sessão de feature

**Requisitos:** OSD025, OSD026, OSD100, OSD031

---

### US041 — Reproduzir sessão de agente

**Como** sistema de monitoramento
**Quero** ler o `output.jsonl` de uma sessão
**Para** reproduzir step-by-step o que o agente fez

**Critérios de Aceite:**
- [ ] JSONL de cada sessão está no path declarado pelo `session_template`
- [ ] Cada linha do JSONL é um evento parseável

**Requisitos:** OSD100

---

### US042 — Integrar via SDK

**Como** sistema de monitoramento
**Quero** importar módulos da API do Runs
**Para** criar projetos, listar status e interagir programaticamente

**Critérios de Aceite:**
- [ ] Módulos exportam funções importáveis (`import { loadProject } from '...'`)
- [ ] A API funciona identicamente via import e via CLI
- [ ] Documentação de integração cobre todos os endpoints

**Requisitos:** OSD057, OSD190, OSD191, OSD192

---

### US043 — Subir preview isolado por feature (futuro)

**Como** sistema de monitoramento
**Quero** usar o worktree declarado de uma sessão para subir o app daquela feature
**Para** que o usuário teste a feature em andamento sem interferir no workspace principal

**Critérios de Aceite:**
- [ ] Worktree está declarado no `session_template`
- [ ] O path do worktree é resolvível via `project.json`
- [ ] O monitor consegue identificar e iniciar o dev server do worktree

**Requisitos:** OSD170, OSD171, OSD173

---

## Rastreabilidade

| User Story | Requisitos OSD |
|------------|----------------|
| US001 | OSD050, OSD051, OSD020, OSD021, OSD027, RNF009 |
| US002 | OSD058, OSD051, RNF010 |
| US003 | OSD053, OSD091, OSD101–OSD104, OSD172, RNF009 |
| US004 | OSD054, OSD028, OSD029 |
| US005 | OSD055, OSD126, OSD098 |
| US006 | OSD093, OSD094, OSD130 |
| US007 | OSD095, OSD096, OSD120, OSD121 |
| US008 | OSD130, OSD131, OSD059 |
| US020 | OSD092, OSD091, OSD005, RNF007 |
| US021 | OSD091, OSD092, OSD101 |
| US022 | OSD150–OSD155 |
| US023 | OSD097, OSD126 |
| US040 | OSD025, OSD026, OSD100, OSD031 |
| US041 | OSD100 |
| US042 | OSD057, OSD190–OSD192 |
| US043 | OSD170, OSD171, OSD173 |
