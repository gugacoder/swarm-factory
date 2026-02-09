# Modelo de Dados (ER)

Modelo entidade-relacionamento do módulo Cartão de Ponto. Tabelas prefixadas com `cp_` conforme DES030.

Convenções (DES033):
- PK: `id UUID DEFAULT uuid_generate_v4()`
- Timestamps: `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`
- Autoria: `created_by UUID`, `updated_by UUID` → `users(id)`
- Soft delete: `situacao VARCHAR(20) DEFAULT 'ativo'` (DES032)
- Horas: `DECIMAL(10,2)` em horas decimais (DES034)

---

## 1. Estrutura Organizacional

### cp_redes

Rede/grupo de empresas. Nível mais alto da hierarquia multi-tenant (DES004).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK DEFAULT uuid_generate_v4() | |
| nome | VARCHAR(255) | NOT NULL UNIQUE | Nome da rede |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | ativo/inativo |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Refs:** DES004, NFR031

---

### cp_empresas

Empresa vinculada a uma rede.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| rede_id | UUID | FK → cp_redes(id) NOT NULL | |
| razao_social | VARCHAR(255) | NOT NULL | |
| nome_fantasia | VARCHAR(255) | | |
| cnpj | VARCHAR(18) | NOT NULL UNIQUE | Formato 00.000.000/0000-00 |
| endereco | TEXT | | Endereço completo |
| telefone | VARCHAR(20) | | |
| email | VARCHAR(255) | | |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Refs:** DES004, NFR031

---

### cp_centros_custo

Centro de custo hierárquico dentro de uma empresa.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| pai_id | UUID | FK → cp_centros_custo(id) NULL | Hierarquia |
| codigo | VARCHAR(20) | NOT NULL | Único por empresa |
| descricao | VARCHAR(255) | NOT NULL | |
| nivel | INTEGER | DEFAULT 1 | Nível hierárquico |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Índices:** UNIQUE(empresa_id, codigo)

**Refs:** REQ230-REQ240 (filtros por CC)

---

### cp_cargos

Cargos disponíveis por empresa.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| codigo | VARCHAR(20) | NOT NULL | |
| descricao | VARCHAR(255) | NOT NULL | |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Índices:** UNIQUE(empresa_id, codigo)

**Refs:** REQ004, REQ234

---

### cp_usuario_empresa

Vinculação de usuários a empresas para controle de acesso (DES004).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| user_id | UUID | FK → users(id) NOT NULL | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Índices:** UNIQUE(user_id, empresa_id)

**Refs:** NFR011

---

## 2. Funcionários

### cp_funcionarios

