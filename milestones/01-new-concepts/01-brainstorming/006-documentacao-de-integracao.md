# Documentação de Uso e Integração

## Princípio

Documentar a parte de fora, não a parte de dentro. Runs é uma caixa preta. Quem consome (monitoramento, dashboards, orquestradores) não precisa saber como funciona internamente — precisa saber como usar e integrar.

## Objetivo

Essa documentação será a base para vibrar o sistema de monitoramento e controle. Quem construir ferramentas em cima do Runs vai ler essa documentação e saber:

- Como criar um projeto (quais parâmetros, qual formato do JSON)
- Como inicializar um workspace (qual função da API chamar)
- Como executar o loop (como invocar, como controlar limites)
- Como consultar o estado (quais artefatos ler, qual o formato de cada um)
- Como parar o loop (graceful stop)
- Quais artefatos existem e onde estão (declarados no project.json)

## Não documenta

- Implementação interna da API
- Como os scripts funcionam por dentro
- Detalhes do agente ou do harness
- Estrutura interna de código do Runs
