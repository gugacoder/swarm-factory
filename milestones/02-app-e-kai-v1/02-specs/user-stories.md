# E-Kai - User Stories

User Stories organizadas por tipo de usuario com criterios de aceite.

---

## Operador

### US001 - Visualizar dashboard de projetos

**Como** operador
**Quero** ver um painel com todos os meus projetos e seus status
**Para** ter visao geral da fabrica de software em um unico lugar

**Criterios de Aceite:**
- [ ] Dashboard exibe cards com nome, slug, harness e progresso de cada projeto
- [ ] Barra de progresso visual (passing/total) em cada card
- [ ] Metricas agregadas no topo (total projetos, total features, taxa de sucesso)
- [ ] Atualizacao em tempo real via SSE sem necessidade de refresh

**Requisitos:** OSD100, OSD101, OSD102, OSD103, OSD108

---

### US002 - Criar novo projeto

**Como** operador
**Quero** criar um projeto informando slug, nome, workspace, specs, harness e parametros
**Para** configurar um novo run na fabrica

**Criterios de Aceite:**
- [ ] Formulario com campos obrigatorios (slug, nome, workspace, specs, harness) e opcionais (model, max_turns, max_iterations, max_features, max_retries)
- [ ] Dropdown para selecao de harness (claude-code, opencode, codex)
- [ ] Dropdown para selecao de scaffold (postgres-n8n ou null)
- [ ] Validacao contra schema com feedback de erros
- [ ] Slug validado como machine-friendly (kebab-case)
- [ ] Erro claro se slug ja existir

**Requisitos:** OSD021, OSD022, OSD023, OSD027, OSD028

---

### US003 - Configurar parametros de projeto

**Como** operador
**Quero** editar max_turns, max_iterations, max_features, max_retries e model de um projeto
**Para** ajustar o comportamento do loop autonomo

**Criterios de Aceite:**
- [ ] Formulario pre-preenchido com valores atuais
- [ ] Validacao de tipos (inteiros positivos para turns/iterations/features/retries)
- [ ] Salvamento com feedback visual (toast de sucesso)
- [ ] Valores aplicados na proxima iteracao do loop

**Requisitos:** OSD024, OSD025

---

### US004 - Inicializar workspace

**Como** operador
**Quero** inicializar o workspace de um projeto com um clique
**Para** preparar a estrutura necessaria antes de iniciar o loop

**Criterios de Aceite:**
- [ ] Botao "Inicializar" visivel quando workspace esta not_initialized
- [ ] Feedback de progresso durante inicializacao
- [ ] Confirmacao se workspace ja existe (re-inicializacao)
- [ ] Exibicao dos artefatos criados apos sucesso

**Requisitos:** OSD050, OSD051, OSD052, OSD053, OSD054, OSD055

---

### US005 - Iniciar loop autonomo

**Como** operador
**Quero** iniciar o Ralph Wiggum Loop de um projeto
**Para** executar a fabrica de forma autonoma

**Criterios de Aceite:**
- [ ] Botao "Iniciar Loop" com opcoes de configuracao (MAX_TURNS, MODEL)
- [ ] Botao desabilitado se workspace nao esta inicializado
- [ ] Status muda para "running" com PID visivel em tempo real
- [ ] Logs do loop exibidos em streaming na interface

**Requisitos:** OSD070, OSD073, OSD074, OSD075, OSD077

---

### US006 - Parar loop

**Como** operador
**Quero** parar o loop de um projeto de forma graceful ou forcada
**Para** interromper a execucao quando necessario

**Criterios de Aceite:**
- [ ] Botao "Parar" (graceful) cria arquivo .stop e aguarda finalizacao da feature atual
- [ ] Botao "Forcar Parada" (com confirmacao) mata o PID imediatamente
- [ ] Status muda para "idle" apos parada
- [ ] Notificacao quando o loop para

**Requisitos:** OSD071, OSD072, OSD191

---

### US007 - Monitorar features

**Como** operador
**Quero** ver a lista de features de um projeto com status, prioridade e dependencias
**Para** acompanhar o progresso detalhado da implementacao