Cadastro completo do funcionário com dados pessoais e funcionais.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| centro_custo_id | UUID | FK → cp_centros_custo(id) | |
| cargo_id | UUID | FK → cp_cargos(id) | |
| matricula | VARCHAR(20) | NOT NULL | Única no sistema |
| nome | VARCHAR(255) | NOT NULL | Mínimo 3 chars |
| sexo | VARCHAR(1) | CHECK IN ('M','F') | |
| data_nascimento | DATE | | Idade mínima 14 |
| nome_pai | VARCHAR(255) | | |
| nome_mae | VARCHAR(255) | | |
| pis | VARCHAR(11) | | 11 dígitos validados |
| pis_data_cadastro | DATE | | |
| cpf | VARCHAR(11) | NOT NULL | Validado, único |
| rg_numero | VARCHAR(20) | | |
| rg_orgao | VARCHAR(20) | | |
| rg_uf | VARCHAR(2) | | |
| rg_data | DATE | | |
| titulo_eleitoral | VARCHAR(20) | | |
| titulo_zona | VARCHAR(10) | | |
| titulo_secao | VARCHAR(10) | | |
| habilitacao | VARCHAR(20) | | |
| telefone | VARCHAR(20) | | |
| email | VARCHAR(255) | | Formato validado |
| endereco | VARCHAR(255) | | |
| endereco_numero | VARCHAR(20) | | |
| endereco_complemento | VARCHAR(100) | | |
| endereco_bairro | VARCHAR(100) | | |
| endereco_cidade | VARCHAR(100) | | |
| endereco_uf | VARCHAR(2) | | |
| endereco_cep | VARCHAR(9) | | |
| tipo_vinculo | VARCHAR(20) | NOT NULL DEFAULT 'clt' | clt/estagiario/temporario/terceirizado |
| data_admissao | DATE | NOT NULL | Não futura |
| data_desligamento | DATE | | ≥ data_admissao |
| salario_base | DECIMAL(12,2) | | |
| percentual_adiantamento | DECIMAL(5,2) | | |
| escala_id | UUID | FK → cp_escalas(id) | Escala vigente |
| horario_id | UUID | FK → cp_horarios(id) | Horário vigente |
| unidade_fisica | VARCHAR(100) | | |
| modelo_rep_id | UUID | FK → cp_modelos_rep(id) | REP autorizado |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | ativo/inativo |
| motivo_inativacao | TEXT | | Obrigatório quando inativo |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Índices:**
- UNIQUE(matricula)
- UNIQUE(cpf)
- idx_cp_func_empresa(empresa_id)
- idx_cp_func_situacao(situacao)
- idx_cp_func_pis(pis)
- idx_cp_func_nome(nome)

**Refs:** REQ001-REQ009

---

## 3. Horários e Escalas

### cp_horarios

Horários de trabalho com controle de versão/vigência (DES031).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| descricao | VARCHAR(255) | NOT NULL | |
| tipo | VARCHAR(20) | NOT NULL | fixo/variavel/noturno/parcial |
| hora_entrada | TIME | NOT NULL | |
| hora_saida | TIME | NOT NULL | > hora_entrada (ou virada) |
| duracao_jornada | DECIMAL(10,2) | | Calculada automaticamente |
| tolerancia_atraso | INTEGER | DEFAULT 0 | Minutos |
| tolerancia_antecipacao | INTEGER | DEFAULT 0 | Minutos |
| tolerancia_extra | INTEGER | DEFAULT 0 | Minutos |
| vigencia_inicio | DATE | NOT NULL | |
| vigencia_fim | DATE | | NULL = vigente |
| versao | INTEGER | DEFAULT 1 | Auto-incrementada |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Índices:**
- idx_cp_hor_empresa(empresa_id)
- idx_cp_hor_vigencia(vigencia_inicio, vigencia_fim)

**Refs:** REQ030-REQ033

---

### cp_horario_intervalos

Intervalos dentro de um horário (múltiplos possíveis).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| horario_id | UUID | FK → cp_horarios(id) NOT NULL ON DELETE CASCADE | |
| hora_inicio | TIME | NOT NULL | |
| hora_fim | TIME | NOT NULL | |
| tipo | VARCHAR(20) | DEFAULT 'intrajornada' | intrajornada/interjornada |
| duracao_minima | INTEGER | | Minutos |
| duracao_maxima | INTEGER | | Minutos |
| ordem | INTEGER | DEFAULT 1 | Sequência |

**Refs:** REQ030, REQ032

---

### cp_escalas

Escalas de trabalho com controle de versão/vigência (DES031).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| nome | VARCHAR(255) | NOT NULL | Único no sistema |
| tipo | VARCHAR(20) | NOT NULL | fixa/turnos/12x36/personalizada |
| vigencia_inicio | DATE | NOT NULL | |
| vigencia_fim | DATE | | NULL = vigente |
| versao | INTEGER | DEFAULT 1 | |
| tolerancia_atraso | INTEGER | | Minutos (override do horário) |
| tolerancia_antecipacao | INTEGER | | |
| tolerancia_intervalo | INTEGER | | |
| tolerancia_noturna | INTEGER | | |
| observacoes | TEXT | | |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | |
| motivo_inativacao | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Índices:**
- UNIQUE(empresa_id, nome)
- idx_cp_esc_vigencia(vigencia_inicio, vigencia_fim)

