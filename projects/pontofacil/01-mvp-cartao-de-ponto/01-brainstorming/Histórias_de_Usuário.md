# # **Histórias de Usuário – Cadastro de Funcionários**

 ---

# ## **1. Estrutura Geral do CRUD**

---

# ### **1.1. Listagem**

---

### **US-CP-FUNC-LI-001 – Visualizar lista de funcionários**

**Como** gestor de RH
**Quero** visualizar uma lista paginada de funcionários
**Para** consultar rapidamente dados essenciais e acessar cadastros individuais.

**Critérios de Aceite:**

* A listagem deve mostrar Nome, CPF, Matrícula, Cargo, Setor, Unidade e Situação.
* A listagem deve estar paginada.
* Funcionários inativos não devem aparecer por padrão.
* Deve existir botão ou toggle para incluir funcionários inativos.
* A ordenação inicial deve ser alfabética por nome.
* Cada linha deve permitir abrir o registro completo clicando ou usando botão “Editar”.

---

### **US-CP-FUNC-LI-002 – Filtrar funcionários**

**Como** analista de ponto
**Quero** aplicar filtros na listagem
**Para** localizar facilmente o funcionário desejado.

**Critérios de Aceite:**

* Deve ser possível filtrar por Nome, CPF, Matrícula, Situação, Cargo, Setor, Unidade.
* O sistema deve exibir indicador visual quando filtros estiverem ativos.
* A listagem deve atualizar imediatamente após aplicar o filtro.

---

### **US-CP-FUNC-LI-003 – Exportar listagem**

**Como** gestor
**Quero** exportar a lista de funcionários
**Para** utilizar as informações em análises externas.

**Critérios de Aceite:**

* Deve ser possível exportar em formato CSV.
* O arquivo deve respeitar os filtros aplicados.
* Colunas devem refletir o mesmo conteúdo da tela.

---

---

# ## **1.2. Cadastro (Create)**

---

### **US-CP-FUNC-CR-001 – Cadastrar novo funcionário**

**Como** gestor de RH
**Quero** registrar um novo funcionário no sistema
**Para** que ele possa ser vinculado às escalas, horários e registros de ponto.

**Critérios de Aceite:**

* Todos os campos obrigatórios devem ser validados.
* CPF e Matrícula não podem se repetir.
* Data de admissão não pode ser futura.
* O sistema deve exibir mensagem clara quando campos estiverem inválidos.
* Após o cadastro, o sistema deve gerar um ID único.
* Auditoria deve registrar o evento completo.

---

### **US-CP-FUNC-CR-002 – Identificar erros no cadastro**

**Como** operador do RH
**Quero** visualizar mensagens claras quando houver problemas no cadastro
**Para** corrigir rapidamente e finalizar o registro.

**Critérios de Aceite:**

* Campos inválidos devem indicar o erro individualmente.
* O sistema deve impedir envio até que todos erros sejam corrigidos.

---

---

# ## **1.3. Edição (Update)**

---

### **US-CP-FUNC-ED-001 – Editar dados cadastrais**

**Como** analista de RH
**Quero** editar os dados do funcionário
**Para** manter as informações sempre atualizadas.

**Critérios de Aceite:**

* Deve ser possível editar todos os campos, exceto o ID.
* Alterações críticas (CPF, Matrícula, Situação, Data de Admissão) devem exigir justificativa.
* Auditoria deve registrar campo alterado, valor antigo, valor novo, usuário e data.
* Não pode alterar CPF para um já existente.
* Edição de funcionário inativo só pode ocorrer com justificativa.

---

### **US-CP-FUNC-ED-002 – Ajustar Escala e Horário**

**Como** administrador do ponto
**Quero** alterar a escala ou horário de um funcionário
**Para** garantir que o cálculo de ponto reflita a jornada correta.

**Critérios de Aceite:**

* O sistema deve exibir alerta de impacto no cálculo.
* Auditoria deve registrar as mudanças.
* Mudança deve ser refletida imediatamente na integração do cálculo.

---

---

# ## **1.4. Exclusão (Inativação)**

---

### **US-CP-FUNC-EX-001 – Inativar funcionário**

**Como** gestor
**Quero** inativar um funcionário
**Para** impedir que ele apareça em processos ativos do sistema.

**Critérios de Aceite:**

* Exclusão deve ser lógica, não física.
* Deve ser obrigatório informar motivo da inativação.
* Funcionário com registros de ponto nunca pode ser excluído fisicamente.
* Funcionários inativos não aparecem em cálculos ou listas padrão.

---

### **US-CP-FUNC-EX-002 – Reativar funcionário**

**Como** coordenador de RH
**Quero** reativar um funcionário
**Para** que ele volte a integrar todos os processos do sistema.

**Critérios de Aceite:**

* Deve exigir justificativa de reativação.
* Auditoria deve registrar reativação.
* O funcionário deve voltar a ser elegível em cálculos e integrações.

---

---

# ## **1.5. Dados Pessoais**

---

### **US-CP-FUNC-DP-001 – Cadastrar dados pessoais completos**

**Como** operador de RH
**Quero** registrar dados pessoais completos
**Para** garantir identificação e documentação correta.

**Critérios de Aceite:**

* Deve incluir: Nome, Sexo, Data de nascimento, Nome dos pais, CPF, PIS, Habilitação, Título eleitoral, RG, Contato, Endereço.
* CPF deve ser validado com dígitos verificadores.
* PIS deve ter 11 dígitos e validação obrigatória.
* Data de nascimento não pode ser futura e deve garantir idade mínima de 14 anos.
* Formulário deve impedir envio enquanto houver erros de validação.

---

---

# ## **1.6. Dados Funcionais**

---

### **US-CP-FUNC-DF-001 – Registrar dados funcionais**

**Como** RH
**Quero** cadastrar dados funcionais do colaborador
**Para** garantir vínculos trabalhistas e operacionais.

**Critérios de Aceite:**

* Deve permitir cadastrar: Matrícula, Cargo, Setor, Unidade, Tipo de vínculo, Datas, Salário, Percentual de adiantamento.
* Matrícula deve ser única.
* Data de desligamento não pode ser anterior à admissão.

---

---

# ## **1.7. Situação do Funcionário**

---

### **US-CP-FUNC-ST-001 – Alterar situação do funcionário**

**Como** gestor
**Quero** mudar situação para Ativo ou Inativo
**Para** controlar a participação do funcionário no sistema.

**Critérios de Aceite:**

* Motivo deve ser obrigatório ao inativar.
* Histórico de situação deve ser mantido permanentemente.
* Funcionário inativo não deve registrar ponto.

---

---

# ## **1.8. Associações Funcionais**

---

### **US-CP-FUNC-AS-001 – Associar escala e horário**

**Como** administrador do ponto
**Quero** vincular escala e horário vigentes
**Para** habilitar o cálculo da jornada.

**Critérios de Aceite:**

* Sistema deve permitir escolher escala e horário.
* Alterações devem gerar alerta.
* Funcionário inativo não deve poder receber novas associações.

---

### **US-CP-FUNC-AS-002 – Vincular equipamentos REP**

**Como** operador
**Quero** definir quais REP o funcionário pode usar
**Para** garantir registro de ponto apenas nos equipamentos autorizados.

**Critérios de Aceite:**

* Deve permitir selecionar REP autorizado.
* Funcionário inativo não pode ter REP vinculado.

---

---

# ## **1.9. Auditoria**

---

### **US-CP-FUNC-AU-001 – Registrar histórico completo de alterações**

**Como** auditor interno
**Quero** visualizar o histórico completo de alterações
**Para** garantir rastreabilidade e conformidade.

**Critérios de Aceite:**

* Registro deve incluir: campo, valor antigo, valor novo, usuário, data/hora, justificativa quando aplicável.
* Histórico deve ser imutável.
* Deve existir tela de consulta com filtros.

---

---

# ## **1.10. Integração / Backend**

---

### **US-CP-FUNC-MT-001 – Submeter cadastro via mutation**

**Como** desenvolvedor front-end
**Quero** enviar novos cadastros para o backend
**Para** gravar corretamente os dados no banco.

**Critérios de Aceite:**

* Mutation deve seguir o schema:

  ```json
  {
    "schema": "cadastro",
    "mutate": "funcionario",
    "action": "insert"
  }
  ```
* A resposta deve retornar ID e status.

---

### **US-CP-FUNC-MT-002 – Receber eventos SSE**

**Como** interface do sistema
**Quero** receber eventos de atualização
**Para** refletir mudanças em tempo real.

**Critérios de Aceite:**

* Evento SSE deve conter: employee_id, campos alterados e timestamp.
* Interface deve atualizar automaticamente quando evento chegar.

---

# ✅ **Histórias de Usuário – Cadastro de Horários**

---

# ## **1. Dados do Horário**

---

## **US-CP-HO-001 — Cadastrar hora de entrada e saída**

**Como** operador de RH
**Quero** informar a hora de entrada e a hora de saída do horário
**Para** definir corretamente o período da jornada de trabalho do colaborador

### **Critérios de Aceite**

1. O sistema DEVE permitir digitar a hora de entrada e saída utilizando máscara HH:MM.
2. O sistema DEVE validar que a hora de saída é maior que a hora de entrada.
3. Caso a validação falhe, o sistema DEVE exibir mensagem clara:

   * “Hora de saída deve ser maior que a hora de entrada.”
4. Não é permitido salvar o registro enquanto a inconsistência não for corrigida.
5. Ao editar um horário existente, os campos devem vir preenchidos com os valores salvos.

---

## **US-CP-HO-002 — Cadastrar intervalos**

**Como** operador de RH
**Quero** cadastrar intervalos (um ou vários) entre a entrada e a saída
**Para** registrar o período de descanso previsto na jornada

### **Critérios de Aceite**

1. Sistema DEVE permitir cadastrar um intervalo único ou múltiplos intervalos.
2. Cada intervalo DEVE ter hora inicial e final com máscara HH:MM.
3. Sistema NÃO DEVE permitir:

   * intervalo com fim menor que o início
   * sobreposição entre intervalos
4. Sistema DEVE informar mensagem clara quando houver conflito:

   * “Intervalos sobrepostos não são permitidos.”
5. Sistema DEVE recalcular automaticamente a jornada prevista ao alterar intervalos.
6. Sistema DEVE impedir salvar o horário se qualquer intervalo for inválido.

---

## **US-CP-HO-003 — Calcular duração prevista da jornada**

**Como** operador de RH
**Quero** ver a jornada total calculada automaticamente
**Para** evitar erros manuais no cálculo da duração do horário

### **Critérios de Aceite**

1. Sistema DEVE calcular jornada total = (Saída – Entrada) – total de intervalos.
2. Cálculo deve ser atualizado sempre que qualquer campo for alterado.
3. O valor deve ser exibido imediatamente na interface.
4. Não é permitido ao usuário alterar manualmente o cálculo.
5. Campo DEVE refletir exatamente o valor armazenado no banco ao editar um horário.

---

## **US-CP-HO-004 — Configurar tolerâncias**

**Como** operador de RH
**Quero** definir tolerâncias específicas de entrada, saída e intervalos
**Para** adequar o controle de ponto às políticas da empresa

### **Critérios de Aceite**

1. Sistema DEVE permitir informar tolerâncias distintas (antes/depois).
2. Tolerâncias invalidas (ex.: valor negativo) DEVEM gerar mensagem de erro.
3. Tolerâncias DEVEM ser armazenadas junto ao horário.
4. Ao editar um horário, tolerâncias DEVEM ser carregadas corretamente.
5. Tolerâncias DEVEM impactar validações posteriores de cálculo de jornada e escala.

---

# ## **2. Tipos de Horários**

---

## **US-CP-HO-005 — Selecionar tipo de horário**

**Como** operador de RH
**Quero** escolher um tipo de horário (fixo, variável, noturno ou parcial)
**Para** aplicar regras específicas conforme a natureza do horário

### **Critérios de Aceite**

1. Sistema DEVE listar os tipos:

   * Fixo
   * Variável
   * Noturno
   * Parcial
2. Sistema DEVE armazenar corretamente o tipo no campo `DFintervalo_fixo_variavel`.
3. Seleção do tipo DEVE alterar visibilidade e obrigatoriedade de campos.
4. Tipos “Noturnos” DEVEM aplicar regras específicas de jornada noturna.
5. Sistema DEVE validar os limites conforme o tipo selecionado.
6. Erros devem ser comunicados claramente ao usuário.

---

# ## **3. Regras**

---

## **US-CP-HO-006 — Validar mínimos e máximos de intervalo**

**Como** operador de RH
**Quero** que o sistema valide automaticamente os limites de intervalo
**Para** garantir conformidade com normas trabalhistas

### **Critérios de Aceite**

1. Sistema DEVE validar mínimo de intervalo conforme política interna.
2. Sistema DEVE validar máximo permitido.
3. Erros DEVEM impedir salvamento.
4. Sistema DEVE exibir mensagens claras informando o motivo da rejeição.
5. A soma dos intervalos NÃO pode ultrapassar a duração do horário.

---

## **US-CP-HO-007 — Validar compatibilidade com escala**

**Como** operador de RH
**Quero** que o sistema verifique se o horário é compatível com as escalas
**Para** evitar atribuição de horários inválidos aos colaboradores

### **Critérios de Aceite**

1. Sistema DEVE validar regras de compatibilidade antes de salvar.
2. Caso incompatível, DEVE exibir mensagem explicando o motivo.
3. Deve impedir salvar o horário até que a inconsistência seja corrigida.

---

# ## **4. Histórico de Vigência**

---

## **US-CP-HO-008 — Definir vigência do horário**

**Como** operador de RH
**Quero** definir data de início e fim de vigência
**Para** que o sistema mantenha controle temporal das versões do horário

### **Critérios de Aceite**

1. Data de início é obrigatória.
2. Data de fim pode ser opcional.
3. Sistema DEVE validar que início < fim quando ambas forem preenchidas.
4. Sistema NÃO DEVE permitir sobreposição de vigência com outras versões.
5. Sistema DEVE impedir salvamento se houver conflito.

---

## **US-CP-HO-009 — Manter histórico de versões**

**Como** gestor de RH
**Quero** que o sistema registre versões históricas dos horários
**Para** preservar o cálculo retroativo e auditoria das jornadas

### **Critérios de Aceite**

1. Atualizar um horário NÃO PODE sobrescrever valores antigos.
2. Uma nova versão deve ser criada com nova vigência.
3. Histórico deve permanecer consultável.
4. O cálculo retroativo DEVE sempre usar a versão vigente no período analisado.
5. Histórico DEVE mostrar:

   * versão
   * datas de vigência
   * dados completos do horário

---

# ## **5. Integração, Mutação e Eventos**

---

## **US-CP-HO-010 — Registrar horário via mutação JQEL**

**Como** sistema integrador
**Quero** criar ou atualizar horários via mutações
**Para** manter integração consistente e rastreável

### **Critérios de Aceite**

1. Para criação, mutação DEVE usar:

   * schema: `"horarios"`
   * mutate: `"cadastro_horario"`
   * action: `"insert"`
2. Para atualização, mutação DEVE usar action `"update"`.
3. Mutação DEVE respeitar regras de vigência.
4. Mutação inválida deve retornar erro detalhado.

---

## **US-CP-HO-011 — Publicar evento SSE ao atualizar**

**Como** cliente conectado (frontend, dashboards, etc.)
**Quero** receber evento SSE ao atualizar ou cadastrar horário
**Para** manter telas sincronizadas em tempo real

### **Critérios de Aceite**

1. Evento DEVE ser publicado como `"schedule-updated"`.
2. Estrutura DEVE conter:

   * horário_id
   * usuário
   * timestamp (ISO8601)
   * versão
3. Evento DEVE ser direcionado ao target `"horario:<horario_id>"`.
4. Evento DEVE ser gerado após qualquer insert/update bem-sucedido.
5. Nenhum evento deve ser emitido em caso de erro.

---

# ## **6. Interface**

---

## **US-CP-HO-012 — Utilizar formulário React**

**Como** usuário do sistema
**Quero** registrar o horário através de um formulário intuitivo
**Para** garantir rapidez e confiabilidade no cadastro

### **Critérios de Aceite**

1. Componente DEVE ser `<ScheduleForm />`.
2. Interface DEVE conter:

   * entrada
   * saída
   * intervalos
   * tolerâncias
   * tipo de horário
   * vigência
3. Todas as validações devem ocorrer em tempo real.
4. Mensagens de erro devem ser claras.
5. Campos devem ser habilitados/desabilitados conforme o tipo de horário.
6. Cálculo da jornada prevista deve atualizar automaticamente.

---

---

# # **Histórias de Usuário – Cadastro de Escalas**

## ### **US-CP-ESC-001 – Criar uma nova escala**

**Como** administrador do sistema
**Quero** criar uma nova escala definindo nome, tipo, vigência inicial e configurações obrigatórias
**Para** que a empresa possa aplicar corretamente as jornadas dos colaboradores.

**Critérios de Aceite:**

* O sistema deve validar todos os campos obrigatórios antes de permitir o salvamento.
* Se já existir uma escala com o mesmo nome, o sistema deve bloquear o cadastro e informar claramente o motivo.
* Após o salvamento, o sistema deve registrar o evento de criação no histórico de escalas.
* A criação deve gerar notificação para outros componentes do sistema que dependem da escala.
* O sistema deve persistir os dados utilizando o mecanismo padrão de mutation para o módulo de escalas.

---

---

## ### **US-CP-ESC-002 – Editar escala gerando nova versão**

**Como** administrador responsável pelas jornadas
**Quero** editar informações de uma escala existente
**Para** criar uma nova versão mantendo histórico e respeitando vigências.

**Critérios de Aceite:**

* A vigência inicial da escala não pode ser alterada em versões já criadas.
* Qualquer modificação deve gerar automaticamente uma nova versão da escala.
* A versão anterior deve ter sua vigência final ajustada sem afetar registros históricos.
* O sistema deve registrar no histórico os campos alterados, valores anteriores, valores atuais, data e usuário responsável.
* A atualização deve disparar notificação informando que uma nova versão foi criada.

---

---

## ### **US-CP-ESC-003 – Configurar dias de trabalho e descanso**

**Como** administrador de RH
**Quero** configurar os dias de trabalho, descanso e ciclos da escala
**Para** representar corretamente o regime de trabalho da equipe.

**Critérios de Aceite:**

* A escala deve possuir pelo menos um dia de trabalho configurado.
* Escalas 12x36 devem seguir obrigatoriamente o padrão estabelecido (12h trabalho / 36h descanso).
* Escalas personalizadas devem permitir ciclos livres, como 3x2, 4x2, 5x1, entre outros.
* A interface deve exibir de forma clara quais dias pertencem ao ciclo ativo e quais são dias de descanso.
* Caso a configuração seja incompatível com o tipo de escala, o sistema deve impedir o salvamento.

---

---

## ### **US-CP-ESC-004 – Configurar horários e tolerâncias**

**Como** administrador
**Quero** definir horários de entrada, saída, intervalos e tolerâncias
**Para** garantir que o cálculo de jornada seja preciso e conforme regras legais.

**Critérios de Aceite:**

* O sistema não deve permitir horários sobrepostos dentro do mesmo dia ou turno.
* Deve ser permitido configurar jornadas que ultrapassem a meia-noite (horários posteriores a 00:00).
* Tolerâncias não podem exceder a jornada real configurada para o período.
* A interface deve mostrar claramente horários classificados como jornada noturna.
* Horários inconsistentes devem impedir o salvamento.

---

---

## ### **US-CP-ESC-005 – Consultar histórico de versões**

**Como** supervisor, administrador ou auditor
**Quero** visualizar todas as versões já criadas de uma escala
**Para** auditar alterações e conferir regras vigentes em cada período.

**Critérios de Aceite:**

* A listagem deve exibir todas as versões cadastradas, incluindo vigência, data de criação, usuário e status.
* Deve ser possível comparar duas versões, destacando alterações campo a campo.
* A versão vigente deve estar visualmente destacada na interface.
* Alterações críticas devem indicar usuário responsável, data e descrição da mudança.
* O usuário deve acessar detalhes completos de qualquer versão disponível.

---

---

## ### **US-CP-ESC-006 – Desativar uma escala**

**Como** administrador
**Quero** desativar uma escala que não será mais utilizada
**Para** impedir que ela seja atribuída ou utilizada em cálculos futuros.

**Critérios de Aceite:**

* O sistema não deve permitir a desativação se houver colaboradores vinculados à escala.
* A desativação deve exigir o registro de um motivo obrigatório.
* O histórico da escala deve registrar data, hora, usuário e justificativa da desativação.
* O sistema deve enviar notificação informando a desativação aos módulos dependentes.
* Escalas desativadas não devem aparecer nas listas de escalas ativas para seleção.

---

---

## ### **US-CP-ESC-007 – Pré-visualizar escala antes de salvar**

**Como** administrador
**Quero** visualizar um resumo completo da escala antes de salvá-la
**Para** confirmar que todos os dados estão corretos e coerentes.

**Critérios de Aceite:**

* A pré-visualização deve mostrar todos os dados configurados, incluindo horários, dias, ciclos e tolerâncias.
* A interface deve destacar visualmente jornadas noturnas e horários que ultrapassam a meia-noite.
* O usuário deve ter a opção de retornar à edição mantendo todos os dados preenchidos.
* A pré-visualização deve refletir qualquer ajuste feito anteriormente no formulário.
* Se houver inconsistências, a prévia deve alertar o usuário antes do salvamento final.

---

---

# **Histórias de Usuário — Cadastro de Tipos de Movimentação (US-CP-TM)**

---

## **US-CP-TM-001: Criar um novo Tipo de Movimentação**

**Como** analista de RH
**Quero** abrir o formulário de cadastro e criar um novo Tipo de Movimentação
**Para** permitir que o sistema registre corretamente eventos que impactam o cálculo do cartão de ponto.

### **Critérios de Aceite**

* O sistema deve exibir a tela de cadastro com todos os campos em branco ao clicar em “Novo”.
* O sistema deve impedir salvar enquanto houver campos obrigatórios vazios.
* Ao salvar com sucesso, o novo registro deve aparecer imediatamente na listagem.
* O sistema deve manter consistência entre campos obrigatórios e opcionais conforme as regras.

---

## **US-CP-TM-002: Editar um Tipo de Movimentação existente**

**Como** analista de RH
**Quero** editar os dados de um Tipo de Movimentação existente
**Para** corrigir informações ou ajustar regras de cálculo já configuradas.

### **Critérios de Aceite**

* O sistema deve preencher automaticamente os campos com os dados atuais ao abrir para edição.
* Deve ser possível alterar qualquer campo editável.
* Ao salvar, as alterações devem substituir o registro anterior sem duplicação.
* Registros inativos devem continuar editáveis apenas no que for permitido.

---

## **US-CP-TM-003: Inativar um Tipo de Movimentação**

