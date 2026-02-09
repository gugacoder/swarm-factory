# PRP-010 — Apuração de Horas, Fechamento Mensal e Banco de Horas

## Objetivo

Implementar a tela de apuração de horas extras / fechamento mensal com abas (Apuração, Fechamento, Listagem de inconsistências), o processo de fechamento mensal irreversível e a lógica completa de compensação do banco de horas.

## Execution Mode

`implementar`

## Contexto

PRP-009 implementou o motor de cálculo e a importação. PRP-008 implementou a digitação do cartão. PRP-003 criou as tabelas cp_fechamento_mensal, cp_banco_horas_movimento, cp_saldo_banco_horas. PRP-007 implementou a parametrização (parâmetros do cartão, eventos por empresa).

Decisões de design:
- DES024 — Fechamento como transação atômica no PostgreSQL
- DES025 — Lógica de compensação BH com prioridades

## Especificação

### API Routes (`/api/ponto/apuracao`)

1. **POST /api/ponto/apuracao/executar** — Executar apuração (REQ181)
   - Body: empresa_id, competencia, modo (detalhado/totalizadores), funcionario_ids (opcional)
   - Validações prévias:
     - Rede obrigatória
     - Alerta se empresa sem eventos BH configurados (REQ181)
     - Verificação de digitação completa (REQ181)
     - Mês não fechado (REQ184)
   - Para cada funcionário: invocar motor de cálculo (PRP-009) recalculando todos os dias do mês
   - Marcar cartão como 'apurado'
   - Retorna resultados conforme modo

2. **GET /api/ponto/apuracao/resultados** — Resultados da apuração (REQ182)
   - Params: empresa_id, competencia
   - Colunas: Empresa, Matrícula, Nome, Horas trabalhadas, Dia normal, HE dom/feriado, Hora faltosa, BH, Adic. noturno, Adic. noturno HE
   - Filtro para exibir apenas funcionários com horas lançadas (REQ182)

3. **GET /api/ponto/apuracao/inconsistencias** — Listar inconsistências (REQ186)
   - Funcionários sem lançamentos para o mês
   - Funcionários com lançamentos que não cobrem o mês integral

4. **POST /api/ponto/fechamento/executar** — Fechamento mensal (REQ184, DES024)
   - Body: empresa_id, competencia, desconta_hora_negativa
   - Pré-condições: apuração executada, sem inconsistências
   - **Transação atômica**:
     1. BEGIN
     2. Verificar pré-condições (lock nos cartões)
     3. Inserir registros de BH (cp_banco_horas_movimento)
     4. Quitar saldos positivos
     5. Zerar horas quitadas
     6. Marcar cartões como 'fechado'
     7. Inserir registro em cp_fechamento_mensal
     8. COMMIT
   - Rollback completo em caso de falha
   - Irreversível (executável apenas uma vez por período)
   - Registro em cp_operation_log

5. **GET /api/ponto/apuracao/horas-negativas** — Controle de horas negativas (REQ183)
   - Visível quando BH ativo
   - Lista funcionários com horas negativas para desconto em folha

### Banco de Horas — Lógica de Compensação (DES025)

Integrado ao processo de fechamento:

- **Créditos**: horas extras dentro dos limites configurados em cp_parametros_cartao (bh_limite_diario, bh_limite_mensal, bh_limite_anual)
- **Débitos**: atrasos, saídas antecipadas, intervalos excedidos
- **Compensação automática** com saldos de meses anteriores (limite parametrizado)
- **Excedentes** além do limite: tratados como hora extra (exportados para folha)
- Saldo inicial (cp_saldo_banco_horas) incorporado ao cálculo
- Cada movimentação registrada em cp_banco_horas_movimento com tipo, horas, motivo, referência ao cartão

### UI — Tela de Apuração/Fechamento (`/ponto/apuracao`)

**Header**:
- Filtro hierárquico: Rede → Empresa → Funcionário (opcional)
- Seletor de período MM/yyyy (padrão: mês atual) (REQ180)

**Abas** (REQ180):

#### Aba Apuração
- Botão "Apurar Horas" com modo: Detalhado / Totalizadores (REQ181)
- Grade de resultados conforme REQ182
- Filtro "Somente com horas lançadas"
- Botão imprimir relatório parcial (REQ182)
- Opção "Desconta hora negativa em folha" (visível se BH ativo) (REQ183)

#### Aba Fechamento
- Status atual (aberto/apurado/fechado)
- Botão "Executar Fechamento" com confirmação (Alert Dialog destrutivo)
- Mensagem clara de irreversibilidade (REQ184)
- Após sucesso: mensagem com opção de imprimir e exportar (REQ184)
- Se inconsistências existirem: botão desabilitado com tooltip explicando

#### Aba Listagem (Inconsistências)
- Lista de inconsistências conforme REQ186
- Indicação se fechamento está impedido
- Link para abrir o cartão do funcionário inconsistente

### UI — Exportação de Horas (REQ185)

Após fechamento, botão para exportar arquivo TXT:
- Layout: Empresa(2)|Matrícula(5)|Evento(3)|Horas(3)|Minutos(2)|MêsAno(6) pipe-separated (DES043)
- Seleção de caminho e nome (.TXT)
- Confirmação para sobrescrever

## Limites

- Não implementar reabertura de período fechado — é irreversível por design (REQ184)
- Não alterar o motor de cálculo (PRP-009) — apenas invocar
- Não implementar os demais relatórios (PRP-012) — apenas a exportação de horas pós-fechamento
- Não implementar exportação AEJ ou Madis (PRP-011)
- A exportação de horas (REQ185) é incluída neste PRP por ser parte do fluxo de fechamento
