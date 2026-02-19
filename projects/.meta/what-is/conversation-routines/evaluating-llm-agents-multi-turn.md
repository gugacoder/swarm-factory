# Evaluating LLM-based Agents for Multi-Turn Conversations: A Survey

- **Autores**: Shengyue Guan, Haoyi Xiong, Jindong Wang, Jiang Bian, Jian-guang Lou
- **Link**: <https://arxiv.org/html/2503.22458v1>
- **Ano**: 2025

## Abstract

Survey abrangente que examina metodologias de avaliacao para sistemas conversacionais baseados em LLMs. Aborda "o que avaliar" e "como avaliar" em tres dimensoes criticas: coerencia de dialogo e manutencao de contexto ao longo de multiplos turnos, eficacia do agente no uso de tools e recursos externos, e capacidade do sistema para gerenciar memoria a nivel de conversa e de turno.

## O Que Avaliar: Dimensoes

### 1. Experiencia End-to-End

- Taxas de conclusao de tarefas
- Capacidades multi-tarefa
- Padroes de interacao
- Manutencao de contexto temporal
- Experiencia do usuario e seguranca

### 2. Acoes e Uso de Tools

- Capacidades de interacao com APIs
- Benchmarks de tool-use em cenarios multi-turn
- Preocupacoes de confiabilidade incluindo alucinacoes

### 3. Capacidades de Memoria

| Tipo | Escopo |
|------|--------|
| **Turn memory** | Contexto dentro de um turno |
| **Conversation memory** | Contexto ao longo da conversa |
| **Permanent memory** | Persistencia entre conversas |

Abrange formas de memoria textual e parametrica.

### 4. Funcoes de Planejamento

- Modelagem de tarefas
- Decomposicao de tarefas
- Mecanismos de adaptacao e controle
- Processos de reflexao

## Como Avaliar: Metodologias

### Dados de Avaliacao

- Geracao de dados conversacionais (respostas next-turn, cenarios de tool-use, reescrita de queries, fact-checking)
- Frameworks de anotacao para avaliacao de qualidade

### Metricas

**Baseadas em anotacao:**

- Metricas tradicionais: BLEU, ROUGE, METEOR
- Abordagens avancadas: BERTScore, DialogRPT

**Livres de anotacao:**

- Scoring point-wise e pairwise usando LLMs como avaliadores

## Contribuicoes Principais

1. **Taxonomia abrangente** — framework estruturado integrando dimensoes de avaliacao previamente dispersas na literatura
2. **Identificacao de lacunas** — deficiencias criticas em datasets existentes, especialmente para cenarios de tool-use e preservacao de contexto de longo prazo
3. **Analise por componente** — estrategias de avaliacao detalhadas para componentes distintos do agente em vez de tratamento holistico
4. **Mapeamento de direcoes futuras** — desafios em metricas de memoria sofisticadas, medidas de eficacia de tool-use e benchmarks padronizados

## Metodologia do Survey

- Sintetiza ~200 papers peer-reviewed (2017-2024)
- Metodologia inspirada em PRISMA
- Triagem de 1.560 papers iniciais para 272 trabalhos focados

## Significancia

Estabelece orientacao fundamental para desenvolver "praticas de avaliacao mais robustas e padronizadas" em IA conversacional multi-turn, endereçando a complexidade crescente de sistemas baseados em agentes que requerem avaliacao integrada de memoria, planejamento e uso de tools.