**Como** analista de RH
**Quero** inativar um Tipo de Movimentação
**Para** evitar uso futuro sem comprometer o histórico já registrado.

### **Critérios de Aceite**

* O sistema deve solicitar confirmação antes da inativação.
* A inativação não pode excluir dados históricos.
* O Tipo de Movimentação inativado não deve aparecer em campos de seleção operacionais.
* Movimentações existentes associadas ao tipo inativado devem continuar visíveis.

---

## **US-CP-TM-004: Registrar código interno do Tipo de Movimentação**

**Como** analista de RH
**Quero** informar um código único para o Tipo de Movimentação
**Para** identificá-lo de forma consistente no sistema.

### **Critérios de Aceite**

* O código deve ser obrigatório.
* O sistema deve impedir códigos duplicados.
* O sistema deve validar limites de caracteres.
* O código deve permanecer imutável após a criação, exceto para usuários autorizados.

---

## **US-CP-TM-005: Registrar descrição do Tipo de Movimentação**

**Como** analista de RH
**Quero** informar uma descrição clara do Tipo de Movimentação
**Para** facilitar o entendimento nas telas e relatórios.

### **Critérios de Aceite**

* A descrição deve ser obrigatória.
* O campo deve aceitar acentuação e caracteres especiais.
* O sistema deve validar o limite máximo de caracteres.
* A descrição deve aparecer em todas as interfaces onde o tipo for referenciado.

---

## **US-CP-TM-006: Definir natureza da movimentação**

**Como** analista de RH
**Quero** selecionar a natureza da movimentação
**Para** garantir interpretação correta do impacto no saldo.

### **Critérios de Aceite**

* O sistema deve listar: crédito, débito e informativa.
* A natureza deve ser obrigatória.
* A natureza deve impactar diretamente a regra de cálculo usada.
* Alterações futuras não devem invalidar dados históricos.

---

## **US-CP-TM-007: Definir a ação da movimentação**

**Como** analista de RH
**Quero** definir como a movimentação afeta horas acumuladas
**Para** garantir a aplicação correta da fórmula.

### **Critérios de Aceite**

* As opções devem incluir: adicionar, subtrair e substituir.
* O campo deve ser obrigatório.
* Combinações inválidas com a natureza devem bloquear o salvamento.
* O motor de cálculo deve aplicar corretamente a ação configurada.

---

## **US-CP-TM-008: Definir fórmula de cálculo**

**Como** analista de RH técnico
**Quero** cadastrar uma fórmula personalizada
**Para** adaptar o cálculo às regras da empresa.

### **Critérios de Aceite**

* A fórmula deve permitir expressões matemáticas e variáveis padrão.
* O sistema deve validar sintaxe antes de salvar.
* A fórmula deve ser aplicada corretamente no motor de cálculo.
* Fórmulas antigas devem continuar válidas mesmo após alterações futuras.

---

## **US-CP-TM-009: Selecionar compatibilidade com escalas**

**Como** analista de RH
**Quero** configurar compatibilidade com escalas
**Para** evitar aplicação incorreta em jornadas específicas.

### **Critérios de Aceite**

* O sistema deve listar todas as escalas disponíveis.
* Deve ser possível marcar uma ou várias escalas compatíveis.
* O sistema deve impedir lançamento em escalas incompatíveis.
* Dados históricos não devem ser afetados por mudanças posteriores.

---

## **US-CP-TM-010: Definir regras de exportação**

**Como** analista de integração
**Quero** configurar as regras de exportação
**Para** garantir exportação correta para o sistema de folha.

### **Critérios de Aceite**

* Deve ser possível ativar ou desativar exportação.
* Deve haver campos para tipo de evento e código externo.
* Exportação deve ser bloqueada se parâmetros obrigatórios estiverem faltando.
* A configuração deve afetar apenas exportações futuras.

---

## **US-CP-TM-011: Inserir códigos externos da folha**

**Como** analista financeiro
**Quero** associar um código externo ao Tipo de Movimentação
**Para** garantir integração adequada com sistemas de folha e contabilidade.

### **Critérios de Aceite**

* O campo deve aceitar letras e números.
* O código externo deve ser obrigatório apenas se exportação estiver ativa.
* Códigos duplicados devem ser impedidos.
* Alterações posteriores não devem comprometer exportações anteriores.

---

## **US-CP-TM-012: Registrar histórico de ativação/inativação**

**Como** auditor
**Quero** que mudanças de ativação/inativação sejam registradas
**Para** garantir rastreabilidade completa.

### **Critérios de Aceite**

* O registro deve incluir data, hora, usuário e motivo.
* Inativação não deve remover dados.
* Reativação deve ser possível mediante permissão.
* O histórico deve ser consultável por usuários autorizados.

---

## **US-CP-TM-013: Registrar histórico de alterações**

**Como** gestor de TI
**Quero** que toda alteração no cadastro gere histórico
**Para** garantir auditoria e conformidade.

### **Critérios de Aceite**

* O histórico deve registrar valores antes e depois da alteração.
* O usuário responsável deve ser sempre registrado.
* O histórico deve ser imutável.
* Deve ser possível filtrar histórico por campo, usuário, data ou período.

---

## **US-CP-TM-014: Validar formato e tamanho dos campos**

**Como** analista de governança
**Quero** que o sistema valide formato e tamanho dos dados
**Para** manter integridade das informações.

### **Critérios de Aceite**

* O sistema deve validar limites de caracteres.
* Caracteres inválidos devem ser impedidos.
* Mensagens de erro devem ser claras e objetivas.
* Nenhum dado inválido pode ser salvo.

---

## **US-CP-TM-015: Validar consistência entre natureza, ação e fórmula**

**Como** supervisor de ponto
**Quero** que o sistema valide coerência entre esses parâmetros
**Para** evitar erros no cálculo.

### **Critérios de Aceite**

* Combinações incoerentes devem bloquear o salvamento.
* A fórmula deve ser validada de acordo com a natureza.
* Dados históricos não devem ser impactados.
* O cálculo deve aplicar a regra final validada.

---

## **US-CP-TM-016: Utilizar inativação lógica (soft delete)**

**Como** auditor interno
**Quero** que o sistema utilize inativação lógica
**Para** preservar histórico e auditoria.

### **Critérios de Aceite**

* Nenhum registro pode ser excluído fisicamente.
* A flag ativo/inativo deve controlar disponibilidade operacional.
* Reativação deve ser permitida conforme permissões.
* O histórico deve registrar todas as mudanças de estado.

---

# ## **HISTÓRIAS DE USUÁRIO — PARAMETRIZAÇÃO DO CARTÃO DE PONTO**

---

# # **Requisitos Gerais (RG)**

---

## **US-CP-PR-RG-001 – Acessar tela de parâmetros**

**Como** administrador de RH
**Quero** acessar a tela “Parâmetros do Cartão de Ponto”
**Para** configurar as regras de tratamento das batidas do ponto

### Critérios de Aceite

1. A tela DEVE existir no menu do sistema.
2. O carregamento DEVE exibir todas as seções (Tolerâncias, Intervalos, Hora Extra, Banco de Horas).
3. A tela DEVE abrir mesmo que não existam dados previamente salvos.

---

## **US-CP-PR-RG-002 – Carregar parâmetros existentes**

**Como** administrador
**Quero** que os parâmetros previamente salvos carreguem ao abrir a tela
**Para** revisar ou alterar as configurações atuais

### Critérios de Aceite

1. Todos os campos DEVEM ser preenchidos com dados persistidos.
2. Checkboxes/toggles DEVEM refletir corretamente ativado/desativado.
3. Caso não existam valores anteriores, campos devem iniciar vazios ou padrão definido.

---

## **US-CP-PR-RG-003 – Salvar, editar e limpar parâmetros**

**Como** administrador
**Quero** salvar, alterar ou limpar parâmetros
**Para** manter a configuração atualizada conforme regras da empresa

### Critérios de Aceite

1. Botão **Salvar** DEVE persistir dados novos ou editados.
2. Botão **Limpar** DEVE resetar todos os campos para estado inicial da tela.
3. Apagar e salvar DEVE substituir parâmetros antigos.
4. Após salvar, o sistema DEVE confirmar sucesso.

---

## **US-CP-PR-RG-004 – Persistir via mutation JQEL**

**Como** sistema
**Quero** persistir os parâmetros via mutation JQEL
**Para** garantir integração com engine padrão

### Critérios de Aceite

1. Mutation deve usar: schema `"cartao_ponto"`, mutate `"parametros"`, action `"update"`.
2. O payload DEVE conter todos os campos da tela.
3. Se ocorrer falha, o sistema deve exibir mensagem de erro clara.

---

## **US-CP-PR-RG-005 – Organizar em seções**

**Como** usuário
**Quero** visualizar as configurações separadas por seções
**Para** facilitar navegação e entendimento

### Critérios de Aceite

1. Tela deve conter seções claramente identificadas.
2. Cada seção deve conter apenas itens relacionados ao tema.
3. Recolhimento/expansão (se houver) deve funcionar corretamente.

---

## **US-CP-PR-RG-006 – Formato de horário**

**Como** administrador
**Quero** que campos de horário aceitem apenas `HH:MM`
**Para** evitar erros de digitação e cálculos incorretos

### Critérios de Aceite

1. Máscara DEVE impedir qualquer formato diferente de `HH:MM`.
2. Inserir letras ou caracteres inválidos DEVE ser bloqueado.
3. Valores como `25:99` DEVEM ser rejeitados.

---

# # **Tolerâncias (TO)**

---

## **US-CP-PR-TO-001 – Configurar atraso permitido**

**Como** administrador
**Quero** definir um limite de atraso tolerado
**Para** que pequenos atrasos não sejam apontados como infração

### Critérios de Aceite

1. Campo deve aceitar somente números.
2. Salvar deve registrar o valor corretamente.
3. Valor maior que zero deve permitir cálculo automático.
4. Se atraso real ≤ tolerância, NÃO deve contar como atraso.

---

## **US-CP-PR-TO-002 – Calcular atraso acima da tolerância**

**Como** sistema
**Quero** considerar atraso apenas quando ultrapassar o limite
**Para** garantir cálculo fiel às regras

### Critérios de Aceite

1. Atraso real maior que tolerância deve ser lançado como atraso.
2. Atraso igual à tolerância NÃO deve gerar apontamento.
3. Sistema deve registrar valor excedente.

---

## **US-CP-PR-TO-003 – Configurar saída antecipada tolerada**

**Como** gestor
**Quero** configurar limite de saída antecipada
**Para** não penalizar pequenas variações na saída

### Critérios de Aceite

1. Campo deve permitir apenas minutos inteiros.
2. Valor deve ser validado antes de salvar.
3. Ocorrências abaixo da tolerância não devem ser apontadas.

---

## **US-CP-PR-TO-004 – Apontar saída antecipada excedente**

**Como** sistema
**Quero** apontar saída antecipada apenas quando exceder a tolerância
**Para** garantir cálculo preciso

### Critérios de Aceite

1. Saída antecipada deve ser calculada corretamente.
2. Apenas excedente gera apontamento.
3. Registro deve ir para relatório de inconsistências.

---

## **US-CP-PR-TO-005 – Configurar tempo extra tolerado**

**Como** administrador
**Quero** definir um período adicional que não se transforma em hora extra
**Para** evitar contagem de minutos irrisórios

### Critérios de Aceite

1. Valor informado deve ser aceito apenas em minutos.
2. Exceder tolerância deve gerar hora extra conforme regra.
3. Valor deve ser usado no cálculo diário.

---

## **US-CP-PR-TO-006 – Considerar como hora extra excedente**

**Como** sistema
**Quero** que valores acima do tempo extra tolerado virem hora extra
**Para** manter coerência nos cálculos

### Critérios de Aceite

1. Sistema deve comparar valor real com tolerância.
2. Apenas excedente deve entrar no cálculo.
3. Registro deve respeitar políticas de hora extra.

---

# # **Intervalos (IN)**

---

## **US-CP-PR-IN-001 – Configurar intervalo mínimo**

**Como** administrador
**Quero** definir tempo mínimo obrigatório
**Para** cumprir legislação e políticas internas

### Critérios de Aceite

1. Sistema deve aceitar somente números positivos.
2. Valor não pode ser zero.
3. Uso deve refletir no cálculo das batidas.

---

## **US-CP-PR-IN-002 – Validar mínimo obrigatório**

**Como** sistema
**Quero** impedir gravação de intervalo mínimo inconsistente
**Para** evitar cálculos incorretos

### Critérios de Aceite

1. Intervalo mínimo maior que máximo deve gerar erro.
2. Valor negativo deve ser rejeitado.
3. Tela deve exibir mensagem clara.

---

## **US-CP-PR-IN-003 – Configurar intervalo máximo**

**Como** administrador
**Quero** definir o limite máximo de intervalo
**Para** garantir cumprimento da jornada

### Critérios de Aceite

1. Campo deve aceitar somente números.
2. Intervalo maior que limite definido deve gerar apontamento.
3. Valor deve ser salvo e utilizado corretamente.

---

## **US-CP-PR-IN-004 – Apontar excesso de intervalo**

**Como** sistema
**Quero** registrar quando intervalo exceder o limite
**Para** controlar ausências injustificadas

### Critérios de Aceite

1. Excedentes devem ser registrados.
2. Relatório deve mostrar tempo excedido.
3. Não pode impactar outros cálculos incorretamente.

---

## **US-CP-PR-IN-005 – Habilitar múltiplos intervalos**

**Como** administrador
**Quero** ativar múltiplos intervalos por dia
**Para** gerenciar jornadas fracionadas

### Critérios de Aceite

1. Toggle “múltiplos intervalos” deve funcionar corretamente.
2. Ativar deve exibir campos adicionais (mínimo, máximo, quantidade).
3. Desativar deve esconder esses campos.

---

## **US-CP-PR-IN-006 – Informar regras de múltiplos intervalos**

**Como** administrador
**Quero** configurar limites de cada intervalo
**Para** controlar uso adequado

### Critérios de Aceite

1. Campos obrigatórios: mínimo, máximo, quantidade.
2. Sistema deve validar que quantidade é ≥ 1.
3. Valores inconsistentes devem ser rejeitados.

---

## **US-CP-PR-IN-007 – Impedir configurações conflitantes**

**Como** sistema
**Quero** impedir salvar configurações inválidas
**Para** manter integridade das regras

### Critérios de Aceite

1. Mínimo > máximo deve ser bloqueado.
2. Quantidade zero deve ser rejeitada.
3. Mensagem deve ser exibida com causa clara.

---

# # **Hora Extra (HE)**

---

## **US-CP-PR-HE-001 – Exigir autorização de hora extra**

**Como** gestor
**Quero** exigir autorização prévia
**Para** controlar custos e evitar excessos

### Critérios de Aceite

1. Toggle deve permitir ativar ou desativar.
2. Quando ativo, horas extras não autorizadas devem ficar “pendentes”.
3. Relatórios devem exibir status.

---

## **US-CP-PR-HE-002 – Registrar horas extras não autorizadas**

**Como** sistema
**Quero** classificar horas extras não autorizadas
**Para** manter organização das solicitações

### Critérios de Aceite

1. Registros devem receber flag “pendente”.
2. Processamento posterior deve seguir políticas da empresa.
3. Nada deve ser creditado até autorização.

---

## **US-CP-PR-HE-003 – Ativar aplicação automática**

**Como** administrador
**Quero** ativar cálculo automático
**Para** pontofacilr fechamento diário

### Critérios de Aceite

1. Toggle deve ativar/desativar corretamente.
2. Quando ativo, sistema deve processar automaticamente.
3. Deve considerar tolerâncias e banco de horas.

---

## **US-CP-PR-HE-004 – Aplicar automaticamente conforme regras**

**Como** sistema
**Quero** aplicar automaticamente hora extra
**Para** garantir cálculo padronizado

### Critérios de Aceite

1. Cálculo deve seguir: tolerâncias + banco + percentuais.
2. Resultado deve ser registrado corretamente.
3. Erros devem ser exibidos ao usuário.

---

## **US-CP-PR-HE-005 – Configurar percentuais**

**Como** administrador
**Quero** definir percentuais (50%, 100%, noturno etc.)
**Para** usar regras adequadas a cada situação

### Critérios de Aceite

1. Percentuais devem aceitar apenas números válidos.
2. Cada percentual deve permitir regra própria.
3. Valores devem ser persistidos.

---

## **US-CP-PR-HE-006 – Aplicar regras por percentual**

**Como** sistema
**Quero** aplicar percentuais conforme configuração
**Para** calcular corretamente a remuneração

### Critérios de Aceite

1. Cálculo deve aplicar o percentual configurado.
2. Percentuais faltantes devem gerar aviso.
3. Registro deve refletir cálculo final.

---

# # **Banco de Horas (BH)**

---

## **US-CP-PR-BH-001 – Ativar/desativar banco de horas**

**Como** administrador
**Quero** habilitar ou desabilitar o banco
**Para** controlar saldo conforme política da empresa

### Critérios de Aceite

1. Toggle deve alterar estado corretamente.
2. Quando desativado, excedentes NÃO devem ser creditados.
3. Usuário deve ser avisado se limites estiverem vazios.

---

## **US-CP-PR-BH-002 – Evitar crédito quando desativado**

**Como** sistema
**Quero** evitar creditar horas quando banco estiver inativo
**Para** manter coerência nos cálculos

### Critérios de Aceite

1. Horas extras devem ir para cálculo normal.
2. Nenhum saldo deve ser lançado no banco.
3. Log deve registrar o motivo.

---

## **US-CP-PR-BH-003 – Configurar limites**

**Como** administrador
**Quero** definir limites diário, mensal e anual
**Para** controlar acúmulo excessivo

### Critérios de Aceite

1. Cada limite deve ser validado separadamente.
2. Valores negativos devem ser recusados.
3. Sistema deve usar limites automaticamente nos cálculos.

---

## **US-CP-PR-BH-004 – Tratar excedentes acima do limite**

**Como** sistema
**Quero** tratar excedentes como hora extra
**Para** evitar saldo ilimitado

### Critérios de Aceite

1. Cálculo deve comparar saldo total com limite.
2. Excedente deve ir para hora extra.
3. Registro deve mostrar motivo.

---

## **US-CP-PR-BH-005 – Configurar regras de crédito**

**Como** administrador
**Quero** definir regras automáticas de crédito
**Para** simplificar operação diária

### Critérios de Aceite

1. Regras devem aceitar vários tipos (ex.: minutos positivos).
2. Configurações devem ser persistidas.
3. Cálculo deve seguir regras automaticamente.

---

## **US-CP-PR-BH-006 – Configurar regras de débito**

**Como** administrador
**Quero** definir regras de débito automático
**Para** descontar atrasos, faltas e excessos de intervalo

### Critérios de Aceite

1. Regras devem aceitar vários eventos.
2. Débitos devem ser lançados automaticamente.
3. Relatório deve exibir movimentações.

---

## **US-CP-PR-BH-007 – Registrar histórico do banco**

**Como** sistema
**Quero** registrar todo movimento
**Para** permitir auditoria e rastreabilidade

### Critérios de Aceite

1. Cada evento deve gerar um item no histórico.
2. Deve conter tipo, valor, origem e timestamp.
3. Consultas devem retornar dados completos.

---

# # **Interface (UI)**

---

## **US-CP-PR-UI-001 – Converter checkboxes em toggles**

**Como** usuário
**Quero** que checkboxes antigos virem toggles modernos
**Para** melhorar a usabilidade

### Critérios de Aceite

1. Todos os checkboxes devem ser convertidos.
2. Estado deve refletir corretamente valores do banco.
3. Toggle deve ter rótulo claro.

---

## **US-CP-PR-UI-002 – Converter combos para Select**

**Como** usuário
**Quero** que combos sejam convertidos para `<Select />`
**Para** usar interface padronizada

### Critérios de Aceite

1. Todos os combos devem virar selects.
2. Opções devem ser carregadas corretamente.
3. Select não deve permitir valor inválido.

---

## **US-CP-PR-UI-003 – Máscara HH:MM**

**Como** usuário
**Quero** campos com máscara de horário
**Para** evitar erro de digitação

### Critérios de Aceite

1. Máscara deve permitir apenas dígitos válidos.
2. Inserção de caracteres proibidos deve ser bloqueada.
3. Formato final deve ser sempre `HH:MM`.

---

## **US-CP-PR-UI-004 – Botões da tela**

**Como** usuário
**Quero** ter os botões Salvar, Limpar e Sair
**Para** executar ações essenciais

### Critérios de Aceite

1. Botão salvar deve validar e persistir dados.
2. Botão limpar deve restaurar valores iniciais.
3. Botão sair deve fechar ou voltar à tela anterior.

---

## **US-CP-PR-UI-005 – Converter grid para DataGrid**

**Como** usuário
**Quero** ver tabelas convertidas para `<DataGrid />`
**Para** facilitar leitura e edição

### Critérios de Aceite

1. DataGrid deve renderizar com colunas corretas.
2. Edição inline (se existir) deve funcionar.
3. Scroll e paginação devem ser funcionais.

---

# # **Validações (VA)**

---

## **US-CP-PR-VA-001 – Impedir salvar sem obrigatórios**

**Como** sistema
**Quero** bloquear gravação de campos obrigatórios vazios
**Para** garantir integridade

### Critérios de Aceite

1. Campos obrigatórios devem ser marcados visualmente.
2. Tentativa de salvar sem eles deve exibir erro.
3. Nada deve ser persistido.

---

## **US-CP-PR-VA-002 – Validar formato HH:MM**

**Como** sistema
**Quero** validar horários inseridos
**Para** manter consistência

### Critérios de Aceite

1. Formato diferente de HH:MM deve bloquear o salvamento.
2. Valores fora do intervalo (ex.: 25:70) devem ser rejeitados.
3. Mensagem deve orientar correção.

---

## **US-CP-PR-VA-003 – Validar intervalos**

**Como** sistema
**Quero** rejeitar intervalos inconsistentes
**Para** evitar cálculos errados

### Critérios de Aceite

1. Mínimo > máximo deve gerar erro.
2. Valores negativos devem ser proibidos.
3. O sistema deve evitar gravação com erro.

---

## **US-CP-PR-VA-004 – Avisar banco de horas sem limites**

**Como** sistema
**Quero** alertar quando banco estiver ativo sem limites configurados
**Para** evitar acúmulo infinito

### Critérios de Aceite

1. Ativar banco sem limites deve gerar alerta.
2. Usuário deve confirmar se deseja continuar.
3. Nada deve ser salvo sem confirmação.

---

## **US-CP-PR-VA-005 – Avisar hora extra automática sem percentuais**

**Como** sistema
**Quero** alertar quando hora extra automática estiver ativa sem percentuais
**Para** evitar cálculos incorretos

### Critérios de Aceite

