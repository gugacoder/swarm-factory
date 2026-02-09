# PRP-013 — Auditoria, Logs, Onboarding e Polish Final

## Objetivo

Implementar as telas de consulta de auditoria e logs de operação, o sistema de onboarding progressivo (checklist + dicas contextuais), e revisão final de acessibilidade, estados de loading/empty/error e responsividade em todas as telas.

## Execution Mode

`implementar`

## Contexto

Todos os PRPs anteriores (001-012) implementaram as funcionalidades do módulo. As tabelas cp_audit_log e cp_operation_log existem desde PRP-003. Auditoria campo-a-campo já é registrada nos endpoints de CRUD (PRP-005 em diante). O onboarding é especificado em `onboarding.md`. Os padrões de UI estão em `ui-guide.md`.

Decisões de design:
- DES005 — Auditoria centralizada (audit_log + operation_log)
- onboarding.md — Onboarding progressivo com checklist + dicas contextuais
- NFR020-NFR024 — Usabilidade e acessibilidade

## Especificação

### 1. Consulta de Auditoria (`/ponto/auditoria`) — REQ290, US010

**API Route** (`/api/ponto/auditoria`):
- GET com filtros: entidade, entidade_id, campo, usuario_id, periodo (data inicio/fim)
- Paginação server-side
- Ordenação por created_at DESC (padrão)

**UI**:
- Filtros: entidade (dropdown das tabelas cp_*), campo (text), usuário (combobox), período (date range)
- DataTable: Data/Hora, Entidade, Campo, Valor Anterior, Valor Novo, Usuário, IP, Justificativa
- Histórico permanente, imutável, apenas consulta (REQ290)
- Detalhamento ao clicar na linha (drawer com dados completos)

### 2. Logs de Operação (`/ponto/auditoria/logs`) — REQ291, US062

**API Route** (`/api/ponto/operacoes`):
- GET com filtros: tipo_operacao, empresa_id, resultado, periodo
- Paginação

**UI**:
- Filtros: tipo (importação/exportação/fechamento/apuração), empresa, resultado (sucesso/erro/parcial), período
- DataTable: Data/Hora, Tipo, Descrição, Empresa, Usuário, Resultado
- Detalhes JSONB expandíveis ao clicar (drawer)

### 3. Onboarding Progressivo — onboarding.md

#### 3.1 Checklist de Configuração Inicial

- Exibido no dashboard (`/ponto/page.tsx`) na primeira visita do gestor de RH
- 7 passos conforme onboarding.md §Checklist:
  1. Cadastrar empresa e centro de custo
  2. Cadastrar horários de trabalho
  3. Criar escalas
  4. Configurar parâmetros do cartão
  5. Parametrizar eventos por empresa
  6. Cadastrar funcionários
  7. Importar batidas ou digitar cartão
- Cada passo: link direto para tela, indicador concluído/pendente
- Conclusão automática quando ação executada (verificar via dados no banco)
- Botão "Não mostrar novamente"
- Armazenado em `localStorage` key `cp_onboarding_{userId}`

#### 3.2 Componente de Dicas Contextuais

Componente `<OnboardingHint>` conforme onboarding.md §Implementação Técnica:
- Wrapper em torno de shadcn Popover/Tooltip
- Props: `hintKey`, `title`, `description`, `side`
- Verifica localStorage antes de renderizar
- Botão "Entendi" para dismissar
- Botão "Não mostrar mais" para permanente

#### 3.3 Dicas por Tela

Aplicar todas as dicas listadas em onboarding.md §Dicas Contextuais:
- Cadastro de Funcionários (3 dicas)
- Cadastro de Horários (3 dicas)
- Cadastro de Escalas (2 dicas)
- Parametrização do Cartão (2 dicas)
- Digitação do Cartão de Ponto (5 dicas)
- Apuração / Fechamento (3 dicas)
- Relatórios (2 dicas)
- Exportações (2 dicas)

#### 3.4 Help Button

- Ícone `HelpCircle` (Lucide) no header de cada página
- Ao clicar: reativa dicas da tela atual
- Estilo consistente com ui-guide.md

### 4. Polish Final — NFR020-NFR024

Revisão em todas as telas implementadas nos PRPs anteriores:

#### 4.1 Acessibilidade (NFR024)
- [ ] Todos os inputs têm labels associados
- [ ] Imagens têm alt text
- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Focus visible em elementos interativos
- [ ] Navegação por teclado funciona (Tab, Enter)
- [ ] aria-labels em ícones sem texto

#### 4.2 Estados (NFR022)
Verificar que todas as telas possuem:
- [ ] Skeleton loading durante carregamento
- [ ] Empty state com ícone, título, descrição e CTA
- [ ] Error state com Alert destrutivo e botão retry

#### 4.3 Responsividade (NFR021)
Verificar breakpoints em todas as telas:
- [ ] Mobile (<640px): layout coluna única, sidebar colapsada
- [ ] Tablet (≥768px): layout adaptado
- [ ] Desktop (≥1024px): layout completo

#### 4.4 Navegação por teclado (NFR020)
- [ ] Tab/Shift+Tab navega entre campos
- [ ] Enter confirma formulários
- [ ] Esc fecha modais/drawers
- [ ] Atalhos documentados (se houver)

#### 4.5 Validação de formulários (NFR023)
- [ ] Mensagens claras em português
- [ ] Indicação precisa do campo com erro
- [ ] Validação inline (não apenas no submit)

## Limites

- Não implementar controle de acesso por perfis (admin/gestor/atendente) — NFR010 é segundo momento
- Não implementar PWA offline completo (NFR030) — apenas manifest e service worker básico
- Não alterar lógica de negócio dos PRPs anteriores — apenas adicionar onboarding e polir UI
- Onboarding usa localStorage (não banco) — dados não críticos, se perder mostra de novo
- Não criar tela de gerenciamento de usuários (US060) — usar o sistema de auth existente
- Não implementar dark mode — apenas o tema padrão
