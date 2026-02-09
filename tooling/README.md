# Swarm Factory — Tooling

Dashboard dev-time da **Swarm Factory** para monitoramento e controle de runs autonomos.

## Filosofia

```
PROJECTS ↔ SCAFFOLDS ↔ RUNS ↔ TOOLING ↔ OPERADOR
```

**Tooling** = dashboard dev-time para visualizar e controlar runs (internos e externos).
**Completamente isolado** do projeto principal.

## Requisitos

- Node.js 18+
- npm
- Navegador com suporte a File System Access API (Chrome, Edge)

## Uso

```bash
# Linux/macOS
./launch.sh

# Windows
npm install  # primeira vez
npm run dev
```

Acesse: http://localhost:5173

## Ferramentas Disponíveis

### Run Monitor

Monitoramento em tempo real de todos os runs configurados em `runs/*.json`.

**Funcionalidades:**
- Lista de runs com status, progresso e estado do loop
- Detalhes de features com tracking de status (passing/failing)
- Controle do loop (start/stop) via interface
- Visualizacao de sessoes e output do agente
- Suporte a projetos externos (`is_external`) e workspaces locais
- Leitura de `agent-harness.json` para exibir `planning_path`

### Session Live

Visualizacao ao vivo das sessoes de agente (output JSONL, checklist, metricas).

### Brand Editor

Editor visual para `brand.json`.

**Funcionalidades:**
- Listar todos os brands disponíveis
- Editar paletas (light/dark) com color picker
- Editar tokens semânticos
- Preview em tempo real
- Salvar direto no arquivo original

## Conceitos

### Projetos Externos vs Locais

- **Workspace local**: `location` comeca com `./` (relativo ao `runs/`), scaffold definido — gera codigo do zero
- **Projeto externo**: `location` absoluto, `scaffold: null` — adiciona features a codebase existente

### milestone_path

Campo opcional no run config (`runs/*.json`) que aponta para o diretorio de milestone dentro do projeto externo, quando os docs de planejamento ficam no proprio repositorio do projeto.

### agent-harness.json

Arquivo gerado no workspace pelo initializer. Contem config resolvida com paths absolutos:
- `planning_path`: caminho absoluto para os docs de planejamento
- `factory`: caminho absoluto para a Swarm Factory
- `run`, `project`, `milestone`, `harness`

O Run Monitor le `agent-harness.json` para exibir `planning_path` no detalhe do run.

## Stack

| Tech | Versão | Motivo |
|------|--------|--------|
| Vite | 5.x | Dev server rápido |
| React | 18.x | Componentes |
| TypeScript | 5.x | Type safety |
| Tailwind | 3.x | Styling |
| react-colorful | latest | Color picker |

## Estrutura

```
tooling/
├── launch.sh              # Script de inicialização
├── package.json           # Dependências isoladas
├── src/
│   ├── main.tsx
│   ├── App.tsx            # Layout Swarm Factory + theme switch
│   ├── index.css
│   ├── hooks/
│   │   └── useTheme.ts    # Light/Dark/System
│   ├── components/
│   │   ├── ThemeSwitcher.tsx
│   │   └── ui/            # Componentes base
│   ├── lib/utils.ts
│   └── tools/
│       ├── brand-editor/  # Editor de brands
│       ├── run-monitor/   # Monitor de runs
│       └── session-live/  # Visualizador de sessoes
```

## Tema

Suporta três modos de tema:
- **Claro** - Tema light
- **Escuro** - Tema dark
- **Sistema** - Segue preferência do OS

A preferência é salva em `localStorage`.

## Adicionar Nova Ferramenta

1. Criar pasta em `src/tools/<nome>/`
2. Criar `index.tsx` como entry point
3. Adicionar no array de tools em `App.tsx`