1. Sistema deve verificar existência dos percentuais.
2. Percentuais faltantes devem ser listados na mensagem.
3. Usuário deve confirmar antes de salvar.

---

## **US-CP-PR-VA-006 – Bloquear tolerâncias negativas**

**Como** sistema
**Quero** impedir valores negativos
**Para** manter coerência

### Critérios de Aceite

1. Qualquer valor negativo deve ser bloqueado instantaneamente.
2. Erro deve informar claramente o motivo.
3. Campo deve permanecer vazio ou com último valor válido.

---

# # **Persistência / Eventos (PE)**

---

## **US-CP-PR-PE-001 – Persistir via POST**

**Como** sistema
**Quero** persistir parâmetros através de POST `/api/cartao_ponto/parametros`
**Para** garantir padronização das APIs

### Critérios de Aceite

1. Endpoint deve receber payload completo.
2. Resposta deve conter confirmação de sucesso.
3. Falhas devem retornar erro detalhado.

---

## **US-CP-PR-PE-002 – Seguir modelo do payload**

**Como** sistema
**Quero** seguir o modelo definido para os parâmetros
**Para** garantir compatibilidade

### Critérios de Aceite

1. Payload deve ter estrutura validada antes de enviar.
2. Campos faltantes devem gerar erro.
3. Dados enviados devem refletir exatamente o estado da tela.

---

## **US-CP-PR-PE-003 – Emitir SSE ao atualizar**

**Como** sistema
**Quero** emitir evento SSE após atualização
**Para** notificar sistemas externos

### Critérios de Aceite

1. SSE deve seguir formato:

```json
{
  "type": "config-updated",
  "target": "cartao_ponto:parametros",
  "data": { "updated_by": "<usuario>", "timestamp": "<iso8601>" }
}
```

2. Evento deve ser enviado após sucesso da gravação.
3. Falha na emissão deve ser registrada em log.

---

# # **HISTÓRIAS DE USUÁRIO — PARAMETRIZAÇÃO DE EVENTOS POR EMPRESA**

---

# ## **US-CP-PE-001 — Acessar a tela de parametrização**

**Como** analista de folha
**Quero** acessar a tela “Parmetro de Evento de Empresa” com suas três abas
**Para** parametrizar corretamente os eventos utilizados no processo de exportação

### **Critérios de Aceite**

* **Dado** que estou no sistema
  **Quando** acessar o menu de parametrizações
  **Então** devo visualizar a tela “Parmetro de Evento de Empresa”.
* **E** a tela deve conter as abas **Cadastro**, **Empresa** e **Listagem**.
* **E** a tela deve exibir os botões: Incluir, Alterar, Excluir, Confirmar, Cancelar, Atualizar e Sair.
* **E** devo conseguir navegar entre as abas sem perder dados digitados em modo de edição.

---

# ## **US-CP-PE-002 — Parametrizar eventos na aba Cadastro**

**Como** analista responsável pela integração da folha
**Quero** selecionar os códigos de eventos referentes a horas extras, faltas, banco de horas e adicionais
**Para** garantir que a exportação utilize os eventos corretos exigidos pelo sistema de folha

### **Critérios de Aceite**

* **Dado** que estou na aba Cadastro
  **Quando** clicar em qualquer campo de evento
  **Então** devo poder digitar ou escolher um evento válido.
* Isso deve valer para:

  * Hora Extra Dia Normal
  * Hora Extra Domingos e Feriados
  * Hora Faltosa
  * Banco de Horas
  * Adicional Noturno
  * Adicional Noturno (Hora Extra)
* **E** o sistema deve validar obrigatoriedade de campos essenciais antes de salvar.
* **E** o sistema deve impedir duplicidade de eventos em categorias diferentes.
* **E** se um evento já estiver sendo usado em outra parametrização, o sistema deve alertar.

---

# ## **US-CP-PE-003 — Parametrizar campo Rede**

**Como** configurador do sistema
**Quero** definir o valor do campo Rede
**Para** estabelecer agrupamento ou classificação necessária para exportação

### **Critérios de Aceite**

* **Dado** que estou na aba Cadastro
  **Quando** acessar o campo Rede
  **Então** devo conseguir inserir um valor válido.
* **E** o sistema deve validar regras específicas do campo (tipo, formato, tamanho).
* **E** o valor deve ser salvo junto à parametrização.

---

# ## **US-CP-PE-004 — Selecionar a empresa**

**Como** gestor de parametrizações
**Quero** selecionar uma empresa ou aplicar parâmetros a todas
**Para** manter consistência nas regras usadas na exportação da folha

### **Critérios de Aceite**

* **Dado** que estou na aba Empresa
  **Quando** visualizar a lista de empresas
  **Então** devo conseguir selecionar qualquer uma delas.
* **Dado** que marco a opção “Todas”
  **Então** a seleção individual deve ser desabilitada.
* **E** a parametrização deve ser salva vinculada à(s) empresa(s) selecionada(s).
* **E** o sistema deve impedir parametrizações duplicadas para a mesma empresa.

---

# ## **US-CP-PE-005 — Consultar parametrizações na listagem**

**Como** usuário responsável por configurações
**Quero** visualizar uma listagem com todas as parametrizações
**Para** consultar, alterar ou excluir informações existentes

### **Critérios de Aceite**

* **Dado** que estou na aba Listagem
  **Quando** a tela carregar
  **Então** devo visualizar uma lista contendo empresa, eventos configurados, data de criação e alteração.
* **E** devo poder selecionar qualquer item da lista.
* **E** devo poder ordenar por qualquer coluna disponível.
* **E** ao clicar em Atualizar, a lista deve recarregar completamente.

---

# ## **US-CP-PE-006 — Incluir nova parametrização**

**Como** analista de folha
**Quero** incluir uma nova parametrização
**Para** que a exportação utilize corretamente eventos recém-definidos

### **Critérios de Aceite**

* **Dado** que estou na tela principal
  **Quando** clicar em Incluir
  **Então** todos os campos da aba Cadastro devem ser habilitados e limpos.
* **E** devo conseguir navegar até a aba Empresa para selecionar a empresa desejada.
* **E** ao clicar em Confirmar, o sistema deve validar e gravar a parametrização.
* **E** ao clicar em Cancelar, os valores devem ser descartados e retornar ao estado anterior.

---

# ## **US-CP-PE-007 — Alterar parametrização existente**

**Como** analista de folha
**Quero** alterar uma parametrização pré-existente
**Para** corrigir códigos ou ajustar regras de exportação

### **Critérios de Aceite**

* **Dado** que estou na aba Listagem
  **Quando** selecionar um registro e clicar em Alterar
  **Então** os campos da aba Cadastro devem exibir os dados atuais.
* **E** ao confirmar a alteração, o sistema deve validar e atualizar os registros.
* **E** o sistema deve impedir gravação se houver erros de duplicidade ou preenchimento inválido.

---

# ## **US-CP-PE-008 — Excluir parametrização**

**Como** usuário administrativo
**Quero** excluir uma parametrização existente
**Para** remover regras que não devem mais ser aplicadas

### **Critérios de Aceite**

* **Dado** que selecionei uma parametrização
  **Quando** clicar em Excluir
  **Então** o sistema deve solicitar confirmação.
* **E** somente após confirmação o sistema deve excluir o registro.
* **E** o registro removido não deve aparecer na listagem após atualização.

---

# ## **US-CP-PE-009 — Aplicar parametrizações na exportação**

**Como** sistema de exportação
**Quero** utilizar as parametrizações cadastradas para cada empresa
**Para** gerar corretamente os arquivos TXT, CSV, XLSX ou proprietários

### **Critérios de Aceite**

* **Dado** que uma exportação é iniciada
  **Quando** o sistema buscar os códigos de eventos
  **Então** deve utilizar exatamente os códigos parametrizados.
* **E** se houver ausência de eventos essenciais, a exportação deve ser bloqueada.
* **E** inconsistências devem ser registradas em log técnico.
* **E** toda alteração de parametrização deve ser auditável.

---

# ## **US-CP-PE-010 — Garantir fluxos operacionais de inclusão e alteração**

**Como** usuário do módulo
**Quero** seguir fluxos claros de inclusão e alteração de parametrizações
**Para** manter consistência no processo

### **Critérios de Aceite**

* **Fluxo de inclusão:**
  Incluir → Preencher Cadastro → Selecionar Empresa → Confirmar

  * Todos os passos devem ser obrigatórios.
  * O sistema deve validar todos os campos antes de confirmar.
* **Fluxo de alteração:**
  Selecionar registro → Alterar → Editar → Confirmar

  * Campos devem carregar valores previamente cadastrados.
  * O sistema deve bloquear gravação se validações falharem.

---

# ## **US-CP-PE-011 — Regras técnicas e integridade**

**Como** desenvolvedor ou administrador
**Quero** que o sistema siga regras técnicas de integridade
**Para** evitar problemas de concorrência ou erros de exportação

### **Critérios de Aceite**

* As parametrizações devem ser persistidas em tabela específica.
* O módulo de exportação deve consumir exatamente esses dados.
* O sistema não deve permitir que duas exportações simultâneas usem regras conflitantes.
* A gravação e alteração das parametrizações deve ser transacional.

---
# **Histórias de Usuário – Cadastro de Saldo Inicial do Banco de Horas**

---

# **1.0. Estrutura Geral do Formulário**

---

## **US-CP-SBH-UI-001 – Acessar a Tela de Cadastro**

**Como** operador do sistema  
**Quero** acessar a tela “Cadastro de Saldo Inicial do Banco de Horas” contendo as abas Cadastro e Listagem  
**Para** realizar o controle de saldos iniciais do banco de horas dos colaboradores

### **Critérios de Aceite**
- A tela deve exibir exatamente duas abas: **Cadastro** e **Listagem**.
- A tela deve carregar sem erros.
- Os elementos devem estar visíveis e acessíveis ao usuário.

---

## **US-CP-SBH-UI-002 – Utilizar Botões Operacionais**

**Como** operador  
**Quero** visualizar os botões: Incluir, Alterar, Excluir, Confirmar, Cancelar, Atualizar e Sair  
**Para** executar todas as operações necessárias no cadastro

### **Critérios de Aceite**
- Todos os botões devem estar presentes e habilitados corretamente.
- Cada botão deve responder ao clique com a ação correspondente.
- Botões devem seguir o padrão visual estabelecido pelo sistema.

---

## **US-CP-SBH-UI-003 – Cumprimento de Comportamento CRUD**

**Como** operador  
**Quero** que os botões sigam o comportamento padrão de CRUD  
**Para** garantir consistência operacional da aplicação

### **Critérios de Aceite**
- **Incluir:** habilita todos os campos editáveis.
- **Alterar:** habilita campos somente após seleção de registro.
- **Excluir:** requer confirmação antes de remover.
- **Confirmar:** salva dados no banco e retorna à visualização.
- **Cancelar:** reverte qualquer dado alterado.
- **Atualizar:** recarrega os dados da listagem.
- **Sair:** fecha a tela sem erros.

---

## **US-CP-SBH-UI-004 – Recalcular Saldo Automaticamente**

**Como** operador  
**Quero** marcar ou desmarcar o checkbox “Recalcular Saldo do Banco de Horas”  
**Para** decidir se o sistema deve recalcular automaticamente o saldo após alterações

### **Critérios de Aceite**
- Checkbox deve estar visível e funcional.
- Quando marcado, o sistema deve recacular automaticamente.
- Quando desmarcado, o cálculo não deve ocorrer.
- O sistema deve registrar a opção utilizada.

---

# **1.1. Aba Cadastro**

---

## **1.1.1. Identificação do Colaborador**

---

### **US-CP-SBH-CAD-001 – Exibir Código do Cargo**

**Como** operador  
**Quero** visualizar o campo "Código do Cargo"  
**Para** identificar corretamente o colaborador e sua função

### Critérios de Aceite
- O campo deve ser exibido sempre que a aba Cadastro for acessada.
- Os dados devem ser carregados a partir das informações do colaborador.
- O valor exibido deve ser correto e atualizado.

---

### **US-CP-SBH-CAD-002 – Exibir Descrição do Cargo**

**Como** operador  
**Quero** ver a descrição do cargo do colaborador  
**Para** confirmar a função associada antes de registrar o saldo

### Critérios de Aceite
- O campo deve ser somente leitura.
- A descrição deve corresponder ao cargo selecionado.
- A informação deve ser atualizada ao alterar o colaborador.

---

### **US-CP-SBH-CAD-003 – Visualizar Saldo Atual**

**Como** operador  
**Quero** visualizar o saldo atual do banco de horas do colaborador  
**Para** saber qual é o estado do acumulado antes de registrar um saldo inicial

### Critérios de Aceite
- O saldo atual deve ser exibido automaticamente.
- A informação deve ser precisa e atual.
- O campo deve ser somente leitura.

---

# **1.1.2. Seção "Mês / Ano"**

---

## **US-CP-SBH-CAD-004 – Exibir Seção Mês/Ano**

**Como** operador  
**Quero** visualizar a seção “Mês / Ano”  
**Para** determinar o períod

---

# **Histórias de Usuário – Cadastro do Modelo de REP**

## **US-CP-REP-001 – Registrar novo modelo de REP**

**Como** analista responsável pelo controle de dispositivos REP
**Quero** registrar um novo modelo de REP informando número interno, identificador AEJ e tipo
**Para** que o modelo fique disponível para parametrização e uso no sistema corporativo.

### **Critérios de Aceite**

#### **Cenário 1 – Cadastro válido**

* **Dado** que estou na tela de cadastro de REP
* **E** preenchi os campos *Número do REP*, *Identificador AEJ* e *Tipo*
* **Quando** eu clicar no botão de salvar
* **Então** o sistema deve registrar o novo modelo com sucesso
* **E** exibir mensagem de confirmação.

#### **Cenário 2 – Número do REP inválido**

* **Dado** que estou preenchendo o campo Número do REP
* **Quando** eu digitar caracteres “-” ou símbolos especiais
* **Então** o sistema deve automaticamente removê-los, aceitando apenas números.

#### **Cenário 3 – Tentativa de cadastro incompleto**

* **Dado** que estou na tela de cadastro
* **Quando** eu tentar salvar sem preencher Número do REP **ou** Identificador AEJ **ou** Tipo
* **Então** o sistema deve bloquear a gravação
* **E** exibir mensagem informando os campos obrigatórios pendentes.

---

## **US-CP-REP-002 – Registrar informações técnicas do equipamento**

**Como** técnico de TI responsável pelo parque de equipamentos
**Quero** informar todas as características técnicas do modelo de REP
**Para** garantir que o sistema conheça capacidade, memória, métodos de comunicação e limitações do equipamento.

### **Critérios de Aceite**

#### **Cenário 1 – Inclusão de dados técnicos**

* **Dado** que o modelo de REP já está criado
* **Quando** eu preencher informações de armazenamento, comunicação, relógio, MRP e limites de usuários
* **Então** o sistema deve vinculá-las corretamente ao modelo.

#### **Cenário 2 – Registro de versões de firmware**

* **Dado** que estou na aba de informações técnicas
* **Quando** eu incluir versões de firmware suportadas
* **Então** elas devem ser associadas ao modelo e aparecer no histórico de versões.

#### **Cenário 3 – Modelo descontinuado**

* **Dado** que um modelo foi marcado como descontinuado
* **Quando** eu acessar as informações técnicas
* **Então** os campos devem estar bloqueados para edição
* **E** as informações deverão estar disponíveis apenas para consulta.

---

## **US-CP-REP-003 – Registrar dados do fabricante**

**Como** administrador do sistema de ponto
**Quero** registrar dados completos do fabricante do REP
**Para** garantir rastreabilidade, conformidade e suporte adequado.

### **Critérios de Aceite**

#### **Cenário 1 – Cadastro de fabricante**

* **Dado** que estou cadastrando um modelo de REP
* **Quando** eu informar razão social, CNPJ, contato técnico e número de registro oficial
* **Então** o sistema deve validar e armazenar os dados.

#### **Cenário 2 – Histórico de modelos por fabricante**

* **Dado** que tenho fabricantes cadastrados
* **Quando** eu consultar um fabricante
* **Então** o sistema deve exibir todos os modelos associados.

#### **Cenário 3 – Registro de políticas de garantia**

* **Dado** que estou nos dados do fabricante
* **Quando** eu incluir políticas de garantia e manutenção
* **Então** o sistema deve permitir consulta e auditoria dessas informações.

---

## **US-CP-REP-004 – Configurar parâmetros de funcionamento**

**Como** analista técnico responsável pela integração
**Quero** parametrizar o funcionamento do modelo de REP
**Para** definir como o equipamento se comunica, coleta dados e trata falhas.

### **Critérios de Aceite**

#### **Cenário 1 – Configuração de comunicação**

* **Dado** que estou definindo parâmetros do modelo
* **Quando** selecionar protocolos, métodos de comunicação e controle de envio
* **Então** o sistema deve gravar corretamente as configurações.

#### **Cenário 2 – Modos de coleta**

* **Dado** que o modelo suporta múltiplos métodos (biometria, cartão, senha)
* **Quando** eu escolher as modalidades permitidas
* **Então** o sistema deve validar se o modelo realmente suporta essas modalidades.

#### **Cenário 3 – Parametrização de tratamento de falhas**

* **Dado** que um modelo pode armazenar marcações localmente
* **Quando** eu selecionar uma regra de falha (ex.: fila, buffer, retransmissão)
* **Então** o sistema deve associar essa regra ao modelo.

---

## **US-CP-REP-005 – Configurar layouts de integração**

**Como** analista responsável pelas integrações externas
**Quero** definir os layouts e protocolos utilizados pelo modelo de REP
**Para** garantir conformidade com legislação e compatibilidade com outros sistemas.

### **Critérios de Aceite**

#### **Cenário 1 – Associação de layouts**

* **Dado** que estou cadastrando um modelo
* **Quando** selecionar os layouts AFD, AFDT e AEJ suportados
* **Então** o sistema deve associá-los corretamente.

#### **Cenário 2 – Validação do identificador AEJ**

* **Dado** que o identificador AEJ é necessário
* **Quando** eu informar o valor
* **Então** o sistema deve verificar conformidade com padrões legais
* **E** garantir uso consistente nos arquivos gerados.

#### **Cenário 3 – Definição de endpoints e protocolos**

* **Dado** que o REP se integra via API/WebService
* **Quando** eu configurar URLs, mapeamentos e intervalos de sincronização
* **Então** o sistema deve persistir e validar esses dados.

---

## **US-CP-REP-006 – Gerenciar versões do modelo**

**Como** analista de manutenção
**Quero** registrar versões de hardware e firmware do modelo
**Para** manter histórico e garantir compatibilidade com funções do sistema.

### **Critérios de Aceite**

#### **Cenário 1 – Inclusão de nova versão**

* **Dado** que estou na seção de versões
* **Quando** eu cadastrar uma nova versão de hardware ou firmware
* **Então** ela deve ser automaticamente registrada no histórico.

#### **Cenário 2 – Descontinuação de versão**

* **Dado** que uma versão deve ser aposentada
* **Quando** eu informar a data de descontinuação
* **Então** o sistema deve impedir novas associações dessa versão a unidades.

#### **Cenário 3 – Registro de incompatibilidades**

* **Dado** que uma versão possui restrições
* **Quando** eu registrá-las
* **Então** elas devem constar em todas as consultas do modelo.

---

## **US-CP-REP-007 – Associar modelo de REP às unidades e empresas**

**Como** coordenador operacional
**Quero** vincular o modelo de REP às unidades organizacionais
**Para** garantir que cada local utilize modelos compatíveis com suas necessidades e legislação.

### **Critérios de Aceite**

#### **Cenário 1 – Associação a múltiplas unidades**

* **Dado** que tenho unidades cadastradas
* **Quando** eu selecionar unidades para vincular ao modelo
* **Então** o sistema deve permitir múltiplas associações.

#### **Cenário 2 – Verificação de restrições**

* **Dado** que estou vinculando uma unidade
* **Quando** a legislação local exigir requisitos específicos
* **Então** o sistema deve alertar caso o modelo não seja compatível.

#### **Cenário 3 – Múltiplas empresas**

* **Dado** que uma empresa compartilha infraestrutura com outras
* **Quando** vincular o modelo
* **Então** o sistema deve suportar o uso compartilhado sem duplicidade de registros.

---

## **US-CP-REP-008 – Manter histórico e manutenção dos modelos**

**Como** técnico de suporte
**Quero** registrar ocorrências, atualizações e substituições
**Para** manter histórico completo e garantir rastreabilidade da vida útil do modelo.

### **Critérios de Aceite**

#### **Cenário 1 – Registro de manutenção**

* **Dado** que um modelo passou por reparo ou substituição
* **Quando** eu incluir um registro de manutenção
* **Então** ele deve ser salvo no histórico do modelo.

#### **Cenário 2 – Inclusão de novos modelos homologados**

* **Dado** que um novo modelo surge no mercado
* **Quando** eu cadastrá-lo
* **Então** o sistema deve registrá-lo sem afetar modelos existentes.

#### **Cenário 3 – Desativação de modelo obsoleto**

* **Dado** que um modelo não deve mais ser utilizado
* **Quando** eu marcá-lo como inativo
* **Então** o sistema deve impedir sua vinculação a novas unidades.

---

## **US-CP-REP-009 – Garantir conformidade legal**

**Como** auditor interno
**Quero** validar que os modelos de REP estão em conformidade com normas do MTE/MTP
**Para** assegurar que os equipamentos utilizados estão dentro das exigências legais.

### **Critérios de Aceite**

#### **Cenário 1 – Registro de certificados**

* **Dado** que o modelo possui certificado de conformidade
* **Quando** eu anexar ou registrar o certificado
* **Então** o sistema deve armazená-lo com rastreabilidade total.

#### **Cenário 2 – Auditoria de alterações**

* **Dado** que mudanças legislativas podem ocorrer
* **Quando** os parâmetros do modelo forem atualizados
* **Então** o sistema deve registrar quem alterou, quando e o motivo.

#### **Cenário 3 – Validação contínua**

* **Dado** que um modelo possui identificador AEJ utilizado em layouts legais
* **Quando** o sistema gerar AFD, AFDT ou AEJ
* **Então** deve garantir que o identificador está conforme normas vigentes.

---

### HISTÓRIAS DE USUÁRIO – 2.2. PROCESSAMENTO DE MARCAÇÕES

#### História 1 – Calcular horas trabalhadas
Como gestor de ponto  
Quero que o sistema calcule automaticamente as horas trabalhadas a partir das batidas  
Para que o cartão de ponto reflita corretamente o tempo de trabalho do colaborador

**Critérios de aceite**
- O cálculo deve ser feito após a importação das batidas.
- O sistema deve considerar horários definidos na jornada do colaborador.
- O valor calculado deve aparecer no cartão de ponto.
- Se houver falhas de batidas, o sistema deve continuar o cálculo e sinalizar o problema.

