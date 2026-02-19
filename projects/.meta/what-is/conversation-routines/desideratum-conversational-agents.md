# A Desideratum for Conversational Agents: Capabilities, Challenges, and Future Directions

- **Autores**: Emre Can Acikgoz, Cheng Qian, Hongru Wang, Vardhan Dongre, Xiusi Chen, Heng Ji, Dilek Hakkani-Tur, Gokhan Tur
- **Instituicao**: University of Illinois Urbana-Champaign
- **Link**: <https://arxiv.org/html/2504.16939>
- **Ano**: 2025

## Abstract

Primeiro survey abrangente de agentes conversacionais baseados em LLMs. Propoe um framework para entender capacidades e limitacoes, organizando features de agentes em tres dimensoes primarias — Reasoning, Monitor e Control — e identifica lacunas criticas de pesquisa para avancar em direcao a sistemas mais inteligentes.

## Definicao Central

> Conversational agent: "um framework baseado em LLM que integra reasoning para permitir planejamento sistematico e tomada de decisao complexa, utiliza monitoring para manter auto-consciencia e rastrear continuamente a interacao do usuario, e emprega capacidades de control para utilizar tools e aderir a politicas."

## Taxonomia: Tres Dimensoes

### 1. Reasoning

| Tipo | Tecnicas |
|------|----------|
| **General reasoning** | Chain-of-thought, self-refinement |
| **Agentic reasoning** | ReAct, tree-of-thoughts, reflexion |

### 2. Monitor

| Tipo | Foco |
|------|------|
| **Self-awareness** | Limites de conhecimento, auto-correcao |
| **User/interaction monitoring** | State tracking, personalizacao, emocao |

### 3. Control

| Tipo | Foco |
|------|------|
| **Tool utilization** | Selecao e execucao de tools |
| **Policy learning/following** | Aprendizado e aderencia a politicas |

## Distincoes-chave

O paper distingue claramente:

- **Sistemas de dialogo tradicionais** — pipeline rigido (NLU → DM → NLG)
- **Language agents basicos** — LLM + tools sem contexto conversacional
- **Conversational agents** — integracao completa de reasoning + monitoring + control em contexto conversacional multi-turn

## Desafios Identificados

- Agentes lutam para manter contexto em conversas extensas e aderir a politicas
- Avaliacao atual depende de benchmarks estaticos suscetiveis a contaminacao de dados
- Utilizacao de tools sofre com alucinacao de argumentos e invocacoes ineficientes
- Metodos de auto-correcao requerem datasets curados extensos e inferencia computacionalmente cara

## Direcoes Futuras

1. **Reasoning multi-turn de longo prazo** — manter cadeia de raciocinio coerente ao longo de muitos turnos
2. **Auto-evolucao** — agentes que melhoram com experiencia
3. **Melhorias de avaliacao** — frameworks interativos mais realistas vs benchmarks offline
4. **Sistemas multi-agente colaborativos** — coordenacao entre agentes especializados
5. **Personalizacao** — adaptacao ao usuario individual
6. **Proatividade** — agentes que antecipam necessidades

## Topicos Reconhecidamente Excluidos

- Sistemas de memoria
- Planejamento detalhado
- Interacoes multimodais
- Consideracoes de seguranca
