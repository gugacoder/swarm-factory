# User Stories

Histórias de usuário do módulo Cartão de Ponto, derivadas do brainstorming.

Formato: Gherkin (Dado/Quando/Então) com IDs referenciáveis.

---

## Gestor de RH (US001–US019)

### US001: HR Manager Register Employee

**Como** gestor de RH,
**gostaria de** cadastrar funcionários com dados pessoais e funcionais completos,
**de forma a** manter o registro atualizado para o controle de ponto.

**Critérios de Aceitação:**
- **Dado** que estou na tela de cadastro de funcionários
- **Quando** preencho os campos obrigatórios (Nome, CPF, Matrícula, Data de Admissão) e confirmo
- **Então** o funcionário é cadastrado com ID único gerado automaticamente
- **E** um registro de auditoria é criado com todos os dados inseridos
- **E** CPF é validado por dígitos verificadores e duplicidade é impedida

**Refs:** REQ001, REQ002, REQ003, REQ004, REQ009

---

### US002: HR Manager Configure Schedule

**Como** gestor de RH,
**gostaria de** cadastrar horários de trabalho com entrada, saída, intervalos e tolerâncias,
**de forma a** definir a jornada padrão dos funcionários.

**Critérios de Aceitação:**
- **Dado** que estou na tela de cadastro de horários
- **Quando** informo Hora de Entrada, Hora de Saída, intervalos e tipo (Fixo/Variável/Noturno/Parcial)
- **Então** o sistema calcula automaticamente a duração prevista da jornada
- **E** valida que a hora de saída é maior que a entrada e intervalos são coerentes
- **E** permite definir tolerâncias específicas (atraso, antecipação, margem)

**Refs:** REQ030, REQ031, REQ032, REQ033

---

### US003: HR Manager Configure Scale

**Como** gestor de RH,
**gostaria de** criar escalas de trabalho (Fixa, Turnos, 12x36, Personalizada),
**de forma a** organizar a jornada dos funcionários conforme necessidade da empresa.

**Critérios de Aceitação:**
- **Dado** que estou na tela de cadastro de escalas
- **Quando** seleciono o tipo de escala e configuro dias, horários e ciclos
- **Então** a interface se adapta mostrando campos relevantes ao tipo selecionado
- **E** o sistema valida coerência (sem sobreposição de horários, dias de descanso definidos)
- **E** exibe pré-visualização da configuração antes de salvar

**Refs:** REQ050, REQ051, REQ052, REQ053

---

### US004: HR Manager Configure Parameters

**Como** gestor de RH,
**gostaria de** parametrizar tolerâncias, intervalos, hora extra e banco de horas,
**de forma a** adequar o cálculo de ponto às políticas da empresa.

**Critérios de Aceitação:**
- **Dado** que estou na tela de Parâmetros do Cartão de Ponto
- **Quando** configuro tolerâncias de atraso, saída antecipada, intervalos e percentuais de hora extra
- **Então** as regras são salvas e aplicadas em todos os cálculos subsequentes
- **E** o sistema alerta quando banco de horas está ativo sem limites configurados
- **E** carrega parâmetros anteriores ao abrir a tela

**Refs:** REQ090, REQ091, REQ092, REQ093, REQ094

---

### US005: HR Manager Configure Events

**Como** gestor de RH,
**gostaria de** parametrizar eventos por empresa (HE Dia Normal, HE Domingos, Hora Faltosa, BH, Adic. Noturno),
**de forma a** mapear os eventos de ponto para os códigos do sistema de folha de pagamento.

**Critérios de Aceitação:**
- **Dado** que estou na tela de Parâmetro de Evento de Empresa
- **Quando** seleciono os eventos e vinculo a uma empresa (ou a todas)
- **Então** a parametrização é salva sem duplicidade por empresa
- **E** o sistema valida que todos os eventos obrigatórios estão preenchidos
- **E** os eventos ficam disponíveis para exportação de folha

**Refs:** REQ110, REQ111, REQ112, REQ113, REQ114

---

### US006: HR Manager Run Monthly Closing

**Como** gestor de RH,
**gostaria de** executar o fechamento mensal do ponto,
**de forma a** consolidar horas trabalhadas e gerar dados para a folha de pagamento.

**Critérios de Aceitação:**
- **Dado** que a apuração de horas foi executada e não há inconsistências pendentes
- **Quando** aciono o fechamento mensal na aba Fechamento
- **Então** o sistema executa em transação: insere registros BH, quita saldos, zera horas quitadas
- **E** o fechamento é irreversível e executável apenas uma vez por período
- **E** oferece opção de imprimir apuração e exportar arquivo de horas

**Refs:** REQ184, REQ185, REQ186

---

### US007: HR Manager Generate Reports