---

#### História 2 – Calcular intervalos
Como analista de RH  
Quero que o sistema calcule os intervalos de descanso e refeição  
Para garantir que os colaboradores cumpram as exigências legais e do contrato

**Critérios de aceite**
- Deve identificar início e término dos intervalos com base nas batidas.
- Deve registrar o tempo total de intervalo por dia.
- Deve emitir alerta se o intervalo obrigatório não for cumprido.
- O resultado deve aparecer no cartão de ponto.

---

#### História 3 – Identificar e calcular horas extras
Como gestor  
Quero que o sistema calcule automaticamente as horas excedentes à jornada  
Para apoiar conferências e pagamentos de horas extras

**Critérios de aceite**
- Deve considerar a jornada contratual e as tolerâncias configuradas.
- Deve registrar as horas extras no cartão de ponto e no banco de dados.
- Deve indicar claramente o período que gerou o excedente.
- Se uma escala especial for aplicada, deve refletir o cálculo correto.

---

#### História 4 – Calcular horas negativas
Como usuário do sistema  
Quero que o sistema identifique a falta de horas trabalhadas  
Para que seja possível compensar ou descontar conforme política da empresa

**Critérios de aceite**
- Se o colaborador trabalhar menos que o previsto, deve registrar horas negativas.
- Deve considerar tolerâncias configuradas antes de gerar o débito.
- O valor gerado deve aparecer no cartão de ponto.

---

#### História 5 – Atualizar banco de horas
Como gestor de departamento  
Quero que o sistema atualize automaticamente o banco de horas após o cálculo  
Para que o saldo fique sempre atualizado e reflita a jornada real

**Critérios de aceite**
- Deve somar horas extras e subtrair horas negativas conforme regras definidas.
- O saldo deve ficar disponível para consulta no cartão de ponto.
- Deve armazenar histórico diário para auditoria.

---

#### História 6 – Aplicar regras de tolerância
Como administrador do sistema  
Quero que o processamento respeite as tolerâncias configuradas  
Para evitar geração desnecessária de horas extras ou negativas por pequenas variações

**Critérios de aceite**
- A tolerância de entrada, saída e intervalo deve ser aplicada aos cálculos.
- As marcações dentro da tolerância não devem gerar hora extra ou déficit.
- O sistema deve registrar o impacto da tolerância no cálculo.

---

#### História 7 – Aplicar escalas configuradas
Como analista de ponto  
Quero que o sistema processe as batidas com base na escala vinculada ao colaborador  
Para que o cálculo reflita corretamente o tipo de jornada praticada

**Critérios de aceite**
- Deve considerar escalas fixas, revezamento, 12x36 e outras configuradas.
- O cálculo deve se adaptar automaticamente ao tipo de escala.
- Se não houver escala vinculada, deve registrar aviso para conferência.

---

#### História 8 – Aplicar horários e regras de jornada
Como gestor  
Quero que o sistema processe horas considerando o horário definido para cada colaborador  
Para garantir que os cálculos estejam alinhados ao contrato de trabalho

**Critérios de aceite**
- Deve considerar horário de entrada, saída e intervalos formais.
- Deve comparar batidas reais com os horários definidos.
- Alterações de horário devem impactar o cálculo imediatamente.

---

#### História 9 – Processar jornadas especiais (noturnas)
Como gestor de RH  
Quero que o sistema calcule corretamente jornadas que envolvem período noturno  
Para atender regras de adicional e contagem diferenciada

**Critérios de aceite**
- Deve aplicar regras como tempo reduzido por hora noturna, quando aplicável.
- Deve registrar adicional quando previsto.
- Deve registrar jornada noturna separadamente no cartão de ponto.

---

### HISTÓRIAS DE USUÁRIO – DIGITAÇÃO MANUAL DE PONTO - 2.3. Digitação Manual de Ponto

#### História 1 – Registrar marcações manualmente
Como usuário autorizado  
Quero poder registrar batidas manualmente  
Para corrigir situações em que o colaborador não registrou o ponto da forma normal

**Critérios de aceite**
- O sistema deve permitir digitação manual apenas para usuários com permissão.
- Deve registrar data, hora, matrícula e tipo de batida.
- Deve exigir o motivo da inclusão antes de salvar.
- A marcação digitada deve aparecer no cartão de ponto como lançamento manual.

---

#### História 2 – Manter histórico de marcações originais
Como gestor de RH  
Quero que ao inserir uma batida manual o sistema não apague a original  
Para garantir rastreabilidade e evitar perda de informação

**Critérios de aceite**
- A marcação original deve permanecer registrada.
- A nova marcação deve ser adicionada sem alterar o dado original.
- O cartão de ponto deve indicar que existe mais de uma marcação para análise.

---

#### História 3 – Gravar informações para auditoria
Como auditor interno  
Quero que o sistema registre todas as informações relevantes da alteração  
Para garantir transparência sobre quem modificou o ponto e por qual motivo

**Critérios de aceite**
- Para cada inclusão manual o sistema deve armazenar:
  - Valor anterior (se existir)  
  - Novo valor  
  - Usuário responsável  
  - Motivo informado  
  - Data e hora da alteração  
- O histórico deve poder ser consultado sempre que necessário.
- Nenhuma alteração manual deve ficar sem motivo preenchido.

---

### HISTÓRIAS DE USUÁRIO – SOLICITAÇÃO DE AJUSTE - 2.4. Solicitação de Ajuste

#### História 1 – Solicitar ajuste no cartão de ponto
Como colaborador  
Quero solicitar correções quando identificar erros no cartão de ponto  
Para garantir que meu registro de jornada reflita corretamente o que aconteceu

**Critérios de aceite**
- O colaborador deve selecionar o dia e o tipo de ajuste desejado.
- O sistema deve exigir uma justificativa antes de enviar.
- Após enviar, o registro deve ficar como aguardando aprovação.
- A solicitação deve aparecer na lista do gestor responsável.

---

#### História 2 – Analisar ajustes enviados
Como gestor  
Quero receber as solicitações de ajustes dos colaboradores  
Para avaliar cada caso e aprovar ou recusar de acordo com as regras da empresa

**Critérios de aceite**
- O gestor deve visualizar todas as solicitações pendentes.
- Deve ser possível aprovar ou recusar com justificativa.
- Ao decidir, o sistema deve atualizar o status do pedido.
- O colaborador deve ser notificado da decisão.

---

#### História 3 – Encaminhar ajuste para o RH
Como gestor  
Quero encaminhar uma solicitação para o RH quando não puder decidir  
Para que situações especiais sejam avaliadas pela área responsável

**Critérios de aceite**
- Deve haver opção para encaminhar a solicitação para o RH.
- O status deve mudar para encaminhado ao RH.
- O RH deve receber o pedido para análise.
- A decisão final deve ser registrada no sistema.

---

#### História 4 – Acompanhar o andamento da solicitação
Como colaborador  
Quero acompanhar o status dos ajustes que enviei  
Para saber se já foram aprovados ou se ainda estão em análise

**Critérios de aceite**
- O colaborador deve visualizar o histórico de status de cada solicitação.
- Devem aparecer: aguardando aprovação, aprovado, recusado ou encaminhado ao RH.
- A justificativa da decisão deve ficar disponível para consulta.

---

### HISTÓRIAS DE USUÁRIO – APLICAÇÃO DE AJUSTES NO CARTÃO - 2.5. Aplicação de Ajustes no Cartão

#### História 1 – Aplicar ajuste após aprovação
Como sistema  
Quero aplicar automaticamente o ajuste aprovado no cartão de ponto  
Para que a marcação seja atualizada sem necessidade de intervenção manual

**Critérios de aceite**
- O sistema só deve aplicar ajustes que estejam aprovados.
- Ao aplicar, deve gravar a nova marcação junto da original.
- O cartão de ponto deve refletir imediatamente o resultado da alteração.
- Nenhuma marcação original deve ser apagada.

---

#### História 2 – Registrar informações de auditoria
Como auditor interno  
Quero que cada ajuste aplique um registro completo de auditoria  
Para garantir rastreabilidade e transparência no histórico de ponto

**Critérios de aceite**
- O registro deve armazenar:
  - Marcação original  
  - Nova marcação  
  - Data e hora da alteração  
  - Usuário responsável  
  - Justificativa da mudança  
- Esses dados devem ser consultáveis a qualquer momento.
- Nenhum ajuste pode ser aplicado sem que todos os campos estejam preenchidos.

---

#### História 3 – Reprocessar cálculos após ajuste
Como gestor de RH  
Quero que o sistema recalcule automaticamente o cartão de ponto  
Para que os relatórios, banco de horas e totais reflitam a alteração aplicada

**Critérios de aceite**
- Após aplicar o ajuste, o sistema deve reprocessar:
  - Horas trabalhadas  
  - Intervalos  
  - Horas extras  
  - Horas negativas  
  - Banco de horas  
- O reprocessamento deve ocorrer sem intervenção humana.
- O cartão de ponto deve apresentar o resultado do recálculo.

---

#### História 4 – Atualizar relatórios
Como usuário do sistema  
Quero que os relatórios sejam atualizados depois que o ajuste for aplicado  
Para que os dados exibidos estejam consistentes com o novo cálculo

**Critérios de aceite**
- Relatórios de ponto, horas extras e banco de horas devem refletir o ajuste.
- O sistema deve atualizar os relatórios imediatamente após o reprocessamento.
- Consultas históricas também devem considerar os ajustes aplicados.

---


# Histórias de Usuário – Apuração / Fechamento Mensal

---

## 2.6. Apuração / Fechamento Mensal

---

### US-CP-FECH-EX-001 – Realizar fechamento mensal
**Como** gestor de ponto  
**Quero** executar o fechamento do mês  
**Para** consolidar as horas dos colaboradores e oficializar os resultados.

**Critérios de Aceite**
* O fechamento deve considerar todos os cálculos do período:
  * Horas trabalhadas  
  * Horas extras  
  * Horas negativas  
  * Saldo do banco de horas  
  * Faltas  
  * Ausências justificadas
* Se houver pendências que impeçam o fechamento, o sistema deve alertar antes de finalizar.
* Após concluir, o período deve ficar bloqueado para edição.

---

### US-CP-FECH-BL-002 – Bloquear alterações após fechamento
**Como** auditor ou gestor  
**Quero** que o período fechado não aceite novos lançamentos ou ajustes  
**Para** garantir que os números consolidados não sejam alterados indevidamente.

**Critérios de Aceite**
* Após o fechamento, inclusão manual, ajustes e alterações devem ser bloqueados.
* Deve existir a opção de reabrir o período somente para usuários com permissão.
* Caso reabra, o sistema deve registrar data, hora e usuário que realizou a ação.

---

### US-CP-FECH-IN-003 – Impedir fechamento com inconsistências
**Como** gestor  
**Quero** que o sistema impeça o fechamento se houver pendências que afetam o cálculo  
**Para** evitar resultados incorretos e retrabalho.

**Critérios de Aceite**
* O sistema deve bloquear o fechamento se existirem:
  * Batidas faltantes  
  * Ajustes pendentes de aprovação  
  * Inconsistências apontadas pelo processamento
* Deve exibir uma lista com cada pendência encontrada.
* O fechamento só deve ser permitido após todas as correções.

---

### US-CP-FECH-HI-004 – Armazenar histórico de fechamento
**Como** auditor interno  
**Quero** que o sistema registre histórico completo de cada fechamento  
**Para** garantir consulta e rastreabilidade no futuro.

**Critérios de Aceite**
* O sistema deve guardar:
  * Data do fechamento  
  * Usuário responsável  
  * Período fechado  
  * Totais consolidados
* O histórico deve estar disponível para consulta posterior.
* Os registros devem ser mantidos por no mínimo 12 meses.

---

# Histórias de Usuário – Trilha de Alterações de Ponto

---

## 3.1 Trilha de Alterações de Ponto

---

### US-TAP-INT-001 – Iniciar interface de alteração de ponto
**Como** operador de folha ou gestor de ponto  
**Quero** abrir a interface de Ocorrência de Alteração de Ponto para um funcionário e data específica  
**Para** visualizar as informações atuais e incluir, editar ou excluir ocorrências.

**Critérios de Aceite**
* Ao informar IdFuncionario e Data, o sistema apresenta:
  * Nome do funcionário e data no formato dd/MM/yyyy.
  * Flags de períodos (1 a 4) habilitadas apenas quando houver entrada ou saída cadastrada na tabela de digitação para o turno correspondente.
  * Lista com as ocorrências já registradas para aquela data, consultadas na tabela de transição.
* A interface deve carregar os turnos consultando a tabela de digitação filtrada por data e período.
* Se ocorrer falha no carregamento, o sistema exibe mensagem clara e registra o erro para auditoria.

---

### US-TAP-INC-002 – Incluir ocorrência de alteração de ponto
**Como** operador de folha  
**Quero** incluir uma ocorrência indicando quais marcações serão ajustadas  
**Para** que o cálculo do cartão seja atualizado corretamente.

**Critérios de Aceite**
* O usuário deve selecionar a fonte da marcação (I, P, X, T), sendo permitida apenas uma.
* Deve ser possível marcar qualquer combinação de entradas e saídas dos turnos disponíveis.
* Ao salvar, o sistema valida se já existe ocorrência para o mesmo funcionário, data e períodos. Em caso positivo, exibe mensagem e bloqueia o cadastro.
* A gravação persiste:
  * id_funcionario  
  * data  
  * primeiro_periodo  
  * segundo_periodo  
  * terceiro_periodo  
  * quarto_periodo  
  * tipo_ocorrencia  
  * observacao
* Campos obrigatórios: fonte da marcação e pelo menos uma marcação de período ou seleção de batidas excedentes.
* Mensagens de validação são exibidas em português (ex.: “Selecione uma fonte de marcação!”).

---

### US-TAP-EXC-003 – Registrar exclusão de batidas excedentes
**Como** operador de folha  
**Quero** registrar que batidas além do permitido devem ser excluídas  
**Para** que o sistema considere a remoção no processamento.

**Critérios de Aceite**
* Se “Batidas Excedentes” for marcado, o sistema desabilita a seleção de entradas e saídas e exibe mensagem caso o usuário tente selecionar ambos (“Não é possível marcar exclusão de batidas excedentes ao alterar algum período!”).
* O registro é salvo com os períodos em branco e tipo de ocorrência correspondente.
* A verificação de duplicidade também se aplica a este tipo de registro.

---

### US-TAP-DEL-004 – Excluir ocorrência registrada
**Como** operador de folha  
**Quero** excluir uma ocorrência existente  
**Para** remover registros inválidos ou revogados.

**Critérios de Aceite**
* A exclusão usa chave composta: data, id_funcionario, flags de período e tipo de ocorrência.
* Após excluir, a lista é atualizada.
* A exclusão é realizada dentro de transação. Em caso de erro, o sistema desfaz a operação e apresenta mensagem informativa.
* A exclusão é registrada na trilha de alterações contendo:
  * marcação original  
  * marcação excluída  
  * usuário responsável  
  * data e hora  
  * motivo, se informado

---

### US-TAP-LOT-005 – Repetir lançamentos em lote
**Como** operador de folha  
**Quero** replicar uma ocorrência para um intervalo de datas  
**Para** evitar lançamentos repetidos manualmente.

**Critérios de Aceite**
* Devem existir:
  * Flag “Repetir Lançamentos”
  * Campo “DiaFimRepetirLancamentos”
* Quando habilitado, o sistema:
  * Remove ocorrências pré-existentes no intervalo para o mesmo funcionário.
  * Insere para cada dia do período uma cópia da ocorrência modelo.
* A operação é transacional. Se qualquer etapa falhar, tudo é revertido e mensagem clara é exibida.
* O sistema deve mostrar aviso indicando a data final da repetição conforme exibido no VB6.

---

### US-TAP-VIS-006 – Visualizar comparação entre original e alterado
**Como** gestor ou operador  
**Quero** visualizar lado a lado a marcação original e a alterada  
**Para** revisar informações com segurança.

**Critérios de Aceite**
* A tela exibe:
  * marcação original por período  
  * marcação alterada por período  
  * usuário que realizou a alteração  
  * data, hora e motivo
* A comparação deve destacar diferenças de forma visual.
* Usuário pode ordenar ou filtrar por:
  * data  
  * tipo de ocorrência  
  * usuário  
  * alteração

---

### US-TAP-FIL-007 – Aplicar filtros avançados
**Como** auditor ou gestor  
**Quero** filtrar alterações por critérios detalhados  
**Para** localizar rapidamente ocorrências específicas.

**Critérios de Aceite**
* Filtros disponíveis:
  * id_funcionario  
  * nome  
  * data do ponto  
  * intervalo de data da alteração  
  * usuário  
  * tipo de ocorrência  
  * período afetado  
  * texto em observação
* Os filtros podem ser combinados conforme interface (AND e OR).
* Resultados devem ser paginados.
* Consultas até 100 mil registros devem responder em menos de três segundos.

---

### US-TAP-DUP-008 – Validar duplicidade antes de inserir
**Como** desenvolvedor ou testador  
**Quero** validar ocorrências duplicadas antes do insert  
**Para** evitar múltiplos lançamentos idênticos.

**Critérios de Aceite**
* A verificação considera:
  * data  
  * id_funcionario  
  * primeiro ao quarto período
* Se já existir, o sistema cancela a operação e exibe mensagem (ex.: “Ocorrência já existe para este período/data.”).
* A validação ocorre tanto no cadastro manual quanto em operações de lote.

---

### US-TAP-OBS-009 – Observação padrão e edição
**Como** operador  
**Quero** que o campo observação seja preenchido automaticamente com “AJUSTE” e possa ser alterado  
**Para** pontofacilr o preenchimento mantendo registro descritivo.

**Critérios de Aceite**
* Ao abrir o formulário, o campo observação recebe o texto “AJUSTE”.
* O usuário pode editar livremente antes de confirmar.
* A observação é salva e exibida na trilha e na tela de comparação.

---

### US-TAP-SEC-010 – Controle de segurança e permissões
**Como** administrador  
**Quero** definir quem pode visualizar, incluir, editar e excluir registros  
**Para** manter segurança e conformidade.

**Critérios de Aceite**
* Devem existir permissões separadas:
  * visualizar_trilha  
  * inserir_ocorrencia  
  * excluir_ocorrencia  
  * repetir_lotes
* Todas as operações são auditadas com:
  * usuário  
  * data e hora  
  * IP (se disponível)  
  * tipo de operação  
  * dados antes e depois
* Operações sensíveis, como exclusão em lote, exigem confirmação e justificativa.

---

# Histórias de Usuário – Registrar importação de arquivo

---

## 3.2 Registrar importação de arquivo

---

### US-CP-IMP-001 – Registrar importação de arquivo

**Como** analista de folha (ou responsável por importação)  
**Quero** que o sistema gere automaticamente um registro sempre que um arquivo de batidas for processado  
**Para** permitir auditoria sobre quais arquivos foram utilizados, quantas batidas entraram e quem executou a operação

**Critérios de Aceite**  
- Ao concluir a importação o sistema registra no log:
  - Nome do arquivo  
  - Quantidade total de linhas lidas  
  - Quantidade importada com sucesso  
  - Quantidade rejeitada  
  - Quantidade de erros encontrados  
  - Data e hora da importação  
  - Usuário responsável  
- O registro é imutável e não pode ser apagado ou sobrescrito sem gerar novo registro de ajuste  
- O registro deve estar acessível na tela de logs com os mesmos dados gravados  
- Logs ficam vinculados ao lote de batidas importadas  
- Exemplo de teste:
  - Arquivo de 100 linhas com 5 inválidas gera:
    - Lidas: 100
    - Importadas: 95
    - Rejeitadas: 5

---

### US-CP-IMP-002 – Registrar erros e batidas rejeitadas

**Como** operador de importação  
**Quero** que o sistema registre detalhadamente cada erro encontrado  
**Para** analisar e corrigir falhas de conteúdo ou formato do arquivo de marcações

**Critérios de Aceite**  
- Para cada linha com erro o sistema registra:
  - Linha de origem  
  - Tipo de erro (formato inválido, colaborador não encontrado, duplicidade etc.)  
  - Ação tomada (rejeitada, corrigida automaticamente, pendente)  
- Tela de logs permite visualizar os erros com paginação e filtro por tipo  
- Erros críticos impedem a importação e geram status “Falha total”  
- Teste:
  - Arquivo com três tipos de erro deve mostrar cada linha com motivo e ação

---

### US-CP-IMP-003 – Visualizar histórico de importações

**Como** gestor de pessoal  
**Quero** filtrar e visualizar o histórico de importações  
**Para** auditar operações passadas e identificar falhas recorrentes

**Critérios de Aceite**  
- Filtros disponíveis:
  - Intervalo de datas  
  - Usuário  
  - Nome de arquivo  
  - Status (Concluída, Parcial, Falha)  
- Listagem exibe:
  - Data e hora  
  - Usuário  
  - Nome do arquivo  
  - Quantidade lida  
  - Importadas  
  - Rejeitadas  
  - Erros  
  - Link para detalhes  
- Ordenação e paginação disponíveis  
- Exportação para CSV/XLSX preserva todas as colunas  
- Teste:
  - Filtro por usuário X exibe apenas importações feitas por X

---

### US-CP-IMP-004 – Registrar ajustes manuais

**Como** operador com permissão  
**Quero** que cada ajuste manual gere um registro de log  
**Para** permitir auditoria completa sobre quem alterou o ponto e por qual motivo

**Critérios de Aceite**  
- Registro inclui:
  - Id do ajuste  
  - Funcionário afetado  
  - Data do ponto  
  - Campos alterados  
  - Valor anterior  
  - Valor novo  
  - Tipo de operação  
  - Motivo  
  - Data e hora  
  - Usuário  
- Registro não pode ser alterado; novos ajustes geram novos registros  
- Ajustes em lote devem registrar todos os dias afetados  
- Teste:
  - Alterar período de vazio para “E” gera registro com “antes = vazio” e “depois = E”

---

### US-CP-IMP-005 – Consultar log de ajustes

**Como** auditor interno  
**Quero** consultar os ajustes com filtros por colaborador, período e usuário  
**Para** verificar e compreender as alterações feitas no ponto

**Critérios de Aceite**  
- Listagem exibe:
  - Id  
  - Data e hora  
  - Usuário  
  - Colaborador  
  - Data do ponto  
  - Campo alterado  
  - Valor antes  
  - Valor depois  
  - Motivo  
- Filtros disponíveis:
  - Colaborador  
  - Intervalo de datas  
  - Usuário  
  - Tipo de ajuste  
- É possível abrir o detalhe e visualizar o antes/depois e cadeia de alterações  
- Exportação para CSV/XLSX inclui todas as informações  
- Teste:
  - Buscar colaborador Y no mês Z retorna apenas ajustes daquele período

