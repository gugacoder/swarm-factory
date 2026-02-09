# 🧠 **DETALHAMENTO COMPLETO DO SISTEMA — Módulo Cartão de Ponto**

---

# ## **1. Cadastros**

O módulo de Cadastros é a fundação do sistema de controle de ponto. Ele reúne todas as informações necessárias para que o restante do módulo funcione corretamente, desde dados do colaborador até regras detalhadas de jornada, equipamentos REP e políticas de cálculo.

---

# ### **1.1. Cadastro de Funcionários**

O cadastro de funcionários centraliza todas as informações necessárias para identificar, vincular e processar corretamente as marcações de ponto.

#### **1.1.1. Dados Pessoais**

* Nome completo
* Sexo
* Data de nascimento
* Nome do Pai
* Nome da Mãe
* Pis(Número e data de cadastro)
* CPF
* Habilitação
* Título Eleitoral(Número, zona e seção)
* Identidade(Número, orgão emissor, UF e Data Expedição)
* Contato e endereço (opcional conforme política interna)

#### **1.1.2. Dados Funcionais**

* Matrícula
* Cargo
* Setor
* Unidade de atuação
* Tipo de vínculo (CLT, estagiário, temporário, terceirizado, etc.)
* Datas de admissão e desligamento
* Informações sobre verbas(Salário base, percentual de adiantamento, etc)

#### **1.1.3. Situação**

* Ativo
* Inativo
* Histórico de mudanças de situação
* Motivo da inativação
* Funcionários inativos não devem aparecer para cálculos ativos do ponto

#### **1.1.4. Associações Importantes**

* Escala vigente
* Horário vigente
* Unidade física
* Equipamento REP autorizado

#### **1.1.5. Auditoria**

Todas as operações devem gerar um registro contendo:

* Valor original e valor novo
* Usuário da alteração
* Data e hora
* Justificativa quando necessária

---

# ### **1.2. Cadastro de Horários**

O sistema permite a criação de horários que serão utilizados nas escalas e no cálculo das jornadas.

#### **1.2.1. Dados do Horário**

* Entrada
* Saída
* Intervalos (múltiplos ou únicos)
* Duração prevista da jornada
* Tolerâncias específicas

#### **1.2.2. Tipos de horários**

* Fixos
* Variáveis
* Noturnos
* Parciais

#### **1.2.3. Regras**

* Validação do mínimo de intervalo
* Validação do máximo permitido
* Compatibilidade com escala

#### **1.2.4. Histórico de Vigência**

* Data de início e fim do horário
* Manutenção da versão histórica
* Preserva cálculo retroativo correto

---

# ### **1.3. Cadastro de Escalas**

A escala define como os horários se distribuem nos dias.

#### **1.3.1. Tipos de Escalas Suportadas**

* Fixa
* Turnos/Revezamento
* 12x36
* Modelos personalizados

#### **1.3.2. Configurações**

* Dias de trabalho
* Dias de descanso
* Horários associados
* Regras específicas de tolerância
* Indicação de jornada noturna

#### **1.3.3. Histórico**

* Alterações devem manter vigência
* Registro de alterações por colaborador
* Impacto direto no cálculo da jornada

---

# ### **1.4. Cadastro de Tipos de Movimentação**

Movimentações representam eventos que interferem nos cálculos do cartão de ponto.

#### **1.4.1. Exemplos**

* Hora Extra
* Hora Negativa
* Hora Trabalhada
* Ausência justificada
* Atrasos
* Abonos
* Banco de horas (crédito/débito)

#### **1.4.2. Parâmetros**

* Fórmula de cálculo
* Compatibilidade com escalas
* Regras para exportação
* Códigos para folha

#### **1.4.3. Ativação/Inativação**

* Tipos de movimentação podem ser desativados
* Histórico preservado

---

# ### **1.5. Parametrização do Cartão de Ponto**

Concentra todas as regras usadas na interpretação das batidas.

#### **1.5.1. Tolerâncias**

* Atraso permitido
* Saída antecipada
* Tempo extra tolerado

#### **1.5.2. Intervalos**

* Mínimo obrigatório
* Máximo permitido
* Controle de múltiplos intervalos

#### **1.5.3. Políticas de Hora Extra**

* Necessidade de autorização
* Aplicação automática
* Porcentagem (50%, 100%, noturno etc.)

#### **1.5.4. Banco de Horas**

* Ativação ou desativação
* Limites
* Regras de crédito e débito

---

# ### **1.6. Parametrização de Exportação**

Determina como o sistema envia os dados para a folha.

#### **1.6.1. Formatos**

* TXT
* CSV
* XLSX
* Formatos proprietários