**Como** gestor de RH,
**gostaria de** gerar relatórios variados (cartão calculado, banco de horas, inconsistências, espelho, etc.),
**de forma a** analisar e auditar os dados de ponto dos funcionários.

**Critérios de Aceitação:**
- **Dado** que estou na tela do relatório desejado
- **Quando** configuro filtros (Rede, Empresa, Centro de Custo, Funcionário, Período) e confirmo
- **Então** o relatório é gerado com barra de progresso durante processamento
- **E** permite escolher modo (Detalhado/Totalizador/Sintético conforme tipo)
- **E** o resultado pode ser impresso ou exportado

**Refs:** REQ230, REQ231, REQ232, REQ233, REQ234, REQ235, REQ236, REQ237, REQ238, REQ239, REQ240

---

### US008: HR Manager Export AEJ

**Como** gestor de RH,
**gostaria de** exportar o Arquivo Eletrônico de Jornada (AEJ) conforme legislação,
**de forma a** atender obrigações legais trabalhistas.

**Critérios de Aceitação:**
- **Dado** que a empresa tem REP cadastrado e batidas completas no período
- **Quando** seleciono empresa, período e caminho de destino e confirmo
- **Então** o sistema gera arquivo TXT no layout oficial da legislação
- **E** valida batidas incompletas antes, gerando log de inconsistências se necessário
- **E** nomeia automaticamente o arquivo como Exp_AEJ_Emp_XX.txt

**Refs:** REQ210, REQ211, REQ212

---

### US009: HR Manager Export Madis

**Como** gestor de RH,
**gostaria de** exportar dados de admissão/demissão no formato Madis,
**de forma a** integrar com sistemas de controle de acesso.

**Critérios de Aceitação:**
- **Dado** que estou na tela de exportação Madis
- **Quando** seleciono empresa, tipo (Admissão/Demissão) e confirmo
- **Então** o sistema gera arquivo TXT no formato Madis com dados dos funcionários
- **E** nomeia automaticamente como ExpMadis_[Adm|Dem]_Emp_XX.txt

**Refs:** REQ220, REQ221, REQ222

---

### US010: HR Manager View Audit Trail

**Como** gestor de RH,
**gostaria de** consultar a trilha de auditoria das operações realizadas,
**de forma a** rastrear quem fez o quê e quando no módulo de ponto.

**Critérios de Aceitação:**
- **Dado** que acesso a consulta de auditoria
- **Quando** filtro por entidade, período, usuário ou campo
- **Então** vejo o histórico completo com campo, valor antigo, valor novo, usuário, data/hora
- **E** o histórico é permanente e imutável

**Refs:** REQ009, REQ290, REQ291

---

### US011: HR Manager Manage Movement Types

**Como** gestor de RH,
**gostaria de** cadastrar e configurar tipos de movimentação (hora extra, falta, abono, etc.),
**de forma a** definir como cada evento impacta o cálculo de ponto.

**Critérios de Aceitação:**
- **Dado** que estou na tela de Tipos de Movimentação
- **Quando** crio um tipo com código, descrição, natureza, ação, totalizador e fórmula
- **Então** o tipo é salvo com código único e fórmula validada sintaticamente
- **E** posso definir compatibilidade com escalas e regras de exportação

**Refs:** REQ070, REQ071, REQ072, REQ073

---

### US012: HR Manager Register REP Model

**Como** gestor de RH,
**gostaria de** cadastrar modelos de Registro Eletrônico de Ponto (REP),
**de forma a** manter o controle dos equipamentos utilizados para registro de ponto.

**Critérios de Aceitação:**
- **Dado** que estou na tela de cadastro de REP
- **Quando** informo número, tipo, identificador AEJ, validade e empresa
- **Então** o modelo é cadastrado sem duplicidade (mesmo número + empresa)
- **E** posso registrar informações técnicas, fabricante e layouts suportados

**Refs:** REQ140, REQ141, REQ142, REQ143, REQ144, REQ145

---

### US013: HR Manager Set Initial Balance

**Como** gestor de RH,
**gostaria de** registrar o saldo inicial do banco de horas dos funcionários,
**de forma a** migrar saldos do sistema legado ou ajustar saldos iniciais.

**Critérios de Aceitação:**
- **Dado** que estou na tela de Saldo Inicial do Banco de Horas
- **Quando** seleciono colaborador, período e informo saldo credor
- **Então** o saldo é salvo sem duplicidade para mesmo colaborador/período
- **E** posso optar por recalcular automaticamente o saldo consolidado

**Refs:** REQ130, REQ131, REQ132

---

### US014: HR Manager Calculate Hours

**Como** gestor de RH,
**gostaria de** executar a apuração de horas extras e totalizadores do mês,
**de forma a** preparar os dados para o fechamento mensal.

