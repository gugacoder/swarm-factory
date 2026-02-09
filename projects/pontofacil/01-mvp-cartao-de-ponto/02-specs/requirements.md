# Requisitos do Sistema

Requisitos funcionais (REQ) e não funcionais (NFR) do módulo Cartão de Ponto, derivados do brainstorming e do manual de operação do sistema legado Director GE.

Formato OSD (O Sistema Deve) — statements atômicas e referenciáveis.

---

## Requisitos Funcionais

### 1. Cadastro de Funcionários (REQ001–REQ029)

#### REQ001: Employee Listing

O sistema deve exibir lista paginada de funcionários com colunas: Nome, Matrícula, CPF, Situação, Cargo, Setor e Unidade.
- Ordenação alfabética por nome como padrão
- Filtros por Nome, Matrícula, CPF, Situação, Cargo, Setor e Unidade
- Funcionários inativos ocultos por padrão, com toggle para exibi-los
- Indicador visual quando filtros estiverem ativos
- Exportação da listagem em CSV
- Navegação entre páginas com indicador de página atual/total

#### REQ002: Employee Creation

O sistema deve permitir inclusão de novo funcionário com validação completa.
- Campos obrigatórios mínimos: Nome, CPF, Matrícula, Data de Admissão
- CPF validado por dígitos verificadores; duplicidade impedida
- Matrícula única no sistema
- Data de Admissão não pode ser futura
- ID único gerado automaticamente
- Registro de auditoria completo no momento do cadastro

#### REQ003: Employee Personal Data

O sistema deve permitir cadastrar dados pessoais do funcionário.
- Nome Completo (mínimo 3 caracteres), Sexo, Data de Nascimento (idade mínima 14 anos)
- PIS (11 dígitos, validado), CPF (validado), RG (número, órgão, UF, data)
- Título Eleitoral, Telefone, E-mail (formato válido), Endereço completo
- Nomes do Pai e da Mãe

#### REQ004: Employee Functional Data

O sistema deve permitir cadastrar dados funcionais do funcionário.
- Matrícula única, Cargo, Setor, Unidade de Atuação
- Tipo de Vínculo (CLT, Estagiário, Temporário, Terceirizado)
- Data de Admissão, Data de Desligamento (quando aplicável, não anterior à admissão)
- Salário base, Percentual de adiantamento

#### REQ005: Employee Update

O sistema deve permitir edição de todos os campos do funcionário, exceto ID.
- Justificativa obrigatória ao alterar campos críticos (CPF, Matrícula, Situação, Data de Admissão)
- Histórico detalhado de todas as alterações
- Alerta de impacto ao alterar Escala ou Horário
- Impedimento de alteração de CPF para valor já existente
- Funcionário inativo não pode ser editado sem justificativa

#### REQ006: Employee Deactivation

O sistema deve realizar exclusão lógica de funcionários (nunca física).
- Justificativa obrigatória para inativação
- Funcionário com registros de ponto só pode ser inativado (não excluído)
- Registro de histórico de inativação
- Funcionários inativos não participam dos cálculos de ponto

#### REQ007: Employee Associations

O sistema deve permitir associar Escala, Horário vigente, Unidade Física e REP ao funcionário.
- Funcionário inativo não pode ser vinculado a REP
- Funcionário sem REP vinculado não pode registrar ponto
- Mudanças de Escala ou Horário geram alerta de impacto no cálculo
- Mudanças de escala refletem imediatamente no cálculo

#### REQ008: Employee Status Management

O sistema deve controlar situação do funcionário (Ativo/Inativo).
- Histórico completo de mudanças de situação
- Motivo obrigatório ao inativar
- Reativação exige justificativa
- Funcionários inativos excluídos dos cálculos de ponto

#### REQ009: Employee Audit Trail

O sistema deve registrar auditoria completa para todas as operações em funcionários.
- Campos: campo alterado, valor antigo, valor novo, usuário, data/hora
- Justificativa obrigatória em alterações críticas
- Histórico permanente e imutável
- Consultas avançadas de auditoria disponíveis

---

### 2. Cadastro de Horários (REQ030–REQ049)

#### REQ030: Schedule Data Entry

O sistema deve permitir cadastrar horários de trabalho com Hora de Entrada, Hora de Saída e intervalos.
- Campos com máscara de horário (HH:MM)
- Validação: hora de saída maior que hora de entrada
- Suporte a múltiplos intervalos ou intervalo único
- Cálculo automático da duração prevista da jornada
- Configuração de tolerâncias específicas (antes/depois, janelas, margens)
- Impedimento de gravação com intervalos inválidos

#### REQ031: Schedule Types

O sistema deve suportar tipos de horário: Fixos, Variáveis, Noturnos e Parciais.
- Interface dinâmica conforme tipo selecionado (campos adicionais para noturnos)
- Consistência entre dados do banco e opções exibidas
- Validação automática de limites e estrutura por categoria

