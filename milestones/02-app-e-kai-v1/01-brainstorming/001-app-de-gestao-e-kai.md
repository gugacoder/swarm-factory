# App de Gestão + Kai

## Ideia

To achando que é melhor já nascer com o app de gestão.

Vai ser um PWA Mobile-First Agentic App with Web Enhancements.

Essas melhorias pra web são, por exemplo, o menu mobile aparece no sidebar colapsável.
Nota: não tem topbar mas tem breadcrumb bar, o objetivo é maximizar a área útil do app.

Precisamos criar a gestão estado da arte para um Ralph Wiggum Loop, para um agents swarm factory.

Eu quero 100% de controle do processo. Quero abrir um projeto configurando os parâmetros.

---

## Kai

Precisa nascer com um agentic copilot chamada Kai com alta capacidade de realizar tarefas no lado do servidor.
Kai precisa ser agent LangGraph com ferramentas. Kai deve ser capaz de operar em 100% das features do sistema.
Devemos ter protocolos para a Kai seguir.

Kai precisa ser o estado da arte em termos de copilot. Temos o app e o sistema nas mãos. O que mais a Kai deve fazer?

---

## Análise: dá pra fazer?

Não, não tá alucinando. Dá pra fazer.

O que você tá descrevendo é um app que consome a API determinística que a gente acabou de especificar (os `.mjs` em `runs/.meta/api/`) e coloca uma UI por cima. A API já prevê consumers programáticos — o app seria mais um. E o LangGraph agent (Kai) seria mais um consumer dessa mesma API, com a diferença de que ele também age.

Vamos decompor pra ver se é real:

### O app (PWA)

- CRUD de `project.json` → já tem `create-project.mjs`, `load-project.mjs`, `list-projects.mjs`
- Status em tempo real → já tem `get-status.mjs` + artefatos declarados
- Controle do loop → start/stop/configurar parâmetros é invocar a API + spawn/kill de processo
- Replay de sessão → `output.jsonl` já tá no spec
- Tudo isso sobre uma API HTTP (Hono) que faz bridge com a SDK `.mjs`

Isso é totalmente factível. É um dashboard CRUD com live monitoring.

### A Kai (LangGraph copilot)

- Ela tem as mesmas ferramentas que a API expõe: criar projeto, inicializar workspace, consultar status, parar loop
- Mais ferramentas de filesystem: ler logs, ler features.json, ler sessões
- Mais ferramentas de ação: rodar o loop, ajustar parâmetros, rotacionar contexto
- É um agent com tool calling sobre uma API que já existe

A parte que faz isso ser "estado da arte" não é a complexidade — é que o domínio é fechado. A Kai não precisa saber tudo do mundo. Ela precisa saber operar o swarm-factory. E o swarm-factory tem uma API determinística com schema validado. Domínio fechado + API bem definida = agent que funciona de verdade.

### O que a Kai deveria fazer além do óbvio

- Diagnosticar — "por que a feature F-007 tá falhando?" → lê output.jsonl, guardrails, progress
- Intervir — "rotaciona contexto da F-007" → mata sessão, limpa estado, reinicia
- Recomendar — "o max_retries tá baixo pra esse projeto, as features são complexas"
- Operar proativamente — se configurada, pode ajustar parâmetros em runtime baseado em padrões

### O que precisa pra nascer

1. Backend HTTP (Hono) que expõe a SDK como REST endpoints
2. PWA (React + Tailwind + shadcn) que consome esses endpoints
3. LangGraph agent (Node.js) com tools que chamam os mesmos endpoints
4. WebSocket ou SSE pra live updates (status, logs, progresso)