**Criterios de Aceite:**
- [ ] Tabela de features com colunas: id, titulo, status, prioridade, dependencias
- [ ] Filtro por status (pending, in_progress, failing, blocked, skipped, passing)
- [ ] Badge colorido por status
- [ ] Atualizacao em tempo real quando status muda
- [ ] Grafico de evolucao de features passing ao longo do tempo

**Requisitos:** OSD101, OSD104, OSD105, OSD106

---

### US008 - Despachar sessao manual

**Como** operador
**Quero** despachar uma sessao de coding para uma feature especifica
**Para** trabalhar uma feature de cada vez com controle manual

**Criterios de Aceite:**
- [ ] Selecao da proxima feature elegivel (maior prioridade, deps satisfeitas)
- [ ] Botao "Despachar Sessao" que inicia o agent para a feature selecionada
- [ ] Exibicao de progresso da sessao em tempo real
- [ ] Status da feature atualizado ao fim da sessao

**Requisitos:** OSD076, OSD105

---

### US009 - Replay de sessao

**Como** operador
**Quero** visualizar o output de uma sessao passada em formato de timeline
**Para** entender o que o agent fez e diagnosticar problemas

**Criterios de Aceite:**
- [ ] Lista de sessoes com data, duracao e feature trabalhada
- [ ] Timeline com eventos (tool_call, message, error) em ordem cronologica
- [ ] Filtro por tipo de evento
- [ ] Botao de copiar trechos do output
- [ ] Indicacao visual de erros na timeline

**Requisitos:** OSD130, OSD131, OSD132, OSD133, OSD134, OSD135

---

### US010 - Conversar com a Kai

**Como** operador
**Quero** conversar com a Kai em linguagem natural sobre meus projetos
**Para** obter diagnosticos, recomendacoes e executar acoes sem navegar menus

**Criterios de Aceite:**
- [ ] Interface de chat com campo de input e historico de mensagens
- [ ] Respostas em streaming (tokens parciais aparecem progressivamente)
- [ ] Tool calls da Kai exibidas de forma transparente (colapsavel)
- [ ] Kai acessa todos os dados e acoes do sistema
- [ ] Historico de conversa mantido durante a sessao

**Requisitos:** OSD150, OSD151, OSD165, OSD242

---

### US011 - Pedir diagnostico a Kai

**Como** operador
**Quero** perguntar a Kai "por que a feature F-007 esta falhando?"
**Para** obter analise automatica sem ler logs manualmente

**Criterios de Aceite:**
- [ ] Kai le output.jsonl, guardrails e progress da feature mencionada
- [ ] Kai apresenta diagnostico com causa provavel e evidencias
- [ ] Kai sugere acoes corretivas (rotacionar contexto, ajustar parametros)
- [ ] Links para a sessao relevante no diagnostico

**Requisitos:** OSD158, OSD159, OSD160, OSD163

---

### US012 - Pedir recomendacao a Kai

**Como** operador
**Quero** que a Kai recomende ajustes de parametros baseado em padroes
**Para** otimizar a performance do loop sem tentativa e erro manual

**Criterios de Aceite:**
- [ ] Kai analisa historico de execucoes e taxa de sucesso
- [ ] Kai sugere valores para max_turns, max_retries e model
- [ ] Sugestoes incluem justificativa baseada em dados
- [ ] Operador pode aplicar sugestao com um clique

**Requisitos:** OSD161, OSD164

---

### US013 - Rotacionar contexto de feature

**Como** operador
**Quero** rotacionar o contexto de uma feature travada
**Para** reiniciar a tentativa com contexto limpo

**Criterios de Aceite:**
- [ ] Botao "Rotacionar Contexto" na pagina de detalhes da feature
- [ ] Confirmacao antes de limpar estado
- [ ] Feature volta para status "failing" com retries zerado
- [ ] Notificacao de sucesso da rotacao
- [ ] Tambem disponivel via comando a Kai

**Requisitos:** OSD079, OSD162

---

### US014 - Receber notificacoes

**Como** operador
**Quero** receber notificacoes quando eventos importantes acontecem
**Para** ser avisado mesmo quando nao estou olhando o dashboard

**Criterios de Aceite:**
- [ ] Toast na interface para eventos de features (mudanca de status)
- [ ] Toast para inicio/parada de loop
- [ ] Push notification (PWA) quando app nao esta em foco
- [ ] Alerta especial quando feature excede max_retries