---

### US-CP-IMP-006 – Rastrear relação entre importações e ajustes

**Como** gestor  
**Quero** relacionar ajustes a suas respectivas importações  
**Para** reconstruir a origem dos dados e todo o fluxo de alterações

**Critérios de Aceite**  
- Ajustes feitos sobre batidas importadas referenciam:
  - A importação de origem
  - O registro ou linha de origem  
- Tela de detalhes da importação mostra os ajustes relacionados  
- Tela de ajustes também exibe a importação associada  
- Teste:
  - Importar arquivo, ajustar uma batida rejeitada e confirmar vínculo nos dois lados

---

### US-CP-IMP-007 – Exportar logs e relatórios

**Como** analista de RH  
**Quero** exportar logs em CSV, XLSX ou PDF  
**Para** usar em auditorias ou envio para folha

**Critérios de Aceite**  
- Exportação permite definir:
  - Período  
  - Tipo de log (importação, ajuste ou ambos)  
  - Colunas incluídas  
- Arquivo exportado preserva datas e cabeçalho com filtros e data de emissão  
- Teste:
  - Exportar 50 registros em CSV e abrir no Excel sem perda de dados

---

### US-CP-IMP-008 – Controlar acesso a logs

**Como** administrador  
**Quero** restringir o acesso e registrar tentativas não permitidas  
**Para** manter integridade e segurança das informações

**Critérios de Aceite**  
- Sistema define permissões separadas para:
  - Visualizar logs  
  - Importar  
  - Ajustar ponto  
  - Exportar  
  - Apagar (somente com processo formal e auditado)  
- Ação sem permissão deve ser registrada com:
  - Usuário  
  - Data e hora  
  - Recurso acessado  
- Teste:
  - Usuário sem permissão tenta ajustar ponto e operação é bloqueada e registrada

---

### US-CP-IMP-009 – Garantir integridade e retenção dos logs

**Como** responsável por compliance  
**Quero** políticas de retenção e proteção dos logs  
**Para** cumprir normas legais e evitar manipulação indevida

**Critérios de Aceite**  
- Logs são imutáveis por padrão  
- Qualquer mudança gera um registro de “ajuste de log”  
- Retenção configurável (exemplo: 7 anos)  
- Possibilidade de exportar arquivos arquivados  
- Teste:
  - Tentar editar um registro direto e ver que:
    - A operação é bloqueada
    - Um evento de tentativa é registrado

---

# Histórias de Usuário – Visualizar histórico de importações

---

## História 3.2.3 — Visualizar histórico de importações

Como gestor de pessoal,
Quero filtrar e visualizar o histórico de importações por período, usuário, status e arquivo,
Para auditar operações passadas e identificar eventos suspeitos ou falhas recorrentes.

Critérios de aceite

A tela de histórico permite filtros por intervalo de datas, usuário responsável, nome do arquivo e status da importação (Concluída, Parcial, Falha).

Resultado do filtro exibe colunas: data/hora, usuário, nome do arquivo, quantidade lida, importadas, rejeitadas, erros, e link para detalhes.

Paginação eficiente e ordenação por data.

Exportar resultados do filtro para CSV/XLSX preserva todas as colunas exibidas.

Teste: aplicar filtro por usuário X e confirmar que só aparecem importações executadas por X.

---

# Histórias de Usuário – Registrar ajustes manuais (ocorrências de alteração do ponto)

---

## História 3.2.4 — Registrar ajustes manuais (ocorrências de alteração do ponto)

Como operador de ponto com permissão,
Quero que toda alteração manual no cartão de ponto (inclusão, exclusão, alteração de período) gere um registro de ajuste no log,
Para manter um rastro auditável de quem alterou, quando, o que foi alterado e por que.

Critérios de aceite

Ao salvar qualquer ocorrência de alteração do ponto (inclusão/exclusão/edição) o sistema cria um registro de ajuste contendo: identificador do ajuste, id do funcionário afetado, data do ponto alterado, campos alterados (por exemplo: primeiro_periodo, segundo_periodo, etc.), valor antes, valor depois, tipo da ocorrência (I/P/X/T conforme domínio), observação/motivo, data/hora do ajuste e usuário responsável.

Não é permitido sobrescrever o histórico do ajuste; alterações adicionais geram novo registro de ajuste que referencia o anterior.

Teste: alterar primeiro período de vazio para 'E' gera um registro com valor antes = vazio e valor depois = 'E' e a observação informada.

Ajustes originados de operações em lote (repetição de lançamentos) também devem gerar registros individuais por dia afetado, ou registrar claramente que foi operação em lote com lista de dias afetados.

---

# Histórias de Usuário – Visualizar e consultar log de ajustes

---

## História 3.2.5 — Visualizar e consultar log de ajustes

Como auditor interno,
Quero consultar o log de ajustes com filtros (por colaborador, por período, por campo alterado, por usuário que ajustou),
Para validar a correção do ponto e investigar causas de divergência na folha.

Critérios de aceite

A interface de consulta exibe lista de ajustes com colunas: id ajuste, data/hora, usuário, colaborador, data do ponto, campos alterados, valor antes, valor depois, motivo.

Filtros disponíveis: id colaborador, nome, intervalo de data do ponto, intervalo de data do ajuste, usuário que ajustou, tipo de ajuste.

É possível abrir o detalhe de um ajuste e ver o diff (valor antes / valor depois) e a cadeia de eventos se houver ajustes subsequentes.

Exportar o resultado para CSV/XLSX inclui todas as informações do detalhe.

Teste: buscar ajustes do colaborador Y no mês Z retorna somente registros daquele colaborador e período.

---

# Histórias de Usuário – Rastreabilidade entre importações e ajustes

---

## História 3.2.6 — Rastreabilidade entre importações e ajustes

Como gestor de sistema,
Quero links entre o log de importação e quaisquer ajustes feitos sobre batidas importadas (incluindo rejeições corrigidas manualmente),
Para entender a origem das alterações e reconstruir o fluxo de dados.

Critérios de aceite

Quando um ajuste é efetuado sobre uma batida resultante de uma importação, o ajuste referencia o id da importação e a linha/registro importado.

A interface de detalhes de importação mostra os ajustes relacionados e, reciprocamente, o detalhe do ajuste mostra a importação de origem quando aplicável.

Teste: importar um arquivo, editar uma batida rejeitada, e confirmar que a edição aparece vinculada ao registro de importação original.

---

# Histórias de Usuário – Exportar logs e relatórios de auditoria

---

## História 3.2.7 — Exportar logs e relatórios de auditoria

Como analista de RH,
Quero exportar logs de importação e ajustes em formatos padrão (CSV, XLSX, PDF),
Para anexar aos processos de auditoria, ou enviar para folha/contabilidade.

Critérios de aceite

Exportação oferece opções: período (data inicial/final), tipos de log (importação, ajuste ou ambos), e colunas selecionáveis.

Arquivo exportado preserva a integridade dos campos (datas em formato ISO ou dd/mm/yyyy conforme configuração) e inclui cabeçalho com filtros aplicados e data/hora da exportação.

Teste: exportar um relatório de 50 registros em CSV e abrir em Excel sem perda de dados.

---

# Histórias de Usuário – Controle de acesso a logs e operações de ajuste

---

## História 3.2.8 — Controle de acesso a logs e operações de ajuste

Como administrador de TI,
Quero restringir visualização e execução de ajustes a perfis autorizados, e registrar tentativas de acesso negado,
Para garantir conformidade e segurança dos dados sensíveis.

Critérios de aceite

Sistema tem roles/permissões que definem: visualizar logs, executar importação, executar ajustes manuais, exportar logs, e apagar logs (apagar apenas via processo formal e também auditado).

A tentativa de acessar telas ou executar ações sem permissão é registrada com usuário, data/hora e recurso solicitado.

Teste: usuário sem permissão tenta incluir ajuste e recebe bloqueio; evento aparece no log de segurança.

---

# Histórias de Usuário – Integridade e retenção dos logs

---

## História 3.2.9 — Integridade e retenção dos logs

Como responsável por compliance,
Quero regras de retenção e integridade para logs que impeçam alteração não registrada e definam tempo de arquivamento,
Para cumprir políticas internas e legais.

Critérios de aceite

Logs são imutáveis por padrão; qualquer operação que altere a visão do log gera um registro de “ajuste de log” com motivo e usuário.

Política de retenção configurável por administrador (ex.: 7 anos), com processos de arquivamento automático e possibilidade de exportar para repositório externo.

Teste: tentar editar um registro de importação diretamente falha; criação de ajuste de log registra o evento.

---

## **Histórias de Usuário – Relatório Batidas Originais x Ajustadas**

### **História 4.1.1 – Consultar alterações de batidas**

**Como** analista de RH ou gestor responsável
**Quero** visualizar no relatório todas as batidas originais e seus respectivos ajustes
**Para** entender de forma clara o que foi alterado, quem fez a alteração, quando e por qual motivo

**Critérios de aceite**

* O relatório deve exibir, para cada registro:

  * Batida original
  * Batida ajustada
  * Autor da alteração
  * Motivo da alteração
  * Data da alteração
* Os dados devem ser exibidos para cada dia do período selecionado.
* O relatório deve permitir a análise sem que o usuário precise acessar outras telas.

---

### **História 4.1.2 – Filtrar relatório**

**Como** usuário autorizado
**Quero** aplicar filtros antes de gerar o relatório
**Para** visualizar apenas os dados relevantes ao período, colaborador ou unidade desejados

**Critérios de aceite**

* Deve ser possível filtrar por:

  * Período
  * Colaborador
  * Unidade
  * Tipo de origem
* Caso nenhum registro seja encontrado para o filtro informado, o sistema deve informar a ausência de dados.
* O relatório deve ser atualizado com base nos filtros selecionados antes da execução.

---

## Histórias de Usuário – Relatório Banco de Horas Acumulado

### História 4.2.1 – Consultar alterações de batidas

**Como** analista de RH, auditor interno ou responsável pelo controle de ponto,  
**Quero** consultar no relatório de banco de horas acumulado as batidas que sofreram alterações,  
**Para** identificar ajustes realizados, validar a correção dos registros e garantir a confiabilidade do banco de horas.

---

#### Critérios de Aceite

- O sistema deve permitir a consulta de batidas que foram alteradas dentro do período informado no relatório.
- A consulta deve considerar apenas batidas que possuam registro de alteração.
- Para cada batida alterada, o relatório deve exibir no mínimo:
  - Data da batida  
  - Horário original  
  - Horário ajustado  
  - Tipo da batida (entrada ou saída)  
  - Identificação do colaborador
- O relatório deve indicar claramente que a batida exibida sofreu alteração.
- As alterações consultadas devem impactar corretamente o cálculo do banco de horas acumulado.
- O período selecionado no formulário deve ser respeitado integralmente.
- Caso não existam batidas alteradas no período, o sistema deve exibir mensagem informativa no relatório.
- A consulta deve respeitar o tipo de relatório selecionado:
  - No relatório sintético, deve haver indicação da existência de alterações.
  - No relatório analítico, as alterações devem ser exibidas de forma detalhada.
- Os dados exibidos devem ser os mesmos utilizados no cálculo dos totais do relatório.
- O relatório deve permitir visualização em tela e impressão mantendo as informações de alteração.

---

## Histórias de Usuário – Relatório Inconsistências no Cartão de Ponto  
---

### História 4.3.1 – Relatório Inconsistências no Cartão de Ponto

**Como** analista de RH, auditor interno ou responsável pelo controle de ponto,  
**Quero** gerar um relatório de inconsistências no cartão de ponto dos colaboradores,  
**Para** identificar falhas de marcação, divergências de cálculo e situações que exijam correção ou validação.

---

#### Critérios de Aceite

- O sistema deve permitir a geração do relatório de inconsistências a partir de um período informado.
- O período inicial e final devem ser de preenchimento obrigatório.
- A data final não pode ser anterior à data inicial.
- O relatório deve considerar apenas os registros de ponto existentes dentro do período selecionado.
- Devem ser identificadas e listadas como inconsistências, no mínimo, as seguintes situações:
  - Falta de marcação de entrada ou saída.
  - Quantidade ímpar de batidas no dia.
  - Jornadas sem cálculo por ausência de marcações.
  - Divergência entre horas trabalhadas e jornada prevista.
  - Cartão de ponto não fechado ou não calculado.
- Para cada inconsistência encontrada, o relatório deve exibir no mínimo:
  - Data da ocorrência
  - Identificação do colaborador
  - Tipo de inconsistência identificada
  - Descrição clara da inconsistência
- O relatório deve permitir identificar mais de uma inconsistência para o mesmo colaborador no período.
- As inconsistências exibidas não devem alterar automaticamente os dados do cartão de ponto.
- Caso não existam inconsistências no período selecionado, o sistema deve exibir mensagem informativa no relatório.
- O relatório deve permitir visualização em tela antes da impressão.
- A visualização em tela deve refletir exatamente os dados que serão impressos.
- O período e a data de emissão devem constar no cabeçalho do relatório.

---

## Histórias de Usuário – Relatório Espelho do Cartão de Ponto  

---

### História 4.4.1 – Relatório Espelho do Cartão de Ponto

**Como** analista de RH, gestor ou responsável pelo controle de ponto,  
**Quero** gerar o relatório espelho do cartão de ponto dos colaboradores,  
**Para** visualizar de forma fiel, organizada e auditável todas as marcações, jornadas e totais apurados em um determinado período.

---

#### Critérios de Aceite

- O sistema deve permitir a geração do relatório espelho do cartão de ponto a partir de um período informado.
- A data inicial e a data final devem ser de preenchimento obrigatório.
- A data final não pode ser anterior à data inicial.
- O relatório deve considerar apenas os registros de ponto existentes dentro do período selecionado.
- Para cada colaborador, o relatório deve exibir o cartão de ponto dia a dia.
- Para cada dia do período, o relatório deve apresentar no mínimo:
  - Data
  - Horários de entrada e saída registrados
  - Total de horas trabalhadas no dia
  - Jornada prevista
- O relatório deve indicar claramente dias com ausência de marcações ou marcações incompletas.
- Ajustes de batidas realizados devem ser refletidos no espelho do cartão de ponto.
- O relatório deve exibir totais consolidados ao final do período, incluindo:
  - Total de horas trabalhadas
  - Total de horas extras
  - Total de horas negativas, quando aplicável
- O relatório deve apresentar identificação completa do colaborador.
- O período informado deve constar no cabeçalho do relatório.
- A data e hora de emissão do relatório devem ser exibidas.
- O relatório deve permitir visualização em tela antes da impressão.
- O conteúdo visualizado em tela deve ser exatamente o mesmo conteúdo impresso.
- Caso não existam registros de ponto no período, o sistema deve exibir mensagem informativa no relatório.

---

# **Histórias de Usuário – Relatório Funcionários por Empresa**

## **História 4.5.1 – Relatório Funcionários por Empresa**

### **Como** Gestor de Recursos Humanos  
**Quero** poder gerar relatórios de funcionários filtrados por empresa com múltiplos critérios de seleção e opções de agrupamento  
**Para** analisar a força de trabalho por empresa, centro de custo e cargo, tanto de forma detalhada quanto consolidada.

---

## **Critérios de Aceite:**

### **1. Seleção de Rede e Empresa**
- **Dado que** o usuário acessa o formulário de relatório  
- **Quando** preenche o campo "Rede" (obrigatório)  
- **E** seleciona uma ou mais empresas (opcional)  
- **Então** o sistema deve filtrar todos os dados subsequentes pela rede selecionada  
- **E** se nenhuma empresa for especificada, considerar todas da rede

### **2. Filtro por Centro de Custo**
- **Dado que** o usuário seleciona um "Plano Centro de Custo"  
- **Quando** escolhe um ou mais "Centros de Custo"  
- **E** opcionalmente marca "Agrupar por Centro de Custo"  
- **Então** o sistema deve habilitar a seleção de "Nível Centro de Custo"  
- **E** carregar os níveis disponíveis baseados na máscara do plano selecionado

### **3. Filtro por Cargo e Status**
- **Dado que** o usuário seleciona um ou mais cargos (opcional)  
- **Quando** define o status (Ativos, Somente Ativos, Afastados, Demitidos)  
- **E** marca/desmarca "Incluir Categorias: 11 e 13"  
- **Então** o sistema deve aplicar os filtros corretamente  
- **E** para status "Ativos", incluir também funcionários afastados

### **4. Período de Admissão**
- **Dado que** o usuário seleciona "Admitidos Até"  
- **Quando** escolhe um mês/ano específico  
- **Então** o sistema deve considerar funcionários admitidos até o último dia do mês selecionado

### **5. Tipo de Relatório e Ordenação**
- **Dado que** o usuário escolhe entre "Analítico" ou "Sintético"  
- **Quando** seleciona "Analítico"  
- **Então** deve habilitar opções de agrupamento (Centro de Custo e Cargo)  
- **E** permitir ordenação por "Nome" ou "Matrícula"  
- **Quando** seleciona "Sintético"  
- **Então** deve desabilitar opções de agrupamento  
- **E** alterar labels de ordenação para "Nome Fantasia" e "Código"

### **6. Validações Obrigatórias**
- **Dado que** o usuário tenta gerar o relatório  
- **Quando** não seleciona uma Rede  
- **Então** o sistema deve exibir mensagem: "Informe a rede"  
- **Quando** marca "Nível Centro de Custo" mas não seleciona o nível  
- **Então** o sistema deve exibir mensagem: "Informe o nível do centro de custo!"

### **7. Geração do Relatório Analítico**
- **Dado que** todos os filtros obrigatórios estão preenchidos  
- **Quando** o usuário clica em "Confirmar" para relatório Analítico  
- **Então** o sistema deve:
  - Criar tabela temporária com os dados filtrados
  - Aplicar ordenação conforme selecionado (Nome ou Matrícula)
  - Agrupar conforme opções marcadas (Centro de Custo e/ou Cargo)
  - Incluir todas as colunas definidas (ID, Nome, Admissão, Centro Custo, Cargo, Empresa, Matrícula, Status, etc.)
  - Gerar relatório "rptRelatorio_Funcionario_Empresa.rpt" ou "rptRelatorio_Funcionario_Empresa_cc.rpt" (com nível)

### **8. Geração do Relatório Sintético**
- **Dado que** todos os filtros obrigatórios estão preenchidos  
- **Quando** o usuário clica em "Confirmar" para relatório Sintético  
- **Então** o sistema deve:
  - Agrupar funcionários por empresa
  - Contar quantidade de funcionários por empresa
  - Gerar relatório "rptRelatorio_Sintetico_Funcionario_Empresa.rpt"
  - Ordenar por Nome Fantasia ou Código da Empresa

### **9. Tratamento de Sem Dados**
- **Dado que** os filtros são aplicados  
- **Quando** não existem registros que atendam aos critérios  
- **Então** o sistema deve exibir mensagem: "Não existem registros que satisfaçam a elaboração do relatório"
- **E** não gerar o relatório

### **10. Funcionalidades de Apoio**
- **Dado que** o usuário clica em "Atualizar"  
- **Então** o sistema deve recarregar todos os combos e listas  
- **Dado que** o usuário clica em "Cancelar"  
- **Então** o sistema deve limpar todos os campos e redefinir para valores padrão  
- **Dado que** o usuário clica em "Sair"  
- **Então** o formulário deve ser fechado

### **11. Performance e Feedback**
- **Dado que** o relatório está sendo gerado  
- **Então** o sistema deve exibir barra de progresso  
- **E** expandir/recolher interface durante o processamento  
- **E** o tempo de resposta deve ser aceitável para até 10.000 registros

### **12. Segurança e Permissões**
- **Dado que** o usuário acessa o formulário  
- **Então** o sistema deve verificar permissões via `clsSeguranca`  
- **E** aplicar filtros de rede/empresa conforme perfil do usuário  
- **E** usar conexão segura com o banco de dados

### **13. Parâmetros do Relatório**
- **Dado que** o relatório é gerado  
- **Então** deve incluir nos parâmetros:
  - Rede selecionada
  - Empresa(s) selecionada(s)
  - Centro(s) de Custo selecionado(s)
  - Cargo(s) selecionado(s)
  - Período de admissão
  - Tipo de ordenação
  - Status filtrado
  - Indicador de agrupamento por Centro de Custo e Cargo

---

# **Histórias de Usuário – Relatório Gestores do Cartão de Ponto**

# **História de Usuário 4.6.1 – Relatório Gestores do Cartão de Ponto**

## **Como** Gestor de Recursos Humanos ou Supervisor de Ponto  
**Quero** gerar um relatório que mostre a relação hierárquica entre gestores e funcionários para aprovação de cartão de ponto  
**Para** verificar e validar a estrutura de aprovação, identificar responsabilidades e garantir que todos os funcionários tenham gestores designados para aprovação de horas.

---

## **Critérios de Aceite:**

### **1. Filtro por Rede (Obrigatório)**
- **Dado que** o usuário acessa o formulário de relatório  
- **Quando** seleciona uma rede no campo "Rede"  
- **Então** o sistema deve carregar automaticamente as empresas vinculadas a essa rede  
- **E** se nenhuma rede for selecionada, exibir mensagem: "Informe a rede"

### **2. Filtro por Empresa (Opcional)**
- **Dado que** uma rede foi selecionada  
- **Quando** o usuário escolhe uma ou mais empresas no campo "Empresa"  
- **Então** o sistema deve filtrar os resultados apenas para as empresas selecionadas  
- **E** se nenhuma empresa for selecionada, considerar todas da rede

### **3. Filtro por Plano de Centro de Custo (Opcional)**
- **Dado que** uma rede foi selecionada  
- **Quando** o usuário seleciona um plano de centro de custo  
- **Então** o sistema deve habilitar e filtrar os centros de custo disponíveis  
- **E** se nenhum plano for selecionado, considerar todos os planos da rede

### **4. Filtro por Centro de Custo (Opcional)**
- **Dado que** um plano de centro de custo foi selecionado  
- **Quando** o usuário escolhe um ou mais centros de custo  
- **Então** o sistema deve filtrar gestores e funcionários vinculados a esses centros de custo  
- **E** se nenhum centro for selecionado, considerar todos do plano

### **5. Filtro por Gestor (Opcional)**
- **Dado que** os filtros anteriores foram aplicados  
- **Quando** o usuário seleciona um gestor específico  
- **Então** o sistema deve mostrar apenas a relação do gestor selecionado com seus subordinados  
- **E** apresentar o gestor com nome e matrícula formatados (Nome - 000000Matrícula)

### **6. Filtro por Funcionário (Opcional)**
- **Dado que** os filtros anteriores foram aplicados  
- **Quando** o usuário seleciona um funcionário específico  
- **Então** o sistema deve mostrar apenas a relação desse funcionário com seu gestor  
- **E** filtrar hierarquicamente acima do funcionário selecionado