**Refs:** REQ050-REQ056

---

### cp_escala_dias

Configuração de dias de trabalho/descanso na escala.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| escala_id | UUID | FK → cp_escalas(id) NOT NULL ON DELETE CASCADE | |
| dia_semana | INTEGER | NOT NULL CHECK (0-6) | 0=dom, 1=seg...6=sab |
| tipo_dia | VARCHAR(20) | NOT NULL | trabalho/descanso |
| horario_id | UUID | FK → cp_horarios(id) | Horário do dia |
| jornada_noturna | BOOLEAN | DEFAULT FALSE | |

**Índices:** UNIQUE(escala_id, dia_semana)

**Refs:** REQ051

---

### cp_escala_turnos

Configuração de turnos/revezamento para escalas de turno.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| escala_id | UUID | FK → cp_escalas(id) NOT NULL ON DELETE CASCADE | |
| numero_equipe | INTEGER | NOT NULL | |
| duracao_etapa | INTEGER | NOT NULL | Dias |
| horario_id | UUID | FK → cp_horarios(id) NOT NULL | Horário da equipe |
| ordem | INTEGER | NOT NULL | Sequência no ciclo |

**Refs:** REQ056

---

## 4. Tipos de Movimentação

### cp_tipos_movimentacao

Tipos de evento que impactam o cálculo do cartão.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| codigo | VARCHAR(10) | NOT NULL | Único por empresa |
| descricao_resumida | VARCHAR(50) | NOT NULL | |
| descricao_completa | VARCHAR(250) | | |
| natureza | VARCHAR(30) | NOT NULL | credito/debito/neutro |
| acao | VARCHAR(30) | NOT NULL | |
| totalizador | VARCHAR(30) | NOT NULL | |
| formula_calculo | TEXT | | Sintaxe validada |
| absenteismo | BOOLEAN | DEFAULT FALSE | |
| codigo_folha | VARCHAR(10) | | Para exportação |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Índices:** UNIQUE(empresa_id, codigo)

**Refs:** REQ070-REQ073

---

## 5. Parametrização

### cp_parametros_cartao

Parâmetros gerais do cartão de ponto por empresa.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL UNIQUE | 1 por empresa |
| tolerancia_atraso | INTEGER | DEFAULT 0 | Minutos |
| tolerancia_saida_antecipada | INTEGER | DEFAULT 0 | Minutos |
| tolerancia_extra | INTEGER | DEFAULT 0 | Minutos antes de considerar HE |
| intervalo_minimo | INTEGER | | Minutos |
| intervalo_maximo | INTEGER | | Minutos |
| multiplos_intervalos | BOOLEAN | DEFAULT FALSE | |
| qtd_intervalos | INTEGER | DEFAULT 1 | |
| he_requer_autorizacao | BOOLEAN | DEFAULT FALSE | |
| he_percentual_normal | DECIMAL(5,2) | DEFAULT 50.00 | % |
| he_percentual_dsr | DECIMAL(5,2) | DEFAULT 100.00 | % |
| he_percentual_feriado | DECIMAL(5,2) | DEFAULT 100.00 | % |
| he_percentual_noturno | DECIMAL(5,2) | DEFAULT 20.00 | % adicional noturno |
| bh_ativo | BOOLEAN | DEFAULT FALSE | |
| bh_limite_diario | DECIMAL(10,2) | | Horas |
| bh_limite_mensal | DECIMAL(10,2) | | Horas |
| bh_limite_anual | DECIMAL(10,2) | | Horas |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Refs:** REQ090-REQ094

---

### cp_parametros_evento_empresa

