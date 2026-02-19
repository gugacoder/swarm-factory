# Catalogo de Servicos Platform

## Ideia central

Cada servico de plataforma e um modulo independente no catalogo. O usuario seleciona quais quer na interface e o gerador compoe os arquivos automaticamente. Cada modulo sabe tudo sobre si — compose fragment, portas, env vars, init, pastas.

## Shape do modulo

```jsonc
{
  "id": "postgres",
  "name": "PostgreSQL",
  "image": "postgres:16-alpine",
  "category": "database",           // database, cache, search, messaging, ai, workflow, tools

  // Portas
  "port_suffix": 32,                // NN fixo → dev port = XXYY
  "internal_port": 5432,            // porta dentro do container
  "alias": "postgres.internal",     // DNS alias na rede interna

  // Compose fragments (yaml parcial)
  "compose_fragment": "...",        // servico no docker-compose.platform.yml
  "dev_ports_fragment": "...",      // ports no docker-compose.platform.dev-ports.yml

  // .env contributions
  "env_routing": {
    "POSTGRES_PORT": 5432,
    "POSTGRES_HOST": "postgres.internal"
  },
  "env_dev_overrides": {
    "POSTGRES_PORT": "${PORT_PREFIX}32",
    "POSTGRES_HOST": "localhost",
    "EXPORT_POSTGRES_PORT": "${POSTGRES_PORT}"
  },
  "env_credentials": {
    "POSTGRES_SUPERUSER": "postgres",
    "POSTGRES_SUPERUSER_PASSWORD": "postgres",
    "POSTGRES_USER": "${SYSUSER}",
    "POSTGRES_PASSWORD": "${SYSPASS}",
    "POSTGRES_DB": "${PROJECT_SLUG}"
  },
  "env_urls": {
    "DATABASE_URL": "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
  },

  // Init
  "init_snippet": "mkdir -p /data/postgres && chmod 777 /data/postgres",

  // Init container (opcional — one-shot apos servico healthy)
  "init_container": {
    "type": "dockerfile",           // dockerfile | script | curl
    "source": "docker/postgres-init/Dockerfile",
    "depends_on": "postgres",
    "condition": "service_healthy"
  },

  // Pastas que gera no projeto
  "folders": [
    "database/migrations/",
    "database/seeds/",
    "database/seeds/{environment}/"
  ],

  // Arquivos template que copia
  "templates": [
    "docker/postgres-init/Dockerfile",
    "docker/postgres-init/init.sh"
  ],

  // Caddy route (null se nao precisa exposicao via proxy)
  "caddy_route": null,

  // Healthcheck
  "healthcheck": {
    "test": ["CMD-SHELL", "pg_isready -U postgres"],
    "interval": "10s",
    "timeout": "5s",
    "retries": 5
  }
}
```

## Catalogo inicial

| ID           | Categoria  | Descricao                        |
|--------------|------------|----------------------------------|
| postgres     | database   | PostgreSQL 16 + init container   |
| mongo        | database   | MongoDB 7                        |
| redis        | cache      | Redis 7                          |
| meilisearch  | search     | Meilisearch (full-text search)   |
| evolution    | messaging  | Evolution API (WhatsApp)         |
| n8n          | workflow   | n8n (automacoes e workflows)     |
| ollama       | ai         | Ollama (LLM local)              |
| whisper      | ai         | Faster Whisper (transcricao)     |
| adminer      | tools      | Adminer (database GUI)           |

## Composicao

O gerador:
1. Recebe lista de servicos selecionados
2. Concatena `compose_fragment` de cada um → `docker-compose.platform.yml`
3. Concatena `dev_ports_fragment` → `docker-compose.platform.dev-ports.yml`
4. Monta `.env` secao por secao (routing, overrides, urls, credentials)
5. Gera `docker/init/setup.sh` concatenando `init_snippet` de cada um
6. Copia templates e cria folders
7. Gera Caddyfile com rotas dos servicos que tem `caddy_route`
