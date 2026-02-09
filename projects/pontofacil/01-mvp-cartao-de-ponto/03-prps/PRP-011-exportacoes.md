# PRP-011 — Exportações: AEJ e Madis

## Objetivo

Implementar as exportações de Arquivo Eletrônico de Jornada (AEJ) e Madis (admissão/demissão) conforme layouts definidos na legislação e integração com sistemas terceiros.

## Execution Mode

`implementar`

## Contexto

PRP-010 implementou o fechamento mensal e a exportação de horas (TXT pipe-separated). PRP-003 criou a tabela cp_exportacoes para registro das exportações. O pipeline de exportação (DES023) gera arquivos em memória e disponibiliza via download.

Decisões de design:
- DES041 — Layout AEJ conforme legislação trabalhista
- DES042 — Layout Madis posicional para admissão/demissão
- DES023 — Validação de pré-condições, geração em memória, download via API route

## Especificação

### 1. Exportação AEJ (`/ponto/exportacao/aej`) — REQ210-REQ212, US008

**API Routes** (`/api/ponto/exportacao/aej`):

1. **POST /api/ponto/exportacao/aej/validar** — Validar pré-condições (REQ211)
   - Params: empresa_id, periodo_inicio, periodo_fim
   - Verificações: empresa com REP cadastrado, batidas completas
   - Retorna: lista de inconsistências (batidas incompletas, saídas não registradas)

2. **POST /api/ponto/exportacao/aej/gerar** — Gerar arquivo AEJ (REQ210, REQ212)
   - Params: empresa_id, periodo_inicio, periodo_fim
   - Layout conforme legislação (DES041):
     - Header com dados do empregador
     - Detalhes de batidas por funcionário/dia
     - Horários contratuais, ausências legais
     - Footer com totalizadores
   - Datas/horas em ISO 8601 com timezone America/Sao_Paulo
   - Apenas funcionários com cartão de ponto no período (REQ212)
   - Nome automático: `Exp_AEJ_Emp_XX.txt` (REQ211)
   - Registro em cp_exportacoes
   - Response: download do arquivo (Content-Disposition)

**UI**:
- Filtro: Rede → Empresa (REQ210)
- Seletor de período: data inicial/final (REQ210)
- Botão "Validar" → mostra inconsistências se houver
- Botão "Gerar AEJ" → download do arquivo
- Log de inconsistências impedindo exportação até regularização (REQ211)

### 2. Exportação Madis (`/ponto/exportacao/madis`) — REQ220-REQ222, US009

**API Routes** (`/api/ponto/exportacao/madis`):

1. **POST /api/ponto/exportacao/madis/gerar** — Gerar arquivo Madis
   - Params: empresa_id, tipo (admissao/demissao), periodo_inicio?, periodo_fim?, funcionario_ids?
   - **Admissão** (REQ221, DES042):
     - Funcionários categorias 1, 7 e 901; excluindo demitidos
     - Layout posicional: empresa+matrícula(15) + nome(40) + data_admissão(8) + horas(5) + código_horário(4) + PIS(11) + código_cargo(8) + email(72) = 163 chars
   - **Demissão** (REQ222, DES042):
     - Funcionários demitidos no período
     - Layout posicional: matrícula(17) + código_902(3) + data_demissão(8) + PIS(11) = 39 chars
   - Nome automático: `ExpMadis_[Adm|Dem]_Emp_XX.txt` (REQ220)
   - Registro em cp_exportacoes
   - Response: download do arquivo

**UI**:
- Filtro: Rede → Empresa → Funcionário(s) (REQ220)
- Radio: Admissão / Demissão (REQ220)
- Período opcional com checkboxes de habilitação (REQ220)
- Botão "Gerar" → download do arquivo

### Página agrupadora (`/ponto/exportacao`)

Página com cards/links para as 3 exportações:
- Exportação de Horas (link para `/ponto/apuracao` aba Fechamento)
- Exportação AEJ
- Exportação Madis

## Limites

- Não implementar novos formatos de exportação além de AEJ e Madis
- Não implementar importação Madis (é apenas exportação)
- O layout AEJ oficial deve ser implementado conforme legislação vigente, mas como a legislação pode mudar, implementar o layout como módulo parametrizável (template de linha) para facilitar ajustes futuros
- Não implementar envio automático dos arquivos por email ou integração direta com sistemas terceiros
- A exportação de horas (TXT pipe-separated) já foi implementada no PRP-010
