# Design e Arquitetura

Decisões técnicas e arquiteturais do módulo Cartão de Ponto, derivadas dos requisitos e da stack existente do projeto PontoFacil.

Formato: DES com justificativa e referências cruzadas.

---

## 1. Arquitetura Geral (DES001–DES009)

### DES001: Component Architecture

O sistema segue arquitetura de quatro componentes, cada um com responsabilidade clara:

1. **Landing** — Next.js SSR, otimizado para SEO (score 100% Google). Páginas institucionais, marketing e conteúdo público. Não serve app.
2. **App** — Vite + React + shadcn/ui. PWA state-of-the-art, mobile-first, com web enhancements (push notifications, offline cache, haptic feedback). Toda a interface operacional do sistema.
3. **Backbone** — Hono REST/SSE. Core do sistema: API, regras de negócio, autenticação, processamento síncrono.
4. **Agent-core** — Agentes LangGraph de IA que operam no Backbone via Hono HTTP/SSE. Processamento assíncrono, integrações e automações inteligentes.

Todos compartilham PostgreSQL 16 (fonte de verdade) e Redis 7 (cache/filas).

```
┌─────────────────┐
│   Landing       │     ┌──────────────────┐
│   Next.js SSR   │     │   PostgreSQL 16  │
│   SEO 100%      │     │   Fonte verdade  │
└─────────────────┘     └──────────────────┘
                               ▲    ▲
┌─────────────────┐            │    │       ┌─────────────────┐
│   App (PWA)     │──REST/SSE──┤    ├───────│   Agent-core    │
│   Vite + React  │            │    │       │   LangGraph     │
│   Mobile-first  │     ┌──────┴────┴──┐    │   via HTTP/SSE  │
└─────────────────┘     │   Backbone   │    └─────────────────┘
                        │   Hono       │           │
                        │   REST/SSE   │◀──────────┘
                        └──────────────┘
                               ▲
                        ┌──────┴───────┐
                        │   Redis 7    │
                        │   Cache/Fila │
                        └──────────────┘
```

**Justificativa:** Next.js é excelente para SSR/SEO mas overengineering para app interativo. Vite+React dá build mais rápido, HMR instantâneo, e controle total do service worker para PWA. Hono é leve e performático como servidor REST/SSE. LangGraph isolado em agent-core evita acoplamento de IA no core.

**Refs:** NFR030, NFR031

---

### DES002: Monorepo Workspace Structure

O projeto usa monorepo com npm workspaces: `landing/`, `app/`, `backbone/` e `agent-core/`.
- `landing/` — Next.js SSR para páginas públicas e SEO
- `app/` — Vite + React PWA para interface operacional
- `backbone/` — Hono REST/SSE, core do sistema
- `agent-core/` — Agentes LangGraph que operam via Backbone
- Código compartilhado pode ser extraído para pacote interno futuro
- Scripts centralizados no `package.json` raiz
- Migrações SQL versionadas em `database/migrations/`
- Justificativa: separação clara de responsabilidades; cada workspace com toolchain otimizado para seu propósito

---

### DES003: Docker Orchestration

O deploy usa Docker Compose com Traefik como reverse proxy.
- `docker-compose.platform.yml` para infra (Postgres, Redis, Evolution, n8n)
- `docker-compose.yml` para aplicações (Portal, Backbone)
- Init containers para setup de banco e importação de workflows
- Health checks em todos os serviços
- Justificativa: padrão já operacional em produção

---

### DES004: Multi-Tenant Data Isolation

Dados isolados por empresa usando coluna `empresa_id` em todas as tabelas de domínio.
- Hierarquia: Rede → Empresa → Centro de Custo
- Filtros hierárquicos cascateados em todas as telas
- Acesso do usuário restrito via tabela `usuario_empresa`
- Não usa schema separation (complexidade desnecessária para o volume esperado)
- Justificativa: simplicidade operacional com isolamento lógico suficiente

**Refs:** NFR031, NFR011, REQ160 (filtro hierárquico)

---

### DES005: Audit Pattern

