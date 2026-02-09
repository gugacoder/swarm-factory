# PRP-005 — CRUD Completo de Funcionários

## Objetivo

Implementar o cadastro completo de funcionários: listagem paginada com filtros, criação, edição, inativação, associações (escala/horário/REP) e histórico de auditoria.

## Execution Mode

`implementar`

## Contexto

PRP-004 criou o app (Vite+React) e o backbone (Hono) com layout base, sidebar, autenticação e páginas/rotas placeholder. A rota `/ponto/funcionarios` já existe como placeholder no app e no backbone. As migrations PRP-001/002/003 criaram as tabelas cp_funcionarios, cp_empresas, cp_centros_custo, cp_cargos, cp_escalas, cp_horarios, cp_modelos_rep e cp_audit_log.

Padrões de frontend definidos em:
- DES011 — Forms com React Hook Form + Zod
- DES012 — DataTable com TanStack Table (paginação server-side, filtros, ordenação, export CSV)
- DES013 — Filtro hierárquico reutilizável
- ui-guide.md — Tokens semânticos, estados (loading/empty/error), acessibilidade

Padrões de backend definidos em:
- DES020 — API Routes REST em `/api/ponto/funcionarios`
- DES005 — Auditoria via cp_audit_log
- DES032 — Soft delete com `situacao`

## Especificação

### API Routes (`/api/ponto/funcionarios`)

1. **GET /api/ponto/funcionarios** — Listagem paginada (REQ001)
   - Query params: page, pageSize, search, situacao, cargo_id, setor (centro_custo_id), empresa_id, orderBy, orderDir
   - Filtro por empresa do usuário logado (NFR011)
   - Default: situacao='ativo', ordenação alfabética por nome
   - Response: `{ data: [], pagination: { page, pageSize, total, totalPages } }`

2. **GET /api/ponto/funcionarios/:id** — Detalhe do funcionário

3. **POST /api/ponto/funcionarios** — Criação (REQ002)
   - Validação Zod compartilhada com frontend
   - CPF: validação por dígitos verificadores + unicidade
   - Matrícula: unicidade
   - Data admissão: não futura
   - Nome: mínimo 3 chars
   - Registro de auditoria no momento do cadastro (REQ009)

4. **PUT /api/ponto/funcionarios/:id** — Edição (REQ005)
   - Justificativa obrigatória ao alterar campos críticos (CPF, Matrícula, Situação, Data Admissão)
   - Histórico campo-a-campo em cp_audit_log
   - Impedimento de alterar CPF para valor já existente
   - Funcionário inativo: exigir justificativa para editar

5. **PATCH /api/ponto/funcionarios/:id/situacao** — Ativação/Inativação (REQ006, REQ008)
   - Justificativa obrigatória para inativar
   - Histórico de mudança de situação
   - Funcionário com registros de ponto: apenas inativar (não excluir)

6. **GET /api/ponto/funcionarios/:id/auditoria** — Histórico de auditoria (REQ009)
   - Filtros: campo, período
   - Paginação

7. **GET /api/ponto/funcionarios/export/csv** — Exportação CSV (REQ001)
   - Mesmos filtros da listagem

### Schemas Zod (compartilhados em `lib/validators/`)

- `funcionarioCreateSchema` — Validação completa para criação
- `funcionarioUpdateSchema` — Validação para edição (parcial + justificativa condicional)
- `funcionarioFilterSchema` — Validação de filtros da listagem
- Validador de CPF (dígitos verificadores) como utility
- Validador de PIS (11 dígitos)

### UI — Listagem (`/ponto/funcionarios/page.tsx`)

Conforme REQ001 e padrão DES012:
- DataTable com colunas: Nome, Matrícula, CPF, Situação, Cargo, Setor, Unidade
- Ordenação por coluna (default: nome A-Z)
- Filtros: busca textual (nome/matrícula/CPF), dropdowns (Situação, Cargo, Setor/CC, Unidade), toggle inativos
- Indicador visual quando filtros ativos
- Botão "Novo Funcionário"
- Botão "Exportar CSV" no header
- Paginação server-side com indicador página/total
- Skeleton loading, empty state, error state

### UI — Formulário de Criação/Edição

Conforme REQ002-REQ005 e padrão DES011:
- Formulário em abas: Dados Pessoais | Dados Funcionais | Associações
- **Dados Pessoais**: Nome, Sexo, Data Nascimento, CPF, PIS, RG (número/órgão/UF/data), Título Eleitoral, Telefone, Email, Endereço completo, Nomes Pai/Mãe
- **Dados Funcionais**: Matrícula, Cargo, Centro de Custo, Unidade, Tipo Vínculo, Data Admissão, Data Desligamento, Salário Base, % Adiantamento
- **Associações**: Escala (combobox), Horário (combobox), Unidade Física, Modelo REP (combobox) — REQ007
- Campos obrigatórios sinalizados visualmente
- Validação inline com mensagens em português
- Diálogo de justificativa ao alterar campos críticos (REQ005)
- Alerta de impacto ao alterar Escala ou Horário (REQ005, REQ007)

### UI — Inativação

- Diálogo de confirmação com campo de justificativa obrigatório (REQ006)
- Alert destrutivo

### UI — Histórico de Auditoria

- Tab ou drawer no detalhe do funcionário
- Lista cronológica: campo, valor antigo → novo, usuário, data/hora, justificativa
- Filtros por campo e período

## Limites

- Não implementar importação em massa de funcionários
- Não implementar a tela de digitação do cartão de ponto (PRP-008)
- Não alterar tabelas do banco — usar as que já existem
- Não criar endpoints de CRUD para cargos, centros de custo ou empresas — apenas consumir como opções nos dropdowns/comboboxes
- Não implementar upload de foto do funcionário
- Validação de CPF é algorítmica (dígitos verificadores), não consulta a Receita Federal