### **7. Geração do Relatório**
- **Dado que** todos os filtros desejados foram aplicados  
- **Quando** o usuário clica em "Confirmar"  
- **Então** o sistema deve:
  - Criar tabela temporária com os dados filtrados
  - Buscar relações gestor-funcionário do cartão de ponto
  - Incluir informações de: gestor, matrícula, empresa, cargo, centro de custo
  - Incluir informações de: funcionário, matrícula, empresa, cargo, centro de custo
  - Ordenar por empresa do gestor e matrícula do gestor
  - Gerar relatório "rptRelatorio_Gestor_Cartao_Ponto.rpt"

### **8. Relacionamento Hierárquico**
- **Dado que** existe uma estrutura de gestores no sistema  
- **Quando** o relatório é gerado  
- **Então** deve mostrar apenas funcionários que possuem gestor de cartão de ponto definido (DFid_funcionario_gestor IS NOT NULL)
- **E** agrupar funcionários sob seus respectivos gestores

### **9. Formatação de Dados**
- **Dado que** o relatório é processado  
- **Quando** apresenta os gestores  
- **Então** deve formatar como: "Nome do Gestor - 000000Matrícula" (com 6 zeros à esquerda)
- **E** manter consistência na formatação de todos os campos

### **10. Validação de Dados Existentes**
- **Dado que** os filtros são aplicados  
- **Quando** não existem relações gestor-funcionário para os critérios  
- **Então** o sistema deve exibir mensagem: "Não há registros que satisfaçam a consulta"
- **E** não gerar o relatório

### **11. Performance e Feedback Visual**
- **Dado que** o relatório está sendo processado  
- **Quando** há muitos registros para processar  
- **Então** o sistema deve:
  - Expandir a interface visualmente
  - Exibir barra de progresso
  - Mostrar incrementos de progresso (pelo menos 3 estágios)
  - Recolher interface ao finalizar

### **12. Funcionalidades de Apoio**
- **Dado que** o usuário clica em "Atualizar"  
- **Então** o sistema deve recarregar todos os combos com dados atualizados  
- **Dado que** o usuário clica em "Cancelar"  
- **Então** o sistema deve limpar todos os campos exceto rede (que mantém padrão do usuário)  
- **E** posicionar cursor no campo Empresa  
- **Dado que** o usuário clica em "Sair"  
- **Então** o formulário deve ser fechado

### **13. Segurança e Permissões**
- **Dado que** o formulário é carregado  
- **Então** o sistema deve aplicar filtro de empresas por usuário (TBusuario_empresa)
- **E** verificar permissões via clsSeguranca
- **E** usar conexão segura com o banco