#### REQ032: Schedule Validation Rules

O sistema deve validar regras de horários antes de salvar.
- Intervalo mínimo conforme política configurada
- Intervalo máximo, sem abusos
- Somatória de intervalos não excede duração total
- Compatibilidade do horário com a escala
- Impedimento de sobreposição de intervalos
- Campos obrigatórios completos

#### REQ033: Schedule Version History

O sistema deve manter histórico de vigência dos horários.
- Data de início e fim de vigência (fim pode ficar em aberto)
- Atualizações geram nova versão (não sobrescrevem)
- Sem sobreposição de vigências entre versões do mesmo horário
- Cálculo retroativo correto baseado no horário vigente na data do evento
- Histórico consultável: versão, faixa de vigência, dados configurados

---

### 3. Cadastro de Escalas (REQ050–REQ069)

#### REQ050: Scale Creation

O sistema deve permitir criação de escalas com Nome, Tipo, Vigência inicial, Situação e Observações.
- Nome único no sistema
- Tipos suportados: Fixa, Turnos/Revezamento, 12x36, Personalizada
- Interface dinâmica conforme tipo selecionado
- Documentação contextual descrevendo cada tipo

#### REQ051: Scale Day Configuration

O sistema deve permitir configurar dias de trabalho e descanso na escala.
- Seletor multisseleção para dias (segunda-domingo)
- Dias de descanso em ciclos fixos (5x1, 6x1), alternância (12x36) ou personalizado
- Para cada dia laboral: associação de blocos de horário (entrada, saída, intervalos, noturna)
- Virada de dia automática (horários que ultrapassam 00:00)
- Jornada noturna com regras adicionais

#### REQ052: Scale Tolerances

O sistema deve permitir definir tolerâncias específicas por escala.
- Tolerância de atraso e adiantamento
- Intervalo adicional
- Tolerância diferenciada para jornada noturna

#### REQ053: Scale Validation

O sistema deve validar consistência da escala antes de salvar.
- Escala sem dias de trabalho impedida
- Sobreposição de horários no mesmo dia impedida
- Coerência em escalas 12x36 (jornada de 12h, descanso subsequente)
- Tolerâncias não excedem período real do horário
- Remoção retroativa impedida se houver ponto registrado
- Pré-visualização da configuração antes de salvar

#### REQ054: Scale Version Control

O sistema deve controlar versões e vigência de escalas.
- Histórico completo: campo alterado, valor anterior/novo, usuário, data/hora, motivo
- Vigência por versão (vigencia_inicio, vigencia_fim)
- Alterações impactam cálculo imediatamente respeitando vigência
- Edição retroativa impedida se houver cálculos consolidados (requer justificativa e permissão especial)

#### REQ055: Scale Deactivation

O sistema deve permitir desativação lógica de escalas.
- Registro de data, usuário e motivo da desativação
- Escala vinculada a colaboradores com vigência ativa não pode ser desativada

#### REQ056: Scale Shifts Configuration

O sistema deve suportar configuração de turnos/revezamento.
- Número de equipes, duração de cada etapa
- Sequência do ciclo, horários por equipe e etapa

---

### 4. Tipos de Movimentação (REQ070–REQ089)

#### REQ070: Movement Type CRUD

O sistema deve permitir CRUD completo de Tipos de Movimentação.
- Código único, descrição resumida (até 50 chars), descrição completa (até 250 chars)
- Natureza, Ação e Totalizador via dropdowns
- Checkbox de Absenteísmo
- Organização em guias (abas)
- Busca em tempo real no grid

#### REQ071: Movement Type Calculation

O sistema deve associar fórmula de cálculo a cada tipo de movimentação.
- Fórmula armazenada como texto com validação de sintaxe básica
- Compatibilidade configurável com escalas
- Natureza e ação definem comportamento do cálculo
- Tipos com absenteísmo seguem regras específicas no motor de cálculo

#### REQ072: Movement Type Export Rules

O sistema deve permitir configurar regras de exportação por tipo de movimentação.
- Código de folha configurável no cadastro
- Exportação em CSV ou JSON
- API para listar tipos com filtros

#### REQ073: Movement Type Lifecycle

O sistema deve controlar ativação/inativação de tipos de movimentação.
- Flag ativo/inativo com soft-delete
- Histórico de alterações (autor, data, tipo)
- Confirmação obrigatória para ativação/inativação

---

### 5. Parametrização do Cartão de Ponto (REQ090–REQ109)

#### REQ090: Time Card Parameters Screen

O sistema deve disponibilizar tela de Parâmetros do Cartão de Ponto com seções: Tolerâncias, Intervalos, Hora Extra e Banco de Horas.
- Carregamento de parâmetros anteriores
- Campos de horário em formato HH:MM
- Botões: Salvar, Limpar, Sair

#### REQ091: Tolerance Configuration

