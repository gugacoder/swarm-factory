# Init Modular

## Problema

O init container atual e um `busybox` com um `mkdir -p` monolitico que cria todas as pastas de uma vez. Nao e modular — se o catalogo de servicos e composavel, o init precisa ser tambem.

## Solucao: script gerado

Um unico container `init` executa um script `docker/init/setup.sh` que e **gerado** pelo scaffold a partir dos servicos selecionados.

### Container (fixo)

```yaml
init:
  image: busybox:latest
  command: sh -c "/init/setup.sh"
  volumes:
    - ./data:/data
    - ./docker/init/setup.sh:/init/setup.sh:ro
  restart: "no"
```

### Script (gerado)

```bash
#!/bin/sh
set -e
# --- postgres ---
mkdir -p /data/postgres && chmod 777 /data/postgres
# --- redis ---
mkdir -p /data/redis
# --- n8n ---
mkdir -p /data/n8n && chmod 777 /data/n8n
# --- caddy ---
mkdir -p /data/caddy/data /data/caddy/config && chmod 777 /data/caddy
echo "Init complete: postgres redis n8n caddy"
```

## Por que um container so

- Nao polui `docker ps` com N containers one-shot
- Script legivel e auditavel
- `depends_on: init` continua funcionando pra todos
- Cada modulo do catalogo contribui apenas seu `init_snippet`
- O script pode fazer mais que mkdir — chmod, chown, validacoes, copiar configs

## Dois niveis de init

1. **init** (busybox) — cria pastas em `./data/`. Roda primeiro.
2. **{servico}-init** (opcional) — configura o servico apos healthy. Exemplos:
   - `postgres-init`: cria databases, users, roda migrations/seeds
   - `n8n-init`: cria admin user, importa workflows
   - `evolution-init`: cria instancia, configura webhook

O nivel 1 e sempre gerado. O nivel 2 vem do campo `init_container` do modulo.