#### **1.6.2. Mapeamentos**

* Eventos da folha
* Códigos por tipo de movimentação
* Agrupamento por funcionário ou período

#### **1.6.3. Regras Gerais**

* Exportação por unidade
* Exportações programadas
* Histórico de exportações

---

# ### **1.7. Cadastro de Saldo Inicial do Banco de Horas**

Cria o ponto de partida para o cálculo do banco de horas do colaborador.

#### **1.7.1. Funcionalidades**

* Registrar saldo inicial
* Editar saldo existente
* Criar histórico detalhado
* Aplicar efeitos no fechamento mensal

---

## **1.8 Cadastro do Modelo do REP**
Processo responsável por **criar, registrar, parametrizar e manter** os modelos de REP (Registro Eletrônico de Ponto) utilizados pela organização. Envolve desde a identificação técnica do equipamento até as configurações que determinam seu funcionamento dentro do sistema.

### **1.8.1 Registro Inicial do Modelo**
- Definição formal do modelo do REP no sistema.  
- Inserção das informações de identificação fornecidas pelo fabricante.  
- Associação de códigos internos utilizados pela empresa para controle e rastreamento dos modelos.  
- Validação dos dados essenciais antes do armazenamento definitivo.

### **1.8.2 Informações Técnicas do Equipamento**
- Registro das características físicas e funcionais do REP.  
- Capacidade de armazenamento de eventos.  
- Tipos de comunicação suportados (USB, TCP/IP, Wi-Fi, GPRS).  
- Especificações do relógio interno, precisão e sincronização.  
- Informações sobre a memória de registro (MRP) e memória de trabalho.  
- Número máximo de usuários, digitais ou cartões suportados.  
- Versão de firmware e compatibilidade com atualizações.

### **1.8.3 Dados do Fabricante**
- Identificação do fabricante homologado pelo MTE.  
- Razão social, CNPJ e dados de contato para suporte técnico.  
- Número de registro do fabricante no ministério responsável.  
- Histórico de versões do equipamento liberadas pelo fabricante.  
- Políticas de garantia e manutenção.

### **1.8.4 Parâmetros de Funcionamento**
- Definição de como o REP irá operar no ambiente corporativo.  
- Protocolo de comunicação com o sistema de ponto.  
- Tipos de coleta: biometria, cartão, senha ou múltiplos métodos.  
- Configurações de segurança: criptografia, autenticação e logs.  
- Regras de envio de marcações para o sistema central.  
- Comportamento em caso de falha de comunicação (armazenamento temporário, fila, retransmissão).

### **1.8.5 Layout de Integração e Protocolos**
- Estrutura de dados usada na comunicação com o sistema de ponto.  
- Definição de layouts de arquivos AFD, AEJ e AFDT conforme legislação.  
- Parametrização de APIs ou webservices usados pela solução corporativa.  
- Mapeamento das informações de marcação para os campos internos do sistema.  
- Configuração de intervalos de sincronização.

### **1.8.6 Controle de Versões do Modelo**
- Registro das versões de hardware e firmware suportadas.  
- Histórico de alterações técnicas entre versões.  
- Data de habilitação e descontinuação de cada versão.  
- Registro de compatibilidades e incompatibilidades.  
- Controle de modelos substituídos ou aposentados.

### **1.8.7 Vinculação com Unidades e Empresas**
- Associação do modelo do REP às unidades físicas que o utilizarão.  
- Definição dos contextos organizacionais onde o modelo é aplicável.  
- Mapeamento de múltiplas empresas utilizando o mesmo modelo.  
- Registro de restrições de uso por legislação local ou por política interna.

### **1.8.8 Gestão e Manutenção Contínua**
- Atualizações periódicas de informações técnicas.  
- Inclusão de novos modelos homologados.  
- Desativação de modelos obsoletos.  
- Registro de reparos, substituições e recolhimentos.  
- Acompanhamento de alertas, falhas e registros de auditoria relacionados ao modelo.

### **1.8.9 Compliance e Conformidade Legal**
- Garantia de que o modelo atende às normas do MTE (IN 510/2009, Portarias MTP, etc.).  
- Registro dos certificados de conformidade.  
- Manutenção de evidências legais para auditorias internas e externas.  
- Monitoramento de alterações na legislação que exijam ajustes no cadastro.

---

# ## **2. Movimentações**

As movimentações correspondem a tudo que ocorre após os cadastros estarem definidos: importação, processamento, ajustes e fechamento.

---

# ### **2.1. Importação de Batidas**

#### **2.1.1. Processo**

* Upload ou leitura automática de arquivo
* Validação de formato
* Identificação do colaborador
* Armazenamento das batidas
* Exibição no cartão de ponto