O sistema deve permitir configurar tolerâncias do cartão de ponto.
- Atraso permitido em minutos (acima do limite = atraso calculado)
- Saída antecipada tolerada (exceder gera apontamento)
- Tempo extra tolerado antes de considerar hora extra
- Tolerâncias negativas não aceitas

#### REQ092: Interval Configuration

O sistema deve permitir configurar regras de intervalo.
- Intervalo mínimo obrigatório e máximo permitido
- Exceder máximo gera apontamento de ausência parcial
- Múltiplos intervalos diários habilitáveis (tempo mínimo, máximo, quantidade)
- Impedimento de configurações conflitantes

#### REQ093: Overtime Policy Configuration

O sistema deve permitir configurar políticas de hora extra.
- Opção de exigir autorização prévia (não autorizadas ficam pendentes)
- Aplicação automática respeitando tolerâncias, BH e limites
- Percentuais configuráveis: 50%, 100%, noturno, feriado
- Cada percentual com regras específicas (autorização, horário, limiares)
- Alerta quando hora extra automática ativa sem percentuais configurados

#### REQ094: Hours Bank Configuration

O sistema deve permitir ativar/desativar e configurar o banco de horas.
- Se desativado, excedentes não são creditados
- Limites diário, mensal e anual configuráveis
- Ao atingir limite, excedentes tratados como hora extra
- Regras automáticas de crédito e débito (atrasos, saídas antecipadas, intervalos excedidos)
- Histórico de todas as movimentações do banco
- Alerta quando BH ativo sem limites configurados

---

### 6. Parametrização de Eventos por Empresa (REQ110–REQ129)

#### REQ110: Event Parameter Screen

O sistema deve disponibilizar tela de Parâmetro de Evento de Empresa com abas: Cadastro, Empresa e Listagem.
- Botões CRUD padrão (Incluir, Alterar, Excluir, Confirmar, Cancelar, Atualizar, Sair)
- Opção para aplicar a todas as empresas simultaneamente

#### REQ111: Event Selection

O sistema deve permitir selecionar eventos de parametrização.
- Hora Extra Dia Normal, Hora Extra Domingos e Feriados
- Hora Faltosa, Banco de Horas
- Adicional Noturno, Adicional Noturno (Hora Extra)
- Campo Rede para agrupamento
- Validação de todos os eventos obrigatórios antes de confirmar
- Impedimento de duplicidade de códigos entre categorias incompatíveis

#### REQ112: Event Company Association

O sistema deve vincular parametrizações de eventos a empresas.
- Lista de empresas disponíveis para seleção
- Opção "Todas" para aplicação global
- Seleção individual desabilitada quando "Todas" marcada
- Impedimento de parametrizações duplicadas por empresa

#### REQ113: Event Parameter Listing

O sistema deve listar parametrizações cadastradas.
- Exibição: empresa, eventos configurados, data de criação/alteração
- Seleção para alteração ou exclusão
- Ordenação por qualquer coluna

#### REQ114: Event Export Integration

O sistema deve utilizar eventos parametrizados na exportação para folha de pagamento.
- Mapeamento direto para códigos do sistema de folha
- Validação de mapeamentos antes da exportação
- Bloqueio se houver ausência de eventos obrigatórios
- Registro de toda alteração em log de auditoria

---

### 7. Saldo Inicial Banco de Horas (REQ130–REQ139)

#### REQ130: Initial Balance Registration

O sistema deve permitir registrar saldo inicial do banco de horas.
- Abas: Cadastro e Listagem
- Identificação do colaborador: código/descrição do cargo, saldo atual
- Período (MM/yyyy), saldo credor com máscara de horas
- Impedimento de duplicidade para mesmo colaborador e mês/ano

#### REQ131: Initial Balance Recalculation

O sistema deve permitir opção de recalcular saldo do banco de horas após alterações.
- Checkbox para recálculo automático
- Quando marcado, recalcula saldo consolidado após confirmação
- Saldo inicial aplicado na apuração mensal
- Incorporação ao cálculo do saldo acumulado no fechamento

#### REQ132: Initial Balance History

O sistema deve manter histórico detalhado de alterações no saldo inicial.
- Usuário, data/hora, saldo anterior, novo saldo
- Motivo da alteração, indicador de recálculo

---

### 8. Cadastro de Modelo REP (REQ140–REQ159)

#### REQ140: REP Model Registration

O sistema deve permitir cadastrar modelos de Registro Eletrônico de Ponto (REP).
- Número do REP (numérico), Tipo (Biométrico, Cartão, Múltiplo)
- Identificador AEJ/AFD/AFDT
- Validade (início/fim) com validação de coerência
- Empresa vinculada (obrigatória)
- Impedimento de duplicidade: mesmo número + mesma empresa

#### REQ141: REP Technical Information

O sistema deve permitir registrar informações técnicas do REP.
- Capacidade de armazenamento, suportes de comunicação (USB, TCP/IP, Wi-Fi, GPRS)
- Suporte biométrico, tipos de cartões aceitos
- Versão de firmware (com histórico de versões)
- Protocolos de comunicação e mapeamento de dados

