# PRP-013 — Documentação de Integração

## Objetivo

Criar a documentação de uso e integração do módulo Runs v2, tratando-o como caixa preta — documentar a interface externa, não a implementação interna.

## Execution Mode

`documentar`

## Contexto

Atualmente a documentação do módulo Runs está dispersa entre o `CLAUDE.md` (visão geral), o `ralph-wiggum-loop.md` (loop bash), e os próprios commands. Não existe documentação unificada que permita a um consumer externo (dashboard, scripts de automação, desenvolvedor destino) entender e usar o sistema.

A documentação deve viver em `runs/.meta/README.md` e cobrir toda a interface pública do Runs v2.

## Especificação

### Estrutura do documento

```markdown
# Runs — Módulo de Execução Autônoma

## Visão Geral
[Descrição em 2-3 frases do que o Runs faz]

## Conceitos
[project.json, workspace, features, sessões, harnesses — cada um em 1-2 frases]

## Guia Rápido

### Criar projeto
[CLI + exemplo]

### Inicializar workspace
[CLI + exemplo + nota sobre executar vibe:initialize depois]

### Executar uma feature
[CLI + exemplo]

### Executar loop contínuo
[CLI + exemplo + graceful stop]

### Consultar status
[CLI + exemplo]

### Listar projetos
[CLI + exemplo]

## Uso como SDK

### Importar módulos
[Exemplos de import + assinaturas]

### createProject(params)
[Parâmetros, retorno, erros]

### loadProject(pathOrSlug)
[Parâmetros, retorno, erros]

### initWorkspace(pathOrSlug)
[Parâmetros, retorno, erros]

### listProjects(options)
[Parâmetros, retorno]

### getStatus(pathOrSlug)
[Parâmetros, retorno]

## Formatos de Arquivo

### project.json
[Schema resumido com tabela de campos]

### agent-harness.json
[Schema resumido — diferenças em relação ao project.json]

### features.json
[Schema resumido + status possíveis]

### agent-harness.state
[Campos e valores]

## Artefatos do Workspace
[Tabela com todos os artefatos, tipo, path padrão, descrição]

## Configuração do Agente
[Tabela com max_turns, max_iterations, max_features, max_retries + comportamento de cada]

## Webhooks
[Configuração no agent-harness.json + eventos + payload]

## Sessões de Feature
[Estrutura de .sessions/{feature-id}/ + arquivos + session_template]

## Graceful Stop
[Como funciona .stop + comportamento]

## Gutter Detection
[max_retries + rotação + skip + guardrails]

## Troubleshooting
[Problemas comuns e soluções]
```

### Regras de escrita

| Regra | Detalhe |
|-------|---------|
| Tom | Direto, declarativo — manual de referência, não tutorial |
| Exemplos | CLI completo + output esperado para cada operação |
| Código | Blocos de código com linguagem marcada (bash, json, javascript) |
| Idioma | pt-BR no texto, inglês no código |
| Interface vs implementação | Documentar O QUE faz e COMO usar, não COMO funciona internamente |
| Versionamento | Indicar versão do schema documentada (v1) |

**Requisitos:** OSD190–OSD192

## Limites

- Não documentar a implementação interna (como o loop funciona por dentro)
- Não documentar o módulo Projects nem o módulo Scaffolds — apenas o Runs
- Não criar múltiplos arquivos de documentação — um único `README.md`
- Não incluir diagramas Mermaid ou ASCII art complexos — manter simples e direto
- Não documentar features futuras (worktrees, execução paralela) como se já existissem — marcar como "Futuro" quando mencionar
- Não duplicar informação do `CLAUDE.md` da raiz — a documentação do Runs é autocontida

## Exemplos

### Seção de Guia Rápido — Criar projeto

```markdown
### Criar projeto

\`\`\`bash
node runs/.meta/api/create-project.mjs \
  --slug meu-app \
  --name "Meu App" \
  --workspace "/home/user/meu-app" \
  --specs "./docs/specs" \
  --harness claude-code

# Saída:
# {
#   "version": 1,
#   "slug": "meu-app",
#   "name": "Meu App",
#   ...
# }
\`\`\`
```

### Seção de SDK — loadProject

```markdown
### loadProject(pathOrSlug)

\`\`\`javascript
import { loadProject } from './runs/.meta/api/load-project.mjs'

// Por path
const p = await loadProject('runs/meu-app/project.json')

// Por slug
const p = await loadProject({ slug: 'meu-app', runsDir: 'runs/' })

// Retorno: objeto do project.json + campos _source e _resolved
\`\`\`
```
