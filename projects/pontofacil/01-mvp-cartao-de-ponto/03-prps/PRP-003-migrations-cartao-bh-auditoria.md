# PRP-003 — Migrations: Cartão de Ponto, Banco de Horas, Fechamento, Importação/Exportação e Auditoria

## Objetivo

Criar as migrations SQL para o cartão de ponto (header + movimentos + batidas + totalizadores), banco de horas (saldo + movimentações), fechamento mensal, importação, exportação e trilha de auditoria.

## Execution Mode

`implementar`

## Contexto

PRP-001 e PRP-002 criaram toda a estrutura organizacional, funcionários, horários, escalas, tipos de movimentação, parametrização e REP. Este PRP completa o modelo de dados com as tabelas operacionais.

Mesmos padrões de migration e convenções dos PRPs anteriores (DES033, DES032, DES031). Horas armazenadas como DECIMAL(10,2) em horas decimais conforme DES034.

## Especificação

### Arquivo: `database/migrations/105_cp_cartao_ponto.sql`

Tabelas conforme er.md §7 (Cartão de Ponto):

1. **cp_cartao_ponto** — Header mensal por funcionário
   - UNIQUE(funcionario_id, competencia)
   - Competência formato YYYY-MM
   - Situacao: aberto/apurado/fechado
   - empresa_id desnormalizado para filtros (com índice)

2. **cp_cartao_ponto_movimento** — Lançamentos diários (até 4 períodos = 8 batidas)
   - UNIQUE(cartao_ponto_id, dia)
   - ON DELETE CASCADE
   - Colunas entrada1-4, saida1-4 como TIME
   - Totalizadores diários: horas_normais, horas_extras, horas_falta, horas_banco, horas_adicional_noturno (DECIMAL 10,2 DEFAULT 0)
   - tipo_dia: normal/dsr/feriado
   - motivo_id FK para cp_tipos_movimentacao

3. **cp_batidas_originais** — Batidas importadas do ponto eletrônico
   - Sem updated_at (registro imutável)
   - Origem: importacao/manual

4. **cp_totalizadores_mes** — Totalizadores mensais consolidados por motivo
   - UNIQUE(cartao_ponto_id, motivo_id)
   - ON DELETE CASCADE

### Arquivo: `database/migrations/106_cp_banco_horas.sql`

Tabelas conforme er.md §8 (Banco de Horas):

1. **cp_saldo_banco_horas** — Saldo inicial/migrado por funcionário/período
   - UNIQUE(funcionario_id, competencia)
   - saldo_credor DECIMAL(10,2)
   - Flag recalculado

2. **cp_banco_horas_movimento** — Movimentações detalhadas
   - Tipo: credito/debito
   - horas DECIMAL(10,2) sempre positivo
   - Referência opcional ao cartão de origem

### Arquivo: `database/migrations/107_cp_fechamento_importacao_exportacao.sql`

Tabelas conforme er.md §9 e §10:

1. **cp_fechamento_mensal** — Fechamentos irreversíveis (REQ184, DES024)
   - UNIQUE(empresa_id, competencia)
   - desconta_hora_negativa BOOLEAN
   - usuario_id obrigatório

2. **cp_importacoes** — Registro de importações (REQ200-REQ203, DES022)
   - Formato: topdata/kurumim
   - Contadores: total, sucesso, erro
   - Situacao: processando/concluido/erro

3. **cp_exportacoes** — Registro de exportações (REQ185, REQ210, REQ220, DES023)
   - Tipo: horas/aej/madis_admissao/madis_demissao

### Arquivo: `database/migrations/108_cp_auditoria.sql`

Tabelas conforme er.md §11 (Auditoria):

1. **cp_audit_log** — Trilha campo-a-campo (REQ009, REQ290, DES005)
   - Imutável (sem updated_at)
   - Índices em (entidade, entidade_id), (usuario_id), (created_at)

2. **cp_operation_log** — Log de operações macro (REQ291, DES005)
   - Detalhes como JSONB
   - Resultado: sucesso/erro/parcial

Todos os índices conforme er.md §Índices Recomendados. Triggers de updated_at onde aplicável.

## Limites

- Não alterar migrations anteriores (001-061, 100-104)
- Não criar lógica de cálculo, triggers de negócio ou stored procedures — apenas estrutura
- Não inserir dados de seed
- A numeração do arquivo de fechamento/importação/exportação foi unificada em 107 ao invés de criar arquivo separado para cada — manter assim por coesão lógica (são poucos DDLs relacionados)

## Exemplos

Padrão para coluna JSONB:

```sql
detalhes JSONB,  -- Dados estruturados da operação (ex: {"arquivo": "x.txt", "registros": 150})
```