Auditoria implementada com tabela `audit_log` centralizada + `operation_log` para operações de sistema.
- audit_log: alterações campo-a-campo (entidade, campo, valor_anterior, valor_novo, usuario, IP, justificativa)
- operation_log: operações macro (importação, exportação, fechamento) com resultado e detalhes
- Trigger `update_updated_at_column()` já existe no projeto para manter `updated_at`
- Justificativa: rastreabilidade total exigida pelo domínio trabalhista

**Refs:** REQ009, REQ290, REQ291, NFR012

---

### DES006: Real-time Updates via SSE

Atualizações em tempo real usando Server-Sent Events (SSE) nativo do Hono no Backbone.
- Endpoint `/events` com streaming SSE para o App
- Uso para notificações de importação concluída, fechamento finalizado, alertas de inconsistência
- Agent-core publica eventos no mesmo canal SSE
- Justificativa: SSE nativo do Hono sem dependência extra; mais simples que WebSocket para notificações unidirecionais

---

## 2. Frontend (DES010–DES019)

### DES010: UI Component Library

Frontend construído com shadcn/ui + Tailwind CSS seguindo ui-guide.md.
- Tema Mira, base Gray, accent Fuchsia, font Inter, radius Medium
- Apenas tokens semânticos (primary, secondary, destructive, muted, etc.)
- Ícones Lucide exclusivamente
- NativeWind para mobile futuro com tokens compartilhados
- Justificativa: consistência visual e produtividade com componentes pré-construídos

**Refs:** NFR021, NFR024

---

### DES011: Form Architecture

Formulários com React Hook Form + Zod para validação.
- Schema Zod como fonte de verdade para validação client e server
- FormField do shadcn/ui para binding automático
- Mensagens de erro em português, claras e posicionadas junto ao campo
- Máscara de horário (HH:mm) via input customizado com validação de range (00-23):(00-59)
- Máscara de período (MM/yyyy) para competências
- Justificativa: padrão do ecossistema React; validação compartilhável entre frontend e API routes

**Refs:** NFR023, REQ030, REQ161

---

### DES012: Data Table Pattern

Tabelas de dados com TanStack Table (via shadcn Data Table).
- Paginação server-side para listas grandes (funcionários, relatórios)
- Filtros combinados: busca textual + dropdowns + toggles
- Ordenação por coluna
- Exportação CSV via botão no header
- Skeleton loading durante carregamento
- Empty state com CTA quando sem dados
- Justificativa: TanStack Table é o padrão do shadcn/ui e suporta todos os cenários necessários

**Refs:** REQ001, NFR001, NFR022

---

### DES013: Hierarchical Filter Component

Componente reutilizável de filtros hierárquicos: Rede → Empresa → Centro de Custo → Funcionário.
- Cada nível carrega opções baseado na seleção do nível anterior
- Combobox com busca para cada nível
- Empresa pré-selecionada quando usuário tem acesso a apenas uma
- Usado em: Digitação Cartão, Apuração, Relatórios, Exportações
- Justificativa: padrão repetido em 15+ telas; componente único evita inconsistências

**Refs:** REQ160, REQ180, REQ230-REQ240

---

### DES014: Time Input Component

Componente de entrada de horário especializado para digitação do cartão.
- Máscara HH:mm com validação de range
- Suporte a 4 períodos (8 campos) por dia
- Tab entre campos para navegação rápida
- Carregamento automático do horário padrão ao selecionar dia
- Indicador visual de divergência com batida original
- Justificativa: usabilidade crítica para operadores que digitam centenas de entradas diárias

**Refs:** REQ161, REQ168, NFR020

---

### DES015: Report Viewer Pattern

Padrão para visualização de relatórios no portal.
- Tela com filtros (hierárquicos + período + opções específicas)
- Barra de progresso durante geração
- Resultado renderizado em tabela paginada
- Opção de impressão via CSS @media print
- Exportação para CSV
- Dois relatórios por página quando aplicável (REQ232)
- Justificativa: substituir Crystal Reports do legado por renderização web nativa

**Refs:** REQ230-REQ240, NFR002

---

