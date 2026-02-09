# PRP-007 — CRUD de Tipos de Movimentação, Parametrização e REP

## Objetivo

Implementar os cadastros de Tipos de Movimentação, Parâmetros do Cartão de Ponto, Parâmetros de Evento por Empresa, Saldo Inicial do Banco de Horas e Modelos de REP.

## Execution Mode

`implementar`

## Contexto

PRP-004 criou rotas placeholder para `/ponto/movimentacoes`, `/ponto/parametros`, `/ponto/eventos`, `/ponto/rep`. PRP-002/003 criaram as tabelas cp_tipos_movimentacao, cp_parametros_cartao, cp_parametros_evento_empresa, cp_fabricantes_rep, cp_modelos_rep, cp_modelo_rep_empresa, cp_saldo_banco_horas. Padrões de API/UI estabelecidos em PRP-005 e PRP-006.

## Especificação

### 1. Tipos de Movimentação (`/ponto/movimentacoes`) — REQ070-REQ073, US011

**API Routes** (`/api/ponto/movimentacoes`):
- CRUD completo com UNIQUE(empresa_id, codigo)
- Validação de sintaxe básica da fórmula de cálculo (REQ071)
- Ativação/inativação com histórico (REQ073)
- Filtros: busca, natureza, ação, totalizador, situacao

**UI**:
- DataTable com colunas: Código, Descrição, Natureza, Ação, Totalizador, Absenteísmo, Situação
- Busca em tempo real no grid (REQ070)
- Formulário com: código, descrição resumida (50 chars), descrição completa (250 chars), natureza (dropdown: crédito/débito/neutro), ação (dropdown), totalizador (dropdown), checkbox absenteísmo, fórmula de cálculo, código de folha (REQ072)
- Organização em abas conforme REQ070

### 2. Parâmetros do Cartão (`/ponto/parametros`) — REQ090-REQ094, US004

**API Routes** (`/api/ponto/parametros`):
- GET/PUT por empresa (1:1, UNIQUE empresa_id)
- Carregamento de parâmetros anteriores (REQ090)
- Validação: tolerâncias não negativas, limites BH coerentes, percentuais HE válidos

**UI**:
- Tela com seções/abas: Tolerâncias | Intervalos | Hora Extra | Banco de Horas (REQ090)
- **Tolerâncias**: atraso (min), saída antecipada (min), tempo extra antes de HE (min) — REQ091
- **Intervalos**: mínimo, máximo, múltiplos intervalos (switch + qtd) — REQ092
- **Hora Extra**: switch autorização prévia, percentuais (normal, DSR, feriado, noturno) — REQ093
  - Alerta quando HE automática ativa sem percentuais (REQ093)
- **Banco de Horas**: switch ativo/inativo, limites diário/mensal/anual — REQ094
  - Alerta quando BH ativo sem limites (REQ094)
- Campos de horário em HH:MM onde aplicável (REQ090)
- Botões: Salvar, Limpar, Sair (REQ090)

### 3. Eventos por Empresa (`/ponto/eventos`) — REQ110-REQ114, US005

**API Routes** (`/api/ponto/eventos`):
- CRUD com UNIQUE(empresa_id)
- Opção "aplicar a todas as empresas" (REQ110)
- Validação de eventos obrigatórios antes de confirmar (REQ111)
- Impedimento de duplicidade (REQ112)

**UI**:
- Abas: Cadastro | Empresa | Listagem (REQ110)
- Seleção de eventos: HE Dia Normal, HE Domingos/Feriados, Hora Faltosa, BH, Adic. Noturno, Adic. Noturno HE (REQ111)
- Campo Rede para agrupamento (REQ111)
- Lista de empresas com checkbox "Todas" (REQ112)
- Listagem com: empresa, eventos configurados, datas (REQ113)
- Botões CRUD padrão (REQ110)

### 4. Saldo Inicial BH (`/ponto/parametros/saldo-inicial`) — REQ130-REQ132, US013

**API Routes** (`/api/ponto/banco-horas/saldo-inicial`):
- CRUD com UNIQUE(funcionario_id, competencia)
- Recálculo opcional (REQ131)
- Histórico de alterações (REQ132)

**UI**:
- Abas: Cadastro | Listagem (REQ130)
- Seletor de colaborador (combobox com busca)
- Período MM/yyyy, saldo credor com máscara de horas
- Checkbox "Recalcular saldo" (REQ131)
- Listagem com filtro por funcionário e período

### 5. Modelos REP (`/ponto/rep`) — REQ140-REQ145, US012

**API Routes** (`/api/ponto/rep`):
- CRUD de fabricantes (simplificado: listagem + criação inline)
- CRUD de modelos com UNIQUE(numero, empresa)
- Vinculação N:N modelo↔empresas (REQ145)

**UI**:
- DataTable com colunas: Número, Tipo, Fabricante, Validade, Empresas vinculadas, Situação
- Formulário com: número, tipo (biométrico/cartão/múltiplo), identificador AEJ, validade (início/fim), fabricante (combobox com opção criar), informações técnicas (capacidade, comunicação, biométrico, cartões, firmware), layouts suportados (AFD/AFDT/AEJ), certificado conformidade
- Seção de associação a empresas (multiselect) (REQ145)

## Limites

- Não implementar a lógica do motor de cálculo que consome esses parâmetros (PRP-009)
- Não implementar exportação para folha (PRP-011)
- Não criar tela de gestão de empresas/redes — apenas consumir como opções
- Não implementar validação de fórmulas complexas (apenas sintaxe básica: parênteses balanceados, operadores válidos)
- Não implementar comunicação real com equipamentos REP — apenas cadastro dos modelos
