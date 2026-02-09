# PRP-001 — Migrations: Estrutura Organizacional e Funcionários

## Objetivo

Criar as migrations SQL para as tabelas de estrutura organizacional (redes, empresas, centros de custo, cargos, usuario_empresa) e cadastro de funcionários, incluindo índices, constraints e trigger de updated_at.

## Execution Mode

`implementar`

## Contexto

O projeto já possui 61 migrations em `database/migrations/` (001-061) cobrindo módulos de Assistente e Entregas. Conforme DES035, as migrations do módulo Cartão de Ponto são reservadas na faixa 100-199. O script `database/scripts/migrate.js` aplica migrations em ordem numérica e trata erros de duplicidade. O banco é PostgreSQL 16 com extensão `uuid-ossp` já habilitada. A trigger `update_updated_at_column()` já existe no projeto (criada em migrations anteriores).

Padrões existentes nas migrations atuais:
- `CREATE TABLE IF NOT EXISTS`
- UUIDs como PK via `uuid_generate_v4()`
- `TIMESTAMPTZ` para timestamps
- Triggers para `updated_at` usando `update_updated_at_column()`
- Comentários descritivos no início de cada arquivo
- Idempotência (IF NOT EXISTS, DROP TRIGGER IF EXISTS antes de CREATE)

## Especificação

### Arquivo: `database/migrations/100_cp_estrutura_base.sql`

Criar as seguintes tabelas conforme er.md §1 (Estrutura Organizacional):

1. **cp_redes** — Rede/grupo de empresas (DES004, NFR031)
2. **cp_empresas** — Empresa vinculada a rede (DES004)
3. **cp_centros_custo** — Centro de custo hierárquico com `pai_id` self-reference (REQ230-REQ240)
4. **cp_cargos** — Cargos por empresa (REQ004, REQ234)
5. **cp_usuario_empresa** — Vinculação usuário-empresa para RBAC (NFR011)

Convenções (DES033):
- PK: `id UUID DEFAULT uuid_generate_v4()`
- Timestamps: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
- Soft delete: `situacao VARCHAR(20) DEFAULT 'ativo'` (DES032)
- FKs para `users(id)` nas colunas `created_by`, `updated_by` onde aplicável
- Índices UNIQUE e BTREE conforme er.md §Índices

Triggers de `updated_at` para tabelas que possuem a coluna.

### Arquivo: `database/migrations/101_cp_funcionarios.sql`

Criar a tabela **cp_funcionarios** conforme er.md §2:
- Todos os campos pessoais e funcionais listados
- FKs para cp_empresas, cp_centros_custo, cp_cargos, cp_escalas, cp_horarios, cp_modelos_rep, users
- FKs para tabelas que ainda não existem (cp_escalas, cp_horarios, cp_modelos_rep) devem ser adicionadas como ALTER TABLE na migration correspondente (102, 104) — nesta migration, criar as colunas sem FK constraint e deixar comentário indicando que a FK será adicionada depois
- Constraints: CHECK para sexo IN ('M','F'), tipo_vinculo IN ('clt','estagiario','temporario','terceirizado')
- Índices UNIQUE em matricula e cpf
- Índices BTREE em empresa_id, situacao, pis, nome

## Limites

- Não criar tabelas de outros módulos (horários, escalas, parametrização, cartão de ponto)
- Não alterar migrations existentes (001-061)
- Não criar a função `update_updated_at_column()` — ela já existe
- Não criar extensão uuid-ossp — já existe
- Não adicionar FK constraints para tabelas que serão criadas em migrations posteriores (cp_escalas, cp_horarios, cp_modelos_rep) — deixar as colunas sem FK e comentar
- Não criar dados de seed neste PRP

## Exemplos

Padrão de criação de trigger (como já existe no projeto):

```sql
-- Não criar a função, apenas usar:
DROP TRIGGER IF EXISTS update_cp_redes_updated_at ON cp_redes;
CREATE TRIGGER update_cp_redes_updated_at
    BEFORE UPDATE ON cp_redes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
