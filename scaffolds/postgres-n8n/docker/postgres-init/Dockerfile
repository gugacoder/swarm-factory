# PostgreSQL Initialization Container
# Cria databases, schemas, extensoes, tabelas, migrations e seeds
FROM node:20-alpine

WORKDIR /app

# Copiar script de inicializacao
COPY scripts/init-postgres.mjs .

# Copiar migrations e seeds
COPY database/migrations ./migrations
COPY database/seeds ./seeds
COPY database/seeds-staging ./seeds-staging

# Instalar dependencia pg
RUN npm install --no-save pg

# Executar script
CMD ["node", "init-postgres.mjs"]
