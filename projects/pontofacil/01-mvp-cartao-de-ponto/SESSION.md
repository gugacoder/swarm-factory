# Session: 01 — MVP Cartão de Ponto

## Objetivo

Entregar o módulo completo de Cartão de Ponto: migrations, app PWA (Vite+React+shadcn, mobile-first), backbone (Hono REST/SSE), CRUDs, digitação de cartão, motor de cálculo, importação de batidas, apuração/fechamento, banco de horas, exportações legais, relatórios, auditoria e onboarding.

## Status

- [x] Brainstorming
- [x] Specs derivadas
- [x] PRPs gerados
- [x] Refs coletadas
- [ ] Initializer executado

## Brainstorming

- `Detalhamento_Cartão_Ponto.md`
- `Funcionalidades_do_Módulo_Cartão_de_Ponto.md`
- `Historia_de_Usuario.md`
- `Histórias_de_Usuário.md`
- `mapa-mental.md`
- `POP-RHD-001-Cartao de Ponto-Manual do Suporte.md`
- `Requisitos_de_Sistema.md`

## Specs

| Documento | Conteúdo |
|-----------|----------|
| `requirements.md` | Requisitos funcionais (REQ) e não funcionais (NFR), formato OSD |
| `user-stories.md` | Histórias de usuário em formato Gherkin (Dado/Quando/Então) |
| `design.md` | Decisões de arquitetura e engenharia (DES) — Portal + Backbone + PG + Redis |
| `er.md` | Modelo entidade-relacionamento, tabelas prefixadas `cp_` |
| `ui-guide.md` | Padrões visuais — shadcn/ui, NativeWind, componentes padrão |
| `onboarding.md` | Sistema de onboarding contextual por tela |

## PRPs

| PRP | Objetivo | Sources |
|-----|----------|---------|
| `PRP-001-migrations-estrutura-base.md` | Migrations: estrutura organizacional e funcionários | er.md, design.md, requirements.md |
| `PRP-002-migrations-horarios-escalas-parametrizacao.md` | Migrations: horários, escalas, movimentação e parametrização | er.md, design.md |
| `PRP-003-migrations-cartao-bh-auditoria.md` | Migrations: cartão de ponto, banco de horas, fechamento, importação/exportação, auditoria | er.md, design.md |
| `PRP-004-portal-scaffolding.md` | App scaffolding: Vite+React+shadcn PWA + Backbone Hono + autenticação | design.md, ui-guide.md |
| `PRP-005-crud-funcionarios.md` | CRUD completo de funcionários | requirements.md, user-stories.md, ui-guide.md |
| `PRP-006-crud-horarios-escalas.md` | CRUD de horários e escalas com versionamento | requirements.md, user-stories.md, ui-guide.md |
| `PRP-007-crud-movimentacao-parametros-rep.md` | CRUD de tipos de movimentação, parametrização e REP | requirements.md, user-stories.md |
| `PRP-008-digitacao-cartao-ponto.md` | Digitação e ajuste do cartão de ponto | requirements.md, user-stories.md, ui-guide.md |
| `PRP-009-motor-calculo-importacao.md` | Motor de cálculo de horas e importação de batidas | requirements.md, design.md |
| `PRP-010-apuracao-fechamento-banco-horas.md` | Apuração, fechamento mensal e banco de horas | requirements.md, user-stories.md, design.md |
| `PRP-011-exportacoes.md` | Exportações AEJ e Madis | requirements.md |
| `PRP-012-relatorios.md` | Todos os relatórios do módulo | requirements.md, user-stories.md |
| `PRP-013-auditoria-onboarding-polish.md` | Auditoria, logs, onboarding e polish final | requirements.md, onboarding.md, ui-guide.md |

## Refs

| Categoria | Conteúdo |
|-----------|----------|
| `base-layout/` | Exemplos de layout: app-shell, sidebar, page-layout, mobile-header, FAB, content-patterns |
| `ux/framer-motion.md` | Padrões de animação |
| `ux/mobile-patterns.md` | Padrões de UI mobile |
| `ux/shadcn-v4/` | Componentes shadcn v4 — blocks, cards, charts, data-table, forms, sidebar |
| `modules/` | Padrões de módulos — core (calendar, metrics, task-queue, automation), patterns (naming, permissions, states), settings, user |
| `researches/` | Pesquisas técnicas de apoio |
| `vibe-method/` | Scaffold e referência do método vibe code |
