# AGENTS.md

## Build/Lint/Test Commands

### Development
```bash
npm run dev:all          # Inicia todos os apps (hub, backbone, landing)
npm run dev:hub          # Apenas o hub
npm run dev:backbone     # Apenas o backend (LangGraph/Hono)
npm run dev:landing      # Apenas o frontend (Next.js)
```

### Build
```bash
npm run build:all        # Build de todos os apps
npm run build:hub        # Build do hub
npm run build:backbone   # Build do backend
npm run build:landing    # Build do frontend
```

### Database
```bash
npm run migrate          # Aplica migrations + seeds
npm run migrate:main     # Apenas migrations
npm run migrate:seed     # Apenas seeds
npm run migrate:seed:demo # Seeds + dados demo
npm run migrate:hotfix   # Migrations de hotfix
```

### Docker Platform Services
```bash
npm run platform:up      # Sobe PostgreSQL + n8n + Redis + Evolution + Whisper
npm run platform:down    # Para serviços de plataforma
npm run platform:logs    # Logs dos serviços
```

## Code Style Guidelines

### TypeScript Configuration
- **Backend (Hono/LangGraph)**: ES2020, strict mode, ESNext modules
- **Frontend (Next.js)**: ES2017, strict: false, JSX preserve
- Scripts usam CommonJS (`require`) para compatibilidade

### File Extensions
- `.ts` para TypeScript
- `.tsx` para React/JSX
- `.mjs` para scripts Node.js com ES Modules
- `.js` para scripts Node.js com CommonJS

### Import Conventions
```typescript
// Node built-ins com 'node:' prefix
import { connect } from 'node:net'
import fs from 'node:fs'

// External dependencies
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

// Local modules com caminhos relativos
import { helper } from '../utils/helper'
```

### Naming Conventions
- **Files**: `kebab-case` (ex: `user-change-password.js`)
- **Variables/Functions**: `camelCase`
- **Classes/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Database**: `snake_case` (tabelas e colunas)

### Error Handling
```javascript
// Scripts Node.js (CommonJS)
async function testConnection(pool) {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  }
}

// Backend TypeScript
async function httpCheck(url: string, port: number, timeout = 3000): Promise<CheckResult> {
  const start = Date.now()
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeout) })
    return { status: res.ok ? 'ok' : 'down', latency: Date.now() - start, port }
  } catch {
    return { status: 'down', latency: Date.now() - start, port }
  }
}
```

### Environment Variables
- Use `dotenv-cli` para carregar `.env` em todos os scripts
- Prefixos específicos: `POSTGRES_`, `LANDING_`, `EXPORT_`
- Construção de URLs em funções helper (ex: `buildDatabaseUrl()`)

### Project Structure
- Monorepo com workspaces em `apps/*`
- `scripts/` para utilitários Node.js
- `database/migrations/` para SQL migrations numeradas
- `database/seeds/` para dados base

### Database Patterns
- PostgreSQL com UUID primary keys
- Migrations SQL numeradas e idempotentes
- Valores default com `IF NOT EXISTS`
- Triggers automáticos para `updated_at`

### Agent Workflow
1. Leia `agent-progress.txt` primeiro
2. Use `features.json` para tracking de features
3. Execute `agent-setup.sh` para setup do ambiente
4. Implemente uma feature por sessão
5. Teste, commite, atualize artefatos

### Comments & Documentation
- Comentários em português brasileiro
- JSDoc para funções complexas
- Uso de blocos com `//` para seções de código

### Security
- Nunca fazer commit de secrets ou senhas
- Usar variáveis de ambiente para dados sensíveis
- Validar inputs com Zod nos agents LangGraph
- PostgreSQL com role-based access control