Mapeamento de eventos para exportação de folha, por empresa.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| rede_id | UUID | FK → cp_redes(id) | Para agrupamento |
| evento_he_dia_normal | VARCHAR(10) | | Código folha |
| evento_he_dom_feriado | VARCHAR(10) | | |
| evento_hora_faltosa | VARCHAR(10) | | |
| evento_banco_horas | VARCHAR(10) | | |
| evento_adicional_noturno | VARCHAR(10) | | |
| evento_adicional_noturno_he | VARCHAR(10) | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Índices:** UNIQUE(empresa_id)

**Refs:** REQ110-REQ114

---

## 6. REP (Registro Eletrônico de Ponto)

### cp_fabricantes_rep

Fabricantes de equipamentos REP.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| razao_social | VARCHAR(255) | NOT NULL | |
| cnpj | VARCHAR(18) | UNIQUE | |
| registro_mte | VARCHAR(50) | | Registro no MTE |
| contato_suporte | TEXT | | |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Refs:** REQ142

---

### cp_modelos_rep

Modelos de Registro Eletrônico de Ponto.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| fabricante_id | UUID | FK → cp_fabricantes_rep(id) NOT NULL | |
| numero | INTEGER | NOT NULL | Número do REP |
| tipo | VARCHAR(20) | NOT NULL | biometrico/cartao/multiplo |
| identificador_aej | VARCHAR(50) | | Identificador AEJ/AFD/AFDT |
| validade_inicio | DATE | | |
| validade_fim | DATE | | |
| capacidade_armazenamento | INTEGER | | Eventos |
| suporte_comunicacao | VARCHAR(100) | | USB/TCP-IP/Wi-Fi/GPRS |
| suporte_biometrico | BOOLEAN | DEFAULT FALSE | |
| tipos_cartao | VARCHAR(100) | | |
| firmware_versao | VARCHAR(50) | | |
| layouts_suportados | VARCHAR(50) | | AFD/AFDT/AEJ |
| certificado_conformidade | TEXT | | |
| situacao | VARCHAR(20) | DEFAULT 'ativo' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Refs:** REQ140-REQ144

---

### cp_modelo_rep_empresa

Vinculação N:N entre modelos REP e empresas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| modelo_rep_id | UUID | FK → cp_modelos_rep(id) NOT NULL | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Índices:** UNIQUE(modelo_rep_id, empresa_id)

**Refs:** REQ145

---

## 7. Cartão de Ponto

### cp_cartao_ponto

Cartão de ponto mensal por funcionário (header).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| funcionario_id | UUID | FK → cp_funcionarios(id) NOT NULL | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | Desnormalizado para filtros |
| competencia | VARCHAR(7) | NOT NULL | Formato YYYY-MM |
| situacao | VARCHAR(20) | DEFAULT 'aberto' | aberto/apurado/fechado |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Índices:**
- UNIQUE(funcionario_id, competencia)
- idx_cp_cartao_empresa(empresa_id, competencia)
- idx_cp_cartao_situacao(situacao)

**Refs:** REQ160, REQ162

---

### cp_cartao_ponto_movimento

Lançamentos diários do cartão de ponto (até 4 períodos = 8 batidas).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| cartao_ponto_id | UUID | FK → cp_cartao_ponto(id) NOT NULL ON DELETE CASCADE | |
| dia | DATE | NOT NULL | |
| tipo_dia | VARCHAR(20) | DEFAULT 'normal' | normal/dsr/feriado |
| motivo_id | UUID | FK → cp_tipos_movimentacao(id) | |
| entrada1 | TIME | | Período 1 |
| saida1 | TIME | | |
| entrada2 | TIME | | Período 2 |
| saida2 | TIME | | |
| entrada3 | TIME | | Período 3 |
| saida3 | TIME | | |
| entrada4 | TIME | | Período 4 |
| saida4 | TIME | | |
| horas_normais | DECIMAL(10,2) | DEFAULT 0 | Calculado (DES021) |
| horas_extras | DECIMAL(10,2) | DEFAULT 0 | |
| horas_falta | DECIMAL(10,2) | DEFAULT 0 | |
| horas_banco | DECIMAL(10,2) | DEFAULT 0 | + crédito / - débito |
| horas_adicional_noturno | DECIMAL(10,2) | DEFAULT 0 | |
| observacao | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Índices:**
- UNIQUE(cartao_ponto_id, dia)
- idx_cp_mov_dia(dia)

