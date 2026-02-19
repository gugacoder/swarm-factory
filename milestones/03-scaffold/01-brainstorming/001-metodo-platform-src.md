# Metodo Platform/SRC

## Ideia central

O scaffold e um gerador de projetos baseado numa divisao clara entre **Platform** (servicos de infraestrutura via Docker) e **SRC** (codigo-fonte da aplicacao). O metodo garante que um unico `.env` + compose files resolvem dev, staging e producao sem reconfigurar nada manualmente.

## Dualidade de ambientes

| | Dev | Prod/Staging |
|---|---|---|
| **SRC** (apps) | Roda no **host** (hot reload) | Embarcado no **Docker** |
| **PLAT** (servicos) | Docker com portas **exportadas** | Docker **isolado** (rede interna) |
| **Proxy** (Caddy) | `host.docker.internal` → apps no host | `*.internal` → apps na rede Docker |

## Compose como camadas

```
docker-compose.platform.yml            ← servicos base (sem portas expostas)
docker-compose.platform.dev-ports.yml  ← overlay: exporta portas com XXYY
docker-compose.yml                     ← deploy: inclui platform + embarca SRC + caddy
```

## .env com 5 secoes

1. **IDENTIDADE** — project, environment, timezone, sysuser/syspass
2. **ROTEAMENTO** — portas internas + hosts `*.internal` (valores Docker)
3. **DEV OVERRIDES** — sobrescreve portas pra `${PORT_PREFIX}YY`, hosts pra `localhost`, backport pra `host.docker.internal`. Comentar inteiro em producao.
4. **URLs COMPOSTAS** — derivadas de HOST:PORT (resolvem automaticamente em qualquer modo)
5. **CREDENCIAIS** — secrets por servico com defaults dev

## Rede interna

Todos os servicos se enxergam via aliases DNS fixos: `postgres.internal`, `redis.internal`, `n8n.internal`, etc. Comunicacao servico-a-servico usa porta interna padrao — nunca depende da porta exportada.

## Caddy como ponto unico

Em producao, Caddy e a unica porta publica. Roteia por path para os apps SRC e servicos que precisam exposicao (n8n webhooks, etc). Em dev, Caddy usa `host.docker.internal` pra alcancar apps rodando no host.
