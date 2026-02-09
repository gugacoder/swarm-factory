# PRP-002 — Migrations: Horários, Escalas, Movimentação e Parametrização

## Objetivo

Criar as migrations SQL para horários de trabalho, escalas, tipos de movimentação, parâmetros do cartão de ponto, parâmetros de evento por empresa, e cadastro de REP (fabricantes e modelos), incluindo as FK constraints pendentes em cp_funcionarios.

## Execution Mode

`implementar`

## Contexto

PRP-001 criou as tabelas cp_redes, cp_empresas, cp_centros_custo, cp_cargos, cp_usuario_empresa e cp_funcionarios. A tabela cp_funcionarios tem colunas `escala_id`, `horario_id` e `modelo_rep_id` sem FK constraint — as FKs devem ser adicionadas neste PRP após criar as tabelas referenciadas.

Padrões de migration idênticos ao PRP-001 (ver contexto do PRP-001). Convenções de campos conforme DES033 e er.md.

## Especificação

### Arquivo: `database/migrations/102_cp_horarios_escalas.sql`

Tabelas conforme er.md §3 (Horários e Escalas):

1. **cp_horarios** — Horários com versão/vigência (DES031)
   - Tipo: fixo/variavel/noturno/parcial
   - Vigência temporal: vigencia_inicio, vigencia_fim (NULL = vigente)
   - Versão auto-incrementada por entidade
   - Tolerâncias específicas em minutos
   - Campos de autoria (created_by, updated_by)

2. **cp_horario_intervalos** — Intervalos dentro de um horário (múltiplos)
   - ON DELETE CASCADE do horario_id
   - Tipo: intrajornada/interjornada
   - Ordem sequencial

3. **cp_escalas** — Escalas com versão/vigência (DES031)
   - Tipo: fixa/turnos/12x36/personalizada
   - UNIQUE(empresa_id, nome)
   - Tolerâncias override do horário

4. **cp_escala_dias** — Dias de trabalho/descanso
   - dia_semana INTEGER CHECK (0-6), 0=dom
   - UNIQUE(escala_id, dia_semana)
   - ON DELETE CASCADE

5. **cp_escala_turnos** — Configuração de turnos/revezamento
   - ON DELETE CASCADE

**Ao final**: ALTER TABLE cp_funcionarios ADD CONSTRAINT fk_funcionario_escala/horario referenciando cp_escalas e cp_horarios.

### Arquivo: `database/migrations/103_cp_parametrizacao.sql`

Tabelas conforme er.md §4 e §5:

1. **cp_tipos_movimentacao** — Tipos de evento/movimentação (REQ070-REQ073)
   - UNIQUE(empresa_id, codigo)
   - Natureza: credito/debito/neutro
   - Fórmula de cálculo como TEXT

2. **cp_parametros_cartao** — Parâmetros gerais por empresa (REQ090-REQ094)
   - UNIQUE(empresa_id) — 1 por empresa
   - Tolerâncias, intervalos, hora extra (percentuais), banco de horas (limites)

3. **cp_parametros_evento_empresa** — Mapeamento eventos→folha por empresa (REQ110-REQ114)
   - UNIQUE(empresa_id)
   - Campos de código de folha para cada tipo de evento

### Arquivo: `database/migrations/104_cp_rep.sql`

Tabelas conforme er.md §6 (REP):

1. **cp_fabricantes_rep** — Fabricantes de REP (REQ142)
2. **cp_modelos_rep** — Modelos de REP (REQ140-REQ144)
3. **cp_modelo_rep_empresa** — Vínculo N:N modelo↔empresa (REQ145)

**Ao final**: ALTER TABLE cp_funcionarios ADD CONSTRAINT fk_funcionario_modelo_rep referenciando cp_modelos_rep.

Todos os índices conforme er.md §Índices. Triggers de updated_at em todas as tabelas que possuem a coluna.

## Limites

- Não criar tabelas do cartão de ponto, banco de horas, fechamento ou auditoria (são de PRPs posteriores)
- Não alterar migrations existentes (001-061) nem a migration 100 ou 101
- Não inserir dados de seed
- Seguir estritamente os tipos e constraints definidos em er.md — não inventar colunas

## Exemplos

Padrão para adicionar FK pendente:

```sql
-- FK pendente do PRP-001
ALTER TABLE cp_funcionarios
    ADD CONSTRAINT fk_cp_func_escala
    FOREIGN KEY (escala_id) REFERENCES cp_escalas(id);
```