**Refs:** REQ161, REQ164

---

### cp_batidas_originais

Batidas originais capturadas do ponto eletrônico (importação).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| funcionario_id | UUID | FK → cp_funcionarios(id) NOT NULL | |
| data | DATE | NOT NULL | |
| hora | TIME | NOT NULL | |
| origem | VARCHAR(20) | DEFAULT 'importacao' | importacao/manual |
| importacao_id | UUID | FK → cp_importacoes(id) | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Índices:**
- idx_cp_batidas_func_data(funcionario_id, data)
- idx_cp_batidas_importacao(importacao_id)

**Refs:** REQ168, REQ200

---

### cp_totalizadores_mes

Totalizadores mensais consolidados por motivo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| cartao_ponto_id | UUID | FK → cp_cartao_ponto(id) NOT NULL ON DELETE CASCADE | |
| funcionario_id | UUID | FK → cp_funcionarios(id) NOT NULL | Desnormalizado |
| competencia | VARCHAR(7) | NOT NULL | YYYY-MM |
| motivo_id | UUID | FK → cp_tipos_movimentacao(id) | |
| total_horas | DECIMAL(10,2) | DEFAULT 0 | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Índices:**
- UNIQUE(cartao_ponto_id, motivo_id)
- idx_cp_total_func(funcionario_id, competencia)

**Refs:** REQ164, REQ182

---

## 8. Banco de Horas

### cp_saldo_banco_horas

Saldo inicial e migrado do banco de horas por funcionário/período.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| funcionario_id | UUID | FK → cp_funcionarios(id) NOT NULL | |
| competencia | VARCHAR(7) | NOT NULL | YYYY-MM |
| saldo_credor | DECIMAL(10,2) | DEFAULT 0 | Horas (DES034) |
| recalculado | BOOLEAN | DEFAULT FALSE | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |
| updated_by | UUID | FK → users(id) | |

**Índices:** UNIQUE(funcionario_id, competencia)

**Refs:** REQ130-REQ132

---

### cp_banco_horas_movimento

Movimentações detalhadas do banco de horas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| funcionario_id | UUID | FK → cp_funcionarios(id) NOT NULL | |
| competencia | VARCHAR(7) | NOT NULL | YYYY-MM |
| tipo | VARCHAR(10) | NOT NULL | credito/debito |
| horas | DECIMAL(10,2) | NOT NULL | Sempre positivo |
| motivo | VARCHAR(100) | | |
| referencia_cartao_id | UUID | FK → cp_cartao_ponto(id) | Cartão de origem |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |

**Índices:** idx_cp_bh_func_comp(funcionario_id, competencia)

**Refs:** REQ094, REQ165, DES025

---

## 9. Fechamento Mensal

### cp_fechamento_mensal

Registro de fechamentos mensais executados (irreversíveis).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| competencia | VARCHAR(7) | NOT NULL | YYYY-MM |
| data_fechamento | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| desconta_hora_negativa | BOOLEAN | DEFAULT FALSE | REQ183 |
| usuario_id | UUID | FK → users(id) NOT NULL | Quem executou |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Índices:** UNIQUE(empresa_id, competencia)

**Refs:** REQ184, DES024

---

## 10. Importação e Exportação

### cp_importacoes

