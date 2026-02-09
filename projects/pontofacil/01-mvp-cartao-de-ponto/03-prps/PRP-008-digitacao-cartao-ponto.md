# PRP-008 — Digitação / Ajuste do Cartão de Ponto

## Objetivo

Implementar a tela de digitação e ajuste do cartão de ponto: filtro hierárquico, grid de lançamentos diários (até 4 períodos), tipo de dia, motivo, batidas originais, operações auxiliares, aba de banco de horas e impressão.

## Execution Mode

`implementar`

## Contexto

PRP-004 criou rota placeholder em `/ponto/cartao`. PRP-003 criou as tabelas cp_cartao_ponto, cp_cartao_ponto_movimento, cp_batidas_originais, cp_totalizadores_mes. PRP-005 implementou o componente de filtro hierárquico (DES013). PRP-006 cadastrou horários e escalas que serão consumidos aqui.

Decisões de design:
- DES014 — TimeInput: máscara HH:mm, Tab entre campos, carregamento automático do horário padrão
- DES016 — Abas preservadas do legado: Lançamentos | Banco de Horas
- DES021 — Motor de cálculo (implementado no PRP-009) calcula totalizadores automaticamente

Esta tela é a mais crítica do módulo em termos de usabilidade (operadores digitam centenas de entradas diárias).

## Especificação

### API Routes (`/api/ponto/cartao`)

1. **GET /api/ponto/cartao** — Buscar cartão de ponto do funcionário no mês
   - Params: funcionario_id, competencia (YYYY-MM)
   - Retorna: header do cartão + todos os movimentos do mês + batidas originais
   - Cria cartão automaticamente se não existir (situacao='aberto')

2. **GET /api/ponto/cartao/:id/movimento** — Listar movimentos do cartão
   - Ordenado por dia

3. **PUT /api/ponto/cartao/:cartao_id/movimento/:dia** — Salvar lançamento do dia (REQ161)
   - Validação: formato HH:mm, horas 00-23, minutos 00-59
   - Tipo do dia: normal/dsr/feriado
   - Motivo (referência a cp_tipos_movimentacao)
   - Campos: entrada1-4, saida1-4
   - Calcula totalizadores do dia automaticamente (invoca motor de cálculo — DES021)
   - Atualiza totalizadores mensais (cp_totalizadores_mes)

4. **POST /api/ponto/cartao/:id/batch** — Repetir lançamento para múltiplos dias (REQ163)
   - Body: dia_inicio, dia_fim, dados do lançamento
   - Respeita limite do mesmo mês
   - Calcula totalizadores para cada dia

5. **DELETE /api/ponto/cartao/:cartao_id/movimento/:dia** — Excluir lançamento do dia
   - Recalcula totalizadores

6. **GET /api/ponto/cartao/:id/batidas-originais** — Batidas importadas do REP (REQ168)
   - Retorna por dia, formato concatenado

7. **GET /api/ponto/cartao/validar-periodo** — Validar período antes de edição (REQ162)
   - Verifica: mês não apurado/fechado, funcionário vigente no período

8. **POST /api/ponto/cartao/:id/shift** — Deslocar horários (REQ166)
   - Body: dia, direcao (esquerda/direita)
   - Move sequência de horários na direção

9. **POST /api/ponto/cartao/:id/carregar-padrao** — Carregar horário padrão do funcionário (REQ166)
   - Body: dia
   - Preenche campos com horário padrão vinculado ao funcionário

10. **GET /api/ponto/cartao/:id/totalizadores** — Totalizadores mensais consolidados (REQ164)

11. **GET /api/ponto/cartao/:id/banco-horas** — Dados da aba BH (REQ165)
    - Histórico mês a mês do saldo BH
    - Meses compensados
    - Previsão com lançamentos não confirmados

### UI — Tela de Digitação (`/ponto/cartao`)

**Header**:
- Filtro hierárquico: Rede → Empresa → Funcionário (DES013) (REQ160)
- Seletor de Mês/Ano com máscara MM/yyyy (REQ160)
- Indicação do horário padrão e escala do funcionário selecionado

**Abas** (REQ160):

#### Aba Lançamentos

- **Grid mensal**: uma linha por dia do mês
  - Colunas: Dia, Dia Semana, Tipo Dia (dropdown: Normal/DSR/Feriado), Motivo (dropdown de tipos movimentação + opção "Fixa"), Entrada1, Saída1, Entrada2, Saída2, Entrada3, Saída3, Entrada4, Saída4, H.Normais, H.Extras, H.Falta, H.BH
  - Campos de horário com máscara HH:mm, Tab entre campos (DES014)
  - Carregamento automático do horário padrão ao selecionar dia (REQ161)
  - Indicador visual de divergência com batida original (DES014)
  - Totalizadores diários calculados automaticamente (REQ164)

- **Painel de batidas originais**: exibido ao selecionar um dia (REQ168)
  - Formato concatenado: "08:00-12:00-13:00-18:00"

- **Opção "Util. lcto até"**: checkbox + seletor de dia final (REQ163)

- **Barra de ações**:
  - Deslocar esquerda/direita (REQ166)
  - Carregar horário padrão (REQ166)
  - Marcar todos os intervalos (REQ166)
  - Alterar Ocorrência (REQ166)
  - Imprimir (REQ167) — disponível após confirmação

- **Consolidação mensal**: tabela de totais por motivo, atualizada em tempo real (REQ164)

- **Detecção de alterações não salvas** ao fechar/cancelar (REQ162)

#### Aba Banco de Horas (REQ165)

- Histórico mês a mês com saldo BH
- Click em linha mostra meses compensados
- Botão "Atualizar" para previsão com lançamentos não confirmados
- Percentuais de acréscimo (Dia Normal, DSR, Feriado)

### UI — Impressão (REQ167)

- Espelho do cartão de ponto com todos os lançamentos e totalizadores
- CSS @media print conforme DES015
- Disponível apenas após confirmação e salvamento

## Limites

- O motor de cálculo (DES021) será implementado no PRP-009 — neste PRP, criar a interface de chamada (função/endpoint) mas a lógica de cálculo em si é do PRP-009. Para efeito de desenvolvimento, implementar um cálculo simplificado (diferença de horas) que será substituído pelo motor completo
- Não implementar apuração de horas nem fechamento mensal (PRP-010)
- Não implementar importação de batidas (PRP-009) — apenas exibir batidas já importadas
- Não criar solicitação de ajuste pelo funcionário (US041) — funcionalidade de segundo momento
- Não implementar visualização read-only do funcionário (US040) — segundo momento
- Manter performance com skeleton loading para o grid mensal (NFR001)