**Requisitos:** OSD190, OSD191, OSD192, OSD193, OSD194, OSD195

---

### US015 - Usar app no celular

**Como** operador
**Quero** usar o app no celular com experiencia nativa
**Para** monitorar e controlar a fabrica de qualquer lugar

**Criterios de Aceite:**
- [ ] Bottom navigation com icones para Dashboard, Projetos, Kai, Perfil
- [ ] Sidebar colapsavel em desktop (mesmos itens)
- [ ] Breadcrumb bar para navegacao hierarquica
- [ ] Drawer/Sheet para acoes (ao inves de modais)
- [ ] Pull-to-refresh para atualizar dados
- [ ] Gestos de swipe em listas
- [ ] Instalavel como PWA (icone na home screen)

**Requisitos:** OSD210, OSD211, OSD212, OSD213, OSD214, OSD215, OSD216, OSD217, OSD218

---

### US016 - Ver progresso detalhado

**Como** operador
**Quero** ler o agent-progress.txt de um projeto
**Para** entender o progresso acumulado entre sessoes

**Criterios de Aceite:**
- [ ] Texto do agent-progress.txt exibido com formatacao preservada
- [ ] Atualizacao em tempo real enquanto loop esta ativo
- [ ] Scroll automatico para o final do texto

**Requisitos:** OSD107

---

### US017 - Excluir projeto

**Como** operador
**Quero** excluir um projeto que nao preciso mais
**Para** manter a lista de projetos organizada

**Criterios de Aceite:**
- [ ] Botao de exclusao com dialog de confirmacao
- [ ] Confirmacao requer digitar o slug do projeto
- [ ] Projeto removido da lista apos exclusao
- [ ] Workspace no filesystem nao e removido (apenas a config)

**Requisitos:** OSD026

---

## Administrador

### US030 - Gerenciar configuracao do sistema

**Como** administrador
**Quero** configurar chaves de API (OpenRouter), paths padrao e modelo default da Kai
**Para** centralizar configuracoes sem editar arquivos

**Criterios de Aceite:**
- [ ] Tela de configuracoes com formulario de chaves de API
- [ ] Campo para OpenRouter API key com mascara (exibe apenas ultimos 4 chars)
- [ ] Campo para modelo padrao da Kai
- [ ] Campo para path padrao do runsDir
- [ ] Salvamento com validacao (testar conexao com OpenRouter)

**Requisitos:** OSD166, RNF010

---

## Kai (Agente)

### US050 - Operar proativamente

**Como** Kai (agente)
**Quero** monitorar projetos e agir quando detecto padroes problematicos
**Para** intervir antes que o operador precise pedir

**Criterios de Aceite:**
- [ ] Kai monitora taxa de falha de features
- [ ] Kai notifica operador quando detecta loop travado (sem progresso por 10+ min)
- [ ] Kai sugere rotacao de contexto automaticamente apos N falhas consecutivas
- [ ] Modo autonomo e configuravel (on/off) pelo operador
- [ ] Todas as acoes proativas sao logadas e reversiveis

**Requisitos:** OSD078, OSD169

---

## Rastreabilidade

| User Story | Requisitos OSD |
|------------|----------------|
| US001 | OSD100, OSD101, OSD102, OSD103, OSD108 |
| US002 | OSD021, OSD022, OSD023, OSD027, OSD028 |
| US003 | OSD024, OSD025 |
| US004 | OSD050-OSD055 |
| US005 | OSD070, OSD073, OSD074, OSD075, OSD077 |
| US006 | OSD071, OSD072, OSD191 |
| US007 | OSD101, OSD104, OSD105, OSD106 |
| US008 | OSD076, OSD105 |
| US009 | OSD130-OSD135 |
| US010 | OSD150, OSD151, OSD165, OSD242 |
| US011 | OSD158, OSD159, OSD160, OSD163 |
| US012 | OSD161, OSD164 |
| US013 | OSD079, OSD162 |
| US014 | OSD190-OSD195 |
| US015 | OSD210-OSD218 |
| US016 | OSD107 |
| US017 | OSD026 |
| US030 | OSD166, RNF010 |
| US050 | OSD078, OSD169 |