Registro de importações de batidas realizadas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| formato | VARCHAR(20) | NOT NULL | topdata/kurumim |
| arquivo_nome | VARCHAR(255) | NOT NULL | |
| periodo_inicio | DATE | NOT NULL | |
| periodo_fim | DATE | NOT NULL | Mesmo mês |
| total_registros | INTEGER | DEFAULT 0 | |
| registros_sucesso | INTEGER | DEFAULT 0 | |
| registros_erro | INTEGER | DEFAULT 0 | |
| situacao | VARCHAR(20) | DEFAULT 'processando' | processando/concluido/erro |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |

**Refs:** REQ200-REQ203, DES022

---

### cp_exportacoes

Registro de exportações realizadas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| empresa_id | UUID | FK → cp_empresas(id) NOT NULL | |
| tipo | VARCHAR(30) | NOT NULL | horas/aej/madis_admissao/madis_demissao |
| arquivo_nome | VARCHAR(255) | NOT NULL | |
| periodo_inicio | DATE | | |
| periodo_fim | DATE | | |
| total_registros | INTEGER | DEFAULT 0 | |
| situacao | VARCHAR(20) | DEFAULT 'gerado' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_by | UUID | FK → users(id) | |

**Refs:** REQ185, REQ210, REQ220, DES023

---

## 11. Auditoria

### cp_audit_log

Trilha de auditoria campo-a-campo para todas as entidades do módulo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| entidade | VARCHAR(100) | NOT NULL | Nome da tabela |
| entidade_id | UUID | NOT NULL | PK do registro |
| campo | VARCHAR(100) | NOT NULL | Nome do campo |
| valor_anterior | TEXT | | |
| valor_novo | TEXT | | |
| usuario_id | UUID | FK → users(id) NOT NULL | |
| ip | VARCHAR(45) | | IPv4/IPv6 |
| justificativa | TEXT | | Obrigatória em campos críticos |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Imutável |

**Índices:**
- idx_cp_audit_entidade(entidade, entidade_id)
- idx_cp_audit_usuario(usuario_id)
- idx_cp_audit_created(created_at)

**Refs:** REQ009, REQ290, DES005

---

### cp_operation_log

Log de operações macro do sistema.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK | |
| tipo_operacao | VARCHAR(50) | NOT NULL | importacao/exportacao/fechamento/apuracao |
| descricao | VARCHAR(255) | | |
| detalhes | JSONB | | Dados estruturados da operação |
| resultado | VARCHAR(20) | NOT NULL | sucesso/erro/parcial |
| empresa_id | UUID | FK → cp_empresas(id) | |
| usuario_id | UUID | FK → users(id) NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Índices:**
- idx_cp_oplog_tipo(tipo_operacao)
- idx_cp_oplog_empresa(empresa_id)
- idx_cp_oplog_created(created_at)

**Refs:** REQ291, DES005

---

## Diagrama de Relacionamentos

```
cp_redes
  │
  └─── cp_empresas
         │
         ├─── cp_centros_custo (hierárquico via pai_id)
         ├─── cp_cargos
         ├─── cp_usuario_empresa ───── users
         ├─── cp_parametros_cartao (1:1)
         ├─── cp_parametros_evento_empresa (1:1)
         ├─── cp_tipos_movimentacao
         ├─── cp_fechamento_mensal
         ├─── cp_importacoes
         ├─── cp_exportacoes
         ├─── cp_operation_log
         │
         ├─── cp_funcionarios
         │      │
         │      ├─── cp_cartao_ponto (por competência)
         │      │      ├─── cp_cartao_ponto_movimento (por dia)
         │      │      └─── cp_totalizadores_mes (por motivo)
         │      │
         │      ├─── cp_batidas_originais
         │      ├─── cp_saldo_banco_horas
         │      └─── cp_banco_horas_movimento
         │
         ├─── cp_horarios
         │      └─── cp_horario_intervalos
         │
         ├─── cp_escalas
         │      ├─── cp_escala_dias ─── cp_horarios
         │      └─── cp_escala_turnos ─── cp_horarios
         │
         └─── cp_modelo_rep_empresa
                └─── cp_modelos_rep
                       └─── cp_fabricantes_rep

cp_audit_log (referencia qualquer entidade por nome + UUID)
```