### **14. Limpeza de Recursos**
- **Dado que** o relatório é gerado  
- **Quando** usa tabela temporária  
- **Então** deve excluir a tabela temporária anterior se existir
- **E** criar nova tabela com nome único (##TBtemp_relatorio_gestor)

### **15. Navegação por Teclado**
- **Dado que** o usuário está no formulário  
- **Quando** pressiona Enter em qualquer campo  
- **Então** não deve executar ação (KeyAscii = 0)  
- **Quando** usa teclas de atalho  
- **Então** deve funcionar conforme definido em Funcoes_Gerais.Verifica_Tecla

### **16. Dependência entre Campos**
- **Dado que** uma rede é selecionada  
- **Então** empresas devem ser filtradas por essa rede  
- **Dado que** um plano de centro de custo é selecionado  
- **Então** centros de custo devem ser filtrados por esse plano  
- **Dado que** mudanças ocorrem nos filtros superiores  
- **Então** filtros dependentes devem ser atualizados ou limpos

---

## **Regras de Negócio Específicas:**

1. **Formatação de Matrícula**: Matrículas devem ser formatadas com 6 zeros à esquerda
2. **Agrupamento**: Relatório deve agrupar por gestor, mostrando todos seus funcionários vinculados
3. **Exclusividade**: Apenas funcionários com gestor definido (DFid_funcionario_gestor) devem aparecer
4. **Ordenação**: Primária por empresa do gestor, secundária por matrícula do gestor
5. **Tabela Temporária**: Usar nomenclatura padrão ##TBtemp_relatorio_gestor para isolamento de dados
6. **Permissão por Empresa**: Filtrar empresas pelo vínculo do usuário (TBusuario_empresa)
7. **Rede Padrão**: Ao cancelar ou inicializar, usar rede padrão do usuário (clsUsuario.Id_Rede_Empresa_Padrao)
8. **Integridade de Dados**: Validar que todos os joins possuem dados correspondentes
9. **Progresso Visual**: Barra de progresso deve ser invisível inicialmente, visível durante processamento
10. **Classe de Configuração**: Usar clsFiltroFuncionario para gerenciar configurações de filtro

---

# **Histórias de Usuário – Relatório Histórico de Banco de Horas**

# **História de Usuário 4.7.1 – Relatório Histórico de Banco de Horas**

## **Como** Gestor de Recursos Humanos, Supervisor de Ponto ou Responsável pelo Controle de Banco de Horas  
**Quero** gerar um relatório histórico do banco de horas dos funcionários  
**Para** analisar a evolução do saldo de horas extras, faltas e saldo acumulado ao longo do tempo, controlar o compliance trabalhista e tomar decisões sobre compensação de horas.

---

## **Critérios de Aceite:**

### **1. Período de Consulta**
- **Dado que** o usuário acessa o formulário de relatório  
- **Quando** seleciona um período inicial e final no formato "MM/aaaa"  
- **E** a data final é anterior à data inicial  
- **Então** o sistema deve exibir mensagem: "Período inválido"  
- **E** posicionar o cursor no campo data final

### **2. Filtro por Rede (Obrigatório)**
- **Dado que** o usuário não seleciona uma rede  
- **Quando** tenta gerar o relatório  
- **Então** o sistema deve exibir mensagem: "Informe a rede"  
- **E** posicionar o cursor no campo rede

### **3. Filtro por Empresa (Opcional)**
- **Dado que** uma rede foi selecionada  
- **Quando** o usuário escolhe uma ou mais empresas  
- **Então** o sistema deve filtrar apenas funcionários das empresas selecionadas  
- **E** aplicar filtro de permissão por usuário (TBusuario_empresa)

### **4. Filtro por Plano de Centro de Custo (Opcional)**
- **Dado que** uma rede foi selecionada  
- **Quando** o usuário seleciona um plano de centro de custo  
- **Então** o sistema deve carregar automaticamente o plano vigente da rede  
- **E** habilitar o filtro de centros de custo

### **5. Filtro por Centro de Custo (Opcional)**
- **Dado que** um plano de centro de custo foi selecionado  
- **Quando** o usuário escolhe um ou mais centros de custo  
- **Então** o sistema deve aplicar máscara de formatação conforme configuração do plano  
- **E** filtrar funcionários apenas dos centros selecionados

### **6. Filtro por Funcionário (Opcional)**
- **Dado que** filtros de empresa e/ou centro de custo foram aplicados  
- **Quando** o usuário seleciona um funcionário específico  
- **Então** o sistema deve mostrar apenas o histórico desse funcionário  
- **E** atualizar automaticamente a lista de funcionários conforme outros filtros

### **7. Opção de Agrupamento**
- **Dado que** o usuário marca "Agrupar por Centro de Custo"  
- **Quando** gera o relatório  
- **Então** o sistema deve organizar os resultados agrupando por centro de custo  
- **E** incluir subtotais por centro de custo quando aplicável

### **8. Exclusão de Demitidos**
- **Dado que** a opção "Excluir Demitidos" está marcada (padrão)  
- **Quando** o relatório é gerado  
- **Então** o sistema deve excluir funcionários com data de demissão anterior ao período  
- **E** considerar apenas funcionários ativos durante o período analisado

### **9. Geração do Relatório**
- **Dado que** todos os filtros obrigatórios estão preenchidos  
- **Quando** o usuário clica em "Confirmar"  
- **Então** o sistema deve:
  - Criar tabela temporária para isolamento de dados
  - Calcular saldo anterior, horas extras, horas faltosas e saldo atual por mês
  - Formatar horas no padrão decimal e HH:mm
  - Ordenar por empresa, centro de custo, nome do funcionário e mês
  - Gerar relatório "rptRelatorio_Historico_Cartao_Ponto_empresa.rpt"

### **10. Cálculos de Banco de Horas**
- **Dado que** existem registros de banco de horas não quitados  
- **Quando** o relatório é processado  
- **Então** o sistema deve:
  - Considerar apenas registros com DFquitado = 0
  - Calcular saldo anterior (do mês anterior ao período)
  - Somar horas extras e horas faltosas do mês
  - Calcular saldo atual (saldo anterior + extras - faltosas)
  - Aplicar formatação decimal e horária apropriada

### **11. Validação de Dados Existentes**
- **Dado que** os filtros são aplicados  
- **Quando** não existem registros de banco de horas para os critérios  
- **Então** o sistema não deve exibir mensagem específica (deixa o Crystal Reports mostrar relatório vazio)  
- **E** deve gerar relatório com estrutura vazia

### **12. Performance e Feedback Visual**
- **Dado que** o relatório está sendo processado  
- **Quando** há muitos meses/funcionários para processar  
- **Então** o sistema deve:
  - Expandir a interface visualmente
  - Exibir barra de progresso com pelo menos 4 incrementos
  - Mostrar progresso durante criação da tabela temporária e processamento
  - Recolher interface ao finalizar

### **13. Funcionalidades de Apoio**
- **Dado que** o usuário clica em "Atualizar"  
- **Então** o sistema deve recarregar os dados da rede selecionada  
- **Dado que** o usuário clica em "Cancelar"  
- **Então** o sistema deve limpar todos os campos exceto rede (que mantém padrão do usuário)  
- **E** redefinir datas para data atual  
- **Dado que** o usuário clica em "Sair"  
- **Então** o formulário deve ser fechado

### **14. Segurança e Permissões**
- **Dado que** o formulário é carregado  
- **Então** o sistema deve aplicar filtro de empresas por usuário (TBusuario_empresa)
- **E** verificar permissões via clsSeguranca
- **E** usar conexão segura com o banco

### **15. Formatação de Datas**
- **Dado que** o período é definido  
- **Quando** o relatório é processado  
- **Então** o sistema deve:
  - Considerar o primeiro dia do mês para data inicial
  - Considerar o último dia do mês para data final
  - Converter datas para formato YYYYMM para comparação no banco
  - Formatar datas para exibição como "MM/aaaa"

### **16. Dependência entre Campos**
- **Dado que** uma rede é selecionada  
- **Então** empresas devem ser filtradas por essa rede e permissões do usuário  
- **Dado que** um plano de centro de custo é selecionado  
- **Então** centros de custo devem ser filtrados por esse plano  
- **Dado que** empresa ou centro de custo é alterado  
- **Então** a lista de funcionários deve ser atualizada automaticamente

### **17. Limpeza de Recursos**
- **Dado que** o relatório é gerado  
- **Quando** usa tabela temporária  
- **Então** deve excluir a tabela temporária anterior se existir
- **E** criar nova tabela com nome único (##TBtemp_historico_ponto)

### **18. Navegação por Teclado**
- **Dado que** o usuário está no formulário  
- **Quando** pressiona Enter em qualquer campo  
- **Então** não deve executar ação (KeyAscii = 0)  
- **Quando** usa teclas de atalho  
- **Então** deve funcionar conforme definido em Funcoes_Gerais.Verifica_Tecla

---

## **Regras de Negócio Específicas:**

1. **Período de Análise**: Sempre considerar meses completos (do dia 1 ao último dia do mês)
2. **Banco de Horas Não Quitados**: Apenas considerar registros com flag DFquitado = 0
3. **Formatação de Horas**: Converter horas decimais para formato HH:mm usando função FOL_FORMATAR_DECIMAL_HORA
4. **Cálculo de Saldo**: Saldo atual = Saldo anterior + Horas Extras - Horas Faltosas
5. **Funcionários Demitidos**: Se excluir demitidos, considerar apenas funcionários sem registro em TBfuncionario_demitido
6. **Máscara de Centro de Custo**: Aplicar formatação conforme configuração do plano (! + máscara)
7. **Ordenação Padrão**: Empresa → Centro de Custo → Nome do Funcionário → Mês/Ano
8. **Rede Padrão**: Ao cancelar ou inicializar, usar rede padrão do usuário (clsUsuario.Id_Rede_Empresa_Padrao)
9. **Plano Padrão**: Ao selecionar rede, carregar automaticamente plano de centro de custo vigente
10. **Progresso**: Barra de progresso invisível inicialmente, visível durante processamento

---


# **Histórias de Usuário – Relatório Detalhado de Ponto**

### **História de Usuário 4.8.1.1 – Relatório Detalhado de Ponto**
**Como** usuário do sistema de gestão de pessoas (analista de RH ou gestor),  
**Quero** acessar a tela de “Registro de Ponto Detalhado” a partir do menu principal,  
**Para** poder configurar os filtros e gerar o relatório detalhado de registros de ponto dos funcionários.

**Critérios de Aceite:**
- O formulário deve ser acessado como um MDI Child dentro da aplicação principal.
- A tela deve ter o título “Registro de Ponto Detalhado”.
- A tela deve ser fixa (não redimensionável) e sem botão de maximizar.
- O ícone da aplicação deve ser exibido na barra de título do formulário.
- O formulário deve ser carregado com os valores padrão configurados (data atual, rede padrão do usuário, etc.).

---

### **História de Usuário 4.8.1.2 – Filtrar por Período do Relatório**
**Como** usuário do sistema de gestão de pessoas,  
**Quero** selecionar um período específico (data inicial e data final) para o relatório,  
**Para** restringir a análise dos registros de ponto a um intervalo de datas desejado.

**Critérios de Aceite:**
- Deve ser possível selecionar a data inicial e a data final através de controles do tipo `DTPicker`.
- As datas devem ser exibidas no formato DD/MM/AAAA.
- A data final não pode ser anterior à data inicial.
- O sistema deve validar se o mês da data inicial é o mesmo da data final. Caso contrário, deve exibir uma mensagem de erro informativa.
- O período selecionado deve ser exibido no relatório gerado.

---

### **História de Usuário 4.8.1.3 – Selecionar Rede para Filtragem**
**Como** usuário do sistema,  
**Quero** selecionar uma rede de empresas no combo `adbRede`,  
**Para** que a lista de empresas (`adbEmpresa`) seja automaticamente filtrada e atualizada apenas com as empresas pertencentes à rede escolhida.

**Critérios de Aceite:**
- O combo `adbRede` deve ser preenchido com todas as redes cadastradas na tabela `TBrede`.
- Ao selecionar uma rede, o combo `adbEmpresa` deve ser atualizado automaticamente para listar apenas as empresas (`TBempresa`) vinculadas à rede selecionada.
- Se nenhuma rede for selecionada, o combo de empresas deve estar vazio ou conter todas as empresas (dependendo da lógica inicial).
- O campo deve ser somente leitura após a seleção inicial, a menos que o usuário clique em “Atualizar”.

---

### **História de Usuário 4.8.1.4 – Selecionar Empresa para Filtragem**
**Como** usuário do sistema,  
**Quero** selecionar uma empresa no combo `adbEmpresa`,  
**Para** que a lista de funcionários (`mltFuncionario`) seja automaticamente filtrada e atualizada apenas com os funcionários ativos da empresa escolhida no período selecionado.

**Critérios de Aceite:**
- O combo `adbEmpresa` só deve ser preenchido após a seleção de uma rede.
- Ao selecionar uma empresa, o controle de múltipla seleção `mltFuncionario` deve ser atualizado com a lista de funcionários ativos (não demitidos) naquela empresa.
- A lista de funcionários deve incluir: ID do funcionário, matrícula e nome.
- A empresa é um campo obrigatório para gerar o relatório. Caso não seja preenchida, o sistema deve exibir uma mensagem de alerta.

---

### **História de Usuário 4.8.1.5 – Selecionar Funcionários para o Relatório**
**Como** usuário do sistema,  
**Quero** selecionar um ou mais funcionários através do controle de múltipla seleção `mltFuncionario`,  
**Para** gerar o relatório apenas para os colaboradores escolhidos. Se nenhum for selecionado, o relatório deve incluir todos os funcionários da empresa.

**Critérios de Aceite:**
- O controle deve permitir seleção múltipla de funcionários a partir de uma lista filtrada por empresa.
- A lista deve exibir as colunas: “ID Func.”, “Matrícula” e “Nome”.
- O sistema deve permitir a seleção total, limpeza da seleção e busca por nome/matrícula.
- Caso nenhum funcionário seja selecionado, o relatório será gerado para todos os funcionários da empresa no período.

---

### **História de Usuário 4.8.1.6 – Atualizar Listas de Filtro**
**Como** usuário do sistema,  
**Quero** poder clicar no botão “Atualizar” (`cmdAtualizar`),  
**Para** recarregar a lista de redes disponíveis, resetando os filtros de empresa e funcionário.

**Critérios de Aceite:**
- Ao clicar no botão, o combo `adbRede` deve ser recarregado com os dados mais recentes da tabela `TBrede`.
- Os combos dependentes (`adbEmpresa` e `mltFuncionario`) devem ser limpos.
- O foco deve ser mantido no botão durante a operação, sem interferir na navegação por teclado.

---

### **História de Usuário 4.8.1.7 – Limpar Todos os Filtros**
**Como** usuário do sistema,  
**Quero** poder clicar no botão “Cancelar” (`cmdCancelar`),  
**Para** limpar todos os campos de filtro (período, rede, empresa e funcionários) e retornar aos valores padrão.

**Critérios de Aceite:**
- As datas devem voltar à data atual.
- A rede deve ser definida como a rede padrão do usuário logado.
- A lista de empresas deve ser atualizada conforme a rede padrão.
- A lista de funcionários deve ser atualizada conforme a empresa selecionada.
- O foco deve ser movido para o campo de data inicial.

---

### **História de Usuário 4.8.1.8 – Sair do Formulário**
**Como** usuário do sistema,  
**Quero** poder clicar no botão “Sair” (`cmdSair`),  
**Para** fechar a tela de relatório e retornar à tela anterior ou ao menu principal.

**Critérios de Aceite:**
- O formulário deve ser fechado sem salvar alterações nem gerar relatório.
- Nenhum dado temporário no banco deve permanecer após o fechamento.

---

### **História de Usuário 4.8.1.9 – Gerar Relatório Detalhado de Ponto**
**Como** usuário do sistema,  
**Quero** clicar no botão “Confirmar” (`cmdConfirmar`) após configurar os filtros,  
**Para** que o sistema processe os dados e gere um relatório detalhado de registros de ponto, incluindo horas trabalhadas, extras, faltas, saldo de banco de horas e observações.

**Critérios de Aceite:**
- O sistema deve validar se uma empresa foi selecionada.
- O sistema deve validar se as datas estão no mesmo mês.
- Durante o processamento, uma barra de progresso deve ser exibida.
- O relatório deve ser gerado com base nos dados das tabelas temporárias `##TBtemp_registro_ponto` e `##TBtemp_saldo_ponto`.
- O relatório deve conter as seguintes colunas para cada dia/funcionário:
  - Empresa, Matrícula, Nome, Cargo, Data (Dia da semana), Turno (horários previstos)
  - Entrada 1, Saída 1, Entrada 2, Saída 2 (com marcações de motivo, se houver)
  - Intervalo, Horas Extras, Horas Faltantes, Horas Normais, Horas Totais, Horas Extras Banco, Saldo Acumulado, Observação/Motivo
- Os cálculos devem considerar:
  - Horas extras quando o funcionário trabalhou além do previsto.
  - Horas faltantes quando o funcionário trabalhou menos do que o previsto.
  - Saldo acumulado de banco de horas com base no saldo anterior e nas horas extras/faltantes do período.
  - Motivos de ausência ou alteração (como atestado, férias, etc.) devem ser exibidos no campo de observação.
- O relatório deve ser ordenado por nome do funcionário e data.
- O período selecionado deve aparecer no cabeçalho do relatório.
- O relatório deve ser exibido no visualizador de relatórios do sistema (Crystal Reports ou similar).
- Após a geração, os dados temporários devem ser excluídos do banco.

---

# Histórias de Usuário – Relatório Motivo do Cartão de Ponto

## História 4.9.1.1 – Acessar o Formulário de Relação de Horas por Motivo
**Como** analista de RH ou gestor,  
**Quero** acessar a tela "Relação de Horas" através do menu do sistema,  
**Para** gerar relatórios consolidados de horas por motivo (hora extra, atestado, falta, etc.) dos funcionários.

**Critérios de Aceite:**
- O formulário deve abrir como janela filha MDI (MDIChild) dentro da aplicação principal.
- A tela deve ter o título "Relação de Horas".
- A janela não deve ser redimensionável e não deve ter botão de maximizar.
- Deve exibir o ícone padrão do sistema na barra de título.
- O formulário deve ser carregado com valores padrão configurados automaticamente.

## História 4.9.1.2 – Selecionar Rede para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar uma rede de empresas no combo `adbRede`,  
**Para** que as listas de empresas (`mltEmpresa`) e centros de custo (`mltCentro_Custo`) sejam automaticamente filtradas com os dados correspondentes à rede escolhida.

**Critérios de Aceite:**
- O combo `adbRede` deve ser preenchido com todas as redes cadastradas na tabela `TBrede`.
- Ao selecionar uma rede, o controle `mltEmpresa` deve ser atualizado para listar apenas empresas da rede selecionada.
- Ao selecionar uma rede, o controle `mltCentro_Custo` deve ser atualizado para listar apenas centros de custo analíticos (`DFanalitico = 1`) vinculados à rede.
- Se nenhuma rede for selecionada, as listas de empresas e centros de custo devem estar vazias.

## História 4.9.1.3 – Selecionar Empresas para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar uma ou mais empresas através do controle de múltipla seleção `mltEmpresa`,  
**Para** que a lista de funcionários (`mltFuncionario`) seja automaticamente atualizada com os funcionários das empresas selecionadas.

**Critérios de Aceite:**
- O controle deve permitir seleção múltipla de empresas.
- A lista deve exibir código e nome fantasia das empresas.
- Ao selecionar uma ou mais empresas, a lista de funcionários deve ser atualizada para mostrar apenas funcionários ativos dessas empresas.
- Se nenhuma empresa for selecionada, a lista de funcionários deve ser limpa.

## História 4.9.1.4 – Selecionar Centros de Custo para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar um ou mais centros de custo através do controle de múltipla seleção `mltCentro_Custo`,  
**Para** filtrar os dados do relatório por centros de custo específicos.

**Critérios de Aceite:**
- O controle deve permitir seleção múltipla de centros de custo.
- A lista deve exibir ID, código e descrição dos centros de custo.
- Deve ser possível marcar a opção "Agrupar" (`chkAgrupar_CCusto`) para agrupar os resultados por centro de custo no relatório Indicador RH.
- Quando "Agrupar por Centro de Custo" estiver marcado, a opção "Agrupar por Cargo" deve ser desabilitada.

## História 4.9.1.5 – Selecionar Funcionários para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar um ou mais funcionários através do controle de múltipla seleção `mltFuncionario`,  
**Para** restringir o relatório a funcionários específicos. Se nenhum for selecionado, o relatório deve incluir todos os funcionários das empresas filtradas.

**Critérios de Aceite:**
- O controle deve permitir seleção múltipla de funcionários.
- A lista deve exibir ID do funcionário, matrícula e nome.
- A lista deve ser atualizada automaticamente quando as empresas forem alteradas.
- Se nenhum funcionário for selecionado, o relatório considerará todos os funcionários das empresas selecionadas.

## História 4.9.1.6 – Selecionar Cargos para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar um ou mais cargos através do controle de múltipla seleção `mltCargo`,  
**Para** filtrar os dados do relatório por cargos específicos.

**Critérios de Aceite:**
- O controle deve permitir seleção múltipla de cargos.
- A lista deve exibir código e descrição dos cargos.
- Deve ser possível marcar a opção "Agrupar" (`chkAgrupar_Cargo`) para agrupar os resultados por cargo no relatório Indicador RH.
- Quando "Agrupar por Cargo" estiver marcado, a opção "Agrupar por Centro de Custo" deve ser desabilitada.

## História 4.9.1.7 – Selecionar Motivos de Horário para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar um ou mais motivos de cartão de ponto através do controle de múltipla seleção `mltMotivo_Horario`,  
**Para** filtrar os dados do relatório por tipos específicos de horas (hora extra, atestado, falta, etc.).

**Critérios de Aceite:**
- O controle deve permitir seleção múltipla de motivos.
- A lista deve exibir ID e descrição dos motivos.
- Se nenhum motivo for selecionado, o relatório deve incluir todos os tipos de horas.

## História 4.9.1.8 – Definir Período do Relatório
**Como** usuário do sistema,  
**Quero** definir um período específico (data inicial e data final) para o relatório,  
**Para** analisar as horas registradas apenas dentro do intervalo desejado.

**Critérios de Aceite:**
- Deve ser possível selecionar data inicial e final através de controles `DTPicker`.
- As datas devem ser exibidas no formato DD/MM/AAAA.
- A data inicial deve ser padrão como o primeiro dia do mês atual.
- A data final deve ser padrão como o último dia do mês atual.
- O período selecionado será aplicado a todos os dados do relatório.

## História 4.9.1.9 – Escolher Tipo de Relatório
**Como** usuário do sistema,  
**Quero** escolher entre três tipos de relatório: Sintético, Analítico ou Indicador RH,  
**Para** obter diferentes níveis de detalhamento na apresentação dos dados.

**Critérios de Aceite:**
- Deve haver três opções de relatório com botões de rádio (`optAnalitico_Sintetico_Indicador`):
  1. **Sintético**: Agrupado por motivo, mostrando horas totais por tipo.
  2. **Analítico**: Detalhado por funcionário, mostrando horas por motivo para cada colaborador.
  3. **Indicador RH**: Focado em indicadores de RH (horas trabalhadas, horas extras, absenteísmo, turnover).
- A opção padrão deve ser "Sintético".
- A seleção do tipo de relatório deve determinar qual relatório será gerado.

## História 4.9.1.10 – Configurar Agrupamento do Relatório
**Como** usuário do sistema,  
**Quero** poder escolher entre agrupar os resultados por centro de custo ou por cargo no relatório Indicador RH,  
**Para** analisar os indicadores de RH por diferentes perspectivas organizacionais.

**Critérios de Aceite:**
- Para o relatório "Indicador RH", deve ser possível escolher agrupamento:
  - Sem agrupamento (padrão)
  - Agrupado por Centro de Custo
  - Agrupado por Cargo
- As opções de agrupamento devem ser mutuamente exclusivas.
- Quando uma opção de agrupamento estiver marcada, a outra deve ser desabilitada.

## História 4.9.1.11 – Atualizar Listas de Filtro
**Como** usuário do sistema,  
**Quero** poder clicar no botão "Atualizar" (`cmdAtualizar`),  
**Para** recarregar as listas de rede, motivo e cargo com os dados mais recentes do sistema.

**Critérios de Aceite:**
- Ao clicar no botão, devem ser atualizadas as listas de:
  - Redes (`adbRede`)
  - Motivos de horário (`mltMotivo_Horario`)
  - Cargos (`mltCargo`)
- As demais listas dependentes (empresas, centros de custo, funcionários) devem ser mantidas conforme seleção atual.

## História 4.9.1.12 – Limpar Todos os Filtros
**Como** usuário do sistema,  
**Quero** poder clicar no botão "Cancelar" (`cmdCancelar`),  
**Para** limpar todos os filtros selecionados e retornar aos valores padrão.

**Critérios de Aceite:**
- Deve limpar todas as seleções: rede, empresas, centros de custo, funcionários, cargos, motivos.
- Deve retornar as datas para o primeiro e último dia do mês atual.
- Deve definir o tipo de relatório como "Sintético".
- Deve desmarcar todas as opções de agrupamento.
- Deve restaurar a rede padrão do usuário logado.

## História 4.9.1.13 – Sair do Formulário
**Como** usuário do sistema,  
**Quero** poder clicar no botão "Sair" (`cmdSair`),  
**Para** fechar a tela de relatório sem gerar nenhum relatório.

**Critérios de Aceite:**
- O formulário deve ser fechado imediatamente.
- Nenhum dado temporário deve permanecer no banco de dados.
- O usuário deve retornar à tela anterior ou ao menu principal.

## História 4.9.1.14 – Gerar Relatório Sintético de Horas por Motivo
**Como** usuário do sistema,  
**Quero** clicar no botão "Confirmar" após configurar os filtros com a opção "Sintético" selecionada,  
**Para** gerar um relatório consolidado de horas por tipo de motivo, agrupado por empresa.

**Critérios de Aceite:**
- O sistema deve criar uma tabela temporária (`##TBtemp_relacao_hora`) com os dados filtrados.
- Deve criar uma segunda tabela temporária (`##TBtemp_relacao_hora_sintetico`) com dados agregados.
- O relatório deve mostrar para cada empresa:
  - ID do motivo
  - Descrição do motivo
  - Total de horas formatadas no padrão HH:MM
  - Código e nome da empresa
- Os dados devem ser ordenados por código da empresa e descrição do motivo.
- O título do relatório deve ser "RELAÇÃO TIPO DE HORA SINTÉTICO".

## História 4.9.1.15 – Gerar Relatório Analítico de Horas por Motivo
**Como** usuário do sistema,  
**Quero** clicar no botão "Confirmar" após configurar os filtros com a opção "Analítico" selecionada,  
**Para** gerar um relatório detalhado mostrando as horas por motivo para cada funcionário.

**Critérios de Aceite:**
- O sistema deve criar uma tabela temporária (`##TBtemp_relacao_hora`) com os dados filtrados.
- Deve criar uma tabela temporária analítica (`##TBtemp_relacao_hora_analitico`) com os dados por funcionário.
- O relatório deve mostrar para cada funcionário:
  - ID do funcionário, matrícula e nome
  - ID do motivo e descrição
  - Centro de custo (código e descrição)
  - Total de horas formatadas no padrão HH:MM
  - Cargo
  - Empresa (código e nome)
- Se a opção "Agrupar por Centro de Custo" estiver marcada, os dados devem ser ordenados por empresa, centro de custo e nome do funcionário.
- Caso contrário, os dados devem ser ordenados por empresa e nome do funcionário.
- O título do relatório deve ser "RELAÇÃO TIPO DE HORA ANALÍTICO".

## História 4.9.1.16 – Gerar Relatório de Indicadores de RH
**Como** usuário do sistema,  
**Quero** clicar no botão "Confirmar" após configurar os filtros com a opção "Indicador RH" selecionada,  
**Para** gerar um relatório com indicadores estratégicos de recursos humanos.

**Critérios de Aceite:**
- O sistema deve criar uma tabela temporária (`##TBtemp_relacao_hora`) com os dados filtrados.
- Deve criar uma tabela temporária de indicadores (`##TBtemp_relacao_hora_indicador_rh`) com os seguintes indicadores:
  1. **Horas efetivamente trabalhadas**: Somatório de horas normais (motivos com totalizador='T', natureza='N', ação BH/FP=0, absenteísmo=0)
  2. **Horas extras**: Somatório de horas extras (totalizador='E', natureza='C', absenteísmo=0)
  3. **Hora deb. BH**: Horas debitadas do banco de horas (vinculadas ao parâmetro de hora devedora)
  4. **Absenteísmo**: Somatório de horas de absenteísmo (absenteísmo=1)
  5. **Turnover**: Percentual calculado como ((admissões + demissões)/2) / total de funcionários * 100
- O cálculo do absenteísmo deve ser apresentado como percentual em relação às horas trabalhadas.
- O turnover deve ser apresentado como percentual com duas casas decimais.
- O relatório deve seguir o agrupamento selecionado (nenhum, por centro de custo ou por cargo).
- O título do relatório deve variar conforme o agrupamento selecionado.

## História 4.9.1.17 – Validar Existência de Dados antes de Gerar Relatório
**Como** usuário do sistema,  
**Quero** que o sistema valide se existem dados correspondentes aos filtros aplicados,  
**Para** evitar a geração de relatórios vazios e economizar recursos do sistema.

**Critérios de Aceite:**
- Após processar os filtros e criar a tabela temporária, o sistema deve verificar se há registros.
- Se não houver dados, o sistema deve exibir a mensagem: "Não há dados que satisfaçam a consulta."
- Nenhum relatório deve ser gerado quando não houver dados.
- A barra de progresso deve ser ocultada após a validação.

## História 4.9.1.18 – Monitorar Progresso da Geração do Relatório
**Como** usuário do sistema,  
**Quero** visualizar uma barra de progresso durante o processamento do relatório,  
**Para** ter feedback visual sobre o andamento da geração dos dados.

**Critérios de Aceite:**
- Uma barra de progresso deve ser exibida durante o processamento.
- A barra deve ter 3 estágios principais:
  1. Criação da tabela temporária com dados filtrados
  2. Processamento dos dados conforme tipo de relatório selecionado
  3. Finalização e preparação para impressão
- A barra deve ser ocultada após a conclusão do processamento ou em caso de erro.

---

# Histórias de Usuário – Relatório Totalizador de Horas do Cartão de Ponto

## História 4.10.1.1 – Acessar o Formulário de Totalizador de Horas
**Como** analista de RH ou gestor,  
**Quero** acessar a tela "Relatório Totalizador Horas" através do menu do sistema,  
**Para** gerar relatórios consolidados de horas trabalhadas no mês, mostrando comparação entre carga horária prevista e horas efetivamente trabalhadas.

**Critérios de Aceite:**
- O formulário deve abrir como janela filha MDI (MDIChild) dentro da aplicação principal.
- A tela deve ter o título "Relatório Totalizador Horas".
- A janela não deve ser redimensionável e não deve ter botão de maximizar.
- Deve exibir o ícone padrão do sistema na barra de título.
- O formulário deve ser carregado com valores padrão configurados automaticamente.

## História 4.10.1.2 – Selecionar Rede para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar uma rede de empresas no combo `adbRede`,  
**Para** que a lista de empresas (`adbEmpresa`) seja automaticamente filtrada apenas com as empresas da rede escolhida e que o usuário tenha permissão de acesso.

**Critérios de Aceite:**
- O combo `adbRede` deve ser preenchido com todas as redes cadastradas na tabela `TBrede`.
- Ao selecionar uma rede, o combo `adbEmpresa` deve ser atualizado para listar apenas empresas da rede selecionada que também estejam na tabela de permissões do usuário (`TBusuario_empresa`).
- A rede padrão do usuário deve ser pré-selecionada automaticamente ao carregar o formulário.
- Se nenhuma rede for selecionada, a lista de empresas deve estar vazia.

## História 4.10.1.3 – Selecionar Empresa para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar uma empresa no combo `adbEmpresa`,  
**Para** restringir o relatório a uma empresa específica.

**Critérios de Aceite:**
- A empresa é um campo obrigatório para geração do relatório.
- Se nenhuma empresa for selecionada, o sistema deve exibir mensagem de alerta ao tentar gerar o relatório.
- A empresa padrão do usuário deve ser pré-selecionada automaticamente ao carregar o formulário.
- A lista de empresas deve ser filtrada conforme a rede selecionada e as permissões do usuário.

## História 4.10.1.4 – Selecionar Centro de Custo para Filtragem
**Como** usuário do sistema,  
**Quero** selecionar um centro de custo específico no combo `adbCentro_Custo`,  
**Para** restringir o relatório a um centro de custo específico dentro da empresa selecionada.

**Critérios de Aceite:**
- A seleção de centro de custo é opcional.
- Se um centro de custo for selecionado, o relatório será filtrado apenas para funcionários daquele centro de custo.
- O combo deve ser preenchido com todos os centros de custo disponíveis.
- A seleção de centro de custo não afeta a obrigatoriedade da seleção de empresa.

## História 4.10.1.5 – Definir Período do Relatório
**Como** usuário do sistema,  
**Quero** selecionar um mês e ano específico através do controle `dtpPeriodo`,  
**Para** analisar as horas trabalhadas apenas no período desejado.

**Critérios de Aceite:**
- O controle deve permitir seleção apenas de mês e ano (formato MM/AAAA).
- O período padrão deve ser o mês atual.
- O período selecionado será aplicado a todos os cálculos do relatório.
- O sistema deve considerar todos os dias do mês selecionado para os cálculos.

## História 4.10.1.6 – Configurar Agrupamento do Relatório
**Como** usuário do sistema,  
**Quero** marcar a opção "Agrupar por Centro de Custo" (`chkAgrupar_cc`),  
**Para** visualizar os resultados do relatório separados por centro de custo, em vez de consolidados por empresa.

**Critérios de Aceite:**
- A opção deve estar disponível como uma caixa de seleção.
- Quando marcada, o relatório deve apresentar os dados agrupados por centro de custo.
- Quando desmarcada, o relatório deve apresentar os dados consolidados por empresa.
- A opção deve estar disponível independentemente da seleção de um centro de custo específico.

## História 4.10.1.7 – Atualizar Listas de Filtro
**Como** usuário do sistema,  
**Quero** poder clicar no botão "Atualizar" (`cmdAtualizar`),  
**Para** recarregar as listas de rede, empresa e centro de custo com os dados mais recentes do sistema.

**Critérios de Aceite:**
- Ao clicar no botão, devem ser atualizadas as listas de:
  - Redes (`adbRede`)
  - Empresas (`adbEmpresa`)
  - Centros de custo (`adbCentro_Custo`)
- Após a atualização, os controles devem ser pré-preenchidos com os valores padrão do usuário (rede e empresa padrão).
- O período selecionado não deve ser alterado pela atualização.

## História 4.10.1.8 – Limpar Todos os Filtros
**Como** usuário do sistema,  
**Quero** poder clicar no botão "Cancelar" (`cmdCancelar`),  
**Para** limpar todos os filtros selecionados e retornar aos valores padrão.

**Critérios de Aceite:**
- Deve limpar todas as seleções: rede, empresa, centro de custo.
- Deve manter o período como o mês atual.
- Deve desmarcar a opção "Agrupar por Centro de Custo".
- Deve chamar automaticamente a função de atualização para recarregar as listas com valores padrão.

## História 4.10.1.9 – Sair do Formulário
**Como** usuário do sistema,  
**Quero** poder clicar no botão "Sair" (`cmdSair`),  
**Para** fechar a tela de relatório sem gerar nenhum relatório.

**Critérios de Aceite:**
- O formulário deve ser fechado imediatamente.
- Nenhum dado temporário deve permanecer no banco de dados.
- O usuário deve retornar à tela anterior ou ao menu principal.

## História 4.10.1.10 – Gerar Relatório Totalizador de Horas (Controle Detalhado)
**Como** usuário do sistema,  
**Quero** clicar no botão "Confirmar" após configurar os filtros quando o sistema estiver configurado com "Controle Detalhado" ativo,  
**Para** gerar um relatório que compara a carga horária prevista com as horas efetivamente trabalhadas, considerando dias normais e domingos separadamente.

**Critérios de Aceite:**
- O sistema deve verificar se o parâmetro `Parametros_CPonto.ControleDetalhado` está ativo.
- Deve validar se uma empresa foi selecionada antes de gerar o relatório.
- Deve criar uma tabela temporária (`##TBtemp_totalizador_hora`) com os dados filtrados.
- O relatório deve calcular:
  - **Para dias normais (tipo_dia = 'N')**: 
    - Carga horária prevista (baseada no horário do funcionário)
    - Total de horas trabalhadas (somando horas de todos os motivos, exceto ausências e horas debitadas)
  - **Para domingos (tipo_dia = 'D')**:
    - Carga horária prevista marcada como "Domingo"
    - Total de horas trabalhadas em domingos
- Os cálculos devem excluir motivos com:
  - Ação BH/FP = 0 (não contabilizam para banco de horas ou folga de ponto)
  - Totalizador diferente de 'A' (não são ausências)
  - Natureza diferente de 'D' (não são débitos)
  - Cartões não quitados
- Os dados devem ser agrupados por empresa e carga horária.
- O período do relatório deve aparecer no cabeçalho como "MM/YYYY".

## História 4.10.1.11 – Gerar Relatório Totalizador de Horas (Controle Simplificado)
**Como** usuário do sistema,  
**Quero** clicar no botão "Confirmar" após configurar os filtros quando o sistema estiver configurado com "Controle Detalhado" inativo,  
**Para** gerar um relatório que consolida as horas trabalhadas através dos totalizadores de motivo, considerando dias normais e domingos.

**Critérios de Aceite:**
- O sistema deve verificar se o parâmetro `Parametros_CPonto.ControleDetalhado` está inativo.
- Deve validar se uma empresa foi selecionada antes de gerar o relatório.
- Deve criar uma tabela temporária (`##TBtemp_totalizador_hora`) com os dados filtrados.
- O relatório deve calcular:
  - **Para todos os dias**:
    - Carga horária prevista (baseada no horário do funcionário)
    - Total de horas trabalhadas (soma dos totalizadores de motivo)
    - Número de funcionários considerados
  - **Para domingos separadamente**:
    - Carga horária prevista marcada como "Domingo" com data específica
    - Total de horas trabalhadas em domingos
    - Número de funcionários que trabalharam em domingos
- Os cálculos devem excluir motivos com:
  - Totalizador diferente de 'A' (não são ausências)
  - Natureza diferente de 'D' (não são débitos)
- Se um centro de custo específico for selecionado, os dados devem ser filtrados por esse centro de custo.
- Se a opção "Agrupar por Centro de Custo" estiver marcada, os dados devem ser agrupados por centro de custo.
- O período do relatório deve aparecer no cabeçalho como "MM/YYYY".

## História 4.10.1.12 – Validar Existência de Dados antes de Gerar Relatório
**Como** usuário do sistema,  
**Quero** que o sistema valide se existem dados correspondentes aos filtros aplicados,  
**Para** evitar a geração de relatórios vazios e economizar recursos do sistema.

**Critérios de Aceite:**
- Após processar os filtros e criar a tabela temporária, o sistema deve verificar se há registros.
- Se não houver dados, o sistema deve exibir a mensagem: "Não há dados que satisfaçam a consulta."
- Nenhum relatório deve ser gerado quando não houver dados.
- A barra de progresso deve ser ocultada após a validação.

## História 4.10.1.13 – Monitorar Progresso da Geração do Relatório
**Como** usuário do sistema,  
**Quero** visualizar uma barra de progresso durante o processamento do relatório,  
**Para** ter feedback visual sobre o andamento da geração dos dados.

**Critérios de Aceite:**
- Uma barra de progresso deve ser exibida durante o processamento.
- A barra deve ter 3 estágios principais:
  1. Criação da tabela temporária com dados filtrados
  2. Processamento dos dados e validação
  3. Preparação para impressão
- A barra deve ser ocultada após a conclusão do processamento ou em caso de erro.

## História 4.10.1.14 – Gerar Relatório Formatado com Centro de Custo
**Como** usuário do sistema,  
**Quero** que o relatório final apresente os dados formatados de acordo com a opção de agrupamento selecionada,  
**Para** visualizar os resultados de forma clara e organizada.

**Critérios de Aceite:**
- Se a opção "Agrupar por Centro de Custo" estiver marcada:
  - Deve criar uma tabela temporária (`##TBtemp_relat_totaliz_hora`) com a lista de centros de custo
  - O relatório deve mostrar os dados separados por centro de custo
  - Cada centro de custo deve mostrar: código, descrição, empresa
- Se a opção "Agrupar por Centro de Custo" não estiver marcada:
  - Deve criar uma tabela temporária com dados consolidados por empresa
  - Se um centro de custo específico foi selecionado, deve mostrar apenas esse centro de custo
  - Se nenhum centro de custo foi selecionado, deve mostrar "NULL" para código e descrição
- O relatório deve usar dois conjuntos de dados:
  - Dados principais (empresa/centro de custo)
  - Dados de totalizadores (horas previstas vs. trabalhadas)
- O título do relatório deve ser "Relatório Totalizador de Horas" com o período especificado.

---

# Histórias de Usuário – Relatório Importação do Cartão de Ponto

# História de Usuário 4.11.1 – Relatório Importação do Cartão de Ponto

**Como** responsável pela gestão de pessoal ou administrador do sistema,  
**Quero** visualizar um relatório prévio dos dados de cartão de ponto que serão importados de um arquivo de texto,  
**Para** validar as informações antes da importação definitiva, garantindo que os registros correspondam aos funcionários corretos, ao período desejado e à empresa selecionada, evitando inconsistências no banco de dados.

---

## Critérios de Aceite:

### 1. Seleção de Rede e Empresa
- [ ] Ao acessar o formulário, o sistema deve carregar a lista de redes disponíveis
- [ ] Ao selecionar uma rede, o sistema deve carregar automaticamente as empresas vinculadas a ela
- [ ] A seleção de uma empresa é obrigatória para prosseguir

### 2. Filtro por Funcionários
- [ ] Após selecionar a empresa, o sistema deve listar apenas os funcionários ativos (não demitidos) na data final do período informado
- [ ] Deve ser possível selecionar um ou mais funcionários para filtrar o relatório
- [ ] Se nenhum funcionário for selecionado, o relatório deve incluir todos os funcionários da empresa

### 3. Definição do Período
- [ ] O usuário deve informar um período com data de início e data de fim
- [ ] O sistema deve validar se o mês de início e o mês de fim são iguais, não permitindo períodos que abranjam mais de um mês
- [ ] A data de início não pode ser posterior à data de fim

### 4. Seleção do Arquivo de Importação
- [ ] O usuário deve selecionar um arquivo de texto (.TXT) contendo os dados do cartão de ponto
- [ ] O sistema deve abrir um diálogo de arquivo para facilitar a navegação e seleção
- [ ] O caminho do arquivo selecionado deve ser exibido em um campo visível

### 5. Validações Antes da Geração
- [ ] O sistema deve validar se todos os campos obrigatórios (empresa, período e caminho do arquivo) foram preenchidos
- [ ] Caso algum campo obrigatório não seja preenchido, o sistema deve exibir uma mensagem informativa e posicionar o foco no campo correspondente

### 6. Processamento do Arquivo e Geração do Relatório
- [ ] Ao confirmar, o sistema deve ler o arquivo de texto, extrair os dados (PIS, data, hora) e cruzá-los com os funcionários da empresa selecionada, dentro do período especificado
- [ ] Os dados processados devem ser temporariamente armazenados em tabelas temporárias no banco de dados para geração do relatório
- [ ] O relatório deve exibir, para cada registro importado:
  - ID do funcionário
  - Data do registro
  - Data e hora completas do registro
  - Nome do funcionário
- [ ] O relatório deve ser ordenado pelo nome do funcionário

### 7. Controles de Ação
- [ ] Deve ser possível cancelar a operação a qualquer momento, limpando todos os campos e retornando ao estado inicial
- [ ] Deve ser possível atualizar a lista de redes (e consequentemente de empresas e funcionários) sem fechar o formulário
- [ ] Deve ser possível sair do formulário

### 8. Feedback Visual
- [ ] Durante o processamento do arquivo e geração do relatório, o sistema deve fornecer um indicador visual de progresso (ex.: barra de progresso)
- [ ] O relatório final deve ser exibido em um visualizador de relatórios (ex.: Crystal Reports) para impressão ou exportação

### 9. Tratamento de Erros
- [ ] Em caso de erro durante a leitura do arquivo, processamento dos dados ou geração do relatório, o sistema deve exibir uma mensagem clara e permitir que o usuário tente novamente
- [ ] O sistema deve garantir que tabelas temporárias sejam devidamente criadas e excluídas ao final do processo para evitar acúmulo de lixo no banco de dados

---

# Histórias de Usuário – Importação do Cartão de Ponto

# **História de Usuário 5.1.1 – Importação do Cartão de Ponto**

**Como** gestor de pessoal ou administrador do sistema,  
**Quero** importar arquivos de cartão de ponto de diferentes formatos,  
**Para** processar automaticamente as batidas dos funcionários, calcular horas trabalhadas, extras, adicionais noturnos, faltas, folgas e atualizar o banco de horas de forma eficiente e confiável.

---

## **Critérios de Aceitação:**

### **1. Configuração dos Filtros de Importação**
- [ ] O sistema deve permitir a seleção hierárquica: **Rede → Empresa → Funcionário(s)**
- [ ] Ao selecionar uma rede, o sistema deve carregar automaticamente as empresas vinculadas
- [ ] Ao selecionar uma empresa, o sistema deve carregar apenas os funcionários **ativos** (não demitidos) na data final do período
- [ ] Deve ser possível selecionar **múltiplos funcionários** ou deixar em branco para importar todos
- [ ] O usuário deve definir um **período de importação** com data inicial e final
- [ ] O sistema deve validar se o período está dentro do **mesmo mês e ano**, não permitindo importação cruzando meses ou anos
- [ ] A data inicial não pode ser posterior à data final

### **2. Seleção do Layout do Arquivo**
- [ ] O sistema deve permitir escolher o **layout do arquivo** de importação (ex: TopData, Kurumim REP II)
- [ ] O layout selecionado deve determinar a **estrutura de leitura** do arquivo (delimitadores, posições dos campos)

### **3. Seleção e Validação do Arquivo**
- [ ] O sistema deve abrir um **diálogo para seleção de arquivo** do tipo `.TXT`
- [ ] O caminho do arquivo deve ser exibido após a seleção
- [ ] O sistema deve validar se o caminho é uma **rede** (`\\`) e se o arquivo **existe**
- [ ] Deve validar se o arquivo está no **layout padrão** de importação (ex: PIS nas posições corretas)

### **4. Opção de Sobrescrita**
- [ ] Deve haver uma **opção para sobrescrever** os dados de ponto já existentes no período
- [ ] Se marcada, o sistema deve **solicitar confirmação** antes de prosseguir

### **5. Validações Pré-Importação**
- [ ] O sistema deve verificar se **todos os parâmetros de ponto** estão cadastrados para a empresa selecionada (motivos de hora trabalhada, hora extra, falta, folga, etc.). Se faltar algum, exibir mensagem e impedir a importação
- [ ] O sistema deve verificar se **não há uma digitação de ponto em aberto** na interface de digitação. Se houver, exibir mensagem e impedir a importação

### **6. Processamento do Arquivo**
- [ ] O sistema deve ler o arquivo **linha a linha** conforme o layout selecionado
- [ ] Deve extrair o **PIS, data e hora** de cada batida
- [ ] Deve **cruzar o PIS** com a base de funcionários da empresa selecionada
- [ ] Deve **ignorar batidas** de funcionários não encontrados ou inativos
- [ ] Deve ignorar batidas **fora do período** selecionado
- [ ] Deve **validar a consistência** das datas (ex: datas válidas, dentro do mês correto)
- [ ] Deve **armazenar as batidas válidas** em uma tabela temporária para processamento

### **7. Cálculos de Horas**
- [ ] Para cada funcionário e cada dia, o sistema deve:
  - [ ] Identificar o **horário padrão conforme escala**
  - [ ] Verificar se é **folga, feriado ou dia normal**
  - [ ] Calcular as **horas trabalhadas** com base nas batidas
  - [ ] Comparar com o horário padrão para determinar **horas extras (positivas)** ou **horas negativas (faltas)**
  - [ ] Calcular o **adicional noturno** (horas entre 22h e 5h)
  - [ ] Calcular **hora extra noturna** (horas extras no período noturno)
  - [ ] Considerar **escalas noturnas** (turnos que atravessam a madrugada)

### **8. Integração com Banco de Horas**
- [ ] O sistema deve **salvar as batidas** na tabela de cartão de ponto
- [ ] Deve gerar os **totalizadores de horas** (normais, extras, adicionais, etc.)
- [ ] Deve **atualizar o banco de horas** do funcionário, considerando saldo anterior
- [ ] Deve **compensar banco de horas** automaticamente, se configurado

### **9. Feedback e Logs**
- [ ] Durante o processamento, o sistema deve exibir uma **barra de progresso** e o nome do funcionário sendo processado
- [ ] Se houver dias com **número inválido de batidas** (ex: menos de 4 em dia normal), o sistema deve registrar em uma tabela de log
- [ ] Ao final, se houver inconsistências, o sistema deve **gerar um arquivo de texto com o log** e abri-lo para o usuário
- [ ] Deve exibir uma **mensagem de sucesso** ao concluir a importação

### **10. Tratamento de Erros**
- [ ] Em caso de erro na leitura do arquivo, o sistema deve **exibir uma mensagem clara** e interromper a importação
- [ ] Deve **garantir que tabelas temporárias** sejam criadas e excluídas corretamente

---

# Histórias de Usuário – Exportação do Arquivo AEJ

## **História 5.2.1 – Exportação do Arquivo AEJ**

### **Como** usuário do sistema de gestão de pessoas  
**Quero** poder exportar o Arquivo Eletrônico de Jornada (AEJ)  
**Para** atender às exigências legais de registro de jornada de trabalho e enviar os dados aos órgãos competentes.

**Critérios de Aceite:**

1. O sistema deve permitir a seleção de uma Rede antes da seleção da Empresa.
2. Ao selecionar uma Rede, a lista de Empresas deve ser filtrada para mostrar apenas as empresas pertencentes àquela rede.
3. O sistema deve permitir a definição de um período (data inicial e data final) para exportação.
4. O usuário deve poder escolher o caminho e nome do arquivo de exportação através de um diálogo.
5. Antes da exportação, o sistema deve validar se:
   - A Rede foi informada.
   - A Empresa foi informada.
   - O caminho do arquivo foi selecionado.
   - A empresa possui REP cadastrado.
   - A data inicial não é maior que a data final.
6. Se houver funcionários com batidas incompletas no período selecionado, o sistema deve:
   - Exibir uma mensagem informando sobre as inconsistências.
   - Gerar um arquivo de log listando os funcionários e os dias com batidas incompletas.
   - Impedir a exportação do arquivo AEJ.
7. O sistema deve executar o procedimento armazenado `sp_cp_exportar_arquivo_aej` passando os parâmetros corretos (ID da rede, ID da empresa, data inicial e data final formatadas).
8. O arquivo de exportação deve ser gerado no caminho especificado, contendo as linhas retornadas pelo procedimento armazenado.
9. Após a exportação bem-sucedida, o sistema deve exibir uma mensagem de confirmação e limpar os campos do formulário.
10. O sistema deve fornecer botões para:
    - Confirmar a exportação.
    - Cancelar a operação (limpando os campos).
    - Atualizar as listas de Rede e Empresa.
    - Sair do formulário.

---

## **História 5.2.2 – Validação de Batidas Incompletas**

**Como** usuário responsável pela exportação do AEJ  
**Quero** ser alertado sobre batidas incompletas antes de gerar o arquivo  
**Para** evitar a exportação de dados inconsistentes e corrigir os registros antes do envio.

**Critérios de Aceite:**

1. O sistema deve verificar automaticamente a existência de batidas incompletas ao clicar no botão "Confirmar".
2. A validação deve considerar apenas os dias dentro do período selecionado.
3. Batidas incompletas são definidas como:
   - Movimentos de ponto sem saída registrada.
   - Presença de apenas um turno quando são esperados dois turnos (com base na escala do funcionário).
4. Se houver batidas incompletas, o sistema deve:
   - Exibir uma mensagem de alerta informando a inconsistência.
   - Gerar um arquivo de log (`LogExportacaoAEJ.txt`) no diretório temporário.
   - O log deve conter:
     - Cabeçalho com data/hora, usuário e empresa selecionada.
     - Lista dos funcionários com batidas incompletas, ordenada por nome e data.
     - Instrução para correção dos dias inconsistentes.
5. O sistema deve abrir automaticamente o arquivo de log no Bloco de Notas após sua criação.
6. A exportação do AEJ não deve prosseguir enquanto houver batidas incompletas não tratadas.

---

## **História 5.2.3 – Atualização e Limpeza de Campos**

**Como** usuário do formulário de exportação  
**Quero** poder atualizar as listas de Rede/Empresa e limpar os campos rapidamente  
**Para** realizar múltiplas exportações de forma eficiente e corrigir seleções incorretas.

**Critérios de Aceite:**

1. O botão "Atualizar" deve recarregar as listas de Rede e Empresa do banco de dados.
2. Ao clicar em "Atualizar", o campo "Rede" deve ser preenchido com a rede padrão do usuário.
3. A seleção da rede padrão deve automaticamente filtrar as empresas disponíveis para aquela rede.
4. O botão "Cancelar" deve limpar todos os campos do formulário:
   - Rede (definindo como vazio)
   - Empresa (definindo como vazio)
   - Caminho do arquivo
   - Data inicial (definindo como data atual)
   - Data final (definindo como data atual)
5. Após a exportação bem-sucedida, os campos devem ser automaticamente limpos.
6. O sistema deve manter a navegação por teclado funcional durante todas as operações.

---

## **História 5.2.4 – Navegação e Controle por Teclado**

**Como** usuário experiente do sistema  
**Quero** poder navegar e controlar o formulário usando o teclado  
**Para** aumentar minha produtividade e eficiência nas operações de exportação.

**Critérios de Aceite:**

1. O formulário deve responder à tecla Enter movendo o foco para o próximo campo (exceto em botões).
2. O formulário deve responder à tecla Escape para sair do formulário.
3. Quando um botão estiver em foco, o tratamento global de teclas deve ser temporariamente desabilitado.
4. Ao perder o foco de um botão, o tratamento global de teclas deve ser reativado.
5. Todos os controles do formulário devem ser acessíveis via navegação por Tab.

---

## **História 5.2.5 – Geração de Nome de Arquivo Automático**

**Como** usuário que exporta frequentemente arquivos AEJ  
**Quero** que o sistema sugira um nome de arquivo padrão  
**Para** manter um padrão de nomenclatura e facilitar a organização dos arquivos exportados.

**Critérios de Aceite:**

1. Ao abrir o diálogo de seleção de caminho, o sistema deve sugerir um nome baseado no padrão:
   `Exp_AEJ_Emp_XX.txt` onde XX é o código da empresa com dois dígitos (com zero à esquerda se necessário).
2. O caminho padrão deve ser o último caminho utilizado ou um diretório padrão do sistema.
3. O usuário deve poder alterar o nome sugerido no diálogo de salvamento.
4. O nome do arquivo deve aparecer no campo "Caminho Selecionado" após a seleção.

---

## **História 5.2.6 – Gerenciamento de Tabelas Temporárias**

**Como** sistema de exportação AEJ  
**Quero** criar e gerenciar tabelas temporárias para validações e processamento  
**Para** garantir a integridade dos dados e evitar conflitos entre múltiplos usuários.

**Critérios de Aceite:**

1. Antes da validação de batidas incompletas, o sistema deve criar uma tabela temporária (`##TBtemp_log_batida_invalida`) se ela não existir.
2. Se a tabela temporária já existir, o sistema deve excluir seu conteúdo antes do uso.
3. Para o processamento do arquivo AEJ, o sistema deve criar uma tabela temporária (`##TBtemp_retorno_proc`) para armazenar os resultados do procedimento armazenado.
4. Todas as tabelas temporárias devem ser criadas com nomes únicos para evitar conflitos entre sessões simultâneas.
5. O sistema deve garantir que as tabelas temporárias sejam adequadamente gerenciadas mesmo em caso de erros durante o processo.

---

## **História 5.2.7 – Tratamento de Erros e Logs**

**Como** administrador do sistema  
**Quero** que todos os erros no processo de exportação sejam tratados e registrados  
**Para** diagnosticar problemas e manter a estabilidade do sistema.

**Critérios de Aceite:**

1. Todas as rotinas do formulário devem ter tratamento de erros com `On Error GoTo`.
2. Em caso de erro, o sistema deve chamar `clsSeguranca.Erro` passando o nome da rotina onde ocorreu o erro.
3. Após o tratamento de erro em operações principais, o sistema deve restaurar a interface para o estado normal.
4. Para erros na validação de batidas incompletas, o sistema deve gerar logs detalhados no diretório temporário.
5. Mensagens de erro para o usuário devem ser claras e informativas, sem detalhes técnicos.
6. O sistema deve garantir que recursos (como conexões de banco e arquivos) sejam liberados mesmo em caso de erro.

---

# Histórias de Usuário - Exportação do Arquivo Madis

## **História 5.3.1 - Exportação do Arquivo Madis**

**Como** usuário do sistema de gestão de pessoas  
**Quero** exportar arquivos de funcionários no formato Madis para integração com sistemas de ponto  
**Para** garantir que os dados de admissão e demissão sejam corretamente transmitidos ao sistema de controle de ponto Madis.

**Critérios de Aceite:**

1. O sistema deve permitir a seleção de uma Rede a partir de uma lista carregada do banco de dados
2. Ao selecionar uma Rede, a lista de Empresas deve ser automaticamente filtrada para mostrar apenas empresas daquela rede
3. O sistema deve permitir a seleção de uma Empresa específica para exportação
4. Deve ser possível selecionar múltiplos funcionários através de um controle de seleção múltipla
5. O usuário deve poder escolher entre exportar dados de "Admissão" ou "Demissão"
6. Deve ser possível definir um período opcional para filtragem (com datas inicial e final)
7. O sistema deve permitir a seleção do caminho onde o arquivo será salvo
8. Ao clicar no botão "Confirmar", o sistema deve:
   - Validar que uma empresa foi selecionada
   - Validar que um caminho de arquivo foi especificado
   - Gerar o arquivo no formato correto para o Madis
   - Exibir mensagem de confirmação após sucesso
9. O nome do arquivo deve seguir o padrão: `ExpMadis_[Adm/Dem]_Emp_XX.txt` (onde XX é o código da empresa)
10. O botão "Cancelar" deve limpar todos os campos do formulário
11. O botão "Atualizar" deve recarregar as listas de Rede e Empresa

## **História 5.3.2 - Filtragem Inteligente de Funcionários**

**Como** usuário responsável pela exportação de dados  
**Quero** que o sistema filtre automaticamente os funcionários com base no tipo de exportação (admissão/demissão) e período  
**Para** evitar erros na seleção e garantir que apenas os registros relevantes sejam exportados.

**Critérios de Aceite:**

1. Ao selecionar "Admissão", o sistema deve mostrar apenas funcionários ativos (não demitidos)
2. Ao selecionar "Demissão", o sistema deve mostrar apenas funcionários demitidos
3. Quando um período é especificado:
   - Para "Admissão", filtrar por data de admissão no período
   - Para "Demissão", filtrar por data de demissão no período
4. O período deve ser opcional - quando não especificado, considerar todos os registros
5. A lista de funcionários deve ser atualizada automaticamente quando:
   - A empresa é alterada
   - O tipo de exportação (admissão/demissão) é alterado
   - O período é alterado
6. O controle de seleção múltipla deve mostrar as colunas: Matrícula e Nome do Funcionário

## **História 5.3.3 - Formatação Específica do Arquivo Madis**

**Como** técnico de integração de sistemas  
**Quero** que o arquivo gerado siga exatamente o formato exigido pelo sistema Madis  
**Para** garantir que a importação no sistema de ponto seja bem-sucedida sem erros de formatação.

**Critérios de Aceite:**

1. Para exportação de "Admissão", o arquivo deve conter os seguintes campos formatados:
   - Código da empresa + matrícula (15 dígitos, preenchidos com zeros à esquerda)
   - 7 espaços em branco
   - Nome do funcionário (40 caracteres, alinhado à esquerda)
   - Dígito "0"
   - Data de admissão no formato DDMMYYYY
   - 21 espaços em branco
   - Código "00" + horas mensais (3 dígitos)
   - 8 espaços em branco
   - Código do horário (4 dígitos, preenchidos com zeros à esquerda)
   - Código "00"
   - 6 espaços em branco
   - Número do PIS (11 dígitos) ou espaços se não houver
   - 18 espaços em branco
   - Código "00"
   - Código do cargo (8 dígitos, preenchidos com zeros à esquerda)
   - 50 espaços em branco
   - 72 espaços em branco (reservado para email)

2. Para exportação de "Demissão", o arquivo deve conter:
   - Matrícula (17 dígitos, preenchidos com zeros à esquerda)
   - Código "902"
   - 45 espaços em branco
   - Data de demissão no formato DDMMYYYY
   - 46 espaços em branco
   - Número do PIS

3. Cada registro deve ocupar exatamente uma linha no arquivo
4. O arquivo deve ser um arquivo de texto simples (.txt)
5. A ordenação dos registros deve ser alfabética por nome do funcionário

## **História 5.3.4 - Validação e Feedback Durante a Exportação**

**Como** usuário que realiza exportações frequentes  
**Quero** receber feedback claro sobre o status da exportação e possíveis problemas  
**Para** identificar e corrigir rapidamente qualquer problema que impeça a geração do arquivo.

**Critérios de Aceite:**

1. Antes de iniciar a exportação, o sistema deve validar:
   - Que uma empresa foi selecionada
   - Que um caminho de arquivo foi especificado
2. Se a validação falhar, o sistema deve:
   - Exibir mensagem clara indicando o campo faltante
   - Posicionar o foco no campo que precisa ser preenchido
3. Durante a geração do arquivo, o sistema deve:
   - Mostrar uma barra de progresso indicando os estágios:
     1. Preparação dos dados
     2. Consulta ao banco de dados
     3. Escrita do arquivo
   - Impedir novas ações do usuário até a conclusão
4. Se não houver dados para exportar, o sistema deve:
   - Informar "Não existem dados para exportação"
   - Não criar o arquivo
5. Após conclusão bem-sucedida, o sistema deve:
   - Exibir mensagem "Arquivo gerado com sucesso!"
   - Limpar automaticamente todos os campos do formulário
6. Em caso de erro durante o processo, o sistema deve:
   - Exibir mensagem amigável de erro
   - Registrar o erro no log do sistema para análise técnica
   - Restaurar a interface para estado normal

## **História 5.3.5 - Navegação Eficiente por Teclado**

**Como** usuário experiente do sistema  
**Quero** poder navegar e executar ações usando apenas o teclado  
**Para** aumentar minha produtividade ao realizar múltiplas exportações sequenciais.

**Critérios de Aceite:**

1. O formulário deve permitir navegação sequencial entre campos usando a tecla Tab
2. A tecla Enter deve mover o foco para o próximo campo (exceto em botões de ação)
3. A tecla Escape deve fechar o formulário
4. Quando um botão está em foco, o tratamento global de teclas deve ser temporariamente desabilitado
5. Ao perder o foco de um botão, o tratamento global de teclas deve ser reativado
6. Os atalhos de teclado padrão do sistema (como Ctrl+C, Ctrl+V) devem funcionar nos campos de texto

## **História 5.3.6 - Gerenciamento de Estado da Interface**

**Como** usuário que trabalha com múltiplas janelas  
**Quero** que a interface responda adequadamente durante operações longas  
**Para** saber quando o sistema está processando e evitar ações duplicadas.

**Critérios de Aceite:**

1. Durante a exportação, a interface deve entrar em modo "em espera"
2. A barra de progresso deve ficar visível durante o processamento
3. Os botões de ação devem ser desabilitados durante o processamento
4. Após a conclusão (seja sucesso ou erro), a interface deve retornar ao estado normal
5. Se o usuário tentar interagir durante o processamento, o sistema deve ignorar a ação
6. O cursor do mouse deve mudar para "espera" durante operações longas

## **História 5.3.7 - Configuração Inicial Inteligente**

**Como** usuário que acessa o formulário frequentemente  
**Quero** que o sistema configure automaticamente valores padrão relevantes  
**Para** reduzir o tempo necessário para iniciar uma exportação.

**Critérios de Aceite:**

1. Ao abrir o formulário, o sistema deve:
   - Carregar automaticamente a lista de redes
   - Configurar a rede padrão do usuário (se disponível)
   - Filtrar empresas com base na rede padrão
   - Selecionar automaticamente a opção "Admissão"
   - Limpar as datas do período
   - Limpar o campo de caminho
2. Ao clicar em "Atualizar", o sistema deve:
   - Recarregar a lista de redes
   - Configurar novamente a rede padrão
   - Atualizar a lista de empresas filtradas
3. O botão "Cancelar" deve restaurar o formulário ao estado inicial padrão

---