### DES016: Legacy VB6 Screen Mapping

Mapeamento direto de telas do Director GE (VB6) para componentes web.
- Cada tela legada tem equivalente 1:1 no portal
- Abas preservadas quando existiam no legado (Lançamentos/BH, Apuração/Fechamento/Listagem)
- Botões CRUD mantidos em posição familiar (Incluir, Alterar, Excluir, Confirmar, Cancelar)
- Menus refatorados em sidebar com agrupamento por módulo
- Justificativa: minimizar curva de aprendizado na migração; operadores já treinados no fluxo legado

**Refs:** NFR032

---

## 3. Backend (DES020–DES029)

### DES020: API Architecture

API implementada no Backbone via Hono.
- Rotas REST agrupadas por domínio: `/api/ponto/funcionarios`, `/api/ponto/horarios`, etc.
- SSE para real-time: notificações, progresso de importação, alertas
- Validação de entrada com Zod (schemas compartilhados com App)
- Middleware de autenticação e autorização por rota
- Respostas padronizadas: `{ data, error, pagination }`
- Agent-core consome e publica via mesmas rotas HTTP/SSE
- Justificativa: Hono como servidor único de API simplifica deploy e elimina duplicação de rotas; SSE nativo sem dependência extra

**Refs:** NFR001, NFR010

---

### DES021: Calculation Engine

Motor de cálculo de horas implementado como módulo isolado no backend.
- Input: batidas do dia + horário padrão + tipo do dia + parâmetros + escala
- Output: horas normais, extras (por percentual), faltas, banco de horas, adicional noturno
- Regras aplicadas em ordem: tolerâncias → intervalos → jornada → extras → BH
- Cálculo noturno com 3 cenários (REQ187): antes 22h/antes 5h, entre 22h-5h, depois 22h/depois 5h
- Horas armazenadas como DECIMAL (minutos / 60) para precisão sem arredondamento
- Justificativa: módulo testável isoladamente; reproduz cálculos do legado Director GE

**Refs:** REQ164, REQ181, REQ187, NFR032

---

### DES022: Import Pipeline

Pipeline de importação de batidas com processamento em etapas.
1. Upload e validação de formato (TopData/Kurumim)
2. Parse do arquivo: PIS(11) + Data(8) + Hora(4)
3. Match PIS → funcionário
4. Validação de período e duplicidades
5. Inserção em `batidas_originais`
6. Cálculo automático via DES021
7. Atualização de `cartao_ponto_movimento` e `totalizadores_mes`
- Processamento em batch com progresso via SSE (DES006)
- Log de inconsistências em `operation_log`
- Justificativa: pipeline explícito facilita debugging e retry parcial

**Refs:** REQ200, REQ201, REQ202, REQ203, NFR003

---

### DES023: Export Pipeline

Pipeline de exportação em 3 formatos: Horas (TXT), AEJ (TXT), Madis (TXT).
- Validação de pré-condições antes de gerar arquivo
- Geração em memória (arquivos pequenos, <10MB por empresa)
- Download via API route com Content-Disposition
- Nomeação automática conforme padrão de cada formato
- Layout fixo com campos posicionais (AEJ, Madis) ou separados por pipe (Horas)
- Justificativa: formatos mandatórios pela legislação e integração com sistemas terceiros

**Refs:** REQ185, REQ210-REQ212, REQ220-REQ222, NFR033

---

### DES024: Monthly Closing Transaction

Fechamento mensal como transação atômica no PostgreSQL.
- BEGIN → inserir registros BH → quitar saldos positivos → zerar horas quitadas → marcar cartão como fechado → COMMIT
- Rollback completo em caso de qualquer falha
- Lock no cartão do período para evitar edições concorrentes
- Verificação de inconsistências como pré-condição (REQ186)
- Irreversível: sem operação de reabertura
- Justificativa: integridade crítica; fechamento parcial corromperia dados de folha

**Refs:** REQ184, REQ186, NFR013

---

### DES025: Hours Bank Compensation Logic