---

## Índices Recomendados (Resumo)

| Tabela | Índice | Tipo | Justificativa |
|--------|--------|------|---------------|
| cp_funcionarios | (matricula) | UNIQUE | REQ002 unicidade |
| cp_funcionarios | (cpf) | UNIQUE | REQ002 unicidade |
| cp_funcionarios | (empresa_id) | BTREE | Filtro por empresa |
| cp_funcionarios | (pis) | BTREE | Match importação |
| cp_horarios | (vigencia_inicio, vigencia_fim) | BTREE | Busca por vigência |
| cp_escalas | (empresa_id, nome) | UNIQUE | REQ050 nome único |
| cp_cartao_ponto | (funcionario_id, competencia) | UNIQUE | 1 cartão por mês |
| cp_cartao_ponto | (empresa_id, competencia) | BTREE | Filtro apuração |
| cp_cartao_ponto_movimento | (cartao_ponto_id, dia) | UNIQUE | 1 lançamento por dia |
| cp_batidas_originais | (funcionario_id, data) | BTREE | Busca por dia |
| cp_totalizadores_mes | (cartao_ponto_id, motivo_id) | UNIQUE | 1 total por motivo |
| cp_saldo_banco_horas | (funcionario_id, competencia) | UNIQUE | 1 saldo por mês |
| cp_fechamento_mensal | (empresa_id, competencia) | UNIQUE | 1 fechamento por mês |
| cp_audit_log | (entidade, entidade_id) | BTREE | Busca por registro |
| cp_audit_log | (created_at) | BTREE | Filtro temporal |
| cp_operation_log | (tipo_operacao) | BTREE | Filtro por tipo |

---

## Índice de Referência

| Tabela | Módulo | Refs |
|--------|--------|------|
| cp_redes | Estrutura | DES004, NFR031 |
| cp_empresas | Estrutura | DES004, NFR031 |
| cp_centros_custo | Estrutura | REQ230-REQ240 |
| cp_cargos | Estrutura | REQ004, REQ234 |
| cp_usuario_empresa | Acesso | NFR011 |
| cp_funcionarios | Funcionários | REQ001-REQ009 |
| cp_horarios | Horários | REQ030-REQ033 |
| cp_horario_intervalos | Horários | REQ030, REQ032 |
| cp_escalas | Escalas | REQ050-REQ056 |
| cp_escala_dias | Escalas | REQ051 |
| cp_escala_turnos | Escalas | REQ056 |
| cp_tipos_movimentacao | Movimentação | REQ070-REQ073 |
| cp_parametros_cartao | Parametrização | REQ090-REQ094 |
| cp_parametros_evento_empresa | Parametrização | REQ110-REQ114 |
| cp_fabricantes_rep | REP | REQ142 |
| cp_modelos_rep | REP | REQ140-REQ144 |
| cp_modelo_rep_empresa | REP | REQ145 |
| cp_cartao_ponto | Cartão de Ponto | REQ160, REQ162 |
| cp_cartao_ponto_movimento | Cartão de Ponto | REQ161, REQ164 |
| cp_batidas_originais | Cartão de Ponto | REQ168, REQ200 |
| cp_totalizadores_mes | Cartão de Ponto | REQ164, REQ182 |
| cp_saldo_banco_horas | Banco de Horas | REQ130-REQ132 |
| cp_banco_horas_movimento | Banco de Horas | REQ094, REQ165 |
| cp_fechamento_mensal | Fechamento | REQ184 |
| cp_importacoes | Importação | REQ200-REQ203 |
| cp_exportacoes | Exportação | REQ185, REQ210, REQ220 |
| cp_audit_log | Auditoria | REQ009, REQ290 |
| cp_operation_log | Auditoria | REQ291 |