#### REQ142: REP Manufacturer Data

O sistema deve armazenar dados do fabricante do REP.
- Razão social, CNPJ, registro no MTE, contatos de suporte
- Vínculo obrigatório a fabricante registrado no sistema

#### REQ143: REP Integration Layouts

O sistema deve associar ao modelo os layouts suportados (AFD, AFDT, AEJ).
- Conformidade com legislação vigente
- Comportamento em falha de comunicação: buffer, retransmissão, retenção local

#### REQ144: REP Compliance

O sistema deve garantir conformidade legal dos modelos de REP.
- Observância de portarias e normas MTE/MTP
- Registro de certificados de conformidade para auditorias
- Atualização do cadastro por alterações legislativas

#### REQ145: REP Multi-Company Association

O sistema deve permitir vincular cada modelo de REP a múltiplas empresas e unidades.
- Impedimento de vinculações conflitantes com legislação ou políticas internas

---

### 9. Digitação / Ajuste do Cartão de Ponto (REQ160–REQ179)

#### REQ160: Time Card Entry Screen

O sistema deve disponibilizar tela de Digitação do Cartão de Ponto.
- Filtro hierárquico: Rede → Empresa → Funcionário
- Seletor de Mês/Ano (MM/yyyy)
- Abas: Lançamentos e Banco de Horas
- Painel de batidas originais do ponto eletrônico

#### REQ161: Time Card Day Entry

O sistema deve permitir digitar horários de entrada/saída em até 4 períodos (8 batidas).
- Campos com máscara HH:mm
- Validação de formato e lógica (horas 00-23, minutos 00-59)
- Tipo do Dia selecionável: Dia Normal, DSR, Feriado
- Motivo selecionável de lista pré-cadastrada (com opção "Fixa" para manter último motivo)
- Carregamento automático do horário padrão do funcionário ao selecionar o dia

#### REQ162: Time Card Period Validation

O sistema deve validar período antes de permitir edição.
- Mês/ano já apurado bloqueia edição (mensagem informativa)
- Data do dia dentro da vigência do funcionário (admissão/demissão)
- Detecção de alterações não salvas ao fechar/cancelar

#### REQ163: Time Card Batch Entry

O sistema deve permitir repetir lançamento para múltiplos dias.
- Opção "Util. lcto até" com dia final selecionável
- Repetição automática de horários e motivo até data limite no mesmo mês

#### REQ164: Time Card Totalizers

O sistema deve calcular automaticamente os totalizadores.
- Horas normais, extras, faltas, banco de horas por dia
- Baseado na comparação horários digitados vs horário padrão + Tipo do Dia + Motivo
- Consolidação mensal (por motivo) atualizada a cada inclusão/alteração/exclusão
- Percentuais de acréscimo para Dia Normal, DSR e Feriado no BH

#### REQ165: Time Card Hours Bank Tab

O sistema deve exibir aba de Banco de Horas com informações completas.
- Histórico mês a mês do saldo BH
- Meses compensados ao clicar em linha do histórico
- Botão Atualizar para previsão do saldo considerando lançamentos não confirmados
- Compensação automática com saldos de meses anteriores (limite parametrizado)

#### REQ166: Time Card Shift Operations

O sistema deve permitir operações auxiliares nos lançamentos.
- Deslocar sequência de horários para esquerda/direita
- Carregar horário padrão
- Marcar todos os intervalos
- Alterar Ocorrência (justificativa/observação) quando parametrizado

#### REQ167: Time Card Print

O sistema deve permitir imprimir espelho do cartão de ponto.
- Todos os lançamentos e totalizadores do mês
- Disponível apenas após confirmação e salvamento

#### REQ168: Original Punches Display

O sistema deve exibir batidas originais capturadas do ponto eletrônico.
- Formato concatenado (ex: "08:00-12:00-13:00-18:00")
- Exibido como referência para o digitador ao selecionar um dia

---

### 10. Apuração de Horas / Fechamento Mensal (REQ180–REQ199)

#### REQ180: Hours Calculation Screen

O sistema deve disponibilizar tela de Apuração de Horas Extras / Fechamento Mensal.
- Filtros: Rede → Empresa → Funcionário (hierárquicos)
- Seletor de período (MM/yyyy), padrão mês atual
- Abas: Apuração, Fechamento, Listagem (inconsistências)

#### REQ181: Hours Calculation Process

O sistema deve executar apuração de horas com validação prévia.
- Rede obrigatória; alerta se empresa sem eventos de BH configurados
- Verificação de digitação completa e mês não fechado
- Modos: Detalhado (lançamentos individuais) ou Totalizadores (totais consolidados)
- Tipos calculados: Horas normais, HE domingos/feriados, faltosas, banco de horas, adicional noturno, adicional noturno HE

#### REQ182: Hours Calculation Results