Lógica de compensação do banco de horas com prioridades definidas.
- Créditos: horas extras dentro dos limites configurados
- Débitos: atrasos, saídas antecipadas, intervalos excedidos
- Compensação automática com saldos de meses anteriores (limite parametrizado)
- Excedentes além do limite tratados como hora extra (vai para folha)
- Saldo inicial importável para migração do legado (REQ130)
- Justificativa: reproduz comportamento exato do Director GE

**Refs:** REQ094, REQ130, REQ131, REQ165, NFR032

---

## 4. Banco de Dados (DES030–DES039)

### DES030: Schema Organization

Tabelas do módulo Cartão de Ponto no schema `public` (mesmo schema da aplicação existente).
- Prefixo `cp_` para tabelas do módulo: `cp_funcionarios`, `cp_horarios`, etc.
- Tabelas de infraestrutura sem prefixo (users, audit_log, operation_log)
- Justificativa: schema único simplifica queries e joins; prefixo dá namespace lógico

---

### DES031: Version Control Pattern

Entidades com versão controlada (horários, escalas) usam padrão de vigência temporal.
- Campos: `vigencia_inicio DATE NOT NULL`, `vigencia_fim DATE NULL` (NULL = vigente)
- Coluna `versao INTEGER` auto-incrementada por entidade
- Constraint: sem sobreposição de vigências (exclusion constraint ou validação aplicacional)
- Cálculo retroativo usa versão vigente na data do evento
- Justificativa: cálculos trabalhistas exigem rastreamento temporal preciso

**Refs:** REQ033, REQ054

---

### DES032: Soft Delete Pattern

Exclusão lógica em todas as entidades de domínio.
- Coluna `situacao VARCHAR(20)` com valores: 'ativo', 'inativo'
- `motivo_inativacao TEXT` quando aplicável
- Queries filtram `situacao = 'ativo'` por padrão
- Registros com dependências podem apenas ser inativados, nunca excluídos fisicamente
- Justificativa: integridade referencial e rastreabilidade trabalhista

**Refs:** REQ006, REQ055, REQ073

---

### DES033: Temporal Fields Convention

Convenção de campos temporais uniforme em todo o módulo.
- `created_at TIMESTAMPTZ DEFAULT NOW()` — imutável
- `updated_at TIMESTAMPTZ DEFAULT NOW()` — atualizado por trigger
- `created_by UUID REFERENCES users(id)` — usuário que criou
- `updated_by UUID REFERENCES users(id)` — último a alterar
- Campos de data: `DATE` (ex: data_admissao, vigencia_inicio)
- Campos de horário de jornada: `TIME` (ex: hora_entrada, hora_saida)
- Campos de quantidade de horas: `DECIMAL(10,2)` (minutos convertidos)
- Justificativa: consistência; trigger `update_updated_at_column()` já existe no projeto

**Refs:** NFR034

---

### DES034: Hours Storage as Decimal

Horas armazenadas como `DECIMAL(10,2)` representando horas decimais (ex: 1h30min = 1.50).
- Evita problemas de arredondamento de floating point
- Facilita somas e comparações
- Conversão para HH:MM apenas na camada de apresentação
- Horas negativas representam débito (banco de horas devedor)
- Justificativa: precisão numérica para cálculos financeiros (folha de pagamento)

**Refs:** REQ164, REQ181

---

### DES035: Migration Sequencing

Migrações do módulo Cartão de Ponto sequenciadas a partir da numeração existente.
- Migrações existentes: 001-061 (módulos Assistente/Entregas)
- Novas migrações: 100-199 reservadas para Cartão de Ponto
- `100_cp_estrutura_base.sql` — redes, empresas, centros_custo, cargos
- `101_cp_funcionarios.sql` — funcionários
- `102_cp_horarios_escalas.sql` — horários, escalas e configurações
- `103_cp_parametrizacao.sql` — parâmetros, eventos, tipos movimentação
- `104_cp_rep.sql` — fabricantes, modelos REP
- `105_cp_cartao_ponto.sql` — cartão, movimentos, batidas, totalizadores
- `106_cp_banco_horas.sql` — saldos, movimentações BH
- `107_cp_auditoria.sql` — audit_log, operation_log
- Justificativa: bloco reservado evita conflitos com migrações futuras de outros módulos