#### **2.1.2. Validações**

* Duplicidade
* Funcionário inexistente
* Batida sem par
* Horário fora do padrão

#### **2.1.3. Logs**

* Registro de sucesso/erro
* Quantidade importada
* Lista de erros

---

# ### **2.2. Processamento de Marcações**

O sistema calcula automaticamente as informações baseadas nas batidas.

#### **2.2.1. Cálculos Aplicados**

* Horas trabalhadas
* Intervalos
* Hora extra
* Hora negativa
* Banco de horas

#### **2.2.2. Regras Aplicadas**

* Tolerâncias
* Escalas
* Horários
* Intervalos obrigatórios
* Jornadas especiais (noturnas)

---

# ### **2.3. Digitação Manual de Ponto**

Permite registrar batidas manualmente quando necessário.

#### **2.3.1. Regras**

* Apenas usuários autorizados
* Obrigatório registrar motivo
* Marcações originais não são apagadas

#### **2.3.2. Auditoria**

* Valor anterior
* Novo valor
* Usuário
* Motivo

---

# ### **2.4. Solicitação de Ajuste**

O colaborador pode solicitar correções no cartão de ponto.

#### **2.4.1. Fluxo**

1. Colaborador identifica erro
2. Seleciona dia e tipo de ajuste
3. Escreve justificativa
4. Envia para o gestor

#### **2.4.2. Status**

* Aguardando aprovação
* Aprovado
* Recusado
* Encaminhado ao RH

---

# ### **2.5. Aplicação de Ajustes no Cartão**

Após aprovação, o sistema aplica o ajuste.

#### **2.5.1. Registro obrigatório**

* Marcação original
* Nova marcação
* Data e hora
* Usuário
* Justificativa

#### **2.5.2. Efeitos**

* Reprocessamento automático
* Atualização de relatórios

---

# ### **2.6. Apuração/Fechamento Mensal**

#### **2.6.1. Cálculos**

* Horas trabalhadas
* Extras
* Negativas
* Banco de horas
* Faltas
* Ausências justificadas

#### **2.6.2. Regras**

* Fechamento bloqueia alterações
* Inconsistências impedem fechamento
* Histórico é armazenado

---

---

# ## **3. Auditoria**

A auditoria garante rastreabilidade total, requisito indispensável em sistemas trabalhistas.

---

# ### **3.1. Trilha de Alterações de Ponto**

#### **3.1.1. Conteúdo do Registro**

* Marcação original
* Marcação alterada
* Usuário
* Data
* Motivo

#### **3.1.2. Exibição**

* Comparação lado a lado
* Filtros avançados

---

# ### **3.2. Log de Importações e Ajustes**

#### **3.2.1. Importações**

* Arquivo utilizado
* Quantidade importada
* Erros detectados
* Batidas rejeitadas
* Data e responsável

#### **3.2.2. Ajustes**

* Quem ajustou
* Qual campo alterado
* Valores antes e depois
* Motivo da modificação

---

---

# ## **4. Extração de Dados**

Inclui relatórios e mecanismos de exportação para relatórios internos, auditorias e integração com folha.

---

# ### **4.1. Relatório Batidas Originais x Ajustadas**

#### **4.1.1. Conteúdo**

* Batida original
* Batida ajustada
* Autor da alteração
* Motivo
* Data da alteração

#### **4.1.2. Filtros**

* Período
* Colaborador
* Unidade
* Tipo de origem

---

# ### **4.2. Relatório de Jornada Apurada**

#### **4.2.1. Informações Exibidas**

* Totais de horas trabalhadas
* Horas extras (com detalhamento)
* Horas negativas
* Banco de horas
* Faltas
* Ausências justificadas

---

# ### **4.3. Exportação de Dados (Excel/PDF/TXT)**

#### **4.3.1. Dados Exportáveis**

* Batidas
* Ajustes
* Totais de jornada
* Logs
* Banco de horas

#### **4.3.2. Aplicações**

* Auditorias
* Integração com outros sistemas
* Arquivo para diretoria ou setores jurídicos

---

# ### **4.4. Relatório de Inconsistências**

#### **4.4.1. Inconsistências Comuns**

* Almoço acima de 2 horas
* Jornada acima de 11 horas
* Falta de pares
* Intervalos ausentes
* Marcação duplicada

---

# ### **4.5. Relatório de Banco de Horas**

#### **4.5.1. Informações Exibidas**

* Saldo atual
* Créditos
* Débitos
* Histórico dia a dia
* Ajustes aplicados

#### **4.5.2. Exportação**

* Excel
* PDF
* TXT