O sistema deve exibir resultados da apuração em grade.
- Colunas: Empresa, Matrícula, Nome, Horas trabalhadas, Dia normal, HE dom/feriado, Hora faltosa, BH, Adic. noturno, Adic. noturno HE
- Filtro para exibir apenas funcionários com horas lançadas
- Impressão de relatório parcial

#### REQ183: Negative Hours Control

O sistema deve controlar horas negativas quando banco de horas ativo.
- Opção "Desconta hora negativa em folha" (visível se BH ativo)
- Tabela temporária para desconto no fechamento

#### REQ184: Monthly Closing Process

O sistema deve permitir fechamento mensal irreversível.
- Executável apenas uma vez por período; não pode ser desfeito
- Requer apuração prévia executada
- Em transação: inserir registros BH, quitar saldos positivos, zerar horas quitadas, quitar cartão de ponto
- Impedimento se existirem inconsistências na listagem
- Mensagem de sucesso com opção de imprimir

#### REQ185: Hours Export File

O sistema deve permitir exportar dados de horas para arquivo texto.
- Seleção de caminho e nome (.TXT)
- Layout: Empresa(2)|Matrícula(5)|Evento(3)|Horas(3)|Minutos(2)|MêsAno(6) separados por pipe
- Confirmação para sobrescrever arquivo existente

#### REQ186: Inconsistency Listing

O sistema deve listar inconsistências na aba Listagem.
- Funcionários sem lançamentos para o mês
- Funcionários com lançamentos que não cobrem o mês integral
- Fechamento impedido enquanto houver inconsistências

#### REQ187: Night Shift Calculation

O sistema deve calcular adicional noturno considerando os horários configurados.
- Entrada antes das 22h e saída antes das 5h
- Entrada e saída entre 22h e 5h
- Entrada depois das 22h e saída depois das 5h

---

### 11. Importação de Batidas (REQ200–REQ209)

#### REQ200: Punch Import Process

O sistema deve permitir importação de arquivos de batidas de ponto.
- Formatos suportados: TopData e Kurumim REP II
- Validação automática de layout
- Seleção hierárquica: Rede → Empresa → Funcionário(s)
- Período obrigatório no mesmo mês

#### REQ201: Punch File Processing

O sistema deve processar arquivo de batidas conforme formato definido.
- PIS (11 chars), Data (DDMMYYYY, 8 chars), Hora (HHMM, 4 chars)
- Relação com funcionários via campo PIS
- Validação de datas dentro do período selecionado
- Cálculo automático: horas trabalhadas, extras, faltas, folgas, adicional noturno

#### REQ202: Punch Import Validation

O sistema deve validar integridade da importação.
- Verificação de parâmetros de cartão de ponto configurados
- Dias com número inválido de batidas geram log de inconsistências
- Impedimento de importação se digitação de ponto estiver aberta com alterações
- Opção de sobrescrever dados existentes (com confirmação)

#### REQ203: Punch Import Results

O sistema deve processar resultados da importação.
- Atualização de tabelas: cartão de ponto, totalizadores, banco de horas
- Compensação automática de BH com horas credoras/devedoras
- Mensagem de sucesso e log de erros quando houver inconsistências

---

### 12. Exportação AEJ (REQ210–REQ219)

#### REQ210: AEJ Export Process

O sistema deve gerar o Arquivo Eletrônico de Jornada (AEJ) em formato TXT.
- Layout conforme legislação trabalhista
- Seleção: Rede → Empresa, período (data inicial/final), caminho de destino
- Validação: empresa com REP cadastrado obrigatório

#### REQ211: AEJ Export Validation

O sistema deve validar integridade antes da exportação AEJ.
- Verificação de batidas incompletas (saída não registrada, segundo turno faltante)
- Log de inconsistências impedindo exportação até regularização
- Nome automático: Exp_AEJ_Emp_XX.txt

#### REQ212: AEJ Export Content

O sistema deve incluir no AEJ todos os registros conforme layout oficial.
- Cabeçalho, detalhes de batidas, horários contratuais, ausências, rodapé
- Datas/horas no padrão ISO 8601 com fuso horário
- Apenas funcionários com cartão de ponto no período

---

### 13. Exportação Madis (REQ220–REQ229)

#### REQ220: Madis Export Process

O sistema deve gerar arquivo de exportação Madis para admissões e demissões.
- Seleção: Rede → Empresa → Funcionário(s)
- Período opcional com checkboxes de habilitação
- Opção: Admissão ou Demissão
- Nome automático: ExpMadis_[Adm|Dem]_Emp_XX.txt

#### REQ221: Madis Admission Export

O sistema deve exportar dados de admissão no formato Madis.
- Funcionários categorias 1, 7 e 901; excluindo demitidos
- Layout: empresa+matrícula(15) + nome(40) + data admissão(8) + horas(5) + código horário(4) + PIS(11) + código cargo(8) + e-mail(72)

#### REQ222: Madis Dismissal Export

