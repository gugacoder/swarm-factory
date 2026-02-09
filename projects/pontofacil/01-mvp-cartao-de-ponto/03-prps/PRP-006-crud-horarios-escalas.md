# PRP-006 — CRUD de Horários e Escalas

## Objetivo

Implementar o cadastro completo de horários de trabalho (com intervalos, tipos, vigência e versionamento) e escalas (com dias, turnos, tolerâncias, vigência e versionamento).

## Execution Mode

`implementar`

## Contexto

PRP-004 criou o app e o backbone com rotas placeholder em `/ponto/horarios` e `/ponto/escalas`. PRP-002 criou as tabelas cp_horarios, cp_horario_intervalos, cp_escalas, cp_escala_dias, cp_escala_turnos. PRP-005 estabeleceu os padrões de API route, schemas Zod, DataTable e formulários no módulo — seguir os mesmos padrões.

Decisões de design relevantes:
- DES031 — Versão/vigência: novo registro = nova versão (não sobrescreve)
- DES014 — Componente TimeInput com máscara HH:mm
- DES011 — Forms com React Hook Form + Zod

## Especificação

### Horários — API Routes (`/api/ponto/horarios`)

1. **GET** — Listagem paginada por empresa, com filtros (tipo, situacao, busca)
2. **GET /:id** — Detalhe com intervalos
3. **POST** — Criação com validação (REQ030, REQ032):
   - Hora saída > hora entrada (ou virada de dia)
   - Intervalos sem sobreposição, dentro da jornada
   - Intervalo mínimo conforme política
   - Cálculo automático de duracao_jornada
   - vigencia_inicio obrigatória
4. **PUT /:id** — Atualização que gera nova versão (REQ033):
   - Fecha vigência da versão atual (vigencia_fim = hoje)
   - Cria novo registro com versão incrementada
   - Sem sobreposição de vigências
5. **PATCH /:id/situacao** — Ativação/inativação
6. **GET /:id/versoes** — Histórico de versões consultável (REQ033)

### Horários — UI (`/ponto/horarios`)

- DataTable com colunas: Descrição, Tipo, Entrada, Saída, Duração, Vigência, Situação
- Formulário com campos dinâmicos por tipo (REQ031):
  - Campos adicionais para noturno
  - Seção de intervalos (adicionar/remover múltiplos) com campos: hora_inicio, hora_fim, tipo, duração
  - Seção de tolerâncias: atraso, antecipação, extra (em minutos)
- Campos de horário com máscara HH:mm e validação de range (DES014)
- Pré-visualização da jornada (timeline visual simples) antes de salvar
- Histórico de versões acessível no detalhe (drawer ou tab)

### Escalas — API Routes (`/api/ponto/escalas`)

1. **GET** — Listagem paginada por empresa, com filtros (tipo, situacao, busca)
2. **GET /:id** — Detalhe com dias e turnos
3. **POST** — Criação com validação (REQ050, REQ053):
   - Nome único no sistema
   - Pelo menos 1 dia de trabalho
   - Sem sobreposição de horários no mesmo dia
   - Coerência para 12x36 (jornada 12h, descanso subsequente)
   - Tolerâncias não excedem período real
4. **PUT /:id** — Atualização com nova versão (REQ054):
   - Mesmo padrão de vigência dos horários
   - Edição retroativa impedida se houver cálculos consolidados
5. **PATCH /:id/situacao** — Inativação com validação (REQ055):
   - Escala vinculada a funcionários com vigência ativa não pode ser desativada
6. **GET /:id/versoes** — Histórico de versões

### Escalas — UI (`/ponto/escalas`)

- DataTable com colunas: Nome, Tipo, Vigência, Situação
- Formulário dinâmico por tipo (REQ050):
  - **Fixa**: seletor de dias da semana (multisseleção), horário por dia
  - **Turnos/Revezamento**: nº equipes, duração etapa, sequência ciclo (REQ056)
  - **12x36**: configuração simplificada de jornada e descanso
  - **Personalizada**: configuração livre de dias e horários
- Para cada dia laboral: associação de bloco de horário (combobox de horários cadastrados)
- Flag de jornada noturna por dia
- Seção de tolerâncias override (REQ052)
- Pré-visualização da escala (calendário semanal visual) antes de salvar (REQ053)
- Documentação contextual descrevendo cada tipo (tooltip/help) (REQ050)

## Limites

- Não implementar cálculos de ponto — apenas cadastro e configuração
- Não alterar o cadastro de funcionários (PRP-005)
- Não implementar integração em tempo real com cartão de ponto
- Exclusion constraint para vigência pode ser feita via validação aplicacional (não exigir constraint PostgreSQL se complexo demais)
- Não implementar drag-and-drop para organizar dias — usar formulário simples
