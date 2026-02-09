# Sistema de Onboarding

Especificação do sistema de onboarding para ensinar usuários a usar o módulo Cartão de Ponto.

O onboarding é contextual: cada tela apresenta dicas na primeira visita do usuário, com opção de revisitar a qualquer momento.

---

## Estratégia

### Abordagem: Onboarding Progressivo

- Nenhum tutorial obrigatório no primeiro acesso
- Dicas contextuais (tooltips/popovers) exibidas na primeira visita a cada tela
- Checklist de configuração inicial no dashboard (dismissível)
- Help button (?) em cada tela para revisar dicas

### Justificativa

- Operadores migram do Director GE (VB6) — já conhecem o domínio
- Foco em mostrar "onde está" no novo sistema, não "o que é"
- Minimizar interrupção; maximizar descoberta gradual

---

## Checklist de Configuração Inicial

Exibido no dashboard na primeira vez que o gestor de RH acessa o módulo. Persiste até ser completado ou dismissado.

### Passos

1. **Cadastrar empresa e centro de custo** — Configurar hierarquia organizacional
2. **Cadastrar horários de trabalho** — Definir jornadas e intervalos
3. **Criar escalas** — Organizar dias de trabalho e descanso
4. **Configurar parâmetros do cartão** — Tolerâncias, hora extra, banco de horas
5. **Parametrizar eventos por empresa** — Mapear eventos para folha de pagamento
6. **Cadastrar funcionários** — Associar escala, horário e REP
7. **Importar batidas ou digitar cartão** — Primeiro registro de ponto

### Comportamento

- Cada passo tem link direto para a tela correspondente
- Indicador visual de concluído/pendente
- Passo marcado como concluído automaticamente quando ação é executada
- Botão "Não mostrar novamente" para dismissar permanentemente
- Armazenado em `localStorage` por usuário

**Refs:** US001, US002, US003, US004, US005

---

## Dicas Contextuais por Tela

### Cadastro de Funcionários

| Elemento | Dica | Trigger |
|----------|------|---------|
| Filtro de situação | "Funcionários inativos ficam ocultos por padrão. Use este toggle para exibi-los." | Primeira visita |
| Botão Novo | "Campos obrigatórios: Nome, CPF, Matrícula e Data de Admissão." | Primeira visita |
| Coluna Escala | "Associe uma escala ao funcionário para que o cálculo de ponto funcione corretamente." | Primeira visita |

**Refs:** REQ001, REQ002, REQ007

---

### Cadastro de Horários

| Elemento | Dica | Trigger |
|----------|------|---------|
| Tipo de horário | "Escolha o tipo antes de preencher. Campos adicionais aparecem para horários noturnos." | Primeira visita |
| Intervalo | "O sistema valida que o intervalo está dentro dos limites permitidos." | Primeira visita |
| Vigência | "Alterações criam nova versão. O histórico é preservado automaticamente." | Primeira visita |

**Refs:** REQ030, REQ031, REQ033

---

### Cadastro de Escalas

| Elemento | Dica | Trigger |
|----------|------|---------|
| Tipo de escala | "A interface se adapta ao tipo selecionado. Exemplo: 12x36 mostra jornada e descanso alternados." | Primeira visita |
| Pré-visualização | "Confira a visualização da escala antes de salvar." | Primeira visita |

**Refs:** REQ050, REQ053

---

### Parametrização do Cartão

| Elemento | Dica | Trigger |
|----------|------|---------|
| Banco de Horas | "Quando ativo, configure os limites diário, mensal e anual. Sem limites, o sistema alertará." | Ao ativar BH |
| Hora Extra | "Se autorização prévia estiver ativa, horas extras não autorizadas ficam pendentes." | Primeira visita |

**Refs:** REQ093, REQ094

---

### Digitação do Cartão de Ponto

| Elemento | Dica | Trigger |
|----------|------|---------|
| Filtro hierárquico | "Selecione Rede → Empresa → Funcionário para carregar o cartão." | Primeira visita |
| Campos de horário | "Use Tab para navegar entre campos. O horário padrão do funcionário é carregado automaticamente." | Primeira visita |
| Batidas originais | "O painel mostra as batidas importadas do REP como referência." | Primeira visita |
| Botão repetir | "Use 'Util. lcto até' para copiar os mesmos horários para vários dias seguidos." | Primeira visita |
| Aba Banco de Horas | "Consulte o saldo acumulado e meses compensados do banco de horas." | Primeira visita |

**Refs:** REQ160, REQ161, REQ163, REQ165, REQ168

---

### Apuração / Fechamento

| Elemento | Dica | Trigger |
|----------|------|---------|
| Botão Apurar | "A apuração calcula todos os totalizadores. Execute antes do fechamento." | Primeira visita |
| Aba Inconsistências | "Funcionários com lançamentos incompletos aparecem aqui. O fechamento é impedido até regularização." | Primeira visita |
| Botão Fechar | "O fechamento é irreversível. Certifique-se de que a apuração está correta." | Antes de fechar |

**Refs:** REQ180, REQ184, REQ186

---

### Relatórios

| Elemento | Dica | Trigger |
|----------|------|---------|
| Filtros | "Todos os relatórios usam filtros hierárquicos. Empresa é obrigatória." | Primeira visita |
| Modo Detalhado/Totalizador | "Detalhado mostra lançamentos individuais. Totalizador mostra totais consolidados." | Primeira visita |

**Refs:** REQ230

---

### Exportações (AEJ/Madis/Horas)

| Elemento | Dica | Trigger |
|----------|------|---------|
| AEJ | "A empresa precisa ter REP cadastrado para gerar o AEJ." | Primeira visita |
| Madis | "Escolha entre Admissão e Demissão. O arquivo é nomeado automaticamente." | Primeira visita |

**Refs:** REQ210, REQ220

---

## Implementação Técnica

### Armazenamento

- Estado de dicas vistas: `localStorage` key `cp_onboarding_{userId}`
- Formato: `{ "checklist_dismissed": false, "hints_seen": ["funcionarios", "horarios", ...] }`
- Sem persistência no banco (dados não críticos; se perder, mostra de novo)

### Componente

- `<OnboardingHint>` wrapper em torno de shadcn Popover/Tooltip
- Props: `hintKey`, `title`, `description`, `side`
- Verifica localStorage antes de renderizar
- Botão "Entendi" para dismissar + "Não mostrar mais" para permanente

### Integração

- Help button (?) no header de cada página para reativar dicas da tela
- Tooltip do shadcn/ui com ícone Lucide `HelpCircle`
- Estilo consistente com ui-guide.md (tokens semânticos)

**Refs:** DES010, DES016, NFR020, NFR024