O sistema deve exportar dados de demissão no formato Madis.
- Funcionários demitidos no período
- Layout: matrícula(17) + código 902(3) + data demissão(8) + PIS(11)

---

### 14. Relatórios (REQ230–REQ289)

#### REQ230: Calculated Time Card Report

O sistema deve gerar relatório de Cartão de Ponto Calculado.
- Filtros hierárquicos: Rede → Empresa → Centro de Custo → Funcionário
- Competência (MM/yyyy), opções: omitir saldo diário, histórico BH, somente resumo
- Modo Detalhado (lançamentos individuais, saldos diários) ou Totalizador (múltiplas batidas, totais mensais)
- Cálculos: horas trabalhadas, saldo diário, totais por tipo, saldo BH

#### REQ231: Accumulated Hours Bank Report

O sistema deve gerar relatório de Banco de Horas Acumulado.
- Filtros: Rede → Empresa → Centro de Custo → Gestor → Funcionário
- Período (mês/ano inicial e final), opção excluir demitidos
- Modos: Banco de Horas (saldos, registros não quitados) ou Cartão de Ponto (crédito/débito por motivo)
- Conteúdo: horas extras (crédito), horas faltosas (débito), saldo, horas a pagar

#### REQ232: Time Card Inconsistencies Report

O sistema deve gerar relatório de Inconsistências no Cartão de Ponto.
- Filtros: Rede → Empresa → Centro de Custo → Funcionário (múltipla seleção)
- Competência, ordem (alfabética/numérica), opção "A partir de"
- Inconsistências: faltas não justificadas, atrasos, saídas antecipadas, HE não autorizadas, sobreposição de turnos
- Formato otimizado: dois cartões por página

#### REQ233: Time Card Mirror Report

O sistema deve gerar relatório Espelho do Cartão de Ponto.
- Filtros: Rede → Empresa → Centro de Custo → Funcionário
- Competência, ordem, opção "A partir de"
- Formato para impressora: informações do mês, empresa, CNPJ, endereço, funcionário, CTPS, matrícula, função, jornada, intervalo
- Duas colunas por página

#### REQ234: Employees by Company Report

O sistema deve gerar relatório de Funcionários por Empresa.
- Modos: Analítico (lista detalhada) ou Sintético (contagem)
- Filtros: Rede → Empresa → Centro de Custo → Cargo
- Admitidos até (data), Status (Afastados, Ativos, Demitidos, Somente Ativos)
- Agrupamento por Centro de Custo, Cargo ou Nível CC
- Ordenação: Nome/Matrícula (analítico) ou Nome Fantasia/Código (sintético)

#### REQ235: Time Card Managers Report

O sistema deve gerar relatório de Gestores do Cartão de Ponto.
- Filtros: Rede → Empresa → Centro de Custo → Gestor → Funcionário
- Lista gestores e seus funcionários subordinados
- Ordenação por empresa do gestor e matrícula

#### REQ236: Detailed Punch Report

O sistema deve gerar relatório Detalhado de Ponto.
- Filtros: Período (data início/fim, mesmo mês), Rede → Empresa → Funcionário(s)
- Conteúdo: empresa, funcionário, matrícula, cargo, data, dia da semana, turno, horários, intervalo, HE, faltas, normais, totais, saldo BH, observações

#### REQ237: Hours Bank History Report

O sistema deve gerar relatório Histórico de Banco de Horas.
- Filtros: Período (mês/ano de/até), Rede → Empresa → Centro de Custo → Funcionário
- Opções: agrupar por Centro de Custo, excluir demitidos
- Conteúdo: saldos, horas extras, faltosas por funcionário no período

#### REQ238: Time Card Reason Report

O sistema deve gerar relatório de Motivo do Cartão de Ponto (Relação de Horas).
- Tipos: Sintético (agrupado por motivo), Analítico (por funcionário), Indicador RH
- Filtros: Rede → Empresa → Centro de Custo → Funcionário → Cargo → Motivo
- Agrupamento: Centro de Custo ou Cargo (mutuamente exclusivos)
- Indicador RH: turnover, absenteísmo (% horas de absenteísmo sobre efetivamente trabalhadas)

#### REQ239: Hours Totalizer Report

O sistema deve gerar relatório Totalizador de Horas do Cartão de Ponto.
- Filtros: Rede → Empresa → Centro de Custo, Período (MM/AAAA)
- Agrupamento opcional por Centro de Custo
- Conteúdo: empresa, centro de custo, carga horária, total horas trabalhadas, nº funcionários
- Modos: detalhado (batidas de ponto) ou totalizador (motivos de cartão)

#### REQ240: Punch Import Report

O sistema deve gerar relatório de Importação do Cartão de Ponto.
- Filtros: Rede → Empresa → Funcionário(s), Período, Caminho do arquivo
- Processamento de arquivo PIS (11) + Data (8) + Hora (4)
- Conteúdo: funcionário, data, data/hora, nome

---

