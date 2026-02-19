# Conversation Routines: A Prompt Engineering Framework for Task-Oriented Dialog Systems

- **Autor**: Giorgio Robino
- **Link**: <https://arxiv.org/html/2501.11613v3>
- **Ano**: 2025

## Abstract

Propoe Conversation Routines (CR), uma metodologia estruturada de prompt engineering que permite o desenvolvimento de Conversational Agentic Systems (CAS) via especificacoes em linguagem natural. Em vez de dialogue managers hard-coded, CR embute logica de negocio diretamente nos prompts do LLM, permitindo que domain experts desenhem workflows complexos mantendo flexibilidade conversacional.

## Contribuicoes Principais

### 1. Framework Teorico

- Define CR como "um conjunto de passos" comunicados via system prompts combinados com tools
- Separacao clara entre **conversation designers** (escrevem prompts) e **software engineers** (implementam funcoes de backend)
- Logica procedural codificada de forma declarativa em vez de programatica

### 2. Metodologia Pratica

Estrutura prompts em componentes comuns:

- **Identidade e proposito** — definicoes de persona do agente e do usuario
- **Protocolos de integracao de funcoes** — descricao de capacidades de tools
- **Padroes de controle de workflow** — passos sequenciais, condicionais e logica de iteracao
- **Protocolos de confirmacao** — confirmacao explicita do usuario antes de acoes criticas
- **Diretrizes de formatacao** — padronizacao de respostas

### 3. Implementacoes Reais

| Case | Descricao |
|------|-----------|
| **Train Ticket Booking** | Workflow multi-step com paginacao, validacao de dados e confirmacoes explicitas antes de finalizar transacoes |
| **Interactive Troubleshooting Copilot** | Guia tecnicos em procedimentos de reparo documentados, mantendo estado entre interrupcoes e lidando com consultas de pecas sem perder contexto procedural |

## Metodologia

- OpenAI GPT-4o-mini com 128k tokens de contexto
- OpenAI SWARM framework para implementacao de agentes
- RAG para acesso a documentacao de procedimentos
- Especificacoes em linguagem natural embutidas em prompts

## Resultados

**Pontos fortes:**

- Prototipacao rapida e iteracao de workflows conversacionais
- Acessivel a nao-programadores mantendo logica de negocio sofisticada
- LLMs demonstram capacidade notavel de manter estado interno e seguir fluxos procedurais complexos
- Lida com input ambiguo e recupera graciosamente de erros

**Limitacoes:**

- Custos computacionais escalam com complexidade do workflow e uso da context window
- Comportamento nao-deterministico com risco de confabulacao ou desvio das instrucoes
- Latencias maiores comparadas a solucoes deterministicas hard-coded
- Trade-off entre flexibilidade conversacional e previsibilidade de execucao

## Comparacao com Alternativas

| Abordagem | Caracteristica |
|-----------|---------------|
| **Rasa CALM** | DSL-based, dialogue managers deterministicos com interpretacao LLM — mais previsivel, menos acessivel |
| **LangGraph** | Arquitetura baseada em grafos com controle granular — requer expertise de programacao |
| **CR** | Linguagem natural, acessivel a domain experts — menos previsivel, mais flexivel |

## Direcoes Futuras

- Metricas de avaliacao padronizadas com criterios de grading orientados a objetivo
- Escalar para ambientes com recursos limitados usando LLMs menores
- Arquiteturas multi-agente para decompor workflows complexos
- Conceituar CR como "source code" compilavel em frameworks de nivel mais baixo para otimizacao
