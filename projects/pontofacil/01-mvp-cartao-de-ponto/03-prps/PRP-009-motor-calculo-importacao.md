# PRP-009 — Motor de Cálculo de Horas e Importação de Batidas

## Objetivo

Implementar o motor de cálculo de horas (módulo isolado) e o pipeline de importação de batidas de ponto eletrônico nos formatos TopData e Kurumim.

## Execution Mode

`implementar`

## Contexto

PRP-008 criou a tela de digitação do cartão com cálculo simplificado placeholder. Este PRP substitui o placeholder pelo motor completo (DES021) e adiciona a importação (DES022). As tabelas cp_batidas_originais, cp_importacoes, cp_cartao_ponto_movimento, cp_totalizadores_mes, cp_banco_horas_movimento já existem (PRP-003). Os parâmetros são lidos de cp_parametros_cartao (PRP-007).

Decisões de design:
- DES021 — Motor de cálculo isolado, testável
- DES022 — Pipeline de importação em etapas
- DES034 — Horas como DECIMAL(10,2) em horas decimais
- DES040 — Formatos posicionais: PIS(11) + Data(DDMMYYYY,8) + Hora(HHMM,4) = 23 chars/linha

## Especificação

### 1. Motor de Cálculo (DES021)

Módulo em `backbone/src/services/ponto/calculation-engine.ts` (ou diretório similar).

**Interface**:
```
Input:
  - batidas do dia (entrada1-4, saida1-4)
  - horário padrão do funcionário (hora_entrada, hora_saida, intervalos, tolerâncias)
  - tipo do dia (normal/dsr/feriado)
  - parâmetros do cartão (tolerâncias, intervalos, HE, BH da empresa)
  - escala (tolerâncias override)

Output:
  - horas_normais: DECIMAL
  - horas_extras: DECIMAL (com percentual aplicável)
  - horas_falta: DECIMAL
  - horas_banco: DECIMAL (+ crédito / - débito)
  - horas_adicional_noturno: DECIMAL
```

**Regras aplicadas em ordem** (REQ164, REQ181):
1. **Tolerâncias**: aplicar tolerância de atraso (antes da entrada) e antecipação (após saída). Se dentro da tolerância, não gera atraso/saída antecipada
2. **Intervalos**: verificar duração do intervalo vs mínimo/máximo. Exceder máximo gera apontamento de ausência parcial
3. **Jornada**: calcular horas trabalhadas = soma dos períodos (entrada→saída) - intervalos
4. **Horas extras**: horas além da jornada prevista. Se tolerância de extra configurada, descontar. Aplicar percentuais por tipo de dia (normal, DSR, feriado). Se requer autorização, marcar como pendente
5. **Banco de horas**: se BH ativo, creditar horas extras dentro dos limites. Excedentes além do limite tratados como hora extra. Débitos: atrasos, saídas antecipadas, intervalos excedidos (DES025)
6. **Adicional noturno** (REQ187): 3 cenários:
   - Entrada antes das 22h e saída antes das 5h
   - Entrada e saída entre 22h e 5h
   - Entrada depois das 22h e saída depois das 5h

**Armazenamento**: resultado gravado em cp_cartao_ponto_movimento (totalizadores diários) e consolidado em cp_totalizadores_mes (por motivo).

O motor deve ser uma função pura (sem side effects de banco) para ser testável unitariamente. A camada de persistência é separada.

### 2. Importação de Batidas (DES022)

**API Routes** (`/api/ponto/importacao`):

1. **POST /api/ponto/importacao** — Iniciar importação (REQ200)
   - Body: arquivo (upload), empresa_id, formato (topdata/kurumim), periodo_inicio, periodo_fim
   - Validação: período no mesmo mês, parâmetros de cartão configurados (REQ202)
   - Verifica se digitação de ponto não está aberta com alterações (REQ202)

2. **GET /api/ponto/importacao/:id** — Status da importação
   - Retorna: progresso, totais, erros

3. **GET /api/ponto/importacao/:id/inconsistencias** — Log de inconsistências
   - Dias com número inválido de batidas (REQ202)

**Pipeline de processamento** (REQ201, DES022):

1. Upload e validação de formato
2. Parse do arquivo: cada linha = PIS(11) + Data(DDMMYYYY, 8) + Hora(HHMM, 4)
3. Match PIS → funcionário via campo pis em cp_funcionarios
4. Validação de datas dentro do período selecionado
5. Inserção em cp_batidas_originais
6. Agrupamento de batidas por funcionário/dia
7. Para cada dia: invocar motor de cálculo (DES021)
8. Atualizar cp_cartao_ponto_movimento e cp_totalizadores_mes
9. Compensação automática de BH (crédito/débito)
10. Registro em cp_importacoes com contadores
11. Log de inconsistências em cp_operation_log

- Opção de sobrescrever dados existentes com confirmação (REQ202)
- Processamento com feedback de progresso (NFR003)

### UI — Tela de Importação (`/ponto/importacao`)

- Filtro hierárquico: Rede → Empresa → Funcionário(s) (REQ200)
- Seletor de período (mesmo mês) (REQ200)
- Seletor de formato: TopData / Kurumim (REQ200)
- Upload de arquivo com validação de layout (REQ200)
- Barra de progresso durante processamento (NFR003)
- Resultado: total processados, sucesso, erros
- Lista de inconsistências com detalhes (REQ203)
- Confirmação para sobrescrever dados existentes (REQ202)

## Limites

- Não implementar comunicação direta com equipamentos REP — apenas importação de arquivo
- Não implementar novos formatos de arquivo além de TopData e Kurumim
- Não implementar processamento assíncrono via Backbone/LangGraph — processar na API route (arquivos são pequenos por empresa)
- Não implementar SSE para progresso neste momento — usar polling simples ou processar síncrono
- Não alterar a tela de digitação do cartão (PRP-008) exceto para substituir o cálculo placeholder pelo motor real
- Testes unitários do motor de cálculo são obrigatórios — cobrir os 3 cenários de adicional noturno e os fluxos de BH