**Critérios de Aceitação:**
- **Dado** que a digitação do cartão de ponto está completa
- **Quando** seleciono empresa, período e aciono "Apurar Horas"
- **Então** o sistema calcula: horas normais, HE, faltosas, BH, adicional noturno
- **E** exibe resultados em grade com opção de filtrar funcionários com horas
- **E** lista inconsistências (funcionários sem lançamentos ou incompletos)

**Refs:** REQ180, REQ181, REQ182, REQ186, REQ187

---

## Operador de Ponto (US020–US039)

### US020: Operator Import Punches

**Como** operador de ponto,
**gostaria de** importar arquivo de batidas do REP para o sistema,
**de forma a** transferir os registros eletrônicos para processamento.

**Critérios de Aceitação:**
- **Dado** que tenho um arquivo de batidas no formato suportado (TopData/Kurumim)
- **Quando** seleciono empresa, período, caminho do arquivo e confirmo
- **Então** o sistema processa as batidas, relaciona com funcionários via PIS
- **E** calcula automaticamente horas trabalhadas, extras, faltas e adicional noturno
- **E** gera log de inconsistências para dias com batidas inválidas

**Refs:** REQ200, REQ201, REQ202, REQ203

---

### US021: Operator Enter Time Card

**Como** operador de ponto,
**gostaria de** digitar manualmente o cartão de ponto de um funcionário,
**de forma a** registrar horários quando não há importação automática.

**Critérios de Aceitação:**
- **Dado** que estou na tela de Digitação do Cartão de Ponto
- **Quando** seleciono funcionário, mês/ano e digito os horários dia a dia
- **Então** o sistema carrega o horário padrão do funcionário para cada dia
- **E** permite até 4 períodos (8 batidas) com máscara HH:mm
- **E** calcula totalizadores automaticamente ao confirmar cada dia

**Refs:** REQ160, REQ161, REQ162, REQ164

---

### US022: Operator Batch Entry

**Como** operador de ponto,
**gostaria de** repetir o lançamento de um dia para vários dias subsequentes,
**de forma a** pontofacilr a digitação quando o horário é uniforme.

**Critérios de Aceitação:**
- **Dado** que digitei os horários de um dia no cartão de ponto
- **Quando** marco "Util. lcto até" e seleciono um dia final
- **Então** o sistema repete automaticamente os mesmos horários e motivo até o dia final
- **E** respeita o limite do mesmo mês

**Refs:** REQ163

---

### US023: Operator View Original Punches

**Como** operador de ponto,
**gostaria de** ver as batidas originais do ponto eletrônico ao editar o cartão,
**de forma a** ter referência para digitação ou ajuste.

**Critérios de Aceitação:**
- **Dado** que estou editando o cartão de ponto de um funcionário
- **Quando** seleciono um dia que possui batidas importadas
- **Então** vejo no painel as batidas originais no formato "08:00-12:00-13:00-18:00"
- **E** posso comparar com os horários digitados

**Refs:** REQ168

---

### US024: Operator Shift Punches

**Como** operador de ponto,
**gostaria de** deslocar a sequência de horários digitados para corrigir posicionamento,
**de forma a** ajustar batidas inseridas em posição equivocada sem redigitar tudo.

**Critérios de Aceitação:**
- **Dado** que estou editando horários de um dia no cartão
- **Quando** posiciono o foco em um campo de horário e aciono deslocar (esquerda/direita)
- **Então** a sequência de horários é ajustada na direção selecionada

**Refs:** REQ166

---

### US025: Operator Print Time Card

**Como** operador de ponto,
**gostaria de** imprimir o espelho do cartão de ponto do funcionário,
**de forma a** gerar documento físico para assinatura do funcionário.

**Critérios de Aceitação:**
- **Dado** que confirmei e salvei os lançamentos do mês
- **Quando** aciono "Imprimir"
- **Então** o sistema gera o espelho com todos os lançamentos e totalizadores do mês

**Refs:** REQ167

---

### US026: Operator Add Occurrence

**Como** operador de ponto,
**gostaria de** registrar justificativa/ocorrência em alterações do ponto,
**de forma a** documentar o motivo de cada ajuste realizado.

**Critérios de Aceitação:**
- **Dado** que alterei o cartão de ponto de um funcionário
- **Quando** aciono "Alterar Ocorrência"
- **Então** posso registrar uma justificativa textual para a alteração
- **E** a ocorrência fica vinculada ao registro para auditoria

**Refs:** REQ166, REQ290

---

## Funcionário (US040–US059)

### US040: Employee View Time Card

**Como** funcionário,
**gostaria de** visualizar meu cartão de ponto mensal,
**de forma a** acompanhar minhas horas trabalhadas e saldo de banco de horas.