---

## 5. Integrações (DES040–DES049)

### DES040: Punch File Formats

Importação de batidas em 2 formatos posicionais.
- **TopData**: PIS(11) + Data(DDMMYYYY, 8) + Hora(HHMM, 4) — 23 chars/linha
- **Kurumim REP II**: mesmo layout (padrão similar)
- Detecção automática de formato por header ou tamanho de linha
- Validação campo a campo com relatório de erros por linha
- Justificativa: formatos exigidos pelo legado Director GE; padronizados pela indústria

**Refs:** REQ200, REQ201

---

### DES041: AEJ Export Format

Exportação do Arquivo Eletrônico de Jornada conforme legislação.
- Header com dados do empregador
- Detalhe: registros de batidas por funcionário/dia
- Horários contratuais, ausências legais
- Footer com totalizadores
- Datas/horas em ISO 8601 com timezone America/Sao_Paulo
- Nomenclatura: `Exp_AEJ_Emp_XX.txt`
- Justificativa: obrigação legal; layout oficial do MTE/MTP

**Refs:** REQ210, REQ211, REQ212, NFR033

---

### DES042: Madis Export Format

Exportação para sistema Madis em 2 variantes.
- **Admissão**: empresa+matrícula(15) + nome(40) + data_admissao(8) + horas(5) + codigo_horario(4) + PIS(11) + codigo_cargo(8) + email(72) = 163 chars
- **Demissão**: matrícula(17) + código_902(3) + data_demissao(8) + PIS(11) = 39 chars
- Nomenclatura: `ExpMadis_[Adm|Dem]_Emp_XX.txt`
- Justificativa: integração com sistema de controle de acesso existente no cliente

**Refs:** REQ220, REQ221, REQ222

---

### DES043: Payroll Export Format

Exportação de horas para sistema de folha de pagamento.
- Layout: Empresa(2) | Matrícula(5) | Evento(3) | Horas(3) | Minutos(2) | MêsAno(6) — pipe-separated
- Eventos mapeados via `parametros_evento_empresa`
- Arquivo `.TXT` com confirmação para sobrescrever
- Justificativa: formato acordado com sistema de folha do cliente

**Refs:** REQ185, REQ114

---

## Índice de Referência

| Código | Phrasal Key | Área |
|--------|-------------|------|
| DES001 | Component Architecture | Arquitetura |
| DES002 | Monorepo Workspace Structure | Arquitetura |
| DES003 | Docker Orchestration | Arquitetura |
| DES004 | Multi-Tenant Data Isolation | Arquitetura |
| DES005 | Audit Pattern | Arquitetura |
| DES006 | Real-time Updates via SSE | Arquitetura |
| DES010 | UI Component Library | Frontend |
| DES011 | Form Architecture | Frontend |
| DES012 | Data Table Pattern | Frontend |
| DES013 | Hierarchical Filter Component | Frontend |
| DES014 | Time Input Component | Frontend |
| DES015 | Report Viewer Pattern | Frontend |
| DES016 | Legacy VB6 Screen Mapping | Frontend |
| DES020 | API Architecture | Backend |
| DES021 | Calculation Engine | Backend |
| DES022 | Import Pipeline | Backend |
| DES023 | Export Pipeline | Backend |
| DES024 | Monthly Closing Transaction | Backend |
| DES025 | Hours Bank Compensation Logic | Backend |
| DES030 | Schema Organization | Banco de Dados |
| DES031 | Version Control Pattern | Banco de Dados |
| DES032 | Soft Delete Pattern | Banco de Dados |
| DES033 | Temporal Fields Convention | Banco de Dados |
| DES034 | Hours Storage as Decimal | Banco de Dados |
| DES035 | Migration Sequencing | Banco de Dados |
| DES040 | Punch File Formats | Integrações |
| DES041 | AEJ Export Format | Integrações |
| DES042 | Madis Export Format | Integrações |
| DES043 | Payroll Export Format | Integrações |