### 15. Auditoria e Trilha (REQ290–REQ299)

#### REQ290: Audit Trail

O sistema deve registrar trilha de auditoria para todas as operações do módulo.
- Campos: entidade, campo, valor anterior, valor novo, usuário, data/hora, IP
- Justificativa obrigatória em alterações críticas
- Histórico permanente, imutável, consultável

#### REQ291: Operation Logs

O sistema deve manter logs de operações do sistema.
- Importações, exportações, fechamentos, processamentos
- Timestamp, usuário, resultado (sucesso/erro), detalhes
- Logs de inconsistências para importação e exportação

---

## Requisitos Não Funcionais

### Performance (NFR001–NFR009)

#### NFR001: CRUD Response Time

Operações CRUD simples devem responder em menos de 2 segundos.

#### NFR002: Report Generation

Relatórios devem utilizar tabelas temporárias para otimização de consultas, com barra de progresso visível durante processamento.

#### NFR003: Import Processing

Importação de batidas deve processar em lote com feedback de progresso, sem travar a interface.

#### NFR004: Database Optimization

O sistema deve utilizar índices apropriados, hints de tabela (NOLOCK onde aplicável) e agrupamento de operações em transações.

---

### Segurança e Acesso (NFR010–NFR019)

#### NFR010: Role-Based Access Control

O sistema deve controlar acesso por perfis (admin, gestor, atendente) com permissões granulares por módulo.
- Inclusão, alteração, exclusão e visualização de histórico controlados separadamente

#### NFR011: Company-Level Access

O sistema deve restringir acesso do usuário às empresas autorizadas (via TBusuario_empresa).

#### NFR012: Audit Logging

Todas as operações devem ser registradas em trilha de auditoria com identificação do usuário.

#### NFR013: Data Integrity

O sistema deve garantir integridade referencial entre tabelas relacionadas e usar transações com rollback em caso de falha.

---

### Usabilidade e Acessibilidade (NFR020–NFR029)

#### NFR020: Keyboard Navigation

O sistema deve suportar navegação completa por teclado (Tab, Enter para avançar, atalhos).

#### NFR021: Responsive Design

O sistema deve ser responsivo (mobile-first) seguindo os breakpoints definidos no ui-guide.

#### NFR022: Loading States

O sistema deve exibir estados de loading (skeleton), empty state e error state conforme padrões do ui-guide.

#### NFR023: Form Validation

O sistema deve exibir mensagens de validação claras e objetivas, com indicação precisa do campo e causa da falha.

#### NFR024: Accessibility Standards

O sistema deve seguir checklist de acessibilidade: labels em inputs, alt text, contraste 4.5:1, focus visible, navegação por teclado, aria-labels.

---

### Operacional (NFR030–NFR039)

#### NFR030: PWA Support

O sistema deve funcionar como PWA (Progressive Web App) com suporte offline básico.

#### NFR031: Multi-Tenant

O sistema deve suportar múltiplas empresas (redes) com dados isolados.

#### NFR032: Legacy Compatibility

O sistema deve reproduzir as funcionalidades e cálculos do sistema legado Director GE (VB6/Crystal Reports) sem perda funcional.

#### NFR033: Export Format Compliance

Exportações AEJ devem seguir layout oficial da legislação trabalhista vigente.

#### NFR034: Temporal Data

O sistema deve usar timestamps automáticos e preservar timezone correto em todas as operações.

---

## Índice de Referência