**Critérios de Aceitação:**
- **Dado** que estou autenticado no sistema
- **Quando** acesso a visualização do meu cartão de ponto
- **Então** vejo os lançamentos do mês com horários, totalizadores e saldo BH
- **E** os dados são somente leitura (sem permissão de edição)

**Refs:** REQ160, REQ164, REQ165

---

### US041: Employee Request Adjustment

**Como** funcionário,
**gostaria de** solicitar ajuste no meu cartão de ponto,
**de forma a** corrigir batidas incorretas ou registrar justificativas.

**Critérios de Aceitação:**
- **Dado** que identifico uma inconsistência no meu cartão
- **Quando** crio uma solicitação de ajuste informando dia, motivo e horários corretos
- **Então** a solicitação é registrada como pendente de aprovação
- **E** o gestor/operador é notificado da pendência

**Refs:** REQ166, REQ290

---

### US042: Employee View Hours Bank

**Como** funcionário,
**gostaria de** consultar meu saldo de banco de horas,
**de forma a** saber quantas horas tenho acumuladas para compensação.

**Critérios de Aceitação:**
- **Dado** que acesso a aba de Banco de Horas
- **Quando** visualizo o histórico
- **Então** vejo o saldo mês a mês, meses compensados e saldo atualizado

**Refs:** REQ165

---

## Administrador / TI (US060–US079)

### US060: Admin Manage Users Access

**Como** administrador,
**gostaria de** configurar permissões de acesso por perfil e empresa,
**de forma a** controlar quem pode acessar cada funcionalidade do módulo de ponto.

**Critérios de Aceitação:**
- **Dado** que estou na tela de gerenciamento de usuários
- **Quando** associo um perfil (admin/gestor/atendente) e empresas ao usuário
- **Então** o acesso é restrito conforme permissões configuradas
- **E** cada módulo tem controle separado para inclusão, alteração, exclusão e visualização

**Refs:** NFR010, NFR011

---

### US061: Admin Configure Multi-Tenant

**Como** administrador,
**gostaria de** configurar múltiplas empresas (redes) no sistema,
**de forma a** atender organizações com várias unidades.

**Critérios de Aceitação:**
- **Dado** que preciso configurar uma nova rede/empresa
- **Quando** crio a estrutura hierárquica (Rede → Empresa → Centro de Custo)
- **Então** os dados ficam isolados por empresa
- **E** filtros hierárquicos funcionam em todas as telas do módulo

**Refs:** NFR031

---

### US062: Admin Monitor System Logs

**Como** administrador,
**gostaria de** monitorar logs de operações do sistema,
**de forma a** identificar e resolver problemas operacionais.

**Critérios de Aceitação:**
- **Dado** que acesso a tela de logs
- **Quando** filtro por tipo de operação, período ou resultado
- **Então** vejo importações, exportações, fechamentos com timestamp, usuário e resultado
- **E** logs de inconsistências estão disponíveis para análise

**Refs:** REQ291

---

## Índice de Referência

| Código | Phrasal Key | Persona |
|--------|-------------|---------|
| US001 | HR Manager Register Employee | Gestor RH |
| US002 | HR Manager Configure Schedule | Gestor RH |
| US003 | HR Manager Configure Scale | Gestor RH |
| US004 | HR Manager Configure Parameters | Gestor RH |
| US005 | HR Manager Configure Events | Gestor RH |
| US006 | HR Manager Run Monthly Closing | Gestor RH |
| US007 | HR Manager Generate Reports | Gestor RH |
| US008 | HR Manager Export AEJ | Gestor RH |
| US009 | HR Manager Export Madis | Gestor RH |
| US010 | HR Manager View Audit Trail | Gestor RH |
| US011 | HR Manager Manage Movement Types | Gestor RH |
| US012 | HR Manager Register REP Model | Gestor RH |
| US013 | HR Manager Set Initial Balance | Gestor RH |
| US014 | HR Manager Calculate Hours | Gestor RH |
| US020 | Operator Import Punches | Operador Ponto |
| US021 | Operator Enter Time Card | Operador Ponto |
| US022 | Operator Batch Entry | Operador Ponto |
| US023 | Operator View Original Punches | Operador Ponto |
| US024 | Operator Shift Punches | Operador Ponto |
| US025 | Operator Print Time Card | Operador Ponto |
| US026 | Operator Add Occurrence | Operador Ponto |
| US040 | Employee View Time Card | Funcionário |
| US041 | Employee Request Adjustment | Funcionário |
| US042 | Employee View Hours Bank | Funcionário |
| US060 | Admin Manage Users Access | Administrador |
| US061 | Admin Configure Multi-Tenant | Administrador |
| US062 | Admin Monitor System Logs | Administrador |