| Código | Phrasal Key | Módulo |
|--------|-------------|--------|
| REQ001 | Employee Listing | Cadastro Funcionários |
| REQ002 | Employee Creation | Cadastro Funcionários |
| REQ003 | Employee Personal Data | Cadastro Funcionários |
| REQ004 | Employee Functional Data | Cadastro Funcionários |
| REQ005 | Employee Update | Cadastro Funcionários |
| REQ006 | Employee Deactivation | Cadastro Funcionários |
| REQ007 | Employee Associations | Cadastro Funcionários |
| REQ008 | Employee Status Management | Cadastro Funcionários |
| REQ009 | Employee Audit Trail | Cadastro Funcionários |
| REQ030 | Schedule Data Entry | Cadastro Horários |
| REQ031 | Schedule Types | Cadastro Horários |
| REQ032 | Schedule Validation Rules | Cadastro Horários |
| REQ033 | Schedule Version History | Cadastro Horários |
| REQ050 | Scale Creation | Cadastro Escalas |
| REQ051 | Scale Day Configuration | Cadastro Escalas |
| REQ052 | Scale Tolerances | Cadastro Escalas |
| REQ053 | Scale Validation | Cadastro Escalas |
| REQ054 | Scale Version Control | Cadastro Escalas |
| REQ055 | Scale Deactivation | Cadastro Escalas |
| REQ056 | Scale Shifts Configuration | Cadastro Escalas |
| REQ070 | Movement Type CRUD | Tipos Movimentação |
| REQ071 | Movement Type Calculation | Tipos Movimentação |
| REQ072 | Movement Type Export Rules | Tipos Movimentação |
| REQ073 | Movement Type Lifecycle | Tipos Movimentação |
| REQ090 | Time Card Parameters Screen | Parametrização Cartão |
| REQ091 | Tolerance Configuration | Parametrização Cartão |
| REQ092 | Interval Configuration | Parametrização Cartão |
| REQ093 | Overtime Policy Configuration | Parametrização Cartão |
| REQ094 | Hours Bank Configuration | Parametrização Cartão |
| REQ110 | Event Parameter Screen | Param. Eventos |
| REQ111 | Event Selection | Param. Eventos |
| REQ112 | Event Company Association | Param. Eventos |
| REQ113 | Event Parameter Listing | Param. Eventos |
| REQ114 | Event Export Integration | Param. Eventos |
| REQ130 | Initial Balance Registration | Saldo Inicial BH |
| REQ131 | Initial Balance Recalculation | Saldo Inicial BH |
| REQ132 | Initial Balance History | Saldo Inicial BH |
| REQ140 | REP Model Registration | Modelo REP |
| REQ141 | REP Technical Information | Modelo REP |
| REQ142 | REP Manufacturer Data | Modelo REP |
| REQ143 | REP Integration Layouts | Modelo REP |
| REQ144 | REP Compliance | Modelo REP |
| REQ145 | REP Multi-Company Association | Modelo REP |
| REQ160 | Time Card Entry Screen | Digitação Cartão |
| REQ161 | Time Card Day Entry | Digitação Cartão |
| REQ162 | Time Card Period Validation | Digitação Cartão |
| REQ163 | Time Card Batch Entry | Digitação Cartão |
| REQ164 | Time Card Totalizers | Digitação Cartão |
| REQ165 | Time Card Hours Bank Tab | Digitação Cartão |
| REQ166 | Time Card Shift Operations | Digitação Cartão |
| REQ167 | Time Card Print | Digitação Cartão |
| REQ168 | Original Punches Display | Digitação Cartão |
| REQ180 | Hours Calculation Screen | Apuração/Fechamento |
| REQ181 | Hours Calculation Process | Apuração/Fechamento |
| REQ182 | Hours Calculation Results | Apuração/Fechamento |
| REQ183 | Negative Hours Control | Apuração/Fechamento |
| REQ184 | Monthly Closing Process | Apuração/Fechamento |
| REQ185 | Hours Export File | Apuração/Fechamento |
| REQ186 | Inconsistency Listing | Apuração/Fechamento |
| REQ187 | Night Shift Calculation | Apuração/Fechamento |
| REQ200 | Punch Import Process | Importação |
| REQ201 | Punch File Processing | Importação |
| REQ202 | Punch Import Validation | Importação |
| REQ203 | Punch Import Results | Importação |
| REQ210 | AEJ Export Process | Exportação AEJ |
| REQ211 | AEJ Export Validation | Exportação AEJ |
| REQ212 | AEJ Export Content | Exportação AEJ |
| REQ220 | Madis Export Process | Exportação Madis |
| REQ221 | Madis Admission Export | Exportação Madis |
| REQ222 | Madis Dismissal Export | Exportação Madis |
| REQ230 | Calculated Time Card Report | Relatórios |
| REQ231 | Accumulated Hours Bank Report | Relatórios |
| REQ232 | Time Card Inconsistencies Report | Relatórios |
| REQ233 | Time Card Mirror Report | Relatórios |
| REQ234 | Employees by Company Report | Relatórios |
| REQ235 | Time Card Managers Report | Relatórios |
| REQ236 | Detailed Punch Report | Relatórios |
| REQ237 | Hours Bank History Report | Relatórios |
| REQ238 | Time Card Reason Report | Relatórios |
| REQ239 | Hours Totalizer Report | Relatórios |
| REQ240 | Punch Import Report | Relatórios |
| REQ290 | Audit Trail | Auditoria |
| REQ291 | Operation Logs | Auditoria |
| NFR001 | CRUD Response Time | Performance |
| NFR002 | Report Generation | Performance |
| NFR003 | Import Processing | Performance |
| NFR004 | Database Optimization | Performance |
| NFR010 | Role-Based Access Control | Segurança |
| NFR011 | Company-Level Access | Segurança |
| NFR012 | Audit Logging | Segurança |
| NFR013 | Data Integrity | Segurança |
| NFR020 | Keyboard Navigation | Usabilidade |
| NFR021 | Responsive Design | Usabilidade |
| NFR022 | Loading States | Usabilidade |
| NFR023 | Form Validation | Usabilidade |
| NFR024 | Accessibility Standards | Usabilidade |
| NFR030 | PWA Support | Operacional |
| NFR031 | Multi-Tenant | Operacional |
| NFR032 | Legacy Compatibility | Operacional |
| NFR033 | Export Format Compliance | Operacional |
| NFR034 | Temporal Data | Operacional |
