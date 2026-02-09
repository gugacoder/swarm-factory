# # **1. Cadastro de Funcionários**

---

# ## **1.1. Estrutura Geral do CRUD**

---

### ### **1.1.1. Listagem**

* **SPEC-CP-FUNC-LI-001:** Sistema DEVE exibir lista paginada de funcionários.
* **SPEC-CP-FUNC-LI-002:** Sistema DEVE permitir filtrar por Nome, Matrícula, CPF, Situação, Cargo, Setor e Unidade.
* **SPEC-CP-FUNC-LI-003:** Funcionários Inativos NÃO DEVEM aparecer por padrão na listagem.
* **SPEC-CP-FUNC-LI-004:** Sistema DEVE permitir ativar filtro para exibir funcionários Inativos.
* **SPEC-CP-FUNC-LI-005:** Sistema DEVE ordenar a lista alfabeticamente por Nome.
* **SPEC-CP-FUNC-LI-006:** Listagem DEVE exibir colunas mínimas: Nome, Matrícula, CPF, Situação, Cargo, Setor e Unidade.
* **SPEC-CP-FUNC-LI-007:** Sistema DEVE permitir exportar a listagem em CSV.
* **SPEC-CP-FUNC-LI-008:** Sistema DEVE exibir indicador visual quando filtros estiverem ativos.
* **SPEC-CP-FUNC-LI-009:** Sistema DEVE permitir selecionar um funcionário para edição por clique ou botão “Editar”.
* **SPEC-CP-FUNC-LI-010:** Sistema DEVE permitir navegação entre páginas, mostrando página atual e total de páginas.

---

### ### **1.1.2. Cadastro (Create)**

* **SPEC-CP-FUNC-CR-001:** Sistema DEVE permitir inclusão de novo funcionário com todos os campos obrigatórios preenchidos.
* **SPEC-CP-FUNC-CR-002:** Sistema NÃO DEVE permitir duplicidade de CPF.
* **SPEC-CP-FUNC-CR-003:** Sistema NÃO DEVE permitir duplicidade de Matrícula.
* **SPEC-CP-FUNC-CR-004:** Sistema DEVE exigir dados mínimos: Nome, CPF, Matrícula e Data de Admissão.
* **SPEC-CP-FUNC-CR-005:** Data de Admissão NÃO DEVE ser futura.
* **SPEC-CP-FUNC-CR-006:** Sistema DEVE gerar ID único para o funcionário cadastrado.
* **SPEC-CP-FUNC-CR-007:** Sistema DEVE registrar auditoria completa no momento do cadastro.
* **SPEC-CP-FUNC-CR-008:** Sistema DEVE apresentar mensagens claras de validação em caso de erros.
* **SPEC-CP-FUNC-CR-009:** Cadastro DEVE ser confirmado apenas após validação completa de todos os campos.

---

### ### **1.1.3. Edição (Update)**

* **SPEC-CP-FUNC-ED-001:** Sistema DEVE permitir edição de todos os campos, exceto o ID.
* **SPEC-CP-FUNC-ED-002:** Sistema DEVE exigir justificativa ao alterar informações críticas (CPF, Matrícula, Situação, Data de Admissão).
* **SPEC-CP-FUNC-ED-003:** Sistema DEVE registrar histórico detalhado de todas as alterações.
* **SPEC-CP-FUNC-ED-004:** Alterações em Escala ou Horário DEVEM gerar alerta sobre impacto no cálculo de ponto.
* **SPEC-CP-FUNC-ED-005:** Sistema NÃO DEVE permitir edição de funcionário Inativo sem justificativa.
* **SPEC-CP-FUNC-ED-006:** Sistema DEVE impedir alteração de CPF para valor já existente.

---

### ### **1.1.4. Exclusão (Delete)**

* **SPEC-CP-FUNC-EX-001:** Sistema NÃO DEVE permitir exclusão física do funcionário.
* **SPEC-CP-FUNC-EX-002:** Exclusão DEVE ser lógica, transformando funcionário em Inativo.
* **SPEC-CP-FUNC-EX-003:** Sistema DEVE exigir justificativa para inativação/exclusão.
* **SPEC-CP-FUNC-EX-004:** Funcionário com registros de ponto NÃO DEVE ser excluído, apenas inativado.
* **SPEC-CP-FUNC-EX-005:** Sistema DEVE registrar histórico de inativação.

---

---

# ## **1.2. Dados Pessoais**

* **SPEC-CP-FUNC-DP-001:** Sistema DEVE permitir cadastrar Nome Completo.
* **SPEC-CP-FUNC-DP-002:** Nome DEVE conter mínimo de 3 caracteres.
* **SPEC-CP-FUNC-DP-003:** Sistema DEVE permitir selecionar Sexo (Masculino, Feminino, Outro).
* **SPEC-CP-FUNC-DP-004:** Sistema DEVE permitir informar Data de Nascimento.
* **SPEC-CP-FUNC-DP-005:** Data de Nascimento NÃO DEVE ser futura.
* **SPEC-CP-FUNC-DP-006:** Sistema DEVE validar idade mínima de 14 anos.
* **SPEC-CP-FUNC-DP-007:** Sistema DEVE permitir cadastrar Nome do Pai e Nome da Mãe.
* **SPEC-CP-FUNC-DP-008:** Sistema DEVE permitir cadastrar PIS (número + data).
* **SPEC-CP-FUNC-DP-009:** Sistema DEVE validar o número do PIS (11 dígitos).
* **SPEC-CP-FUNC-DP-010:** Sistema DEVE validar CPF mediante cálculo dos dígitos verificadores.
* **SPEC-CP-FUNC-DP-011:** Sistema DEVE permitir cadastrar RG (número, órgão emissor, UF e data de expedição).
* **SPEC-CP-FUNC-DP-012:** Sistema DEVE permitir cadastrar Título Eleitoral (número, zona, seção).
* **SPEC-CP-FUNC-DP-013:** Sistema DEVE permitir cadastrar telefone e e-mail.
* **SPEC-CP-FUNC-DP-014:** Sistema DEVE permitir cadastrar endereço completo.

---

# ## **1.3. Dados Funcionais**

* **SPEC-CP-FUNC-DF-001:** Sistema DEVE permitir cadastrar Matrícula única.
* **SPEC-CP-FUNC-DF-002:** Sistema DEVE permitir associar Cargo.
* **SPEC-CP-FUNC-DF-003:** Sistema DEVE permitir selecionar Setor.
* **SPEC-CP-FUNC-DF-004:** Sistema DEVE permitir registrar Unidade de Atuação.
* **SPEC-CP-FUNC-DF-005:** Sistema DEVE permitir selecionar Tipo de Vínculo (CLT, Estagiário, Temporário, Terceirizado etc.).
* **SPEC-CP-FUNC-DF-006:** Sistema DEVE permitir registrar Data de Admissão.
* **SPEC-CP-FUNC-DF-007:** Sistema DEVE permitir registrar Data de Desligamento quando aplicável.
* **SPEC-CP-FUNC-DF-008:** Data de desligamento NÃO DEVE ser anterior à admissão.
* **SPEC-CP-FUNC-DF-009:** Sistema DEVE permitir registrar salário base.
* **SPEC-CP-FUNC-DF-010:** Sistema DEVE permitir registrar percentual de adiantamento.

---

# ## **1.4. Situação do Funcionário**

* **SPEC-CP-FUNC-ST-001:** Sistema DEVE permitir definir situação: Ativo ou Inativo.
* **SPEC-CP-FUNC-ST-002:** Sistema DEVE exigir motivo ao inativar funcionário.
* **SPEC-CP-FUNC-ST-003:** Sistema DEVE registrar histórico completo de situação.
* **SPEC-CP-FUNC-ST-004:** Funcionários inativos NÃO DEVEM aparecer nos cálculos de ponto.
* **SPEC-CP-FUNC-ST-005:** Sistema NÃO DEVE permitir reativação sem justificativa.

---

# ## **1.5. Associações Funcionais**

* **SPEC-CP-FUNC-AS-001:** Sistema DEVE permitir associar Escala ao funcionário.
* **SPEC-CP-FUNC-AS-002:** Sistema DEVE permitir associar Horário vigente.
* **SPEC-CP-FUNC-AS-003:** Sistema DEVE permitir informar Unidade Física.
* **SPEC-CP-FUNC-AS-004:** Sistema DEVE permitir vincular REP autorizado.
* **SPEC-CP-FUNC-AS-005:** Funcionário inativo NÃO DEVE ser vinculado a REP.
* **SPEC-CP-FUNC-AS-006:** Mudanças em Escala ou Horário DEVEM gerar alerta de impacto no cálculo.

---

# ## **1.6. Auditoria**

* **SPEC-CP-FUNC-AU-001:** Todas as operações DEVE gerar registro de auditoria.
* **SPEC-CP-FUNC-AU-002:** Auditoria DEVE registrar campo, valor antigo, valor novo, usuário e data/hora.
* **SPEC-CP-FUNC-AU-003:** Auditoria DEVE exigir justificativa em alterações críticas.
* **SPEC-CP-FUNC-AU-004:** Histórico DEVE ser permanente e imutável.
* **SPEC-CP-FUNC-AU-005:** Sistema DEVE permitir consultas avançadas de auditoria.

---

# ## **1.7. Integração com Backend / Mutations**

### **Mutation de criação**

* **SPEC-CP-FUNC-MT-001:**

```
schema: "cadastro"
mutate: "funcionario"
action: "insert"
```

### **Mutation de atualização**

* **SPEC-CP-FUNC-MT-002:**

```
schema: "cadastro"
mutate: "funcionario"
action: "update"
```

### **Evento SSE**

* **SPEC-CP-FUNC-MT-003:**

```json
{
  "type": "employee-updated",
  "target": "employee:<id>",
  "data": {
    "employee_id": "<id>",
    "changed_fields": ["campo"],
    "timestamp": "<iso8601>"
  }
}
```

---

# ## **1.8. Componente React**

* **SPEC-CP-FUNC-UI-001:** Interface DEVE utilizar o componente `<EmployeeForm />`.
* **SPEC-CP-FUNC-UI-002:** Formulário DEVE conter todos os campos definidos.
* **SPEC-CP-FUNC-UI-003:** Submissão DEVE acionar mutations backend.
* **SPEC-CP-FUNC-UI-004:** Interface DEVE exibir mensagens claras de erro.
* **SPEC-CP-FUNC-UI-005:** Interface DEVE validar campos antes do envio.

---

# ## **1.9. Validações**

* **SPEC-CP-FUNC-VL-001:** CPF inválido NÃO DEVE ser aceito.
* **SPEC-CP-FUNC-VL-002:** PIS deve ser validado conforme regra oficial.
* **SPEC-CP-FUNC-VL-003:** Datas DEVE ser coerentes (nascimento, admissão, desligamento).
* **SPEC-CP-FUNC-VL-004:** Matrícula deve ser única.
* **SPEC-CP-FUNC-VL-005:** Email deve ter formato válido.
* **SPEC-CP-FUNC-VL-006:** Campos obrigatórios NÃO DEVEM ficar em branco.

---

# ## **1.10. Integração com REP e Módulo de Ponto**

* **SPEC-CP-FUNC-RP-001:** Funcionário sem REP vinculado NÃO DEVE registrar ponto.
* **SPEC-CP-FUNC-RP-002:** Funcionário inativo NÃO DEVE registrar ponto.
* **SPEC-CP-FUNC-RP-003:** Mudanças de escala DEVEM refletir imediatamente no cálculo.

---

# ## **1.11. Banco de Dados**

* **SPEC-CP-FUNC-DB-001:** Tabela `funcionarios` DEVE usar `id` como chave primária.
* **SPEC-CP-FUNC-DB-002:** CPF e Matrícula DEVEM ser únicos.
* **SPEC-CP-FUNC-DB-003:** Auditoria DEVE ser armazenada em tabela dedicada.
* **SPEC-CP-FUNC-DB-004:** Timestamps DEVEM ser gerados automaticamente.

---

# **2. Requisitos – Cadastro de Horários**

## **2.1. Cadastro de Horários**

---

## **2.1.1. Dados do Horário**

- **SPEC-CP-HO-CA-DH-001**: Sistema DEVE permitir informar **Hora de Entrada** em campo específico, com máscara de horário.  
- **SPEC-CP-HO-CA-DH-002**: Sistema DEVE permitir informar **Hora de Saída** em campo específico, com máscara de horário.  
- **SPEC-CP-HO-CA-DH-003**: Sistema DEVE validar que a **hora de saída** é maior que a **hora de entrada**, exibindo mensagem de erro quando violado.  
- **SPEC-CP-HO-CA-DH-004**: Sistema DEVE permitir cadastrar **intervalos**, suportando múltiplos intervalos ou intervalo único conforme configuração.  
- **SPEC-CP-HO-CA-DH-005**: Sistema DEVE calcular automaticamente a **duração prevista da jornada** com base no período Entrada–Saída e intervalos cadastrados.  
- **SPEC-CP-HO-CA-DH-006**: Sistema DEVE permitir configurar **tolerâncias específicas** (ex.: minutos antes/depois, janelas, margens permitidas).  
- **SPEC-CP-HO-CA-DH-007**: Sistema DEVE impedir gravação caso qualquer intervalo tenha valores inválidos (fim menor que início).  
- **SPEC-CP-HO-CA-DH-008**: Sistema DEVE validar todos os campos obrigatórios antes de permitir o salvamento do horário.  
- **SPEC-CP-HO-CA-DH-009**: Sistema DEVE apresentar mensagem orientativa ao usuário sempre que uma inconsistência for detectada durante o cadastro.  
- **SPEC-CP-HO-CA-DH-010**: Formulário DEVE carregar valores existentes ao editar horário, preenchendo os campos com os dados retornados do banco.

---

## **2.1.2. Tipos de Horários**

- **SPEC-CP-HO-CA-TP-001**: Sistema DEVE permitir selecionar o **Tipo de Horário** através do combo exibido no formulário VB6 (`adbTipo_Horario_Intervalo`).  
- **SPEC-CP-HO-CA-TP-002**: Sistema DEVE suportar os tipos:
  - Fixos  
  - Variáveis  
  - Noturnos  
  - Parciais  
- **SPEC-CP-HO-CA-TP-003**: Sistema DEVE manter consistência entre o campo do banco `DFintervalo_fixo_variavel` e as opções exibidas ao usuário.  
- **SPEC-CP-HO-CA-TP-004**: Sistema DEVE apresentar dinamicamente regras e campos adicionais conforme o tipo selecionado (ex.: horários noturnos exigem cálculo diferenciado).  
- **SPEC-CP-HO-CA-TP-005**: Sistema DEVE validar automaticamente os limites e estrutura do horário conforme sua categoria.

---

## **2.1.3. Regras**

- **SPEC-CP-HO-CA-RG-001**: Sistema DEVE validar **mínimo de intervalo** conforme política configurada.  
- **SPEC-CP-HO-CA-RG-002**: Sistema DEVE validar **máximo permitido de intervalo**, evitando intervalos abusivos ou inconsistentes.  
- **SPEC-CP-HO-CA-RG-003**: Sistema DEVE garantir que a somatória dos intervalos não ultrapasse a duração total do horário.  
- **SPEC-CP-HO-CA-RG-004**: Sistema DEVE validar a **compatibilidade do horário com a escala** na qual será utilizado.  
- **SPEC-CP-HO-CA-RG-005**: Sistema DEVE impedir sobreposição de intervalos quando houver múltiplos intervalos cadastrados.  
- **SPEC-CP-HO-CA-RG-006**: Sistema DEVE impedir que o cadastro seja salvo quando qualquer campo obrigatório estiver vazio ou com formato incorreto.  
- **SPEC-CP-HO-CA-RG-007**: Sistema DEVE apresentar mensagens de erro coerentes com as validações, informando claramente ao usuário o campo e a causa da falha.  
- **SPEC-CP-HO-CA-RG-008**: Ao carregar um horário para edição, Sistema DEVE aplicar as mesmas regras de validação ao salvar novamente.

---

## **2.1.4. Histórico de Vigência**

- **SPEC-CP-HO-CA-HV-001**: Sistema DEVE permitir definir a **data de início da vigência** do horário.  
- **SPEC-CP-HO-CA-HV-002**: Sistema DEVE permitir definir a **data de fim da vigência**, podendo ficar em aberto para horários vigentes.  
- **SPEC-CP-HO-CA-HV-003**: Sistema DEVE manter **versões históricas** do horário, preservando todas as alterações realizadas.  
- **SPEC-CP-HO-CA-HV-004**: Atualizações em um horário existente NÃO DEVEM sobrescrever registros históricos; uma nova versão deve ser gerada.  
- **SPEC-CP-HO-CA-HV-005**: Sistema DEVE garantir que datas de vigência não se sobreponham entre versões do mesmo horário.  
- **SPEC-CP-HO-CA-HV-006**: Sistema DEVE preservar o **cálculo retroativo correto** das jornadas com base no horário que estava vigente na data do evento.  
- **SPEC-CP-HO-CA-HV-007**: Histórico DEVE ser consultável pelo usuário, exibindo versão, faixa de vigência e dados configurados em cada época.

---

## **2.1.5. Integração, Mutação e Eventos**

- **SPEC-CP-HO-CA-MT-001**: Mutação JQEL DEVE usar:
  - schema: `"horarios"`
  - mutate: `"cadastro_horario"`
  - action: `"insert"`
- **SPEC-CP-HO-CA-MT-002**: Para edição, Mutação DEVE usar action `"update"`, preservando campos históricos conforme regras de vigência.  
- **SPEC-CP-HO-CA-MT-003**: Sistema DEVE publicar evento SSE `"schedule-updated"` após criação ou alteração de horário:

```json
{
  "type": "schedule-updated",
  "target": "horario:<horario_id>",
  "data": {
    "horario_id": "<id>",
    "usuario": "<nome>",
    "timestamp": "<iso8601>",
    "versao": "<versao>"
  }
}
````

---

## **2.1.6. Interface**

* **SPEC-CP-HO-CA-UI-001**: Componente React DEVE ser `<ScheduleForm />` contendo campos para Entrada, Saída, Intervalos, Tipo de Horário e Vigência.
* **SPEC-CP-HO-CA-UI-002**: Interface DEVE refletir dinamicamente os tipos de horário, habilitando ou ocultando campos conforme a categoria selecionada.
* **SPEC-CP-HO-CA-UI-003**: Interface DEVE exibir os cálculos automáticos (ex.: jornada prevista) imediatamente após alterações.
* **SPEC-CP-HO-CA-UI-004**: Interface DEVE replicar as validações históricas do formulário VB6, incluindo mensagens como “Hora de saída deve ser maior que a hora de entrada”.

---

---

# # **3. Requisitos – Cadastro de Escalas**

---

# ## **3.1. Cadastro de Escalas**

---

# ### **3.1.1. Estrutura e Comportamento Geral**

**SPEC-CP-CA-ESC-001**: Sistema DEVE permitir criação de novas escalas por meio de formulário contendo, obrigatoriamente, os seguintes campos:

* Nome da escala
* Tipo da escala
* Vigência inicial (data)
* Situação (ativa/inativa)
* Observações gerais

**SPEC-CP-CA-ESC-002**: Sistema DEVE validar que o *nome da escala* é único no contexto do sistema, impedindo criação de escalas duplicadas.
**SPEC-CP-CA-ESC-003**: Sistema DEVE permitir edição de todos os atributos configuráveis da escala, exceto a vigência inicial, que DEVE gerar nova versão registrada no histórico.
**SPEC-CP-CA-ESC-004**: Sistema DEVE realizar desativação lógica. A desativação DEVE registrar:

* Data da desativação
* Usuário responsável
* Motivo (texto livre)

**SPEC-CP-CA-ESC-005**: Ao abrir uma escala para edição, Sistema DEVE carregar todas as configurações existentes: dias, horários, tolerâncias, histórico e vínculos ativos.
**SPEC-CP-CA-ESC-006**: Sistema DEVE impedir desativação de escala vinculada a colaboradores com vigência ativa. Mensagem DEVE orientar usuário a alterar vínculos antes da ação.

---

# ### **3.1.2. Tipos de Escalas**

**SPEC-CP-CA-ESC-010**: Sistema DEVE suportar os seguintes tipos de escala:

* Fixa
* Turnos/Revezamento
* 12x36
* Personalizada

---

**SPEC-CP-CA-ESC-011**: Ao selecionar um tipo de escala, Sistema DEVE ajustar dinamicamente a interface exibindo somente os campos aplicáveis.

Exemplos:

* *Fixa*: 1 horário por dia.
* *Turnos*: estrutura com equipes, rotações e horários escalonados.
* *12x36*: alternância automática entre dias trabalhados e dias de descanso.
* *Personalizada*: múltiplos blocos independentes de horários.

---

**SPEC-CP-CA-ESC-012**: Sistema DEVE exibir documentação contextual (“ajuda”) descrevendo cada tipo de escala.

---

**SPEC-CP-CA-ESC-013**: Escalas do tipo *Turnos/Revezamento* DEVEM permitir definição de:

* Número de equipes
* Duração de cada etapa
* Sequência do ciclo
* Horários associados por equipe e etapa

---

---

# ### **3.1.3. Configuração de Dias, Ciclos e Horários**

**SPEC-CP-CA-ESC-020**: Sistema DEVE permitir seleção dos dias de trabalho (segunda–domingo). Interface DEVE usar seletor multisseleção.

---

**SPEC-CP-CA-ESC-021**: Sistema DEVE permitir definição dos dias de descanso nos formatos:

* Ciclos fixos (5x1, 6x1 etc.)
* Alternância (12x36)
* Personalizado (ex.: 3 dias trabalho / 2 dias folga)

---

**SPEC-CP-CA-ESC-022**: Para cada dia laboral, Sistema DEVE permitir associação de um ou mais blocos de horário com:

* Horário de entrada
* Horário de saída
* Intervalos
* Indicação de jornada noturna

---

**SPEC-CP-CA-ESC-023**: Sistema DEVE impedir configuração de horários incoerentes com o tipo da escala selecionado.
**SPEC-CP-CA-ESC-024**: Sistema DEVE interpretar automaticamente "virada de dia" quando o horário ultrapassar 00:00.

Exemplo:

* Entrada: 20:00
* Saída: 06:00 → Saída considerada no dia seguinte

---

**SPEC-CP-CA-ESC-025**: Sistema DEVE permitir marcar um horário como “Jornada Noturna”, habilitando regras adicionais.
**SPEC-CP-CA-ESC-026**: Sistema DEVE permitir definição de tolerâncias específicas por escala:

* Tolerância de atraso
* Tolerância de adiantamento
* Intervalo adicional
* Tolerância diferenciada para jornada noturna

---

**SPEC-CP-CA-ESC-027**: Interface React DEVE usar componente:

```
<ScheduleEditor />
```

Componentes internos devem incluir:

* Grade de dias
* Botão “Adicionar horário”
* Validações inline
* Destaque visual para dias de descanso

---

---

# ### **3.1.4. Regras de Validação e Consistência**

**SPEC-CP-CA-ESC-030**: Sistema DEVE impedir criação de escala sem dias de trabalho definidos.
**SPEC-CP-CA-ESC-031**: Sistema DEVE impedir sobreposição de horários no mesmo dia.
**SPEC-CP-CA-ESC-032**: Sistema DEVE validar coerência em escalas 12x36, impedindo configurações como:

* Jornada de 12h sem descanso subsequente
* Blocos que totalizem menos de 12h ou mais de 12h

---

**SPEC-CP-CA-ESC-033**: Sistema DEVE validar que tolerâncias não excedam o período real do horário configurado.
**SPEC-CP-CA-ESC-034**: Sistema DEVE impedir remoção retroativa de horários se houver ponto registrado no período coberto pela escala.
**SPEC-CP-CA-ESC-035**: Antes de salvar, Sistema DEVE exibir um resumo visual da configuração da escala (pré-visualização).

---

---

# ### **3.1.5. Persistência – Mutations JQEL**

**SPEC-CP-CA-ESC-040**: Para criação de escala, Mutação JQEL DEVE usar:

```json
{
  "schema": "escala",
  "mutate": "cadastro_escala",
  "action": "insert"
}
```

---

**SPEC-CP-CA-ESC-041**: Para atualização de escala com vigência ativa, Mutação DEVE usar:

```json
"action": "version"
```

Gerando nova versão no histórico.

---

**SPEC-CP-CA-ESC-042**: Para desativação lógica, Mutação DEVE usar:

```json
"action": "disable"
```

E atualizar o campo `vigencia_fim`.

---

**SPEC-CP-CA-ESC-043**: Mutação DEVE retornar payload:

```json
{
  "escala_id": "<id>",
  "version": "<numero>",
  "status": "<ativo|inativo>",
  "timestamp": "<iso8601>"
}
```

---

---

# ### **3.1.6. Eventos SSE**

**SPEC-CP-CA-ESC-050**: Sistema DEVE publicar evento SSE `"schedule-updated"` nas seguintes situações:

* Criação de escala
* Atualização de escala
* Geração de nova versão
* Mudança de vigência
* Desativação

---

**SPEC-CP-CA-ESC-051**: Estrutura do evento SSE:

```json
{
  "type": "schedule-updated",
  "target": "escala:<id>",
  "data": {
    "escala_id": "<id>",
    "version": "<versao>",
    "updated_by": "<usuario>",
    "update_type": "<insert|update|version|disable>",
    "timestamp": "<iso8601>"
  }
}
```

---

**SPEC-CP-CA-ESC-052**: Evento DEVE ser enviado em broadcast para todos os clientes conectados ao canal da empresa/unidade.

---

---

# ### **3.1.7. Histórico e Controle de Versões**

**SPEC-CP-CA-ESC-060**: Sistema DEVE registrar histórico completo das alterações, incluindo:

* Campo alterado
* Valor anterior
* Novo valor
* Usuário responsável
* Data/hora
* Motivo (opcional ou obrigatório conforme regra)

---

**SPEC-CP-CA-ESC-061**: Histórico DEVE armazenar vigência por versão:

* `vigencia_inicio`
* `vigencia_fim`

---

**SPEC-CP-CA-ESC-062**: Alterações DEVEM impactar cálculo de jornada imediatamente, respeitando a vigência associada.
**SPEC-CP-CA-ESC-063**: Interface DEVE disponibilizar componente:

```
<ScheduleHistory />
```

O componente DEVE exibir:

* Lista cronológica de versões
* Comparação entre versões
* Indicação da versão vigente

---

**SPEC-CP-CA-ESC-064**: Sistema DEVE impedir edição retroativa caso existam cálculos de ponto já consolidados. A liberação DEVE exigir justificativa e permissão especial.

---

---

# **4. Cadastro de Tipos de Movimentação**

## **4.1. Requisitos Funcionais da Interface**

**4.1.1 — SPEC-CP-TM-UI-001**: O sistema **DEVE** permitir criar um novo Tipo de Movimentação através do formulário de cadastro.
**4.1.2 — SPEC-CP-TM-UI-002**: O sistema **DEVE** permitir editar um Tipo de Movimentação existente e salvar ou cancelar.
**4.1.3 — SPEC-CP-TM-UI-003**: O sistema **DEVE** exibir a lista de Tipos de Movimentação em grid com ordenação e seleção para edição.
**4.1.4 — SPEC-CP-TM-UI-004**: O sistema **DEVE** permitir consulta via campo de busca filtrando o grid em tempo real.
**4.1.5 — SPEC-CP-TM-UI-005**: O sistema **DEVE** conter campos para descrição resumida e descrição completa.
**4.1.6 — SPEC-CP-TM-UI-006**: O sistema **DEVE** disponibilizar combos para Natureza, Ação e Totalizador.
**4.1.7 — SPEC-CP-TM-UI-007**: O sistema **DEVE** apresentar um checkbox de Absenteísmo.
**4.1.8 — SPEC-CP-TM-UI-008**: O sistema **DEVE** organizar os dados do cadastro em guias (abas).
**4.1.9 — SPEC-CP-TM-UI-009**: Os botões padrão (Incluir, Alterar, Confirmar, Cancelar, Excluir, Atualizar, Imprimir, Sair) **DEVEM** operar conforme comportamento esperado.

---

## **4.2. Requisitos de Dados e Persistência**

**4.2.1 — SPEC-CP-TM-DATA-010**: Cada Tipo de Movimentação **DEVE** possuir código único e descrições.
**4.2.2 — SPEC-CP-TM-DATA-011**: Campos obrigatórios: código, descrição resumida, descrição, natureza, ação e totalizador.
**4.2.3 — SPEC-CP-TM-DATA-012**: O sistema **DEVE** suportar campos opcionais como absenteísmo, fórmula, regras de exportação, códigos de folha e compatibilidade de escalas.
**4.2.4 — SPEC-CP-TM-DATA-013**: A descrição resumida **DEVE** ter até 50 caracteres e a descrição completa até 250.
**4.2.5 — SPEC-CP-TM-DATA-014**: A fórmula de cálculo **DEVE** ser armazenada como texto e validada minimamente.
**4.2.6 — SPEC-CP-TM-DATA-015**: O sistema **DEVE** possuir flag de ativação/inativação (`ativo`).
**4.2.7 — SPEC-CP-TM-DATA-016**: O histórico de alterações **DEVE** ser preservado com autor, data e tipo de alteração.
**4.2.8 — SPEC-CP-TM-DATA-017**: A exclusão **DEVE** ser soft-delete por padrão.

---

## **4.3. Regras de Negócio e Cálculo**

**4.3.1 — SPEC-CP-TM-BUS-018**: Cada Tipo de Movimentação **DEVE** possuir fórmula de cálculo associada.
**4.3.2 — SPEC-CP-TM-BUS-019**: O sistema **DEVE** permitir definir compatibilidade com escalas.
**4.3.3 — SPEC-CP-TM-BUS-020**: O sistema **DEVE** permitir configurar regras de exportação.
**4.3.4 — SPEC-CP-TM-BUS-021**: Natureza e ação **DEVEM** definir o comportamento do cálculo.
**4.3.5 — SPEC-CP-TM-BUS-022**: Tipos marcados como absenteísmo **DEVEM** seguir regras específicas no motor de cálculo.

---

## **4.4. Integração, Exportação e Relatórios**

**4.4.1 — SPEC-CP-TM-INT-023**: O sistema **DEVE** disponibilizar API para listar Tipos de Movimentação com filtros.
**4.4.2 — SPEC-CP-TM-INT-024**: Exportações **DEVEM** utilizar o código de folha configurado no cadastro.
**4.4.3 — SPEC-CP-TM-INT-025**: O sistema **DEVE** permitir gerar relatório imprimível dos Tipos de Movimentação.

---

## **4.5. Validação, UX e Feedback**

**4.5.1 — SPEC-CP-TM-VAL-026**: O sistema **DEVE** validar obrigatoriedade e unicidade do código no momento do salvamento.
**4.5.2 — SPEC-CP-TM-VAL-027**: A fórmula de cálculo **DEVE** passar por validação de sintaxe básica.
**4.5.3 — SPEC-CP-TM-VAL-028**: Ativação e inativação **DEVEM** solicitar confirmação e registrar histórico.
**4.5.4 — SPEC-CP-TM-UX-029**: Operações longas **DEVEM** exibir barra de progresso.

---

## **4.6. Segurança e Controle de Acesso**

**4.6.1 — SPEC-CP-TM-SEC-030**: Permissões **DEVEM** controlar inclusão, alteração, exclusão e visualização de histórico.
**4.6.2 — SPEC-CP-TM-SEC-031**: Todas as operações **DEVEM** ser registradas em audit trail.

---

## **4.7. Requisitos Não Funcionais**

**4.7.1 — SPEC-CP-TM-NF-032**: Operações CRUD simples **DEVEM** responder em menos de 2 segundos.
**4.7.2 — SPEC-CP-TM-NF-033**: O sistema **DEVE** garantir integridade referencial entre tabelas relacionadas.
**4.7.3 — SPEC-CP-TM-NF-034**: O sistema **DEVE** permitir exportação dos cadastros em CSV ou JSON.

---

# ## **5. Parametrização do Cartão de Ponto**

---

# ### **5.1. Requisitos Gerais**

* **SPEC-CP-PR-RG-001:** O sistema DEVE disponibilizar uma tela de “Parâmetros do Cartão de Ponto”.
* **SPEC-CP-PR-RG-002:** A tela DEVE carregar parâmetros anteriormente salvos.
* **SPEC-CP-PR-RG-003:** O sistema DEVE permitir salvar, editar e limpar parâmetros.
* **SPEC-CP-PR-RG-004:** A persistência DEVE ocorrer via MUTATION JQEL com schema `"cartao_ponto"`, mutate `"parametros"`, action `"update"`.
* **SPEC-CP-PR-RG-005:** A interface DEVE conter seções: Tolerâncias, Intervalos, Hora Extra e Banco de Horas.
* **SPEC-CP-PR-RG-006:** Campos de horário DEVEM aceitar formato `HH:MM`.

---

# ### **5.2. Tolerâncias**

## **Atraso Permitido**

* **SPEC-CP-PR-TO-001:** O sistema DEVE permitir configurar o atraso tolerado em minutos.
* **SPEC-CP-PR-TO-002:** Atrasos acima do limite DEVE ser considerados como atraso calculado.

## **Saída Antecipada**

* **SPEC-CP-PR-TO-003:** O sistema DEVE permitir configurar a saída antecipada tolerada.
* **SPEC-CP-PR-TO-004:** Exceder esse limite DEVE gerar apontamento de saída antecipada.

## **Tempo Extra Tolerado**

* **SPEC-CP-PR-TO-005:** O sistema DEVE permitir configurar minutos extras não considerados como hora extra.
* **SPEC-CP-PR-TO-006:** Valores acima dessa tolerância DEVE gerar hora extra conforme regras aplicadas.

---

# ### **5.3. Intervalos**

## **Intervalo Mínimo**

* **SPEC-CP-PR-IN-001:** O sistema DEVE permitir configurar o intervalo mínimo obrigatório.
* **SPEC-CP-PR-IN-002:** Valores inconsistentes NÃO DEVEM ser aceitos.

## **Intervalo Máximo**

* **SPEC-CP-PR-IN-003:** O sistema DEVE permitir configurar o intervalo máximo permitido.
* **SPEC-CP-PR-IN-004:** Exceder o limite DEVE gerar apontamento de ausência parcial.

## **Múltiplos Intervalos**

* **SPEC-CP-PR-IN-005:** O sistema DEVE permitir habilitar múltiplos intervalos diários.
* **SPEC-CP-PR-IN-006:** Quando ativo, o usuário DEVE informar:

  * tempo mínimo
  * tempo máximo
  * quantidade máxima de intervalos
* **SPEC-CP-PR-IN-007:** O sistema NÃO DEVE permitir salvar configurações conflitantes.

---

# ### **5.4. Políticas de Hora Extra**

## **Autorização**

* **SPEC-CP-PR-HE-001:** O sistema DEVE permitir exigir autorização prévia de hora extra.
* **SPEC-CP-PR-HE-002:** Horas extras não autorizadas DEVE ser classificadas como pendentes.

## **Aplicação Automática**

* **SPEC-CP-PR-HE-003:** O sistema DEVE permitir aplicação automática de hora extra.
* **SPEC-CP-PR-HE-004:** A aplicação automática DEVE respeitar tolerâncias, banco de horas e limites.

## **Percentuais**

* **SPEC-CP-PR-HE-005:** O sistema DEVE permitir configurar percentuais: 50%, 100%, noturno e feriado.
* **SPEC-CP-PR-HE-006:** Cada percentual DEVE permitir regras específicas (autorização, horário, limiares).

---

# ### **5.5. Banco de Horas**

## **Ativação**

* **SPEC-CP-PR-BH-001:** O sistema DEVE permitir ativar ou desativar o banco de horas.
* **SPEC-CP-PR-BH-002:** Se desativado, horas excedentes NÃO DEVEM ser creditadas.

## **Limites**

* **SPEC-CP-PR-BH-003:** O sistema DEVE permitir configurar limites diário, mensal e anual.
* **SPEC-CP-PR-BH-004:** Ao atingir o limite, excedentes DEVE ser tratados como hora extra.

## **Créditos e Débitos**

* **SPEC-CP-PR-BH-005:** O sistema DEVE permitir configurar regras automáticas de crédito.
* **SPEC-CP-PR-BH-006:** O sistema DEVE permitir configurar regras automáticas de débito por atrasos, saídas antecipadas e intervalos excedidos.
* **SPEC-CP-PR-BH-007:** O sistema DEVE registrar histórico de todas as movimentações do banco.

---

# ### **5.6. Interface (Baseado no VB6)**

* **SPEC-CP-PR-UI-001:** Todos os checkboxes do VB6 DEVE ser convertidos para toggles na nova interface.
* **SPEC-CP-PR-UI-002:** Combos DEVEM ser convertidos para `<Select />`.
* **SPEC-CP-PR-UI-003:** Campos `MaskEdBox` DEVEM ser convertidos para entrada mascarada `HH:MM`.
* **SPEC-CP-PR-UI-004:** A tela DEVE conter os botões: Salvar, Limpar e Sair.
* **SPEC-CP-PR-UI-005:** Grids DEVEM ser convertidos para componentes `<DataGrid />`.

---

# ### **5.7. Validações**

* **SPEC-CP-PR-VA-001:** Campos obrigatórios NÃO DEVEM permitir gravação vazia.
* **SPEC-CP-PR-VA-002:** Valores de horário DEVEM estar no formato `HH:MM`.
* **SPEC-CP-PR-VA-003:** Intervalos inconsistentes NÃO DEVEM ser permitidos.
* **SPEC-CP-PR-VA-004:** O sistema DEVE alertar quando banco de horas estiver ativo sem limites.
* **SPEC-CP-PR-VA-005:** O sistema DEVE alertar quando hora extra automática estiver ativa sem percentuais configurados.
* **SPEC-CP-PR-VA-006:** Tolerâncias negativas NÃO DEVEM ser aceitas.

---

# ### **5.8. Persistência / Eventos**

* **SPEC-CP-PR-PE-001:** A gravação DEVE ocorrer via POST `/api/cartao_ponto/parametros`.
* **SPEC-CP-PR-PE-002:** O payload DEVE seguir o modelo definido no documento.
* **SPEC-CP-PR-PE-003:** Ao atualizar parâmetros, o sistema DEVE emitir SSE:

```json
{
  "type": "config-updated",
  "target": "cartao_ponto:parametros",
  "data": { "updated_by": "<usuario>", "timestamp": "<iso8601>" }
}
```

---

# # **6.0. Estrutura Geral do Formulário**

**SPEC-CP-PE-UI-001:** O sistema DEVE disponibilizar uma tela denominada “Parmetro de Evento de Empresa”, contendo três abas: Cadastro, Empresa e Listagem.

**SPEC-CP-PE-UI-002:** O sistema DEVE apresentar na tela principal os seguintes botões operacionais: Incluir, Alterar, Excluir, Confirmar, Cancelar, Atualizar e Sair.

**SPEC-CP-PE-UI-003:** Todos os botões DEVE seguir o comportamento padrão de CRUD: Incluir habilita campos, Alterar permite modificar, Excluir remove após confirmação, Confirmar grava, Cancelar desfaz, Atualizar recarrega a lista e Sair fecha a tela.

**SPEC-CP-PE-UI-004:** A tela DEVE conter a opção chkTodas, permitindo aplicar parametrizações para todas as empresas simultaneamente.

---

# # **6.1. Aba “Cadastro”**

## **6.1.1. Campos de Eventos**

**SPEC-CP-PE-CAD-001:** O sistema DEVE permitir selecionar o evento “Hora Extra Dia Normal”.

**SPEC-CP-PE-CAD-002:** O sistema DEVE permitir selecionar o evento “Hora Extra Domingos e Feriados”.

**SPEC-CP-PE-CAD-003:** O sistema DEVE permitir selecionar o evento “Hora Faltosa”.

**SPEC-CP-PE-CAD-004:** O sistema DEVE permitir selecionar o evento “Banco de Horas”.

**SPEC-CP-PE-CAD-005:** O sistema DEVE permitir selecionar o evento “Adicional Noturno”.

**SPEC-CP-PE-CAD-006:** O sistema DEVE permitir selecionar o evento “Adicional Noturno (Hora Extra)”.

**SPEC-CP-PE-CAD-007:** O sistema DEVE permitir parametrizar o campo “Rede”, representando agrupamento, origem ou configuração equivalente.

---

## **6.1.2. Validações da Aba Cadastro**

**SPEC-CP-PE-CAD-008:** O sistema DEVE validar que todos os eventos obrigatórios estejam preenchidos antes da confirmação do cadastro.

**SPEC-CP-PE-CAD-009:** O sistema DEVE impedir duplicidade de códigos de eventos entre categorias incompatíveis.

**SPEC-CP-PE-CAD-010:** O sistema DEVE verificar se um evento alterado já está vinculado a outras parametrizações e alertar o usuário se houver impacto.

---

# # **6.2. Aba “Empresa”**

**SPEC-CP-PE-EMP-001:** O sistema DEVE exibir a lista de empresas disponíveis para seleção.

**SPEC-CP-PE-EMP-002:** O sistema DEVE permitir marcar a opção “Todas” (chkTodas) para aplicar a parametrização a todas as empresas.

**SPEC-CP-PE-EMP-003:** Se chkTodas estiver marcada, o sistema DEVE desabilitar a seleção individual de empresas.

**SPEC-CP-PE-EMP-004:** O sistema DEVE salvar a parametrização vinculada à empresa escolhida ou a todas, caso chkTodas esteja marcada.

**SPEC-CP-PE-EMP-005:** O sistema DEVE impedir a criação de parametrizações duplicadas para a mesma empresa.

---

# # **6.3. Aba “Listagem”**

**SPEC-CP-PE-LIS-001:** O sistema DEVE listar todas as parametrizações cadastradas, exibindo empresa, eventos configurados, data de criação e data de alteração.

**SPEC-CP-PE-LIS-002:** O sistema DEVE permitir selecionar um item da listagem para alteração ou exclusão.

**SPEC-CP-PE-LIS-003:** O sistema DEVE recarregar completamente os registros da listagem ao acionar o botão Atualizar.

**SPEC-CP-PE-LIS-004:** O sistema DEVE permitir ordenar a listagem por qualquer coluna apresentada.

---

# # **6.4. Operações CRUD**

**SPEC-CP-PE-CRUD-001:** Ao clicar em Incluir, o sistema DEVE habilitar e limpar todos os campos da aba Cadastro.

**SPEC-CP-PE-CRUD-002:** Ao clicar em Alterar, o sistema DEVE carregar nos campos os valores do registro selecionado.

**SPEC-CP-PE-CRUD-003:** Ao clicar em Confirmar, o sistema DEVE gravar no banco de dados os valores validados.

**SPEC-CP-PE-CRUD-004:** Ao clicar em Excluir, o sistema DEVE solicitar confirmação explícita antes de remover o registro.

**SPEC-CP-PE-CRUD-005:** Ao clicar em Cancelar, o sistema DEVE restaurar o último estado salvo dos campos.

---

# # **6.5. Regras de Negócio Relacionadas à Exportação**

**SPEC-CP-PE-RN-001:** Os eventos parametrizados DEVE ser utilizados na exportação para TXT, CSV, XLSX ou layouts proprietários.

**SPEC-CP-PE-RN-002:** Os eventos DEVE mapear diretamente para os códigos esperados pelo sistema de folha.

**SPEC-CP-PE-RN-003:** O sistema DEVE validar mapeamentos antes da exportação, bloqueando-a se houver ausência de eventos obrigatórios.

**SPEC-CP-PE-RN-004:** O sistema DEVE aplicar a parametrização conforme a unidade selecionada na aba Empresa.

**SPEC-CP-PE-RN-005:** O sistema DEVE registrar toda alteração de parametrização em log técnico e de auditoria.

---

# # **6.6. Fluxos**

**SPEC-CP-PE-FLU-001:** O fluxo padrão de inclusão DEVE seguir: Incluir → Preencher Cadastro → Selecionar Empresa → Confirmar.

**SPEC-CP-PE-FLU-002:** O fluxo de alteração DEVE seguir: Selecionar registro → Alterar → Editar campos → Confirmar.

---

# # **6.7. Requisitos Técnicos**

**SPEC-CP-PE-TEC-001:** O sistema DEVE persistir parametrizações na tabela específica de eventos por empresa.

**SPEC-CP-PE-TEC-002:** O módulo de exportação DEVE consumir essas parametrizações ao gerar arquivos para a folha.

**SPEC-CP-PE-TEC-003:** O sistema DEVE impedir que duas exportações simultâneas utilizem parametrizações divergentes para a mesma empresa no mesmo período.

---

# ## **7. Saldo Inicial Banco de Horas**

# # **7.0. Estrutura Geral do Formulário**

**SPEC-CP-SBH-UI-001:** O sistema DEVE disponibilizar uma tela denominada **“Cadastro de Saldo Inicial do Banco de Horas”**, contendo duas abas principais: **Cadastro** e **Listagem**.

**SPEC-CP-SBH-UI-002:** O sistema DEVE apresentar na tela principal os seguintes botões operacionais: **Incluir, Alterar, Excluir, Confirmar, Cancelar, Atualizar e Sair**.

**SPEC-CP-SBH-UI-003:** Todos os botões DEVEM seguir o comportamento padrão de CRUD:  
- **Incluir** habilita campos para novo registro;  
- **Alterar** permite modificar o registro selecionado;  
- **Excluir** remove o registro mediante confirmação;  
- **Confirmar** grava as alterações ou inclusão;  
- **Cancelar** reverte alterações pendentes;  
- **Atualizar** recarrega a listagem;  
- **Sair** fecha a tela.

**SPEC-CP-SBH-UI-004:** A tela DEVE apresentar o checkbox **chkRecalcularSaldo**, permitindo indicar se o sistema deve recalcular automaticamente o saldo do banco de horas após alterações.

---

# # **7.1. Aba “Cadastro”**

# ## **7.1.1. Identificação do Colaborador**

**SPEC-CP-SBH-CAD-001:** O sistema DEVE exibir o campo **Código do Cargo (lblCodCargo)** para identificação da função associada ao colaborador.

**SPEC-CP-SBH-CAD-002:** O sistema DEVE apresentar o campo **Descrição do Cargo (lblDescCargo)**, exibido em modo somente leitura.

**SPEC-CP-SBH-CAD-003:** O sistema DEVE exibir o campo **Saldo Atual (lblSaldoHoras)**, representando o saldo acumulado existente antes da aplicação do saldo inicial.

---

# ## **7.1.2. Seção "Mês / Ano"**

**SPEC-CP-SBH-CAD-004:** O sistema DEVE apresentar a seção **“Mês / Ano”** (Frame1), responsável por definir o período inicial do controle.

**SPEC-CP-SBH-CAD-005:** O sistema DEVE disponibilizar o campo **dtpMesAnoPonto**, no formato **MM/yyyy**, permitindo selecionar o mês/ano do saldo inicial.

---

# ## **7.1.3. Seção "Banco de Horas"**

**SPEC-CP-SBH-CAD-006:** O sistema DEVE disponibilizar a seção **“Banco de Horas”** (Frame3), contendo os campos necessários para informar o saldo inicial.

**SPEC-CP-SBH-CAD-007:** O sistema DEVE permitir informar o campo **mskHoraCredora**, com máscara **#####:####**, representando o saldo inicial credor.

**SPEC-CP-SBH-CAD-008:** O sistema DEVE limitar o campo **mskHoraCredora** a até **6 caracteres**, garantindo o padrão de horas.

**SPEC-CP-SBH-CAD-009:** O sistema DEVE validar o valor inserido em **mskHoraCredora**, garantindo o formato correto de horas.

---

# ## **7.1.4. Recalcular Saldo**

**SPEC-CP-SBH-CAD-010:** O sistema DEVE disponibilizar o checkbox **chkRecalcularSaldo** com a legenda “Recalcular saldo do banco de horas”.

**SPEC-CP-SBH-CAD-011:** Quando marcado, o sistema DEVE recalcular automaticamente o saldo consolidado após confirmação do registro.

**SPEC-CP-SBH-CAD-012:** Quando desmarcado, o sistema NÃO DEVE recalcular o saldo automaticamente.

---

# # **7.2. Aba “Listagem”**

**SPEC-CP-SBH-LST-001:** A aba Listagem DEVE exibir todos os registros de saldo inicial cadastrados.

**SPEC-CP-SBH-LST-002:** A listagem DEVE permitir seleção de um registro para edição ou exclusão.

**SPEC-CP-SBH-LST-003:** A listagem DEVE ser atualizada sempre que o botão “Atualizar” for acionado.

---

# # **7.3. Funcionalidades do Módulo**

# ## **7.3.1. Registro de Saldo Inicial**

**SPEC-CP-SBH-FUN-001:** O sistema DEVE permitir registrar o saldo inicial do banco de horas conforme valores informados no formulário.

**SPEC-CP-SBH-FUN-002:** O sistema DEVE considerar o período selecionado em **dtpMesAnoPonto** como referência inicial.

**SPEC-CP-SBH-FUN-003:** O sistema DEVE impedir cadastro duplicado de saldo inicial para o mesmo colaborador e o mesmo Mês/Ano.

---

# ## **7.3.2. Edição de Saldo Existente**

**SPEC-CP-SBH-FUN-004:** O sistema DEVE permitir edição de um saldo inicial previamente cadastrado.

**SPEC-CP-SBH-FUN-005:** Ao editar, o sistema DEVE atualizar histórico e recalcular saldo final quando **chkRecalcularSaldo** estiver marcado.

---

# ## **7.3.3. Histórico Detalhado**

**SPEC-CP-SBH-FUN-006:** O sistema DEVE manter histórico detalhado de todas as alterações no saldo inicial.

**SPEC-CP-SBH-FUN-007:** O histórico DEVE registrar:  
- Usuário  
- Data/hora da alteração  
- Saldo anterior  
- Novo saldo  
- Motivo da alteração  
- Indicador de recálculo

---

# ## **7.3.4. Fechamento Mensal**

**SPEC-CP-SBH-FUN-008:** O sistema DEVE aplicar o saldo inicial na apuração mensal do banco de horas.

**SPEC-CP-SBH-FUN-009:** O sistema DEVE incorporar o saldo inicial ao cálculo do saldo acumulado no fechamento do mês.

---

# # **8 Cadastro do Modelo do REP**

---

# **8.0 Estrutura Geral do Formulário**

**SPEC-CP-REP-UI-001:** O sistema DEVE disponibilizar uma tela denominada **“Registro Eletrônico de Ponto – REP”**, destinada ao cadastro, manutenção e parametrização dos modelos de REP utilizados pela organização.

**SPEC-CP-REP-UI-002:** A tela DEVE possuir um painel principal contendo os seguintes botões operacionais do CRUD:
**Incluir, Alterar, Excluir, Confirmar, Cancelar, Atualizar, Sair** e o botão complementar **Imprimir**.

**SPEC-CP-REP-UI-003:** Todos os botões DEVEM seguir o comportamento padrão:

* **Incluir:** habilita os campos para inclusão de um novo modelo de REP;
* **Alterar:** habilita os campos para edição do modelo selecionado;
* **Excluir:** remove o registro selecionado mediante confirmação do usuário;
* **Confirmar:** grava alterações ou inclusões;
* **Cancelar:** descarta alterações não gravadas;
* **Atualizar:** recarrega a listagem;
* **Sair:** fecha a tela;
* **Imprimir:** gera relatório contendo as informações do(s) modelo(s) listado(s).

**SPEC-CP-REP-UI-004:** A tela DEVE possuir controle do tipo **SSTab** com no mínimo duas abas:

* **Cadastro**
* **Listagem**

**SPEC-CP-REP-UI-005:** O sistema DEVE disponibilizar um **ProgressBar** (ProgressBar1) para indicar processos demorados, como carregamento, impressão ou sincronização de registros.

---

# # **8.1 Aba “Cadastro”**

---

## **8.1.1 Identificação Básica do Modelo**

**SPEC-CP-REP-CAD-001:** O sistema DEVE disponibilizar o campo **txnNumero_REP**, do tipo numérico, destinado ao registro do **Número do REP**, removendo automaticamente caracteres “-” a cada alteração.

**SPEC-CP-REP-CAD-002:** O campo **txnNumero_REP** DEVE aceitar apenas valores numéricos, rejeitando letras e caracteres especiais.

**SPEC-CP-REP-CAD-003:** O sistema DEVE apresentar o campo **cmbTipo_REP**, contendo a lista de tipos de REP suportados (ex.: Biométrico, Cartão, Múltiplo, etc.).

**SPEC-CP-REP-CAD-004:** O sistema DEVE apresentar a legenda **lblTipo_REP** vinculada ao campo **cmbTipo_REP** para fins de acessibilidade e clareza.

**SPEC-CP-REP-CAD-005:** O sistema DEVE disponibilizar o campo **txnIdentificador_REP_AEJ**, utilizado para registro do **Identificador AEJ/AFD/AFDT** do equipamento, aplicando automaticamente a remoção de caracteres “-”.

---

## **8.1.2 Validade do Modelo de REP**

**SPEC-CP-REP-CAD-006:** O sistema DEVE disponibilizar os campos **dtpInicio_Validade** e **dtpFim_Validade**, do tipo DatePicker, permitindo especificar o intervalo de validade do modelo cadastrado.

**SPEC-CP-REP-CAD-007:** A data inicial (**dtpInicio_Validade**) DEVE ser menor ou igual à data final (**dtpFim_Validade**). O sistema DEVE impedir gravação em caso de violação.

**SPEC-CP-REP-CAD-008:** O sistema DEVE emitir mensagem caso a validade do modelo seja inferior a um dia ou superior a limites internos de homologação definidos pelo departamento técnico.

---

## **8.1.3 Associação com Empresa**

**SPEC-CP-REP-CAD-009:** O sistema DEVE disponibilizar o campo **adbEmpresa**, do tipo combo data-bound, para seleção da empresa/unidade onde o modelo do REP será utilizado.

**SPEC-CP-REP-CAD-010:** O combo **adbEmpresa** DEVE ser carregado automaticamente com a lista de empresas cadastradas no sistema e vinculadas ao módulo de ponto.

**SPEC-CP-REP-CAD-011:** A seleção de empresa é obrigatória para gravação do modelo do REP.

---

## **8.1.4 Campo de Consulta e Filtro**

**SPEC-CP-REP-CAD-012:** O sistema DEVE disponibilizar o campo **txaConsulta**, do tipo texto alfanumérico, destinado à pesquisa e filtragem de modelos existentes.

**SPEC-CP-REP-CAD-013:** Esse campo DEVE permitir digitação de múltiplos critérios, como número do REP, tipo, fabricante ou identificador AEJ.

**SPEC-CP-REP-CAD-014:** O sistema DEVE aplicar busca automática sempre que o usuário inserir caracteres no campo **txaConsulta**, atualizando a listagem da aba **Listagem**.

---

# # **8.2 Aba “Listagem”**

**SPEC-CP-REP-LST-001:** A aba Listagem DEVE exibir todos os modelos de REP cadastrados no sistema, utilizando o controle **gexListagem** do tipo GridEX.

**SPEC-CP-REP-LST-002:** O grid DEVE apresentar no mínimo as seguintes colunas:

* Número do REP
* Tipo do REP
* Identificador AEJ
* Empresa vinculada
* Início de validade
* Fim de validade
* Situação (ativo/inativo)

**SPEC-CP-REP-LST-003:** A listagem DEVE permitir ordenação crescente e decrescente por qualquer coluna.

**SPEC-CP-REP-LST-004:** Ao selecionar um registro no grid, o sistema DEVE preencher automaticamente todos os campos da aba **Cadastro** para edição ou exclusão.

**SPEC-CP-REP-LST-005:** O grid DEVE ser atualizado sempre que o botão **Atualizar** for acionado.

---

# # **8.3 Funcionalidades do Módulo**

---

## **8.3.1 Registro Inicial do Modelo**

**SPEC-CP-REP-FUN-001:** O sistema DEVE permitir registrar um novo modelo de REP contendo todas as informações fornecidas pelo fabricante e pelas políticas internas da organização.

**SPEC-CP-REP-FUN-002:** O sistema DEVE validar que todos os campos obrigatórios foram preenchidos antes de permitir a gravação.

**SPEC-CP-REP-FUN-003:** O sistema DEVE impedir cadastro duplicado de um modelo de REP com o mesmo número e mesma empresa.

**SPEC-CP-REP-FUN-004:** Cada novo registro DEVE armazenar metadados de criação: usuário, data/hora e origem da operação.

---

## **8.3.2 Informações Técnicas do Equipamento**

**SPEC-CP-REP-FUN-005:** O sistema DEVE permitir registrar informações técnicas associadas ao modelo de REP, conforme seção 8.2 (capacidade, comunicação, memória, firmware etc.), mesmo que não estejam explicitamente presentes na tela VB6, desde que armazenadas na mesma estrutura de dados.

**SPEC-CP-REP-FUN-006:** O sistema DEVE registrar a capacidade de armazenamento de eventos, suportes de comunicação (USB, TCP/IP, Wi-Fi, GPRS), suporte biométrico e tipos de cartões aceitos.

**SPEC-CP-REP-FUN-007:** O sistema DEVE registrar a versão atual do firmware informada pelo fabricante e manter compatibilidade com versões futuras ou homologadas.

---

## **8.3.3 Dados do Fabricante**

**SPEC-CP-REP-FUN-008:** O sistema DEVE armazenar informações do fabricante, incluindo razão social, CNPJ, registro no MTE e contatos de suporte técnico.

**SPEC-CP-REP-FUN-009:** O sistema DEVE vincular cada modelo cadastrado a um fabricante previamente registrado no sistema corporativo.

---

## **8.3.4 Parâmetros de Funcionamento**

**SPEC-CP-REP-FUN-010:** O sistema DEVE permitir definir parâmetros de funcionamento para cada modelo, como protocolo de comunicação, métodos de autenticação e regras de coleta.

**SPEC-CP-REP-FUN-011:** O sistema DEVE registrar comportamento do REP em caso de falha de comunicação, incluindo buffer temporário, tentativas de retransmissão e retenção local de dados.

---

## **8.3.5 Layout de Integração e Protocolos**

**SPEC-CP-REP-FUN-012:** O sistema DEVE associar ao modelo os layouts suportados (AFD, AFDT, AEJ), definidos em conformidade com a legislação vigente.

**SPEC-CP-REP-FUN-013:** O sistema DEVE registrar os protocolos de comunicação e mapeamento de dados utilizados na integração com sistemas de ponto e Web Services.

---

## **8.3.6 Controle de Versões do Modelo**

**SPEC-CP-REP-FUN-014:** O sistema DEVE manter histórico completo de versões de firmware e hardware para cada modelo de REP.

**SPEC-CP-REP-FUN-015:** O sistema DEVE registrar a data de habilitação e descontinuação de cada versão.

---

## **8.3.7 Vinculação com Unidades e Empresas**

**SPEC-CP-REP-FUN-016:** O sistema DEVE permitir vincular cada modelo de REP a múltiplas empresas e unidades.

**SPEC-CP-REP-FUN-017:** O sistema DEVE impedir vinculações que entrem em conflito com legislações estaduais ou com políticas internas da organização.

---

## **8.3.8 Gestão e Manutenção Contínua**

**SPEC-CP-REP-FUN-018:** O sistema DEVE permitir atualizar informações técnicas, registrar substituições, reparos e desativar modelos obsoletos.

**SPEC-CP-REP-FUN-019:** O sistema DEVE armazenar histórico de falhas, alertas, substituições, revisões e auditorias internas.

---

## **8.3.9 Compliance e Conformidade Legal**

**SPEC-CP-REP-FUN-020:** O sistema DEVE garantir que os modelos cadastrados observem todas as portarias e normas do MTE/MTP.

**SPEC-CP-REP-FUN-021:** O sistema DEVE registrar certificados de conformidade e mantê-los disponíveis para auditorias.

**SPEC-CP-REP-FUN-022:** O sistema DEVE permitir atualização do cadastro sempre que houver alteração legislativa que exija adequação técnica ou documental.

---

# **Especificação de Requisitos - Módulo de Apuração de Horas Extras/Fechamento Mensal**

## **9.0 Estrutura Geral do Formulário**

**SPEC-MV-APH-UI-001:** O sistema DEVE apresentar um formulário MDI Child com dimensões fixas (10140x6930 twips) e barra de título "Apuração de Horas Extras / Fechamento Mensal"

**SPEC-MV-APH-UI-002:** A tela DEVE possuir uma estrutura com três seções principais:
1. **Área de filtros superiores**: Controles para seleção de Rede, Empresa e Funcionário
2. **Área de trabalho central**: Abas SSTab com três guias ("Apuração", "Fechamento", "Listagem")
3. **Área de rodapé**: Barra de ferramentas com botões de ação e barra de progresso

**SPEC-MV-APH-UI-003:** Todos os botões DEVEM utilizar o controle mxCBCF da biblioteca 3DMaxCtl com tratamento de foco e eventos de teclado apropriados

## **9.1 Funcionalidades do Módulo**

### **9.1.1 – Configuração de Filtros para Apuração**

**SPEC-MV-APH-FN-001:** O sistema DEVE permitir selecionar uma Rede através de um controle ctlData_Combo que carrega dados da tabela TBrede

**SPEC-MV-APH-FN-002:** Ao selecionar uma Rede, o sistema DEVE carregar automaticamente no combo de Empresas apenas as empresas:
- Da rede selecionada
- Associadas ao usuário atual através da tabela TBusuario_empresa
- Ordenadas por nome fantasia

**SPEC-MV-APH-FN-003:** Ao selecionar uma Empresa, o sistema DEVE carregar automaticamente no combo de Funcionários apenas funcionários:
- Da empresa selecionada
- Com dados de pessoa física (nome) da tabela TBpessoa
- Ordenados por nome

**SPEC-MV-APH-FN-004:** O sistema DEVE permitir selecionar um período de apuração através de um controle DTPicker configurado para exibir apenas mês/ano (formato "MM/yyyy")

**SPEC-MV-APH-FN-005:** O valor padrão do período DEVE ser o mês/ano atual

### **9.1.2 – Processo de Apuração de Horas**

**SPEC-MV-APH-FN-006:** O sistema DEVE executar a apuração de horas ao clicar no botão "Apurar Horas" após validações:
- Rede deve estar selecionada
- Empresa deve ter eventos de banco de horas configurados (exceto se usuário confirmar continuar)

**SPEC-MV-APH-FN-007:** Antes da apuração, o sistema DEVE validar se:
- A digitação do cartão ponto está completa para todos funcionários do período
- O mês não está fechado para nenhum funcionário

**SPEC-MV-APH-FN-008:** O sistema DEVE exibir mensagem de aviso se existirem empresas sem eventos de banco de horas relacionados e permitir continuar após confirmação do usuário

**SPEC-MV-APH-FN-009:** O sistema DEVE suportar dois modos de apuração conforme configuração do cliente:
- **Modo Detalhado**: Cálculo baseado em lançamentos individuais
- **Modo Totalizadores**: Cálculo baseado em totais consolidados

**SPEC-MV-APH-FN-010:** A apuração DEVE calcular os seguintes tipos de horas:
- Horas trabalhadas normais (DFdia_normal)
- Horas extras em domingos/feriados (DFhe_dom_feriado)
- Horas faltosas (DFhora_faltosa)
- Banco de horas (DFbanco_horas)
- Adicional noturno (DFadic_noturno)
- Adicional noturno em horas extras (DFadic_noturno_he)

**SPEC-MV-APH-FN-011:** O sistema DEVE criar tabelas temporárias para processamento:
- Tabela de apuração principal (##TBtemp_apuracao)
- Tabela de horas negativas para folha (quando aplicável)
- Tabelas de cartão ponto por período

**SPEC-MV-APH-FN-012:** Durante o processamento, o sistema DEVE alterar o cursor para "espera" e restaurar ao final

### **9.1.3 – Exibição de Resultados**

**SPEC-MV-APH-FN-013:** Os resultados da apuração DEVEM ser exibidos em uma grade GridEX com as seguintes colunas:
- Código da empresa
- Nome da empresa
- Matrícula do funcionário
- Nome do funcionário
- Horas trabalhadas
- Dia normal
- HE domingo/feriado
- Hora faltosa
- Banco de horas
- Adicional noturno
- Adicional noturno HE

**SPEC-MV-APH-FN-014:** O sistema DEVE fornecer opção para filtrar a exibição mostrando apenas funcionários com horas lançadas (check box "Exibir somente funcionários com horas")

**SPEC-MV-APH-FN-015:** O sistema DEVE permitir imprimir relatório parcial da apuração através do botão "Imprimir Rel. Parcial" que gera o relatório "rptRelatorio_Horas_Extra2.rpt"

**SPEC-MV-APH-FN-016:** A impressão DEVE incluir fórmula de referência com mês/ano no formato "Mmm/yyyy" (ex: "Jan/2024")

### **9.1.4 – Controle de Horas Negativas**

**SPEC-MV-APH-FN-017:** O sistema DEVE exibir a opção "Desconta hora negativa em folha" apenas se o parâmetro de banco de horas estiver ativado para o cliente

**SPEC-MV-APH-FN-018:** Quando marcada, a opção de horas negativas DEVE criar tabela temporária específica (strTabelaHoraNegFolha) e considerar o desconto no processo de fechamento

### **9.1.5 – Processo de Fechamento Mensal**

**SPEC-MV-APH-FN-019:** O sistema DEVE permitir fechamento mensal através da aba "Fechamento" com as seguintes características:
- Só pode ser executado uma vez por período
- Não pode ser desfeito
- Requer apuração prévia executada

**SPEC-MV-APH-FN-020:** O sistema DEVE exibir mensagem de alerta na aba "Fechamento" indicando a necessidade de executar apuração primeiro, caso não tenha sido feita

**SPEC-MV-APH-FN-021:** O sistema DEVE permitir exportação dos dados de horas para arquivo texto através da opção "Exportar arquivo de horas"

**SPEC-MV-APH-FN-022:** Para exportação, o sistema DEVE:
- Permitir selecionar caminho e nome do arquivo (.TXT)
- Verificar se arquivo já existe e solicitar confirmação para sobrescrever
- Gerar arquivo com layout específico por evento de horas

**SPEC-MV-APH-FN-023:** O layout do arquivo exportado DEVE seguir o padrão:
- Empresa (2 dígitos)
- Matrícula (5 dígitos)
- Evento (3 dígitos)
- Horas (3 dígitos)
- Minutos (2 dígitos)
- Mês/Ano (6 dígitos - yyyyMM)
- Campos separados por pipe ("|")

**SPEC-MV-APH-FN-024:** Durante o fechamento, o sistema DEVE executar em transação as seguintes ações:
- Inserir registros de banco de horas para funcionários sem registro no mês-base
- Marcar como quitados (DFquitado=1) registros de banco de horas com saldo positivo
- Zerar saldo de horas quitadas (DFsaldo_horas=0)
- Marcar como quitados registros de cartão ponto do período
- Se horas negativas ativadas, marcar como quitados registros de banco de horas negativos

**SPEC-MV-APH-FN-025:** Após fechamento, o sistema DEVE:
- Exibir mensagem de sucesso
- Perguntar se deseja imprimir apuração
- Executar cancelamento automático para limpar dados

### **9.1.6 – Listagem de Inconsistências**

**SPEC-MV-APH-FN-026:** A aba "Listagem" DEVE exibir funcionários que:
- Não possuem lançamentos para o mês de apuração
- Possuem lançamentos que não compreendem o mês integral

**SPEC-MV-APH-FN-027:** A listagem DEVE utilizar grade GridEX com formatação específica e impedir edição direta

**SPEC-MV-APH-FN-028:** O sistema DEVE impedir fechamento mensal se existirem funcionários na listagem de inconsistências

### **9.1.7 – Controles de Navegação e Ações**

**SPEC-MV-APH-FN-029:** A barra de rodapé DEVE conter os botões:
- **Cancelar (CA)**: Limpa todos os campos, grades e retorna ao estado inicial
- **Atualizar (AT)**: Recarrega dados do combo de Rede
- **Sair (SA)**: Fecha o formulário

**SPEC-MV-APH-FN-030:** O sistema DEVE utilizar barra de progresso (ProgressBar1) alinhada na parte inferior, inicialmente invisível

**SPEC-MV-APH-FN-031:** Todos os controles DEVE ter tratamento apropriado de eventos GotFocus/LostFocus para gerenciar a propriedade KeyPreview do formulário

**SPEC-MV-APH-FN-032:** O sistema DEVE implementar tratamento de teclado com:
- Interceptação de Enter (KeyPress=13 → 0)
- Chamada a Funcoes_Gerais.Verifica_Tecla para atalhos

### **9.1.8 – Validações e Segurança**

**SPEC-MV-APH-FN-033:** O sistema DEVE verificar permissões de acesso através da classe clsSeguranca associada ao formulário

**SPEC-MV-APH-FN-034:** O formulário DEVE ter ID=3648 na tabela TBformulario para controle de permissões

**SPEC-MV-APH-FN-035:** Todas as operações de banco de dados DEVEM ter tratamento de erro com:
- Rollback de transações em caso de falha
- Log de erros através de clsSeguranca.Erro
- Restauração do cursor ao estado normal

**SPEC-MV-APH-FN-036:** O sistema DEVE validar mês quitado antes da apuração e permitir incluir funcionários já quitados mediante confirmação do usuário

### **9.1.9 – Integração com Parâmetros do Sistema**

**SPEC-MV-APH-FN-037:** O sistema DEVE ler parâmetros de configuração:
- Uso de banco de horas (Parametros_CPonto.UsaBancoHoras)
- Número de meses para limite de compensação (Parametros_CPonto.NumeroMesesLimiteCompensacao)
- Se usa lançamento detalhado (Cartao_Ponto_Cliente.LancamentoDetalhado)

**SPEC-MV-APH-FN-038:** Os eventos de horas (códigos) DEVEM ser obtidos da tabela TBparametro_evento_empresa_banco_hora por empresa

**SPEC-MV-APH-FN-039:** O cálculo de adicional noturno DEVE considerar horários configurados (InicioAdNoturno e FinalAdNoturno) nas seguintes situações:
- Entrada antes das 22h e saída antes das 5h
- Entrada e saída entre 22h e 5h
- Entrada depois das 22h e saída depois das 5h

### **9.1.10 – Comportamentos Específicos da Interface**

**SPEC-MV-APH-FN-040:** Ao focar no check box de exportação, o sistema DEVE automaticamente mudar para a aba "Fechamento"

**SPEC-MV-APH-FN-041:** Ao focar no controle de data, o sistema DEVE automaticamente mudar para a aba "Apuração"

**SPEC-MV-APH-FN-042:** Ao focar no botão de fechamento, o sistema DEVE automaticamente mudar para a aba "Fechamento"

**SPEC-MV-APH-FN-043:** Ao focar na grade de resultados, o sistema DEVE automaticamente mudar para a aba "Apuração"

**SPEC-MV-APH-FN-044:** Ao clicar na grade de resultados, o sistema DEVE executar método Update para garantir persistência de alterações

**SPEC-MV-APH-FN-045:** O frame do caminho de exportação DEVE ser habilitado/desabilitado conforme estado do check box "Exportar arquivo de horas"

---

# **10 Movimentação Solicitar ajuste no cartão de ponto**

## **10.0 Estrutura Geral do Formulário**

**SPEC-MV-ACP-UI-001:** O sistema DEVE apresentar um formulário de digitação do cartão de ponto com título "Digitação do Cartão de Ponto", dimensões fixas (17355x7800 twips), estilo de borda fixa single, posicionamento centralizado na tela, e ser um formulário filho MDI (MDIChild = True).

**SPEC-MV-ACP-UI-002:** A tela DEVE possuir uma área superior de filtro de funcionário contendo campos para seleção hierárquica de Rede, Empresa, Funcionário, e um seletor de Mês/Ano (MM/yyyy), com um botão "Confirmar" para aplicar o filtro.

**SPEC-MV-ACP-UI-003:** Todos os botões de ação principal (Confirmar, Cancelar, Atualizar, Alterar Ocorrência, Sair) DEVEM ser exibidos em um painel inferior (mxPainel4) com ícones representativos e dicas de ferramenta (ToolTipText) explicando sua funcionalidade.

**SPEC-MV-ACP-UI-004:** O sistema DEVE conter uma barra de progresso (ProgressBar1) na parte inferior do formulário, visível apenas durante operações de processamento.

**SPEC-MV-ACP-UI-005:** O sistema DEVE utilizar um controle de abas (SSTab1) com duas guias: "Lançamentos" (ícone padrão) e "Banco de Horas" (ícone padrão).

**SPEC-MV-ACP-UI-006:** A guia "Lançamentos" DEVE conter uma seção superior (fraLancamento) para entrada de dados, com controles para: Dia (DTPicker), Tipo do Dia (ComboBox: Dia Normal, DSR, Feriado), Motivo (ctlData_Combo), uma caixa de seleção "Fixa", campos de máscara para até 8 horários (4 períodos de entrada/saída), botões de ação para o dia (Incluir, Alterar, Confirmar, Cancelar, Excluir) e botões auxiliares (Deslocar horários, Repetir lançamento até um dia, Carregar horário padrão, Marcar todos os intervalos, Imprimir).

**SPEC-MV-ACP-UI-007:** A guia "Lançamentos" DEVE conter uma grade principal (gexDigitacao) para exibir todos os lançamentos do mês, com colunas para: Data, Tipo do Dia (com ícone), Motivo, e os horários de 1º a 4º período, e permitir ordenação pela coluna de Data.

**SPEC-MV-ACP-UI-008:** A guia "Lançamentos" DEVE conter um painel lateral direito com duas grades: "gexTotalizadores" (detalhamento por motivo do dia selecionado) e "gexTotalizadoresMes" (consolidado por motivo para todo o mês).

**SPEC-MV-ACP-UI-009:** A guia "Banco de Horas" DEVE conter três seções em quadros: "Histórico" (grade gexHistoricoBH), "Meses Compensados" (grade gexMesesCompensados) e "Saldo Atualizado" (grade gexSaldoAtualizado com botão "Atualizar").

**SPEC-MV-ACP-UI-010:** O sistema DEVE exibir um painel (mxpBatidas_Originais) acima da grade de lançamentos, mostrando as batidas originais capturadas do ponto eletrônico para o dia selecionado, quando disponíveis.

---

## **10.1 Funcionalidades do Módulo**

### **10.1.1 Solicitar ajuste no cartão de ponto**

**SPEC-MV-ACP-FUNC-001:** O sistema DEVE permitir a seleção hierárquica de um funcionário para edição, seguindo a sequência: escolha de Rede -> filtro automático da Empresa (baseado na rede e no usuário) -> escolha de Funcionário (lista filtrada por empresa e mês/ano de admissão/demissão). A escolha do funcionário DEVE preencher automaticamente os campos de Cargo (código e descrição).

**SPEC-MV-ACP-FUNC-002:** O sistema DEVE, ao clicar no botão "Confirmar" do filtro, validar se o mês/ano selecionado já foi apurado para o funcionário. Se apurado, DEVE bloquear a edição e exibir uma mensagem informativa.

**SPEC-MV-ACP-FUNC-003:** O sistema DEVE, ao selecionar um dia no campo "Dia", carregar automaticamente o horário padrão do funcionário para aquele dia nos campos de horário (1º ao 4º período), considerando turnos que ultrapassem a meia-noite (ajuste de data).

**SPEC-MV-ACP-FUNC-004:** O sistema DEVE permitir ao usuário digitar manualmente horários de entrada e saída em até 4 períodos distintos (8 batidas no total), utilizando campos de máscara no formato HH:mm.

**SPEC-MV-ACP-FUNC-005:** O sistema DEVE validar o formato e a validade lógica de cada horário digitado (ex: horas entre 00-23, minutos entre 00-59) ao sair do campo, e não permitir o salvamento de valores inválidos.

**SPEC-MV-ACP-FUNC-006:** O sistema DEVE oferecer a opção "Util. lcto até" que, quando marcada, permite definir um dia final (DTPicker com formato 'dd') para repetir automaticamente o mesmo lançamento de horários e motivo em todos os dias subsequentes, até a data limite dentro do mesmo mês.

**SPEC-MV-ACP-FUNC-007:** O sistema DEVE calcular automaticamente os totalizadores (horas normais, extras, faltas, banco de horas, etc.) para o dia, com base na comparação entre os horários digitados e o horário padrão do funcionário, considerando o Tipo do Dia e o Motivo selecionado. O resultado DEVE ser exibido na grade lateral "Totalizadores" (gexTotalizadores).

**SPEC-MV-ACP-FUNC-008:** O sistema DEVE consolidar e atualizar automaticamente os totalizadores do mês (por motivo) na grade "gexTotalizadoresMes" sempre que um lançamento for incluído, alterado ou excluído.

**SPEC-MV-ACP-FUNC-009:** O sistema DEVE permitir a exclusão de um lançamento de dia específico através do botão "Excluir" na seção de lançamento, após confirmação do usuário via caixa de diálogo.

**SPEC-MV-ACP-FUNC-010:** O sistema DEVE permitir a edição de um lançamento existente ao clicar em uma linha da grade principal e então no botão "Alterar". Os controles de lançamento DEVERÃO ser preenchidos com os dados do dia, e os botões "Incluir/Alterar" serão substituídos por "Confirmar/Cancelar" para a edição.

**SPEC-MV-ACP-FUNC-011:** O sistema DEVE validar, ao tentar incluir ou alterar um lançamento, se a data do dia está dentro do período de vigência do funcionário (entre data de admissão e data de demissão, se houver). Caso contrário, DEVE impedir o lançamento e informar o usuário.

**SPEC-MV-ACP-FUNC-012:** O sistema DEVE permitir ao usuário selecionar o "Tipo do Dia" (Dia Normal, DSR, Feriado), o que influencia os cálculos dos totalizadores e a lista de Motivos disponíveis (ex: para DSR, apenas motivos com totalizador 'E' ou 'A').

**SPEC-MV-ACP-FUNC-013:** O sistema DEVE permitir a seleção de um "Motivo" para o dia a partir de uma lista pré-cadastrada. A opção de checkBox "Fixa", quando marcada, DEVE manter o último motivo selecionado para os próximos lançamentos.

**SPEC-MV-ACP-FUNC-014:** O sistema DEVE, para o dia selecionado/em edição, consultar e exibir no painel "mxpBatidas_Originais" as batidas originais capturadas pelo sistema de ponto eletrônico (quando existirem), no formato concatenado (ex: "08:00-12:00-13:00-18:00"), para referência do digitador.

**SPEC-MV-ACP-FUNC-015:** O sistema DEVE permitir ao usuário deslocar a sequência de horários digitados para a esquerda ("<<") ou para a direita (">>") a partir do campo de horário que estiver com foco, facilitando o ajuste de batidas inseridas em posição equivocada.

**SPEC-MV-ACP-FUNC-016:** O sistema DEVE gerenciar automaticamente o saldo do Banco de Horas (BH) do funcionário. Ao confirmar os lançamentos do mês, DEVE salvar as horas positivas e negativas no BH e, em seguida, executar a compensação dessas horas com os saldos de meses anteriores (respeitando o limite de meses parametrizado), atualizando o saldo final.

**SPEC-MV-ACP-FUNC-017:** O sistema DEVE, na guia "Banco de Horas", carregar e exibir na grade "Histórico" o saldo mês a mês do BH do funcionário, considerando o número de meses limite para compensação definido nos parâmetros.

**SPEC-MV-ACP-FUNC-018:** O sistema DEVE, ao clicar em uma linha do "Histórico" do BH, carregar na grade "Meses Compensados" a lista de meses que foram compensados (utilizados) para gerar o saldo daquele mês específico.

**SPEC-MV-ACP-FUNC-019:** O sistema DEVE permitir o lançamento de uma ocorrência (justificativa/observação) para a alteração feita no ponto, através do botão "Alterar Ocorrência". Esta funcionalidade DEVE estar disponível apenas se o parâmetro correspondente estiver habilitado na empresa.

**SPEC-MV-ACP-FUNC-020:** O sistema DEVE validar a integridade básica dos horários digitados (ex: entrada de um período anterior à saída do mesmo período) e, caso detecte uma sequência aparentemente incorreta (ex: sobreposição), DEVE alertar o usuário e perguntar se deseja continuar.

**SPEC-MV-ACP-FUNC-021:** O sistema DEVE permitir a impressão do espelho do cartão de ponto (com todos os lançamentos e totalizadores do mês) através do botão "Imprimir". Esta ação DEVE estar disponível apenas após a confirmação e salvamento das alterações do mês.

**SPEC-MV-ACP-FUNC-022:** O sistema DEVE, ao carregar o formulário, verificar a existência de funções essenciais no banco de dados (como `CALC_HORAS_TRABALHADAS`, `FOL_FORMATAR_DECIMAL_HORA`). Caso não existam, DEVE exibir uma mensagem de erro e impedir o uso do formulário.

**SPEC-MV-ACP-FUNC-023:** O sistema DEVE detectar a existência de alterações não salvas no cartão de ponto (quando `booCartaoSalvo = False`). Ao tentar fechar o formulário ou clicar no botão "Cancelar", DEVE solicitar confirmação do usuário para descartar as alterações.

**SPEC-MV-ACP-FUNC-024:** O sistema DEVE, ao calcular o saldo do Banco de Horas, aplicar os percentuais de acréscimo parametrizados para horas trabalhadas em Dia Normal, DSR e Feriado, antes de contabilizá-las como crédito no BH.

**SPEC-MV-ACP-FUNC-025:** O sistema DEVE, na guia "Banco de Horas", permitir ao usuário clicar no botão "Atualizar" para recalcular e exibir na grade "Saldo Atualizado" uma previsão do saldo do BH, considerando os lançamentos já feitos no mês (ainda não confirmados) e a compensação com meses anteriores.

---

# **11 Relatório Cartão de Ponto Calculado**

## **11.0 Estrutura Geral do Formulário**

**SPEC-RE-BOA-UI-001:** O sistema DEVE apresentar um formulário intitulado "Relatório Cartão de Ponto Calculado" com as seguintes características visuais:
- Bordas fixas (não redimensionáveis)
- Dimensões de 8865 x 5655 twips
- Fonte padrão MS Sans Serif, tamanho 9.75
- Exibição como janela filha do MDI
- Não exibir na barra de tarefas do sistema

**SPEC-RE-BOA-UI-002:** A tela DEVE possuir a seguinte estrutura de componentes:
- Painel de filtros de funcionários à esquerda
- Painel de opções de relatório à direita
- Barra de botões de ação na parte inferior
- Barra de progresso oculta na base

**SPEC-RE-BOA-UI-003:** Todos os botões DEVEM possuir:
- Tooltips descritivos das ações
- Códigos de atalho visíveis (CO, CA, AT, SA)
- Comportamento de navegação por teclado consistente
- Visualização de teclas de atalho quando em foco

## **11.1 Funcionalidades do Módulo**

### **11.1.1 – Sistema de Filtros Hierárquicos**

**SPEC-RE-BOA-FUNC-001:** O sistema DEVE implementar um sistema de filtros hierárquicos com as seguintes dependências:
1. Seleção de Rede → Carrega Empresas disponíveis
2. Seleção de Empresa → Carrega Planos de Centro de Custo
3. Seleção de Plano de Centro de Custo → Carrega Centros de Custo
4. Seleção de Centro de Custo → Filtra funcionários correspondentes
5. Gestor e Funcionário como filtros opcionais independentes

**SPEC-RE-BOA-FUNC-002:** O filtro de Rede DEVE:
- Ser carregado automaticamente com a rede padrão do usuário
- Atualizar todos os filtros dependentes quando alterado
- Possuir capacidade de atualização manual via botão "Atualizar"

**SPEC-RE-BOA-FUNC-003:** O filtro de Empresa DEVE:
- Restringir-se às empresas autorizadas para o usuário atual
- Manter alinhamento vertical dos controles (Alinhamento=7)

**SPEC-RE-BOA-FUNC-004:** O controle de Centro de Custo DEVE:
- Utilizar componente drop-down específico (ctlDropDown)
- Suportar limpeza completa via comando "Cancelar"

### **11.1.2 – Configuração de Parâmetros do Relatório**

**SPEC-RE-BOA-FUNC-005:** O sistema DEVE permitir a configuração dos seguintes parâmetros de relatório:
1. **Competência:** Seleção de mês/ano via controle DTPicker com formato MM/yyyy
2. **Omitir saldo diário:** Checkbox para suprimir cálculo de saldo diário
3. **Exibir Histórico Banco de Horas:** Checkbox para incluir histórico detalhado de BH
4. **Emitir somente resumo:** Checkbox para gerar apenas o resumo mensal

**SPEC-RE-BOA-FUNC-006:** A competência DEVE:
- Inicializar com a data atual do sistema
- Formatar como "MM/yyyy" na exibição
- Ser obrigatória para geração do relatório

### **11.1.3 – Geração de Relatórios**

**SPEC-RE-BOA-FUNC-007:** O sistema DEVE suportar dois modos de geração de relatórios:
1. **Modo Detalhado:** Quando configurado no cliente (Cartao_Ponto_Cliente.LancamentoDetalhado = True)
2. **Modo Totalizador:** Quando configurado no cliente (Cartao_Ponto_Cliente.LancamentoDetalhado = False)

**SPEC-RE-BOA-FUNC-008:** O Modo Detalhado DEVE:
- Gerar relatório com estrutura de lançamentos detalhados
- Incluir movimentos por turno com horários específicos
- Calcular saldos diários (a menos que omitido)
- Suportar histórico de Banco de Horas quando habilitado

**SPEC-RE-BOA-FUNC-009:** O Modo Totalizador DEVE:
- Gerar relatório com múltiplas batidas (até 5 turnos)
- Calcular totais de horas trabalhadas, extras, abonadas e faltosas
- Suportar opção "somente resumo"
- Incluir totais mensais consolidados

**SPEC-RE-BOA-FUNC-010:** A geração de relatórios DEVE:
- Validar obrigatoriedade da empresa antes da execução
- Exibir barra de progresso durante processamento
- Criar tabelas temporárias para otimização de consultas
- Limpar tabelas temporárias após conclusão

### **11.1.4 – Cálculos e Processamentos**

**SPEC-RE-BOA-FUNC-011:** O sistema DEVE executar os seguintes cálculos:
- Horas trabalhadas: Diferença entre entrada e saída por turno
- Saldo diário: Horas trabalhadas - Jornada de trabalho
- Totais por tipo (extra, abono, falta) baseado em totalizadores
- Saldo acumulado de Banco de Horas

**SPEC-RE-BOA-FUNC-012:** Os cálculos DEVE utilizar:
- Função FOL_FORMATAR_DECIMAL_HORA para formatação decimal→hora
- Função FOL_FORMATAR_HORA_DECIMAL para conversão hora→decimal
- Função CALC_HORAS_TRABALHADAS para cálculo entre horários
- Função FOL_FORMATAR_ANO_MES para formatação de períodos

**SPEC-RE-BOA-FUNC-013:** O processamento de Banco de Horas DEVE:
- Respeitar configuração Parametros_CPonto.UsaBancoHoras
- Considerar meses quitados conforme parâmetro do sistema
- Aplicar limite de meses para compensação (Parametros_CPonto.NumeroMesesLimiteCompensacao)
- Incluir saldos iniciais quando configurados

### **11.1.5 – Controles de Ação**

**SPEC-RE-BOA-FUNC-014:** O sistema DEVE disponibilizar os seguintes controles de ação:
1. **Confirmar (CO):** Valida filtros e gera relatório
2. **Cancelar (CA):** Limpa todos os filtros e restaura valores padrão
3. **Atualizar (AT):** Recarrega dados de rede e atualiza filtros dependentes
4. **Sair (SA):** Fecha o formulário

**SPEC-RE-BOA-FUNC-015:** O botão "Cancelar" DEVE:
- Limpar todos os controles de filtro (Empresa, PlanoCCusto, CCusto, Funcionário)
- Restaurar competência para data atual
- Marcar checkbox "Omitir saldo diário" como ativo
- Reposicionar foco no filtro de Empresa

**SPEC-RE-BOA-FUNC-016:** O botão "Atualizar" DEVE:
- Recarregar dados da rede a partir do banco
- Aplicar rede padrão do usuário (clsUsuario.Id_Rede_Empresa_Padrao)
- Atualizar toda a cadeia de filtros dependentes

### **11.1.6 – Tratamento de Erros e Validações**

**SPEC-RE-BOA-FUNC-017:** O sistema DEVE validar:
- Empresa é obrigatória para geração do relatório
- Competência deve estar dentro do período permitido
- Filtros hierárquicos devem manter consistência

**SPEC-RE-BOA-FUNC-018:** O tratamento de erros DEVE:
- Utilizar estrutura On Error GoTo em todos os procedimentos
- Registrar erros via clsSeguranca.Erro
- Manter Debug.Assert para interrupção em ambiente de desenvolvimento
- Garantir liberação de recursos em caso de erro

**SPEC-RE-BOA-FUNC-019:** A interface DEVE:
- Alterar para estado "interfaceEmEspera" durante processamento
- Retornar para "interfaceNormal" após conclusão ou erro
- Ocultar barra de progresso em estado normal

### **11.1.7 – Integração e Segurança**

**SPEC-RE-BOA-FUNC-020:** O sistema DEVE integrar-se com:
- Módulo de segurança (clsSeguranca) para controle de acesso
- Estrutura de usuário (clsUsuario) para filtros padrão
- Parâmetros do cartão de ponto (Parametros_CPonto)
- Configurações específicas do cliente (Cartao_Ponto_Cliente)

**SPEC-RE-BOA-FUNC-021:** A segurança DEVE:
- Verificar permissões através de clsSeguranca
- Filtrar empresas por TBusuario_empresa
- Utilizar ID do formulário (2134) para controle de acesso
- Validar permissões antes de operações críticas

**SPEC-RE-BOA-FUNC-022:** A geração de relatórios DEVE:
- Utilizar sistema de impressão unificado (clsSeguranca.Imprimir)
- Suportar múltiplos sub-relatórios
- Aplicar fórmulas de Crystal Reports dinamicamente
- Opção de suprimir mensagens (parâmetro SemMsg)

### **11.1.8 – Otimização e Performance**

**SPEC-RE-BOA-FUNC-023:** O sistema DEVE otimizar consultas através de:
- Criação de tabelas temporárias para processamento intermediário
- Uso de índices apropriados nas tabelas de origem
- Agrupamento de operações em transações SQL
- Limpeza explícita de objetos temporários

**SPEC-RE-BOA-FUNC-024:** As tabelas temporárias DEVE:
- Utilizar prefixo "##TBtemp_" para identificação
- Ser criadas via clsSeguranca.Criar_TB
- Ser excluídas via Excluir_TBTemp após uso
- Conter apenas dados necessários para o relatório

### **11.1.9 – Personalização por Cliente**

**SPEC-RE-BOA-FUNC-025:** O sistema DEVE adaptar-se por cliente através de:
- Parâmetro Cartao_Ponto_Cliente.LancamentoDetalhado
- Configuração Parametros_CPonto.UsaBancoHoras
- Parâmetro Parametros_CPonto.NumeroMesesLimiteCompensacao
- ID específico de parâmetro (Parametros_CPonto.IdParametroCPonto)

**SPEC-RE-BOA-FUNC-026:** A personalização DEVE afetar:
- Layout do relatório gerado (detalhado vs. totalizador)
- Cálculo de Banco de Horas (habilitado/desabilitado)
- Limite de meses para compensação
- Motivos específicos para adicional noturno

### **11.1.10 – Navegação e Usabilidade**

**SPEC-RE-BOA-FUNC-027:** O sistema DEVE suportar:
- Navegação por teclado entre controles (TabIndex definido)
- Tecla Enter para avançar entre campos
- Teclas de atalho padrão do sistema
- Preview de teclas (KeyPreview = True no formulário)

**SPEC-RE-BOA-FUNC-028:** A experiência do usuário DEVE incluir:
- Foco automático no campo Empresa após cancelar
- Atualização automática de filtros dependentes
- Estado visual consistente dos controles
- Mensagens de validação claras e objetivas

**SPEC-RE-BOA-FUNC-029:** Os componentes customizados DEVE:
- Manter alinhamento visual consistente (Alinhamento=7)
- Suportar métodos padrão (Limpar, Atualizar, Id)
- Integrar-se com sistema de binding de dados
- Respeitar hierarquia de tabulação definida

---

# **12 Relatório Banco de Horas Acumulado**

## **12.0 Estrutura Geral do Formulário**

**SPEC-RE-BHA-UI-001:** O sistema DEVE apresentar um formulário intitulado "Relatório de Banco de Horas Acumulado" com as seguintes características visuais:
- Bordas fixas (não redimensionáveis)
- Dimensões de 7050 x 6045 twips
- Fonte padrão MS Sans Serif, tamanho 9.75
- Ícone personalizado específico do formulário
- Exibição como janela filha do MDI (MDIChild = True)
- Não exibir na barra de tarefas do sistema (ShowInTaskbar = False)
- Captura de eventos de teclado em nível de formulário (KeyPreview = True)

**SPEC-RE-BHA-UI-002:** A tela DEVE possuir a seguinte estrutura de componentes:
- Painel de filtros de funcionários (fraFiltros) na parte superior
- Painel de período (fraPeriodo) com controles de data início/fim
- Frame de opções (Frame1) com checkbox "Excluir Demitidos"
- Barra de botões de ação (mxPainel4) na parte inferior
- Barra de progresso (ProgressBar1) oculta na base da janela

**SPEC-RE-BHA-UI-003:** Todos os botões DEVEM possuir:
- Tooltips descritivos das ações (Confirmar, Cancelar, Sair, Atualizar)
- Ícones gráficos em vez de texto
- Comportamento de navegação por teclado consistente
- Desabilitação temporária do KeyPreview do formulário quando em foco
- Restauração do KeyPreview ao perder o foco

## **12.1 Funcionalidades do Módulo**

### **12.1.1 – Sistema de Filtros Hierárquicos**

**SPEC-RE-BHA-FUNC-001:** O sistema DEVE implementar um sistema de filtros hierárquicos com as seguintes dependências:
1. Seleção de Rede → Carrega Empresas disponíveis
2. Seleção de Empresa → Carrega Planos de Centro de Custo
3. Seleção de Plano de Centro de Custo → Carrega Centros de Custo
4. Gestor e Funcionário como filtros opcionais independentes

**SPEC-RE-BHA-FUNC-002:** O filtro de Rede DEVE:
- Ser carregado automaticamente com a rede padrão do usuário (clsUsuario.Id_Rede_Empresa_Padrao)
- Atualizar todos os filtros dependentes quando alterado através do método config.Refresh
- Possuir capacidade de atualização manual via botão "Atualizar"
- Ter tabulação desabilitada (TabStop = False) como controle raiz

**SPEC-RE-BHA-FUNC-003:** O filtro de Empresa DEVE:
- Restringir-se às empresas autorizadas para o usuário atual através de join com TBusuario_empresa
- Manter alinhamento vertical consistente dos controles (Alinhamento = 7)
- Suportar seleção múltipla através do componente ctlData_Combo

**SPEC-RE-BHA-FUNC-004:** O controle de Centro de Custo DEVE:
- Utilizar componente drop-down específico (ctlDropDown)
- Suportar limpeza completa via comando "Cancelar"
- Manter vinculação com o Plano de Centro de Custo selecionado

**SPEC-RE-BHA-FUNC-005:** Os filtros de Gestor e Funcionário DEVE:
- Utilizar componente ctlData_Combo com binding nas tabelas TBfuncionario e TBpessoa
- Suportar busca por matrícula e nome
- Ser independentes na hierarquia de filtros

### **12.1.2 – Configuração de Parâmetros do Relatório**

**SPEC-RE-BHA-FUNC-006:** O sistema DEVE permitir a configuração dos seguintes parâmetros de relatório:
1. **Período:** Seleção de mês/ano inicial e final via controles DTPicker com formato MM/yyyy
2. **Excluir Demitidos:** Checkbox para excluir funcionários demitidos (valor padrão = Checked)

**SPEC-RE-BHA-FUNC-007:** O período DEVE:
- Inicializar com o mês atual (data início como 01/mm/aaaa e data final como último dia do mês)
- Utilizar controles DTPicker com formato customizado "MM/yyyy"
- Validar que a data final não seja anterior à data início
- Ser obrigatório para geração do relatório

**SPEC-RE-BHA-FUNC-008:** A opção "Excluir Demitidos" DEVE:
- Estar marcada por padrão (Value = 1)
- Aplicar filtro para excluir registros da tabela TBfuncionario_demitido
- Ser opcional para o usuário

### **12.1.3 – Geração de Relatórios**

**SPEC-RE-BHA-FUNC-009:** O sistema DEVE gerar relatório de Banco de Horas Acumulado com base na configuração do sistema:
1. **Modo Banco de Horas:** Quando Parametros_CPonto.UsaBancoHoras = True
2. **Modo Cartão de Ponto:** Quando Parametros_CPonto.UsaBancoHoras = False

**SPEC-RE-BHA-FUNC-010:** O Modo Banco de Horas DEVE:
- Consultar tabelas TBbanco_hora, TBnumero_he_mes e TBsaldo_banco_hora
- Considerar apenas registros não quitados (DFquitado = 0)
- Calcular saldo atual com base no último mês do período (TBsaldo_atual.DFsaldo_atual)
- Incluir total de horas extras e faltosas por funcionário

**SPEC-RE-BHA-FUNC-011:** O Modo Cartão de Ponto DEVE:
- Consultar tabelas TBcartao_ponto, TBtotalizador_motivo_cartao_ponto e TBmotivo_cartao_ponto
- Considerar apenas motivos do tipo 'E' (Extra) com ação BH/FP = 1 (DFtotalizador = 'E' AND DFacao_bh_fp = 1)
- Calcular totais de crédito (natureza 'C') e débito (natureza 'D') por funcionário
- Agrupar por funcionário e natureza do motivo

**SPEC-RE-BHA-FUNC-012:** A geração de relatórios DEVE:
- Validar obrigatoriedade de Rede e Empresa antes da execução
- Exibir mensagens de alerta específicas para cada validação
- Criar tabelas temporárias para otimização de consultas (##TBtemp_*)
- Limpar tabelas temporárias após conclusão através de Excluir_TBTemp
- Utilizar barra de progresso durante processamento (ProgressBar1)

### **12.1.4 – Cálculos e Processamentos**

**SPEC-RE-BHA-FUNC-013:** O sistema DEVE executar os seguintes cálculos:
- Total de horas extras: Soma de créditos por funcionário
- Total de horas faltosas: Soma de débitos por funcionário
- Saldo de horas: 
  - Modo Banco: TBsaldo_atual.DFsaldo_atual
  - Modo Cartão: DFtotal_hora_extra - DFtotal_hora_faltosa
- Horas a pagar: Saldo de horas com base no limite de compensação (Parametros_CPonto.NumeroMesesLimiteCompensacao)

**SPEC-RE-BHA-FUNC-014:** Os cálculos DEVE utilizar:
- Função FOL_FORMATAR_DECIMAL_HORA para formatação decimal→hora
- Função FOL_FORMATO_ANO_MES para formatação de períodos
- Função dbo.FOL_FORMATO_ANO_MES para formatação no banco de dados
- Parâmetro NumeroMesesLimiteCompensacao para cálculo de horas a pagar

**SPEC-RE-BHA-FUNC-015:** O processamento DEVE:
- Incluir dados de rede, empresa, centro de custo, gestor e funcionário
- Formatar números de matrícula e nomes adequadamente
- Ordenar resultados por rede, empresa, gestor e funcionário
- Calcular saldo acumulado considerando meses anteriores

**SPEC-RE-BHA-FUNC-016:** A construção de filtros DEVE:
- Gerar cláusulas WHERE dinamicamente através da função GerarFiltro
- Aplicar condições para período, rede, empresa, centro de custo, gestor e funcionário
- Incluir condição de exclusão de demitidos quando checkbox marcado

### **12.1.5 – Controles de Ação**

**SPEC-RE-BHA-FUNC-017:** O sistema DEVE disponibilizar os seguintes controles de ação:
1. **Confirmar (Ícone):** Valida filtros, processa dados e gera relatório
2. **Cancelar (Ícone):** Limpa todos os filtros e restaura valores padrão
3. **Atualizar (Ícone):** Recarrega dados de rede e atualiza filtros dependentes
4. **Sair (Ícone):** Fecha o formulário

**SPEC-RE-BHA-FUNC-018:** O botão "Cancelar" DEVE:
- Chamar o procedimento Limpar_Campos para resetar todos os controles
- Limpar todos os controles de filtro (Empresa, PlanoCCusto, CCusto, Funcionário, Gestor)
- Restaurar período para mês atual usando Banco_Dados.Data_hora
- Marcar checkbox "Excluir Demitidos" como ativo (Value = 1)
- Reposicionar foco no filtro de Empresa (adbEmpresa.SetFocus)

**SPEC-RE-BHA-FUNC-019:** O botão "Atualizar" DEVE:
- Recarregar dados da rede a partir do banco (adbRede.Atualizar)
- Aplicar rede padrão do usuário (clsUsuario.Id_Rede_Empresa_Padrao)
- Atualizar toda a cadeia de filtros dependentes via config.Refresh
- Manter tratamento de erro com clsSeguranca.Erro

**SPEC-RE-BHA-FUNC-020:** O botão "Confirmar" DEVE:
- Validar obrigatoriedade de Rede e Empresa
- Construir consultas SQL dinâmicas baseadas no modo (Banco/Cartão)
- Criar e popular tabelas temporárias
- Configurar parâmetros do relatório Crystal Reports
- Chamar clsSeguranca.Imprimir para gerar o relatório

### **12.1.6 – Tratamento de Erros e Validações**

**SPEC-RE-BHA-FUNC-021:** O sistema DEVE validar:
- Rede é obrigatória para geração do relatório (adbRede.Id ≠ vbNullString)
- Empresa é obrigatória para geração do relatório (adbEmpresa.Id ≠ vbNullString)
- Período deve ter datas válidas (CLng(dtpData_Inicio.value) > 0)

**SPEC-RE-BHA-FUNC-022:** O tratamento de erros DEVE:
- Utilizar estrutura On Error GoTo em todos os procedimentos públicos
- Registrar erros via clsSeguranca.Erro com nome do procedimento
- Manter Debug.Assert False para interrupção em ambiente de desenvolvimento
- Incluir mensagens de erro descritivas com timestamp (DateTime.time)
- Garantir liberação de recursos em caso de erro

**SPEC-RE-BHA-FUNC-023:** A função GerarFiltro DEVE:
- Construir cláusulas WHERE dinamicamente com base nos controles preenchidos
- Incluir condição de exclusão de demitidos quando checkbox marcado
- Aplicar filtros de rede, empresa, centro de custo, gestor e funcionário
- Considerar parâmetro UsaBancoHoras para condição de período

### **12.1.7 – Integração e Segurança**

**SPEC-RE-BHA-FUNC-024:** O sistema DEVE integrar-se com:
- Módulo de segurança (clsSeguranca) para controle de acesso e tratamento de erros
- Estrutura de usuário (clsUsuario) para filtros padrão e ID_Usuario
- Parâmetros do cartão de ponto (Parametros_CPonto) para configuração
- Configurações de banco de horas do sistema (UsaBancoHoras, NumeroMesesLimiteCompensacao)

**SPEC-RE-BHA-FUNC-025:** A segurança DEVE:
- Verificar permissões através de clsSeguranca (instância pública)
- Filtrar empresas por TBusuario_empresa baseado no ID_Usuario
- Utilizar ID do formulário (3856) para controle de acesso na tabela TBformulario
- Garantir que usuário só visualize empresas autorizadas

**SPEC-RE-BHA-FUNC-026:** A geração de relatórios DEVE:
- Utilizar sistema de impressão unificado (clsSeguranca.Imprimir)
- Passar parâmetros para o relatório Crystal Reports via Formulas collection
- Incluir informações de empresa, centro de custo, período e configuração
- Usar relatório "rptRelatorio_Banco_Horas_Acumulado.rpt"

### **12.1.8 – Otimização e Performance**

**SPEC-RE-BHA-FUNC-027:** O sistema DEVE otimizar consultas através de:
- Criação de tabelas temporárias para processamento intermediário (##TBtemp_*)
- Uso de hints de tabela (WITH (NOLOCK)) para evitar bloqueios
- Agrupamento de operações em transações SQL implícitas
- Indexação apropriada nas tabelas de origem

**SPEC-RE-BHA-FUNC-028:** As tabelas temporárias DEVE:
- Utilizar prefixo "##TBtemp_" para identificação (escopo global)
- Ser criadas via procedimento Criar_TB
- Ser excluídas via Excluir_TBTemp após uso
- Conter apenas dados necessários para o relatório
- Ter estrutura otimizada para as consultas do relatório

### **12.1.9 – Personalização por Configuração**

**SPEC-RE-BHA-FUNC-029:** O sistema DEVE adaptar-se por configuração através de:
- Parâmetro Parametros_CPonto.UsaBancoHoras para definir fonte de dados
- Parâmetro Parametros_CPonto.NumeroMesesLimiteCompensacao para cálculo de horas a pagar

**SPEC-RE-BHA-FUNC-030:** A personalização DEVE afetar:
- Fontes de dados consultadas (TBbanco_hora vs TBcartao_ponto)
- Cálculo de saldo de horas (saldo atual vs cálculo direto)
- Critérios de filtragem e condições de consulta
- Estrutura das queries SQL geradas dinamicamente

### **12.1.10 – Navegação e Usabilidade**

**SPEC-RE-BHA-FUNC-031:** O sistema DEVE suportar:
- Navegação por teclado entre controles (TabIndex definido de 0 a 12)
- Tecla Enter para avançar entre campos (KeyAscii = 13 tratado no formulário)
- Teclas de atalho padrão do sistema via Funcoes_Gerais.Verifica_Tecla
- Preview de teclas (KeyPreview = True no formulário)

**SPEC-RE-BHA-FUNC-032:** A experiência do usuário DEVE incluir:
- Foco automático no campo Empresa após cancelar (adbEmpresa.SetFocus)
- Atualização automática de filtros dependentes ao alterar rede/empresa
- Estado visual consistente dos controles através de Limpar_Captions
- Mensagens de validação claras e objetivas (MsgBox com vbInformation)

**SPEC-RE-BHA-FUNC-033:** Os componentes customizados DEVE:
- Manter alinhamento visual consistente (Alinhamento = 7)
- Suportar métodos padrão (Limpar, Atualizar, Id, Descricao)
- Integrar-se com sistema de binding de dados (Campo_Chave, Campo_Id, Campo_Descricao)
- Respeitar hierarquia de tabulação definida no formulário

### **12.1.11 – Relatório Gerado**

**SPEC-RE-BHA-FUNC-034:** O relatório gerado DEVE conter as seguintes informações:
- Identificação da rede (código e nome fantasia)
- Identificação da empresa (código e nome fantasia)
- Centro de custo (código e descrição)
- Período de apuração (mês/ano inicial e final)
- Matrícula e nome do gestor (quando aplicável)
- Matrícula e nome do funcionário
- Total de horas extras (crédito) em formato decimal e hora
- Total de horas faltosas (débito) em formato decimal e hora
- Saldo de horas em formato decimal e hora
- Horas a pagar (com base no limite de compensação)
- Indicador de utilização de banco de horas (parâmetro UtilizaBanco)

**SPEC-RE-BHA-FUNC-035:** O relatório DEVE ser formatado adequadamente:
- Números de horas no formato decimal (ex: 8.5) e hora (ex: 8:30) via FOL_FORMATAR_DECIMAL_HORA
- Períodos no formato mês/ano (MM/yyyy) via Format(dtpData_Inicio.value, "mm/yyyy")
- Dados agrupados por rede, empresa e gestor
- Ordenação por nome de funcionário dentro de cada grupo
- Campos calculados mantidos em formato numérico para ordenação (sufixo _dec)

### **12.1.12 – Inicialização e Configuração**

**SPEC-RE-BHA-FUNC-036:** O formulário DEVE durante a inicialização:
- Instanciar objeto config do tipo clsFiltroFuncionario
- Chamar Limpar_Captions para configuração visual
- Configurar SQLSelectEmpresa com restrição por TBusuario_empresa
- Executar Scan do config para mapear controles
- Chamar cmdCancelar_Click e cmdAtualizar_Click para estado inicial

**SPEC-RE-BHA-FUNC-037:** A classe clsFiltroFuncionario DEVE:
- Gerenciar a hierarquia de filtros (Rede → Empresa → PlanoCCusto → CCusto)
- Suportar método Refresh para atualizar cadeia de filtros
- Integrar-se com controles ctlData_Combo e ctlDropDown
- Manter consistência entre filtros dependentes

### **12.1.13 – Manutenção e Extensibilidade**

**SPEC-RE-BHA-FUNC-038:** O código DEVE ser estruturado para facilitar manutenção:
- Comentários de cabeçalho com informações do sistema/área/módulo
- Separação clara de responsabilidades entre procedimentos
- Uso de constantes e funções auxiliares (SeNull, Retornar_Ultimo_Dia_Mes)
- Tratamento consistente de erros em todos os procedimentos

**SPEC-RE-BHA-FUNC-039:** O sistema DEVE ser extensível para:
- Adição de novos filtros sem quebrar a hierarquia existente
- Suporte a diferentes formatos de relatório através de parâmetros
- Adaptação a mudanças nas estruturas de tabelas do banco

---

# **13 Relatório Inconsistências no Cartão de Ponto**

## **13.0 Estrutura Geral do Formulário**

**SPEC-RE-ICP-UI-001:** O sistema DEVE apresentar um formulário intitulado "Relatório Inconsistências no Cartão de Ponto" com as seguintes características visuais:
- Bordas fixas (não redimensionáveis)
- Dimensões de 7332 x 5148 twips (conforme formulário anexado)
- Fonte padrão MS Sans Serif, tamanho 9.6
- Ícone personalizado específico do formulário
- Exibição como janela filha do MDI (MDIChild = True)
- Não exibir na barra de tarefas do sistema (ShowInTaskbar = False)
- Captura de eventos de teclado em nível de formulário (KeyPreview = True)
- Controles travados para evitar redimensionamento (LockControls = True)

**SPEC-RE-ICP-UI-002:** A tela DEVE possuir a seguinte estrutura de componentes:
- Painel de filtros (Frame1) na parte superior contendo:
   - Controle de seleção de Rede (adbRede)
   - Controle de seleção de Empresa (dpdEmpresa) com suporte a múltipla seleção
   - Controle de seleção de Plano de Centro de Custo (dpdPlano_centro_custo)
   - Controle de seleção de Centro de Custo (dpdCentro_custo) com suporte a múltipla seleção
   - Controle de seleção de Funcionário (mltFuncionario) com suporte a múltipla seleção e opção "A partir de"
- Painel de competência (Frame2) com seletor de mês/ano (dtpCompetencia)
- Painel de ordem (Frame3) com opções de ordenação alfabética ou numérica
- Barra de botões de ação (mxPainel4) na parte inferior
- Barra de progresso (ProgressBar1) oculta na base da janela

**SPEC-RE-ICP-UI-003:** Todos os botões DEVEM possuir:
- Tooltips descritivos das ações (Confirmar, Cancelar, Sair, Atualizar)
- Ícones gráficos em vez de texto
- Comportamento de navegação por teclado consistente
- Desabilitação temporária do KeyPreview do formulário quando em foco
- Restauração do KeyPreview ao perder o foco

## **13.1 Funcionalidades do Módulo**

### **13.1.1 – Sistema de Filtros Hierárquicos**

**SPEC-RE-ICP-FUNC-001:** O sistema DEVE implementar um sistema de filtros hierárquicos com as seguintes dependências:
1. Seleção de Rede → Carrega Empresas disponíveis para aquela rede
2. Seleção de Empresa → Não afeta diretamente, mas é usada em conjunto com rede para filtros
3. Seleção de Plano de Centro de Custo → Carrega Centros de Custo analíticos associados ao plano
4. Seleção de Centro de Custo → Filtra funcionários associados ao centro de custo

**SPEC-RE-ICP-FUNC-002:** O filtro de Rede DEVE:
- Ser carregado automaticamente com a rede padrão do usuário (clsUsuario.Id_Rede_Empresa_Padrao)
- Atualizar os filtros de Empresa e Plano de Centro de Custo quando alterado
- Chamar o procedimento adbRede_LostFocus para atualizar a cadeia de filtros

**SPEC-RE-ICP-FUNC-003:** O filtro de Empresa DEVE:
- Ser um controle drop-down com suporte a múltipla seleção (Multi = True)
- Ter grid de seleção com colunas Código e Descrição
- Filtrar empresas por rede selecionada

**SPEC-RE-ICP-FUNC-004:** O controle de Plano de Centro de Custo DEVE:
- Ser carregado com base na rede selecionada
- Ter como valor padrão o plano vigente para a rede (Rotinas_Gestao_pessoas.Plano_CCusto_Vigente)
- Ao perder o foco, carregar os centros de custo analíticos associados ao plano

**SPEC-RE-ICP-FUNC-005:** O controle de Centro de Custo DEVE:
- Ser carregado com base no plano de centro de custo selecionado
- Suportar múltipla seleção (Multi = True) e consulta (Consultar = True)
- Aplicar máscara de formatação conforme definição no plano (se não for código reduzido)
- Filtrar funcionários quando alterado (via dpdCentro_custo_LostFocus)

**SPEC-RE-ICP-FUNC-006:** O controle de Funcionário DEVE:
- Ser um controle de múltipla seleção (ctlMult) com grid contendo ID Func., ID_Pessoa, Matrícula e Nome
- Ter opção "A partir de" (chkApartir) que, quando marcada, filtra funcionários a partir do funcionário selecionado na ordem escolhida (alfabética ou numérica)
- Ser atualizado automaticamente quando os filtros de rede, empresa ou centro de custo são alterados

### **13.1.2 – Configuração de Parâmetros do Relatório**

**SPEC-RE-ICP-FUNC-007:** O sistema DEVE permitir a configuração dos seguintes parâmetros de relatório:
1. **Competência:** Seleção de mês/ano via controle DTPicker com formato MM/yyyy
2. **Ordem de impressão:** Opções alfabética (por nome) ou numérica (por matrícula)
3. **A partir de:** Checkbox que, quando ativado, permite iniciar a impressão a partir de um funcionário específico, de acordo com a ordem selecionada.

**SPEC-RE-ICP-FUNC-008:** A competência DEVE:
- Inicializar com a data de processamento da folha (folParametros_Folha.DataProcessamento)
- Utilizar controle DTPicker com formato customizado "MM/yyyy"
- Ser obrigatória para geração do relatório

**SPEC-RE-ICP-FUNC-009:** A opção "A partir de" DEVE:
- Habilitar a seleção de um funcionário de referência no controle mltFuncionario
- Quando ativada, o relatório deve incluir apenas funcionários a partir daquele funcionário, na ordem selecionada (alfabética ou numérica)
- O funcionário de referência deve ser obrigatório quando a opção estiver marcada

### **13.1.3 – Geração de Relatórios de Inconsistências**

**SPEC-RE-ICP-FUNC-010:** O sistema DEVE gerar um relatório de inconsistências no cartão de ponto com base nos filtros selecionados, incluindo:
1. Funcionários com faltas não justificadas
2. Funcionários com atrasos ou saídas antecipadas
3. Funcionários com horas extras não autorizadas
4. Funcionários com sobreposição de turnos
5. Qualquer outra inconsistência definida nas regras de negócio

**SPEC-RE-ICP-FUNC-011:** A geração do relatório DEVE:
- Validar obrigatoriedade de Rede, Empresa e Competência antes da execução
- Exibir mensagens de alerta específicas para cada validação
- Criar tabelas temporárias para otimização de consultas (##TBtemp_*)
- Limpar tabelas temporárias após conclusão através de Excluir_TBTemp
- Utilizar barra de progresso durante processamento (ProgressBar1)

**SPEC-RE-ICP-FUNC-012:** O relatório DEVE ser gerado em formato de impressora matricial (ou arquivo texto) utilizando a classe clsImpressao, com as seguintes características:
- Configurar a impressora com 60 linhas por página
- Imprimir dois cartões por página (lado a lado) para otimização de papel
- Incluir quebra de página a cada dois funcionários
- Formatar os dados com alinhamento e preenchimento adequados (função Inserir_Caracter)

### **13.1.4 – Cálculos e Processamentos**

**SPEC-RE-ICP-FUNC-013:** O sistema DEVE executar os seguintes cálculos para identificar inconsistências:
- Comparar horários registrados com a jornada contratual
- Identificar faltas não abonadas (comparando presenças com dias úteis)
- Calcular atrasos e saídas antecipadas com base na tolerância configurada
- Verificar sobreposição de turnos em dias com múltiplas marcações

**SPEC-RE-ICP-FUNC-014:** Os cálculos DEVE utilizar:
- Tabelas de cartão de ponto (TBcartao_ponto, TBcartao_ponto_movimento)
- Tabelas de motivos (TBmotivo_cartao_ponto) para identificar abonos
- Tabelas de horários (TBhorario) para obter a jornada contratual
- Tabelas de escala (TBescala, TBescala_horario) para obter os dias de trabalho

**SPEC-RE-ICP-FUNC-015:** O processamento DEVE:
- Considerar apenas funcionários ativos (não demitidos até a competência)
- Excluir funcionários com categoria que não calcula folha (DFcalcula_folha = 0)
- Incluir apenas funcionários marcados para impressão de cartão de ponto (DFimprimir_cartao_ponto = 1)
- Ordenar os resultados conforme seleção do usuário (alfabética ou numérica)

### **13.1.5 – Controles de Ação**

**SPEC-RE-ICP-FUNC-016:** O sistema DEVE disponibilizar os seguintes controles de ação:
1. **Confirmar (Ícone):** Valida filtros, processa dados e gera relatório
2. **Cancelar (Ícone):** Limpa todos os filtros e restaura valores padrão
3. **Atualizar (Ícone):** Recarrega dados com base na rede padrão e atualiza filtros
4. **Sair (Ícone):** Fecha o formulário

**SPEC-RE-ICP-FUNC-017:** O botão "Cancelar" DEVE:
- Limpar todos os controles de filtro (Rede, Empresa, PlanoCCusto, CCusto, Funcionário)
- Desmarcar checkbox "A partir de"
- Definir ordenação alfabética como padrão
- Chamar cmdAtualizar_Click para recarregar dados iniciais

**SPEC-RE-ICP-FUNC-018:** O botão "Atualizar" DEVE:
- Definir a competência com base na data de processamento da folha
- Resetar o controle de rede (idRedeControle = 0) e chamar adbRede_LostFocus
- Atualizar a lista de funcionários (Atualizar_Funcionarios)

**SPEC-RE-ICP-FUNC-019:** O botão "Confirmar" DEVE:
- Validar todos os campos obrigatórios
- Alterar a interface para modo de espera (interfaceEmEspera)
- Criar tabelas temporárias e executar consultas complexas
- Processar os dados e enviar para impressão
- Retornar a interface para modo normal (interfaceNormal) ao final

### **13.1.6 – Tratamento de Erros e Validações**

**SPEC-RE-ICP-FUNC-020:** O sistema DEVE validar:
- Rede é obrigatória (adbRede.id não pode ser vazio)
- Empresa é obrigatória (dpdEmpresa.id não pode ser vazio)
- Competência é obrigatória (dtpCompetencia.Value não pode ser nulo)
- Se "A partir de" estiver marcado, um funcionário deve ser selecionado

**SPEC-RE-ICP-FUNC-021:** O tratamento de erros DEVE:
- Utilizar estrutura On Error GoTo em todos os procedimentos públicos
- Registrar erros via clsSeguranca.Erro com nome do procedimento
- Manter Debug.Assert False para interrupção em ambiente de desenvolvimento
- Incluir mensagens de erro descritivas com timestamp
- Garantir que a interface volte ao normal mesmo em caso de erro

### **13.1.7 – Integração e Segurança**

**SPEC-RE-ICP-FUNC-022:** O sistema DEVE integrar-se com:
- Módulo de segurança (clsSeguranca) para controle de acesso e tratamento de erros
- Estrutura de usuário (clsUsuario) para filtros padrão
- Parâmetros da folha (folParametros_Folha) para data de processamento
- Rotinas de gestão de pessoas (Rotinas_Gestao_pessoas) para obter plano de centro de custo vigente

**SPEC-RE-ICP-FUNC-023:** A segurança DEVE:
- Verificar permissões através de clsSeguranca (instância pública)
- Utilizar ID do formulário (2331) para controle de acesso na tabela TBformulario
- Filtrar empresas disponíveis com base nas permissões do usuário (vwEmpresa_Gestao_Pessoas)

### **13.1.8 – Otimização e Performance**

**SPEC-RE-ICP-FUNC-024:** O sistema DEVE otimizar consultas através de:
- Criação de tabelas temporárias para processamento intermediário
- Uso de hints de tabela (WITH (NOLOCK)) para evitar bloqueios
- Agrupamento de operações em transações SQL implícitas
- Indexação apropriada nas tabelas de origem

**SPEC-RE-ICP-FUNC-025:** As tabelas temporárias DEVE:
- Utilizar prefixo "##TBtemp_" para identificação (escopo global)
- Ser criadas via procedimento Criar_TB
- Ser excluídas via Excluir_TBTemp após uso
- Conter apenas dados necessários para o relatório

### **13.1.9 – Personalização por Configuração**

**SPEC-RE-ICP-FUNC-026:** O sistema DEVE adaptar-se por configuração através de:
- Parâmetros da folha (folParametros_Folha) para definir data de competência padrão
- Configuração de rede para definir plano de centro de custo vigente
- Categorias de funcionário que não calculam folha (códigos 11 e 13)

### **13.1.10 – Navegação e Usabilidade**

**SPEC-RE-ICP-FUNC-027:** O sistema DEVE suportar:
- Navegação por teclado entre controles (TabIndex definido de 0 a 12)
- Tecla Enter para avançar entre campos (KeyAscii = 13 tratado no formulário)
- Teclas de atalho padrão do sistema via Funcoes_Gerais.Verifica_Tecla
- Preview de teclas (KeyPreview = True no formulário)

**SPEC-RE-ICP-FUNC-028:** A experiência do usuário DEVE incluir:
- Foco automático no campo adequado após operações (ex: Empresa após cancelar)
- Atualização automática de filtros dependentes ao alterar controles pai
- Mensagens de validação claras e objetivas
- Barra de progresso durante processamentos longos

### **13.1.11 – Relatório Gerado**

**SPEC-RE-ICP-FUNC-029:** O relatório gerado DEVE conter as seguintes informações para cada inconsistência:
- Código da rede e nome fantasia
- Código da empresa e razão social
- Centro de custo (código e descrição)
- Matrícula e nome do funcionário
- Data da inconsistência
- Tipo de inconsistência (falta, atraso, hora extra não autorizada, etc.)
- Horários envolvidos (entrada, saída, turnos)
- Valor da inconsistência (em horas, dias, etc.)

**SPEC-RE-ICP-FUNC-030:** O relatório DEVE ser formatado adequadamente:
- Dois registros por página (lado a lado) para economia de papel
- Cabeçalho com dados da empresa e período
- Detalhe com dados do funcionário e inconsistências
- Rodapé com totais e observações

### **13.1.12 – Inicialização e Configuração**

**SPEC-RE-ICP-FUNC-031:** O formulário DEVE durante a inicialização:
- Chamar cmdCancelar_Click para configurar estado inicial
- Carregar a rede padrão do usuário
- Configurar competência com base na data de processamento da folha
- Atualizar todos os filtros dependentes

### **13.1.13 – Manutenção e Extensibilidade**

**SPEC-RE-ICP-FUNC-032:** O código DEVE ser estruturado para facilitar manutenção:
- Comentários de cabeçalho com informações do sistema/área/módulo
- Separação clara de responsabilidades entre procedimentos
- Uso de constantes e funções auxiliares (SeNull, Grava_Data, FormatoAnoMes)
- Tratamento consistente de erros em todos os procedimentos

**SPEC-RE-ICP-FUNC-033:** O sistema DEVE ser extensível para:
- Adição de novos tipos de inconsistências sem reestruturação completa
- Suporte a diferentes formatos de saída (impressora, arquivo, tela)
- Adaptação a mudanças nas estruturas de tabelas do banco

---

# **14 Relatório Espelho do Cartão de Ponto**

# **14.0 Estrutura Geral do Formulário**

**SPEC-RE-ICP-UI-001:** O sistema DEVE apresentar o formulário "frmRelatorio_Cartao_Ponto" com título "Relatório Cartão de Ponto", exibido como janela filha do MDI, sem botão de maximização e sem aparecer na barra de tarefas do sistema operacional.

**SPEC-RE-ICP-UI-002:** A tela DEVE possuir uma barra de progresso (ProgressBar) alinhada na parte inferior, inicialmente invisível, que será exibida apenas durante o processamento do relatório.

**SPEC-RE-ICP-UI-003:** Todos os botões DEVEM conter dicas de ferramenta (ToolTipText) descrevendo sua função: "Confirmar", "Cancelar", "Atualizar" e "Sair". Cada botão DEVE possuir um ícone gráfico distintivo.

# **14.1 Funcionalidades do Módulo**

---

## **14.1.1 Relatório Espelho do Cartão de Ponto**

**SPEC-RE-ICP-FUNC-001:** O sistema DEVE permitir a geração do relatório de cartão de ponto com base em critérios de filtro configuráveis, processando os dados e enviando a saída diretamente para a impressora padrão do sistema.

**SPEC-RE-ICP-FUNC-002:** O sistema DEVE posicionar a janela do formulário nas coordenadas iniciais (Left: 13800, Top: 3636) ao ser carregada.

**SPEC-RE-ICP-FUNC-003:** O sistema DEVE tratar a tecla ENTER para navegação entre os controles, convertendo seu pressionamento para a tecla TAB.

**SPEC-RE-ICP-FUNC-004:** O sistema DEVE permitir a navegação por teclado utilizando as combinações padrão definidas no módulo "Funcoes_Gerais.Verifica_Tecla".

### **14.1.2 – Configuração de Filtros para Apuração**

**SPEC-RE-ICP-FILT-001:** O sistema DEVE prover um controle "Rede" (ctlData_Combo) vinculado à tabela "TB_rede", utilizando "DFid_rede" como campo chave e "DFnome_fantasia" como descrição, com alinhamento centralizado.

**SPEC-RE-ICP-FILT-002:** Ao perder o foco do controle "Rede", o sistema DEVE:
   1. Atualizar o controle "Empresa" filtrando os registros onde "DFid_rede" seja igual ao ID selecionado.
   2. Atualizar o controle "Plano Centro de Custo" filtrando os registros onde "DFid_rede" seja igual ao ID selecionado.
   3. Definir automaticamente o plano de centro de custo vigente para a rede selecionada.
   4. Carregar os parâmetros da folha de pagamento para a rede selecionada.
   5. Definir automaticamente a competência no controle dtpCompetencia com base na data de processamento dos parâmetros carregados (primeiro dia do mês).

**SPEC-RE-ICP-FILT-003:** O sistema DEVE prover um controle "Empresa" (ctlDropDown) vinculado à tabela "TB_empresa", permitindo seleção múltipla, com campos "DFcod_empresa" (ID) e "DFnome_fantasia" (descrição), exibindo grade com colunas "Código" e "Descrição".

**SPEC-RE-ICP-FILT-004:** O sistema DEVE prover um controle "Plano Centro de Custo" (ctlDropDown) vinculado à tabela "TBPlano_centro_custo", utilizando "DFcod_plano_centro_custo" como campo chave.

**SPEC-RE-ICP-FILT-005:** Ao perder o foco do controle "Plano Centro de Custo", o sistema DEVE:
   1. Atualizar o controle "Centro de Custo" filtrando os registros onde "TBplano_centro_custo.DFcod_plano_centro_custo" seja igual ao ID selecionado e onde "TBcentro_custo.DFanalitico = 1".
   2. Aplicar a máscara definida no campo "DFmascara" do plano selecionado ao formato do controle "Centro de Custo", exceto se o campo "DFcodigo_reduzido" for verdadeiro.

**SPEC-RE-ICP-FILT-006:** O sistema DEVE prover um controle "Centro de Custo" (ctlDropDown) vinculado à tabela "TBcentro_custo", permitindo seleção múltipla, exibindo grade com colunas "Código" e "Descrição", com pré-seleção habilitada.

**SPEC-RE-ICP-FILT-007:** O sistema DEVE prover um controle "Funcionário" (ctlMult) vinculado à tabela "TBfuncionario", permitindo seleção múltipla, com campos chave "DFid_funcionario", descrição "DFnome" e ID "DFmatricula_funcionario", exibindo grade com colunas "ID Func., ID_Pessoa, Mátricula, Nome".

**SPEC-RE-ICP-FILT-008:** O sistema DEVE prover um seletor de data "Competência" (DTPicker) formatado como "MM/aaaa", pré-configurado com a data atual do sistema.

**SPEC-RE-ICP-FILT-009:** O sistema DEVE prover opções de ordenação para o relatório: "Alfabética" (padrão) e "Numérica".

**SPEC-RE-ICP-FILT-010:** O sistema DEVE prover uma opção "Á partir de:" (CheckBox) que, quando marcada, obriga a seleção de um funcionário/matrícula como referência para o início da listagem no relatório, conforme o tipo de ordenação escolhido.

**SPEC-RE-ICP-FILT-011:** Os controles de filtro "Empresa", "Centro de Custo" e "Funcionário" DEVEM ser atualizados automaticamente sempre que houver alteração nos controles "Rede", "Empresa" ou "Centro de Custo", executando uma consulta que inclua apenas funcionários ativos (não demitidos antes da competência selecionada) e da categoria de cálculo de folha.

**SPEC-RE-ICP-FUNC-005:** O sistema DEVE validar os seguintes critérios obrigatórios ao acionar o botão "Confirmar":
   1. Rede deve estar selecionada.
   2. Empresa deve estar selecionada.
   3. Competência deve estar informada.
   4. Se a opção "Á partir de:" estiver marcada, um Funcionário deve estar selecionado.

**SPEC-RE-ICP-FUNC-006:** Ao acionar o botão "Confirmar", o sistema DEVE:
   1. Alterar a interface para modo de espera.
   2. Exibir mensagem informativa sobre o tempo de processamento se nenhum funcionário específico foi selecionado.
   3. Criar tabelas temporárias no banco de dados para processamento.
   4. Executar consulta SQL complexa que consolida dados de funcionários, empresas, horários, cargos, endereços e escalas, aplicando todos os filtros selecionados.
   5. Verificar se existem registros resultantes. Caso negativo, exibir mensagem e abortar.
   6. Reorganizar os dados para impressão em formato de duas colunas por página.
   7. Inicializar a impressora através da classe clsImpressao.
   8. Formatar e enviar os dados para a impressora, incluindo informações do mês/ano, empresa, CNPJ, endereço, nome do funcionário, CTPS, matrícula, função, jornada e intervalo.
   9. Inserir quebras de página e linhas em branco para formatar o cartão de ponto.
   10. Encerrar a impressão e exibir mensagem de conclusão.

**SPEC-RE-ICP-FUNC-007:** Ao acionar o botão "Atualizar", o sistema DEVE:
   1. Atualizar a competência com base na data de processamento dos parâmetros da folha.
   2. Resetar o controle de rede e disparar seu evento LostFocus para recarregar todos os controles dependentes.
   3. Atualizar a lista de funcionários.

**SPEC-RE-ICP-FUNC-008:** Ao acionar o botão "Cancelar", o sistema DEVE:
   1. Limpar todos os controles de filtro.
   2. Definir a rede com base no padrão do usuário (clsUsuario.Id_Rede_Empresa_Padrao).
   3. Desmarcar a opção "Á partir de:".
   4. Definir a ordenação padrão como "Alfabética".
   5. Executar a função de atualização.

**SPEC-RE-ICP-FUNC-009:** Ao acionar o botão "Sair", o sistema DEVE fechar o formulário.

**SPEC-RE-ICP-FUNC-010:** O sistema DEVE tratar erros durante o processamento do relatório, exibindo mensagens apropriadas e retornando a interface ao estado normal.

---

# **15 Relatório Funcionários por Empresa**

# **15.0 Estrutura Geral do Formulário**

**SPEC-RE-FPE-UI-001:** O sistema DEVE apresentar o formulário "frmRelatorio_Funcionario_por_Empresa" com título "Funcionário por Empresa", exibido como janela filha do MDI, sem botão de maximização e sem aparecer na barra de tarefas do sistema operacional.

**SPEC-RE-FPE-UI-002:** A tela DEVE possuir uma barra de progresso (ProgressBar) alinhada na parte inferior, inicialmente invisível, que será exibida e atualizada durante o processamento do relatório.

**SPEC-RE-FPE-UI-003:** Todos os botões DEVEM conter dicas de ferramenta (ToolTipText) descrevendo sua função: "Confirmar", "Cancelar", "Atualizar" e "Sair". Cada botão DEVE possuir um ícone gráfico distintivo.

# **15.1 Funcionalidades do Módulo**

---

## **15.1.1 Relatório Funcionários por Empresa**

**SPEC-RE-FPE-FUNC-001:** O sistema DEVE permitir a geração de relatórios listando funcionários agrupados por empresa, com base em critérios de filtro configuráveis, podendo ser exibido no formato analítico (lista detalhada) ou sintético (contagem por empresa).

**SPEC-RE-FPE-FUNC-002:** O sistema DEVE posicionar a janela do formulário nas coordenadas iniciais (Left: 9885, Top: 4395) ao ser carregada.

**SPEC-RE-FPE-FUNC-003:** O sistema DEVE tratar a tecla ENTER para navegação entre os controles, convertendo seu pressionamento para a tecla TAB.

**SPEC-RE-FPE-FUNC-004:** O sistema DEVE permitir a navegação por teclado utilizando as combinações padrão definidas no módulo "Funcoes_Gerais.Verifica_Tecla".

**SPEC-RE-FPE-FUNC-005:** O sistema DEVE alterar dinamicamente os rótulos das opções de ordenação com base no tipo de relatório selecionado:
   - Para relatório **Analítico**: "Nome" e "Matrícula".
   - Para relatório **Sintético**: "Nome Fantasia" e "Código".

**SPEC-RE-FPE-FUNC-006:** Ao selecionar o relatório no formato **Sintético**, o sistema DEVE desmarcar e desabilitar automaticamente as opções de agrupamento "Centro de Custo" e "Cargo".

### **15.1.2 – Configuração de Filtros para Apuração**

**SPEC-RE-FPE-FILT-001:** O sistema DEVE prover um controle "Rede" (ctlData_Combo) vinculado à tabela "TB_rede", utilizando "DFid_rede" como campo chave e "DFrazao_social" como descrição, com alinhamento centralizado.

**SPEC-RE-FPE-FILT-002:** Ao perder o foco do controle "Rede", o sistema DEVE:
   1. Atualizar o controle "Empresa" filtrando os registros onde "DFid_rede" seja igual ao ID selecionado.
   2. Atualizar o controle "Plano Centro de Custo" filtrando os registros onde "DFid_rede" seja igual ao ID selecionado.
   3. Definir automaticamente o plano de centro de custo vigente para a rede selecionada.
   4. Limpar a seleção do controle "Centro de Custo".

**SPEC-RE-FPE-FILT-003:** O sistema DEVE prover um controle "Empresa" (ctlDropDown) vinculado à view "vwEmpresa_Gestao_Pessoas", permitindo seleção múltipla, com grade de seleção contendo colunas "Código" e "Descrição", e com pré-seleção habilitada.

**SPEC-RE-FPE-FILT-004:** O sistema DEVE prover um controle "Plano Centro de Custo" (ctlDropDown) vinculado à tabela "TBplano_centro_custo", utilizando "DFcod_plano_centro_custo" como campo chave.

**SPEC-RE-FPE-FILT-005:** Ao perder o foco do controle "Plano Centro de Custo", o sistema DEVE:
   1. Atualizar o controle "Centro de Custo" filtrando os registros onde "TBplano_centro_custo.DFcod_plano_centro_custo" seja igual ao ID selecionado e onde "TBcentro_custo.DFanalitico = 1".
   2. Aplicar a máscara definida no campo "DFmascara" do plano selecionado ao formato do controle "Centro de Custo", exceto se o campo "DFcodigo_reduzido" for verdadeiro.

**SPEC-RE-FPE-FILT-006:** O sistema DEVE prover um controle "Centro de Custo" (ctlDropDown) vinculado à tabela "TBcentro_custo", permitindo seleção múltipla, exibindo grade com colunas "Código" e "Descrição", com pré-seleção habilitada.

**SPEC-RE-FPE-FILT-007:** O sistema DEVE prover um controle "Cargo" (ctlMult) para seleção múltipla de cargos, utilizando uma consulta SQL personalizada ("SELECT DFcod_cargo, DFdescricao FROM TBcargo WHERE DFcargo_empresa = 1") e retornando "DFcod_cargo".

**SPEC-RE-FPE-FILT-008:** O sistema DEVE prover um seletor de data "Admitidos Até" (DTPicker) formatado como "MM/aaaa", pré-configurado com a data atual do sistema.

**SPEC-RE-FPE-FILT-009:** O sistema DEVE prover uma lista suspensa "Status" (ComboBox) com as opções: "Afastados", "Ativos (Inclusive os afastados)", "Demitidos", "Somente Ativos", sendo a opção padrão "Ativos (Inclusive os afastados)".

**SPEC-RE-FPE-FILT-010:** O sistema DEVE prover uma opção "Incluir Categorias: 11 e 13" (CheckBox) que, quando desmarcada (padrão), exclui os funcionários das categorias 11 e 13 do resultado do relatório.

**SPEC-RE-FPE-FILT-011:** O sistema DEVE prover opções de visualização do relatório: "Analítico" (padrão) e "Sintético" (apenas contagem).

**SPEC-RE-FPE-FILT-012:** O sistema DEVE prover opções de ordenação para o relatório: "Nome/Nome Fantasia" (padrão) e "Matrícula/Código".

**SPEC-RE-FPE-FILT-013:** O sistema DEVE prover opções de agrupamento "Centro de Custo" e "Cargo" (CheckBoxes), que estarão habilitadas apenas quando o relatório for do tipo **Analítico**.

**SPEC-RE-FPE-FILT-014:** O sistema DEVE prover uma opção "Nível Centro de Custo" (CheckBox) que, quando marcada:
   1. Habilita um controle de seleção de "Nível" (ctlData_Combo).
   2. Cria uma tabela temporária no banco de dados com os níveis hierárquicos baseados na máscara do plano de centro de custo selecionado.
   3. Popula o controle de nível com os níveis gerados.
   4. Esta opção só estará habilitada se "Centro de Custo" estiver marcado.

**SPEC-RE-FPE-VAL-001:** Ao acionar o botão "Confirmar", o sistema DEVE validar os seguintes critérios obrigatórios:
   1. Rede deve estar selecionada.
   2. Se a opção "Nível Centro de Custo" estiver marcada, um Nível deve estar selecionado.

**SPEC-RE-FPE-PROC-001:** Ao acionar o botão "Confirmar" com validações aprovadas, o sistema DEVE:
   1. Alterar a interface para modo de processamento (expandida) e exibir/atualizar a barra de progresso.
   2. Calcular a data final do período como o último dia do mês selecionado em "Admitidos Até".
   3. Obter dinamicamente a tabela de funcionários válidos para o período, rede e empresa selecionados, através da função `Rotinas_Gestao_pessoas.getTabelaFuncionarioPeriodo`.
   4. Construir e executar uma consulta SQL complexa que:
      - Seleciona dados de pessoa, funcionário, empresa, cargo, centro de custo, plano centro de custo, demissão, afastamento e horário.
      - Aplica todos os filtros configurados (rede, empresa, centro de custo, cargo, status, período, categorias).
      - Inclui um campo "DFnivel" calculado (prefixo do código do centro de custo) se a agrupação por nível estiver ativa.
      - Ordena conforme a opção escolhida (Nome/Matrícula) e agrupamentos.
   5. Armazenar o resultado em uma tabela temporária específica para impressão.
   6. Configurar os parâmetros do relatório Crystal Reports (fórmulas) com os valores dos filtros aplicados.
   7. Verificar se existem registros resultantes. Caso negativo, exibir mensagem e abortar.
   8. Para relatório **Analítico**:
      - Definir fórmulas de agrupamento conforme seleção (Centro de Custo, Cargo, Nível).
      - Executar consulta de ordenação final considerando os agrupamentos selecionados.
      - Chamar o mecanismo de impressão com o arquivo de relatório específico (`rptRelatorio_Funcionario_Empresa.rpt` ou `rptRelatorio_Funcionario_Empresa_cc.rpt` se agrupar por nível).
   9. Para relatório **Sintético**:
      - Criar uma segunda tabela temporária com a contagem de funcionários agrupados por empresa (e nível, se aplicável).
      - Chamar o mecanismo de impressão com o arquivo de relatório `rptRelatorio_Sintetico_Funcionario_Empresa.rpt`.
   10. Retornar a interface ao estado normal.

**SPEC-RE-FPE-PROC-002:** Ao acionar o botão "Atualizar", o sistema DEVE:
   1. Disparar o evento de perda de foco do controle "Rede" para recarregar todos os controles dependentes.
   2. Atualizar a lista de cargos.
   3. Definir a ordenação padrão como "Nome".
   4. Definir o tipo de relatório padrão como "Analítico".
   5. Executar a função `Controla_Grupo` para sincronizar o estado da interface.

**SPEC-RE-FPE-PROC-003:** Ao acionar o botão "Cancelar", o sistema DEVE:
   1. Solicitar confirmação de cancelamento se uma consulta SQL estiver em andamento.
   2. Limpar todas as seleções dos controles de filtro.
   3. Definir a rede com base no padrão do usuário (`clsUsuario.Id_Rede_Empresa_Padrao`).
   4. Desmarcar as opções de agrupamento "Centro de Custo" e "Nível Centro de Custo".
   5. Limpar a seleção de nível e desabilitar seu controle.
   6. Limpar a seleção de cargos.
   7. Definir a ordenação padrão como "Nome".
   8. Definir o tipo de relatório padrão como "Analítico".
   9. Definir o status padrão como "Ativos (Inclusive os afastados)".
   10. Desmarcar a opção "Incluir Categorias".
   11. Executar a função de atualização completa.

**SPEC-RE-FPE-PROC-004:** Ao acionar o botão "Sair", o sistema DEVE fechar o formulário.

**SPEC-RE-FPE-PROC-005:** O sistema DEVE tratar erros durante o processamento do relatório, exibindo mensagens apropriadas, registrando o erro e retornando a interface ao estado normal.

---

# **16 Relatório Gestores do Cartão de Ponto**

# **16.0 Estrutura Geral do Formulário**

**SPEC-RE-GCP-UI-001:** O sistema DEVE apresentar o formulário "frmRelatorio_Gestor_Cartao_Ponto" com título "Relatório de Gestores do Cartão de Ponto", exibido como janela filha do MDI, sem botão de maximização e sem aparecer na barra de tarefas do sistema operacional, posicionado inicialmente nas coordenadas (Left: 4020, Top: 3756).

**SPEC-RE-GCP-UI-002:** A tela DEVE possuir uma barra de progresso (ProgressBar) alinhada na parte inferior, inicialmente invisível, que será exibida e atualizada durante o processamento do relatório.

**SPEC-RE-GCP-UI-003:** Todos os botões DEVEM conter dicas de ferramenta (ToolTipText) descrevendo sua função: "Confirmar", "Cancelar", "Atualizar" e "Sair". Cada botão DEVE possuir um ícone gráfico distintivo.

# **16.1 Funcionalidades do Módulo**

---

## **16.1.1 Relatório Gestores do Cartão de Ponto**

**SPEC-RE-GCP-FUNC-001:** O sistema DEVE permitir a geração de relatório que lista gestores responsáveis pelo cartão de ponto e seus respectivos funcionários subordinados, com base em critérios de filtro configuráveis.

**SPEC-RE-GCP-FUNC-002:** O sistema DEVE tratar a tecla ENTER para navegação entre os controles, convertendo seu pressionamento para a tecla TAB.

**SPEC-RE-GCP-FUNC-003:** O sistema DEVE permitir a navegação por teclado utilizando as combinações padrão definidas no módulo "Funcoes_Gerais.Verifica_Tecla".

**SPEC-RE-GCP-FUNC-004:** O sistema DEVE utilizar a classe "clsFiltroFuncionario" para gerenciar a configuração e sincronização dos filtros hierárquicos (Rede, Empresa, Plano Centro de Custo, etc.).

**SPEC-RE-GCP-FUNC-005:** Ao carregar o formulário, o sistema DEVE:
   1. Instanciar a classe clsFiltroFuncionario.
   2. Chamar a rotina "Limpar_Captions" para o formulário atual.
   3. Configurar a consulta SQL de empresa para incluir um filtro por usuário (TBusuario_empresa) baseado no ID do usuário logado (`clsUsuario.Id_Usuario`).
   4. Executar o método "Scan" da classe de configuração para vincular os controles do formulário.
   5. Executar os comandos de cancelar e atualizar para inicializar os controles.

### **16.1.2 – Configuração de Filtros para Apuração**

**SPEC-RE-GCP-FILT-001:** O sistema DEVE prover um controle "Rede" (ctlData_Combo) vinculado à tabela "TB_rede", utilizando "DFid_rede" como campo chave e "DFnome_fantasia" como descrição, com alinhamento centralizado. Este controle NÃO deve receber foco via TAB (TabStop = False).

**SPEC-RE-GCP-FILT-002:** O sistema DEVE prover um controle "Empresa" (ctlData_Combo) vinculado dinamicamente através da classe clsFiltroFuncionario, que aplicará automaticamente filtros hierárquicos baseados na seleção da Rede.

**SPEC-RE-GCP-FILT-003:** O sistema DEVE prover um controle "Plano de Centro de Custo" (ctlData_Combo) vinculado à tabela "TBempresa", utilizando "DFcod_empresa" como campo chave e "DFnome_fantasia" como descrição, com alinhamento centralizado.

**SPEC-RE-GCP-FILT-004:** O sistema DEVE prover um controle "Centro de Custo" (ctlDropDown) que será populado dinamicamente com base nos filtros hierárquicos gerenciados pela classe clsFiltroFuncionario.

**SPEC-RE-GCP-FILT-005:** O sistema DEVE prover um controle "Gestor" (ctlData_Combo) vinculado à tabela "TBfuncionario", utilizando "DFid_funcionario" como campo chave e "DFnome" como descrição, com alinhamento centralizado.

**SPEC-RE-GCP-FILT-006:** O sistema DEVE prover um controle "Funcionário" (ctlData_Combo) vinculado à tabela "TBfuncionario", utilizando "DFid_funcionario" como campo chave, "DFmatricula_funcionario" como ID e "DFnome" como descrição, com alinhamento centralizado.

**SPEC-RE-GCP-VAL-001:** Ao acionar o botão "Confirmar", o sistema DEVE validar que o campo "Rede" está preenchido. Caso contrário, deve exibir mensagem informativa e posicionar o foco no controle.

**SPEC-RE-GCP-PROC-001:** Ao acionar o botão "Confirmar" com validações aprovadas, o sistema DEVE:
   1. Alterar a interface para modo de processamento (expandida) e exibir/atualizar a barra de progresso.
   2. Criar uma tabela temporária específica para o relatório ("##TBtemp_relatorio_gestor").
   3. Construir e executar uma consulta SQL complexa que:
      - Relaciona gestores (TBfunc_gestor) com seus funcionários subordinados (TBfuncionario) através do campo DFid_funcionario_gestor.
      - Inclui dados de pessoa, empresa, cargo e centro de custo para ambos (gestor e funcionário).
      - Aplica todos os filtros configurados (rede, empresa, centro de custo, gestor, funcionário).
      - Utiliza a view "vwPlano_Ccusto" para obter informações de centro de custo.
   4. Armazenar o resultado na tabela temporária.
   5. Verificar se existem registros resultantes. Caso negativo, exibir mensagem informativa e abortar o processo.
   6. Retornar a interface ao estado normal.
   7. Chamar o mecanismo de impressão Crystal Reports com o arquivo "rptRelatorio_Gestor_Cartao_Ponto.rpt", ordenando os resultados por código da empresa do gestor e matrícula do gestor.

**SPEC-RE-GCP-PROC-002:** Ao acionar o botão "Atualizar", o sistema DEVE:
   1. Recarregar os dados do controle "Rede".
   2. Definir a rede padrão com base no ID configurado para o usuário (`clsUsuario.Id_Rede_Empresa_Padrao`).
   3. Atualizar todos os controles dependentes através do método `Refresh` da classe clsFiltroFuncionario.

**SPEC-RE-GCP-PROC-003:** Ao acionar o botão "Cancelar", o sistema DEVE:
   1. Limpar as seleções dos controles "Empresa", "Plano de Centro de Custo", "Centro de Custo" e "Funcionário".
   2. Definir a rede padrão com base no ID configurado para o usuário (`clsUsuario.Id_Rede_Empresa_Padrao`).
   3. Atualizar todos os controles dependentes através do método `Refresh` da classe clsFiltroFuncionario.
   4. Posicionar o foco no controle "Empresa".

**SPEC-RE-GCP-PROC-004:** Ao acionar o botão "Sair", o sistema DEVE fechar o formulário.

**SPEC-RE-GCP-PROC-005:** O sistema DEVE tratar erros durante o processamento do relatório, exibindo mensagens apropriadas, registrando o erro através da classe clsSeguranca e retornando a interface ao estado normal.

---

## **17 Relatório Detalhado de Ponto**

---

### **17.0 Estrutura Geral do Formulário**

**SPEC-RE-HBH-UI-001:** O sistema DEVE apresentar um formulário intitulado “Registro de Ponto Detalhado”, com borda fixa (Fixed Single), sem botão de maximizar e sem aparecer na barra de tarefas do sistema, sendo aberto como um formulário filho dentro do ambiente MDI.

**SPEC-RE-HBH-UI-002:** A tela DEVE possuir uma área de filtros organizada em um frame (fraFiltros) contendo os seguintes controles: Período (com seletores de data inicial e final), Rede, Empresa e Funcionário(s), sendo que o campo Funcionário permite múltipla seleção.

**SPEC-RE-HBH-UI-003:** Todos os botões de ação (Confirmar, Cancelar, Atualizar e Sair) DEVEM estar dispostos em um painel inferior (mxPainel4) com ícones ilustrativos e dicas de ferramenta (tooltips) que identifiquem claramente sua função.

---

### **17.1 Funcionalidades do Módulo**

---

#### **17.1.1 Relatório Detalhado de Ponto**

**SPEC-RE-HBH-FUNC-001:** O sistema DEVE permitir a geração de um relatório detalhado de ponto com base nos filtros selecionados, apresentando informações como: empresa, funcionário, matrícula, cargo, data, dia da semana, turno programado, horários de entrada/saída (primeiro e segundo turno), intervalo, horas extras, horas faltantes, horas normais, horas totais, horas extras no banco, saldo acumulado e observações.

**SPEC-RE-HBH-FUNC-002:** O sistema DEVE validar, antes da geração do relatório, que:
- A empresa foi informada;
- A data inicial não é maior que a data final;
- O período selecionado está contido no mesmo mês.

**SPEC-RE-HBH-FUNC-003:** O sistema DEVE exibir uma barra de progresso (ProgressBar1) durante a execução das consultas e cálculos do relatório, com três etapas principais: preparação dos dados, cálculo de saldos e finalização.

**SPEC-RE-HBH-FUNC-004:** O sistema DEVE utilizar a função `FOL_FORMATAR_DECIMAL_HORA` para converter valores decimais de horas no formato “HH:MM”.

**SPEC-RE-HBH-FUNC-005:** O sistema DEVE exibir o relatório através do Crystal Reports, utilizando o arquivo “rptRelatorio_Registro_Ponto_Detalhado.rpt” e passando como parâmetro o período selecionado.

**SPEC-RE-HBH-FUNC-006:** O sistema DEVE permitir a saída do formulário através do botão “Sair” ou da tecla ESC.

---

#### **17.1.2 – Configuração de Filtros para Apuração**

**SPEC-RE-HBH-FUNC-007:** O sistema DEVE carregar, ao abrir o formulário, a lista de redes disponíveis, definindo como padrão a rede associada ao usuário logado.

**SPEC-RE-HBH-FUNC-008:** O sistema DEVE atualizar a lista de empresas sempre que uma rede for selecionada, filtrando apenas as empresas vinculadas à rede escolhida.

**SPEC-RE-HBH-FUNC-009:** O sistema DEVE atualizar a lista de funcionários sempre que uma empresa for selecionada, exibindo apenas funcionários ativos (não demitidos) na data final do período.

**SPEC-RE-HBH-FUNC-010:** O sistema DEVE permitir a seleção múltipla de funcionários através do controle `ctlMult`, exibindo em uma grade as colunas: ID Funcionário, Matrícula e Nome.

**SPEC-RE-HBH-FUNC-011:** O sistema DEVE permitir a atualização da lista de redes através do botão “Atualizar”.

**SPEC-RE-HBH-FUNC-012:** O sistema DEVE permitir a limpeza de todos os campos de filtro através do botão “Cancelar”, restaurando as datas para a data atual e redefinindo a rede para a padrão do usuário.

**SPEC-RE-HBH-FUNC-013:** O sistema DEVE permitir a navegação entre os campos utilizando a tecla TAB, na seguinte ordem: Data Inicial → Data Final → Rede → Empresa → Funcionário → Botões (Confirmar, Cancelar, Atualizar, Sair).

**SPEC-RE-HBH-FUNC-014:** O sistema DEVE tratar a tecla ENTER para mover o foco para o próximo campo, exceto quando o foco estiver em botões de ação.

**SPEC-RE-HBH-FUNC-015:** O sistema DEVE impedir a geração do relatório caso não haja empresa selecionada ou caso o período seja inválido, exibindo mensagens de alerta apropriadas.

---

# **18 Relatório Histórico de Banco de Horas**

# **18.0 Estrutura Geral do Formulário**

**SPEC-RE-HBH-UI-001:** O sistema DEVE apresentar o formulário "frmRelatorio_Historico_Banco_Horas" com título "Relatório Histórico de Banco de Horas", exibido como janela filha do MDI, sem botão de maximização e sem aparecer na barra de tarefas do sistema operacional, posicionado inicialmente nas coordenadas (Left: 4845, Top: 3015).

**SPEC-RE-HBH-UI-002:** A tela DEVE possuir uma barra de progresso (ProgressBar) alinhada na parte inferior, inicialmente invisível, que será exibida e atualizada durante o processamento do relatório.

**SPEC-RE-HBH-UI-003:** Todos os botões DEVEM conter dicas de ferramenta (ToolTipText) descrevendo sua função: "Confirmar", "Cancelar", "Atualizar" e "Sair". Cada botão DEVE possuir um ícone gráfico distintivo.

# **18.1 Funcionalidades do Módulo**

---

## **18.1.1 Relatório Histórico de Banco de Horas**

**SPEC-RE-HBH-FUNC-001:** O sistema DEVE permitir a geração de relatório histórico de banco de horas, listando saldos, horas extras e horas faltosas dos funcionários em um período específico, com opções de agrupamento e filtros configuráveis.

**SPEC-RE-HBH-FUNC-002:** O sistema DEVE tratar a tecla ENTER para navegação entre os controles, convertendo seu pressionamento para a tecla TAB.

**SPEC-RE-HBH-FUNC-003:** O sistema DEVE permitir a navegação por teclado utilizando as combinações padrão definidas no módulo "Funcoes_Gerais.Verifica_Tecla".

**SPEC-RE-HBH-FUNC-004:** O sistema DEVE garantir que ao carregar o formulário, as variáveis de controle "lonUltima_rede_selecionada" e "lonUltimo_plano_selecionado" sejam inicializadas como vazias.

### **18.1.2 – Configuração de Filtros para Apuração**

**SPEC-RE-HBH-FILT-001:** O sistema DEVE prover um controle "Período" contendo dois seletores de data (DTPicker) formatados como "MM/aaaa", rotulados como "De" e "Até", pré-configurados com a data atual do sistema.

**SPEC-RE-HBH-FILT-002:** O sistema DEVE prover uma opção "Agrupar por Centro de Custo" (CheckBox) que permite agrupar os resultados do relatório por centro de custo.

**SPEC-RE-HBH-FILT-003:** O sistema DEVE prover uma opção "Excluir Demitidos" (CheckBox) marcada por padrão, que quando ativa, exclui funcionários demitidos do resultado do relatório.

**SPEC-RE-HBH-FILT-004:** O sistema DEVE prover um controle "Rede" (ctlData_Combo) vinculado à tabela "TB_rede", utilizando "DFid_rede" como campo chave e "DFrazao_social" como descrição, com alinhamento centralizado.

**SPEC-RE-HBH-FILT-005:** Ao perder o foco do controle "Rede", o sistema DEVE:
   1. Atualizar o controle "Empresa" filtrando os registros onde "DFid_rede" seja igual ao ID selecionado E onde o usuário logado tenha permissão (via tabela TBusuario_empresa).
   2. Atualizar o controle "Plano Centro de Custo" filtrando os registros onde "DFid_rede" seja igual ao ID selecionado.
   3. Definir automaticamente o plano de centro de custo vigente para a rede selecionada.
   4. Limpar a seleção do controle "Centro de Custo".

**SPEC-RE-HBH-FILT-006:** O sistema DEVE prover um controle "Empresa" (ctlDropDown) permitindo seleção múltipla, com grade de seleção contendo colunas "Código" e "Descrição", e com pré-seleção habilitada.

**SPEC-RE-HBH-FILT-007:** O sistema DEVE prover um controle "Plano Centro de Custo" (ctlDropDown) vinculado à tabela "TBplano_centro_custo".

**SPEC-RE-HBH-FILT-008:** Ao perder o foco do controle "Plano Centro de Custo", o sistema DEVE:
   1. Atualizar o controle "Centro de Custo" filtrando os registros onde "TBplano_centro_custo.DFcod_plano_centro_custo" seja igual ao ID selecionado e onde "TBcentro_custo.DFanalitico = 1".
   2. Aplicar a máscara definida no campo "DFmascara" do plano selecionado ao formato do controle "Centro de Custo", exceto se o campo "DFcodigo_reduzido" for verdadeiro.

**SPEC-RE-HBH-FILT-009:** O sistema DEVE prover um controle "Centro de Custo" (ctlDropDown) permitindo seleção múltipla, exibindo grade com colunas "Código" e "Descrição", com pré-seleção habilitada.

**SPEC-RE-HBH-FILT-010:** O sistema DEVE prover um controle "Funcionário" (ctlData_Combo) vinculado à tabela "TBpessoa", utilizando "DFid_pessoa" como campo chave, "DFmatricula" como ID e "DFnome" como descrição, com alinhamento centralizado.

**SPEC-RE-HBH-FILT-011:** O sistema DEVE atualizar automaticamente a lista de funcionários sempre que houver alteração nos controles "Empresa" ou "Centro de Custo", filtrando apenas funcionários não demitidos até o início do período selecionado.

**SPEC-RE-HBH-VAL-001:** Ao acionar o botão "Confirmar", o sistema DEVE validar os seguintes critérios obrigatórios:
   1. Rede deve estar selecionada.
   2. A data final do período não pode ser anterior à data inicial.

**SPEC-RE-HBH-PROC-001:** Ao acionar o botão "Confirmar" com validações aprovadas, o sistema DEVE:
   1. Alterar a interface para modo de processamento (expandida) e exibir/atualizar a barra de progresso.
   2. Ajustar as datas do período: definir o dia da data inicial como 1 e o dia da data final como o último dia do mês correspondente.
   3. Criar uma tabela temporária específica para o relatório ("##TBtemp_historico_ponto").
   4. Construir uma string de filtro (strFiltro) com base nas seleções: empresa, centro de custo, funcionário e opção de excluir demitidos.
   5. Configurar os parâmetros do relatório Crystal Reports (fórmulas) com os valores dos filtros aplicados e a opção de agrupamento.
   6. Construir e executar uma consulta SQL complexa que:
      - Seleciona dados de banco de horas, funcionário, pessoa, empresa, centro de custo, número de horas extras e saldo de banco de horas.
      - Filtra por período (campo DFano_mes), rede e critérios adicionais (strFiltro).
      - Inclui campos formatados (hora_extra, hora_faltosa, saldo) e seus equivalentes em decimal.
      - Considera apenas registros não quitados (DFquitado = 0).
   7. Armazenar o resultado na tabela temporária.
   8. Retornar a interface ao estado normal.
   9. Chamar o mecanismo de impressão Crystal Reports com o arquivo "rptRelatorio_Historico_Cartao_Ponto_empresa.rpt", ordenando os resultados por empresa, código do centro de custo, nome do funcionário e mês/ano.

**SPEC-RE-HBH-PROC-002:** Ao acionar o botão "Atualizar", o sistema DEVE disparar o evento de perda de foco do controle "Rede" para recarregar todos os controles dependentes.

**SPEC-RE-HBH-PROC-003:** Ao acionar o botão "Cancelar", o sistema DEVE:
   1. Solicitar confirmação de cancelamento se uma consulta SQL estiver em andamento.
   2. Chamar a rotina "Limpar_Campos" que:
      - Recarrega o controle "Rede" e define a rede padrão com base no ID configurado para o usuário (`clsUsuario.Id_Rede_Empresa_Padrao`).
      - Limpa as seleções dos controles "Empresa", "Centro de Custo" e "Funcionário".
      - Redefine as datas do período para a data atual.
      - Desmarca a opção "Agrupar por Centro de Custo".
      - Executa a função de atualização completa.

**SPEC-RE-HBH-PROC-004:** Ao acionar o botão "Sair", o sistema DEVE fechar o formulário.

**SPEC-RE-HBH-PROC-005:** O sistema DEVE tratar erros durante o processamento do relatório, exibindo mensagens apropriadas, registrando o erro através da classe clsSeguranca e retornando a interface ao estado normal.

**SPEC-RE-HBH-PROC-006:** A rotina "Atualizar_Funcionario" DEVE construir uma consulta SQL que lista funcionários ativos (não demitidos) até a data inicial do período, filtrados por empresa e centro de custo quando aplicável, ordenados por nome.

---

## **19 Relatório Motivo do Cartão de Ponto**

---

### **19.0 Estrutura Geral do Formulário**

**SPEC-RE-MCP-UI-001:** O sistema DEVE apresentar um formulário intitulado "Relação de Horas", com borda fixa (Fixed Single), sem botão de maximizar e sem aparecer na barra de tarefas do sistema, sendo aberto como um formulário filho dentro do ambiente MDI.

**SPEC-RE-MCP-UI-002:** A tela DEVE possuir uma área de filtros organizada em seções para seleção de: Rede, Empresa(s), Centro de Custo, Funcionário(s), Cargo, Motivo de Horário, além de opções de período (data início e data fim) e tipo de relatório (Sintético, Analítico, Indicador RH). A tela também DEVE conter checkboxes para agrupamento por Centro de Custo e Cargo, e uma opção oculta para exibir feriados pagos.

**SPEC-RE-MCP-UI-003:** Todos os botões de ação (Confirmar, Cancelar, Atualizar e Sair) DEVEM estar dispostos em um painel inferior (mxPainel4) com ícones ilustrativos e dicas de ferramenta (tooltips) que identifiquem claramente sua função.

---

### **19.1 Funcionalidades do Módulo**

---

#### **19.1.1 Relatório Motivo do Cartão de Ponto**

**SPEC-RE-MCP-FUNC-001:** O sistema DEVE permitir a geração de três tipos de relatórios com base na seleção do usuário: Sintético (agrupado por motivo), Analítico (detalhado por funcionário) e Indicador RH (com métricas gerenciais).

**SPEC-RE-MCP-FUNC-002:** O sistema DEVE utilizar a função `FOL_FORMATAR_DECIMAL_HORA` para converter valores decimais de horas no formato "HH:MM" nos relatórios Sintético e Analítico.

**SPEC-RE-MCP-FUNC-003:** O sistema DEVE utilizar a função `FOL_FORMATAR_DECIMAL_HORA_PERIODOS_MAIORES` para formatar horas em períodos maiores no relatório Indicador RH.

**SPEC-RE-MCP-FUNC-004:** O sistema DEVE exibir uma barra de progresso (ProgressBar1) durante a execução das consultas e cálculos do relatório, com três etapas principais: criação da tabela temporária, verificação de dados e geração do relatório.

**SPEC-RE-MCP-FUNC-005:** O sistema DEVE validar, antes da geração do relatório, que há dados que satisfaçam os filtros aplicados, exibindo uma mensagem informativa caso contrário.

**SPEC-RE-MCP-FUNC-006:** O sistema DEVE permitir a impressão dos relatórios através do Crystal Reports, utilizando os arquivos:
- "rptRelatorio_Relacao_Motivo_Hora_Funcionario_Sintetico.rpt" para o relatório Sintético.
- "rptRelatorio_Relacao_Motivo_Hora_Funcionario_Analitico.rpt" para o relatório Analítico.
- "rptRelatorio_Relacao_Indicador_RH.rpt", "rptRelatorio_Relacao_Indicador_RH_Ccusto.rpt" ou "rptRelatorio_Relacao_Indicador_RH_Cargo.rpt" para o relatório Indicador RH, dependendo do agrupamento selecionado.

**SPEC-RE-MCP-FUNC-007:** O sistema DEVE passar como parâmetro para o relatório o título correspondente ao tipo de relatório e agrupamento selecionado através da propriedade `Formulas` do Crystal Reports.

**SPEC-RE-MCP-FUNC-008:** O sistema DEVE permitir a saída do formulário através do botão "Sair" ou da tecla ESC.

---

#### **19.1.2 – Configuração de Filtros para Apuração**

**SPEC-RE-MCP-FUNC-009:** O sistema DEVE carregar, ao abrir o formulário, a lista de redes disponíveis, definindo como padrão a rede associada ao usuário logado (obtida através de `clsUsuario.Id_Rede_Empresa_Padrao`).

**SPEC-RE-MCP-FUNC-010:** O sistema DEVE atualizar a lista de empresas sempre que uma rede for selecionada, filtrando apenas as empresas vinculadas à rede escolhida.

**SPEC-RE-MCP-FUNC-011:** O sistema DEVE atualizar a lista de centros de custo sempre que uma rede for selecionada, filtrando apenas os centros de custo analíticos (`DFanalitico = 1`) vinculados ao plano de centro de custo da rede.

**SPEC-RE-MCP-FUNC-012:** O sistema DEVE atualizar a lista de funcionários sempre que uma empresa for selecionada, exibindo apenas funcionários ativos na empresa selecionada.

**SPEC-RE-MCP-FUNC-013:** O sistema DEVE permitir a seleção múltipla de empresas, centros de custo, funcionários, cargos e motivos de horário através dos controles `ctlMult`.

**SPEC-RE-MCP-FUNC-014:** O sistema DEVE permitir a atualização das listas de redes, motivos de horário e cargos através do botão "Atualizar".

**SPEC-RE-MCP-FUNC-015:** O sistema DEVE permitir a limpeza de todos os campos de filtro através do botão "Cancelar", restaurando as datas para o primeiro e último dia do mês atual, redefinindo a rede para a padrão do usuário e limpando as seleções múltiplas.

**SPEC-RE-MCP-FUNC-016:** O sistema DEVE garantir que os checkboxes de agrupamento por Centro de Custo e Cargo sejam mutuamente exclusivos, desabilitando um quando o outro estiver marcado.

**SPEC-RE-MCP-FUNC-017:** O sistema DEVE permitir a navegação entre os campos utilizando a tecla TAB, na seguinte ordem: Rede → Empresa → Centro de Custo → Funcionário → Cargo → Motivo → Opções de relatório → Período (Data Início, Data Fim) → Botões (Confirmar, Cancelar, Atualizar, Sair).

**SPEC-RE-MCP-FUNC-018:** O sistema DEVE tratar a tecla ENTER para mover o foco para o próximo campo, exceto quando o foco estiver em botões de ação.

**SPEC-RE-MCP-FUNC-019:** O sistema DEVE aplicar os filtros selecionados na consulta SQL que alimenta o relatório, considerando as seleções múltiplas e as datas do período.

**SPEC-RE-MCP-FUNC-020:** O sistema DEVE calcular o turnover no relatório Indicador RH com base no número de admissões e demissões no período, dividido pela média do número de funcionários no período, apresentando o resultado em porcentagem.

**SPEC-RE-MCP-FUNC-021:** O sistema DEVE calcular o absenteísmo no relatório Indicador RH como a porcentagem das horas de absenteísmo sobre as horas efetivamente trabalhadas.

**SPEC-RE-MCP-FUNC-022:** O sistema DEVE agrupar os dados no relatório Indicador RH conforme a seleção do usuário: sem agrupamento, por centro de custo ou por cargo.

---

## **20 Relatório Totalizador de Horas do Cartão de Ponto**

---

### **20.0 Estrutura Geral do Formulário**

**SPEC-RE-THCP-UI-001:** O sistema DEVE apresentar um formulário intitulado "Relatório Totalizador Horas", com borda fixa (Fixed Single), sem botão de maximizar e sem aparecer na barra de tarefas do sistema, sendo aberto como um formulário filho dentro do ambiente MDI.

**SPEC-RE-THCP-UI-002:** A tela DEVE possuir uma área de filtros organizada com campos para seleção de: Rede, Empresa, Centro de Custo, Período (MM/AAAA) e uma opção de agrupamento por Centro de Custo.

**SPEC-RE-THCP-UI-003:** Todos os botões de ação (Confirmar, Cancelar, Atualizar e Sair) DEVEM estar dispostos em um painel inferior (mxPainel4) com ícones ilustrativos e dicas de ferramenta (tooltips) que identifiquem claramente sua função.

---

### **20.1 Funcionalidades do Módulo**

---

#### **20.1.1 Relatório Totalizador de Horas do Cartão de Ponto**

**SPEC-RE-THCP-FUNC-001:** O sistema DEVE permitir a geração de um relatório totalizador de horas trabalhadas no mês, apresentando informações como: empresa, centro de custo, carga horária, total de horas trabalhadas e número de funcionários.

**SPEC-RE-THCP-FUNC-002:** O sistema DEVE validar, antes da geração do relatório, que a empresa foi informada.

**SPEC-RE-THCP-FUNC-003:** O sistema DEVE exibir uma barra de progresso (ProgressBar1) durante a execução das consultas e cálculos do relatório, com três etapas principais: criação da tabela temporária, verificação de dados e preparação do relatório.

**SPEC-RE-THCP-FUNC-004:** O sistema DEVE utilizar a função `FOL_FORMATAR_DECIMAL_HORA` para converter valores decimais de horas no formato "HH:MM".

**SPEC-RE-THCP-FUNC-005:** O sistema DEVE utilizar a função `CALC_HORAS_TRAB_DECIMAL` para calcular horas trabalhadas com base nos horários de entrada e saída.

**SPEC-RE-THCP-FUNC-006:** O sistema DEVE exibir o relatório através do Crystal Reports, utilizando o arquivo "rptRelatorio_Totalizador_Hora_Func.rpt" e passando como parâmetro o período selecionado.

**SPEC-RE-THCP-FUNC-007:** O sistema DEVE considerar dois modos de cálculo baseados no parâmetro `Parametros_CPonto.ControleDetalhado`:
- Quando habilitado (`True`), calcular horas trabalhadas diretamente das batidas de ponto.
- Quando desabilitado (`False`), calcular horas trabalhadas através dos totalizadores de motivo de cartão de ponto.

**SPEC-RE-THCP-FUNC-008:** O sistema DEVE considerar dias normais ('N') e domingos ('D') separadamente no cálculo das horas trabalhadas.

**SPEC-RE-THCP-FUNC-009:** O sistema DEVE permitir a saída do formulário através do botão "Sair" ou da tecla ESC.

---

#### **20.1.2 – Configuração de Filtros para Apuração**

**SPEC-RE-THCP-FUNC-010:** O sistema DEVE carregar, ao abrir o formulário, a lista de redes disponíveis, definindo como padrão a rede associada ao usuário logado.

**SPEC-RE-THCP-FUNC-011:** O sistema DEVE atualizar a lista de empresas sempre que uma rede for selecionada, filtrando apenas as empresas vinculadas à rede escolhida e que o usuário tem permissão de acesso (conforme `TBusuario_empresa`).

**SPEC-RE-THCP-FUNC-012:** O sistema DEVE definir como empresa padrão a empresa associada ao usuário logado (obtida através de `clsUsuario.Id_Empresa_Padrao`).

**SPEC-RE-THCP-FUNC-013:** O sistema DEVE permitir a seleção de um centro de custo específico através de um combo box, que deve ser atualizado com a lista de centros de custo disponíveis.

**SPEC-RE-THCP-FUNC-014:** O sistema DEVE permitir a atualização das listas de redes, empresas e centros de custo através do botão "Atualizar".

**SPEC-RE-THCP-FUNC-015:** O sistema DEVE permitir a limpeza de todos os campos de filtro através do botão "Cancelar", restaurando a data para a data atual e redefinindo as seleções para os valores padrão do usuário.

**SPEC-RE-THCP-FUNC-016:** O sistema DEVE permitir a seleção de um período específico através de um controle de data (DTPicker) no formato "MM/AAAA".

**SPEC-RE-THCP-FUNC-017:** O sistema DEVE permitir o agrupamento dos resultados por centro de custo através de um checkbox "Agrupar por Centro de Custo".

**SPEC-RE-THCP-FUNC-018:** O sistema DEVE permitir a navegação entre os campos utilizando a tecla TAB, na seguinte ordem: Rede → Empresa → Centro de Custo → Período → Agrupar por Centro de Custo → Botões (Confirmar, Cancelar, Atualizar, Sair).

**SPEC-RE-THCP-FUNC-019:** O sistema DEVE tratar a tecla ENTER para mover o foco para o próximo campo, exceto quando o foco estiver em botões de ação.

**SPEC-RE-THCP-FUNC-020:** O sistema DEVE filtrar os dados pelo período selecionado (mês/ano) e pela empresa selecionada, podendo opcionalmente filtrar por centro de custo específico.

**SPEC-RE-THCP-FUNC-021:** O sistema DEVE excluir do cálculo motivos de cartão de ponto que sejam de ajuste ('A'), de natureza débito ('D'), ou que não sejam considerados para o banco de horas (`DFacao_bh_fp = 0`).

**SPEC-RE-THCP-FUNC-022:** O sistema DEVE considerar apenas registros de cartão de ponto não quitados (`DFquitado = 0`) no cálculo das horas.

---

## **21 Relatório Importação do Cartão de Ponto**

---

### **21.0 Estrutura Geral do Formulário**

**SPEC-RE-ICP-UI-001:** O sistema DEVE apresentar um formulário intitulado "Relatório Importação Ponto", com borda fixa (Fixed Single), sem botão de maximizar e sem aparecer na barra de tarefas do sistema, sendo aberto como um formulário filho dentro do ambiente MDI.

**SPEC-RE-ICP-UI-002:** A tela DEVE possuir uma área de filtros organizada com campos para seleção de: Rede, Empresa, Funcionário(s) (com seleção múltipla), Período (data início e data fim) e um campo para o caminho do arquivo de importação com um botão de busca ("...").

**SPEC-RE-ICP-UI-003:** Todos os botões de ação (Confirmar, Cancelar, Atualizar e Sair) DEVEM estar dispostos em um painel inferior (mxPainel4) com ícones ilustrativos e dicas de ferramenta (tooltips) que identifiquem claramente sua função.

---

### **21.1 Funcionalidades do Módulo**

---

#### **21.1.1 Relatório Importação do Cartão de Ponto**

**SPEC-RE-ICP-FUNC-001:** O sistema DEVE permitir a geração de um relatório de importação de cartão de ponto a partir de um arquivo de texto, apresentando informações como: funcionário, data, data/hora e nome.

**SPEC-RE-ICP-FUNC-002:** O sistema DEVE validar, antes da geração do relatório, que:
- A empresa foi informada;
- O caminho do arquivo foi informado;
- O período selecionado está contido no mesmo mês;
- A data inicial não é maior que a data final.

**SPEC-RE-ICP-FUNC-003:** O sistema DEVE permitir a seleção de um arquivo de texto através de um diálogo de abertura de arquivo, que deve filtrar apenas arquivos com extensão .TXT.

**SPEC-RE-ICP-FUNC-004:** O sistema DEVE carregar o conteúdo do arquivo de texto em uma tabela temporária no banco de dados utilizando o comando BULK INSERT.

**SPEC-RE-ICP-FUNC-005:** O sistema DEVE processar o arquivo de texto com base no formato esperado: os primeiros 11 caracteres representam o PIS do funcionário, as posições 12-19 representam a data (no formato DDMMYYYY) e as posições 20-23 representam a hora (no formato HHMM).

**SPEC-RE-ICP-FUNC-006:** O sistema DEVE relacionar as batidas de ponto do arquivo com os funcionários da empresa selecionada, através do campo PIS (na tabela TBpessoa).

**SPEC-RE-ICP-FUNC-007:** O sistema DEVE filtrar as batidas de ponto pelo período selecionado (data início e data fim) e, opcionalmente, por funcionários específicos (quando selecionados).

**SPEC-RE-ICP-FUNC-008:** O sistema DEVE exibir o relatório através do Crystal Reports, utilizando o arquivo "rptRelatorio_Importacao_Cartao_Ponto.rpt" e passando como parâmetro a empresa selecionada.

**SPEC-RE-ICP-FUNC-009:** O sistema DEVE permitir a saída do formulário através do botão "Sair" ou da tecla ESC.

---

#### **21.1.2 – Configuração de Filtros para Apuração**

**SPEC-RE-ICP-FUNC-010:** O sistema DEVE carregar, ao abrir o formulário, a lista de redes disponíveis, definindo como padrão a rede associada ao usuário logado.

**SPEC-RE-ICP-FUNC-011:** O sistema DEVE atualizar a lista de empresas sempre que uma rede for selecionada, filtrando apenas as empresas vinculadas à rede escolhida.

**SPEC-RE-ICP-FUNC-012:** O sistema DEVE atualizar a lista de funcionários sempre que uma empresa for selecionada, exibindo apenas funcionários ativos (não demitidos) na data final do período.

**SPEC-RE-ICP-FUNC-013:** O sistema DEVE permitir a seleção múltipla de funcionários através do controle `ctlMult`, exibindo em uma grade as colunas: ID Funcionário, Matrícula e Nome.

**SPEC-RE-ICP-FUNC-014:** O sistema DEVE permitir a atualização da lista de redes através do botão "Atualizar".

**SPEC-RE-ICP-FUNC-015:** O sistema DEVE permitir a limpeza de todos os campos de filtro através do botão "Cancelar", restaurando as datas para o primeiro e último dia do mês atual, redefinindo a rede para a padrão do usuário e limpando o campo do caminho do arquivo.

**SPEC-RE-ICP-FUNC-016:** O sistema DEVE permitir a navegação entre os campos utilizando a tecla TAB, na seguinte ordem: Rede → Empresa → Funcionário → Período (Data Início, Data Fim) → Caminho → Botões (Confirmar, Cancelar, Atualizar, Sair).

**SPEC-RE-ICP-FUNC-017:** O sistema DEVE tratar a tecla ENTER para mover o foco para o próximo campo, exceto quando o foco estiver em botões de ação.

**SPEC-RE-ICP-FUNC-018:** O sistema DEVE impedir a geração do relatório caso não haja empresa selecionada, caminho do arquivo informado ou o período seja inválido, exibindo mensagens de alerta apropriadas.

**SPEC-RE-ICP-FUNC-019:** O sistema DEVE definir o diretório inicial do diálogo de abertura de arquivo como o servidor do banco de dados (quando o campo de caminho estiver vazio) para facilitar a localização do arquivo.

**SPEC-RE-ICP-FUNC-020:** O sistema DEVE utilizar a função `Grava_Data` para formatar as dates no formato aceito pelo banco de dados (YYYYMMDD) nas consultas SQL.

**SPEC-RE-ICP-FUNC-021:** O sistema DEVE considerar apenas funcionários ativos (não demitidos) na data final do período para a listagem de funcionários e para o processamento do arquivo de importação.

---

Com base no formulário VB6 fornecido e nas funcionalidades observadas, aqui estão os requisitos de sistema detalhados:

---

## **22.0 Ferramentas Importação do Cartão de Ponto**

**SPEC-FE-ICP-UI-001:** O sistema DEVE apresentar uma tela de importação de cartão de ponto com campos para seleção de Rede, Empresa, Funcionários, Período, Layout do arquivo, Caminho do arquivo e uma opção de sobrescrever dados existentes.

**SPEC-FE-ICP-UI-002:** A tela DEVE possuir uma barra de progresso visível durante o processo de importação, mostrando o nome do funcionário sendo processado e o status da operação.

**SPEC-FE-ICP-UI-003:** Todos os botões DEVEM ter ícones e tooltips descritivos, e a navegação entre campos DEVE ser possível com a tecla Tab e Enter.

---

## **22.1 Funcionalidades do Módulo**

### **22.1.1 Ferramentas Importação do Cartão de Ponto**

**SPEC-FE-ICP-FUNC-001:** O sistema DEVE permitir a importação de arquivos de cartão de ponto nos formatos TopData e Kurumim REP II, com validação automática do layout.

**SPEC-FE-ICP-FUNC-002:** O sistema DEVE validar se o arquivo está no caminho de rede correto e se possui o formato adequado antes de iniciar a importação.

**SPEC-FE-ICP-FUNC-003:** O sistema DEVE permitir a seleção múltipla de funcionários para importação, com filtragem dinâmica baseada na empresa selecionada.

**SPEC-FE-ICP-FUNC-004:** O sistema DEVE validar se o período de importação está dentro do mesmo mês e ano, e se a data inicial é anterior ou igual à data final.

**SPEC-FE-ICP-FUNC-005:** O sistema DEVE verificar se os parâmetros de cartão de ponto (motivos de hora, folga, falta, etc.) estão configurados para a empresa antes de permitir a importação.

**SPEC-FE-ICP-FUNC-006:** O sistema DEVE processar as batidas do arquivo e calcular automaticamente as horas trabalhadas, horas extras, faltas, folgas e adicional noturno.

**SPEC-FE-ICP-FUNC-007:** O sistema DEVE gerar um log de inconsistências quando houver dias com número inválido de batidas (menos de 4 ou mais de 4, conforme configuração).

**SPEC-FE-ICP-FUNC-008:** O sistema DEVE permitir a sobrescrita dos dados de ponto no período selecionado, após confirmação do usuário.

**SPEC-FE-ICP-FUNC-009:** O sistema DEVE atualizar as tabelas de cartão de ponto, totalizadores e banco de horas automaticamente após a importação.

**SPEC-FE-ICP-FUNC-010:** O sistema DEVE exibir uma mensagem de sucesso ao final da importação e um log de erros se houver inconsistências.

---

### **22.1.2 – Configuração de Filtros para Apuração**

**SPEC-FE-ICP-FILTRO-001:** O sistema DEVE permitir a seleção hierárquica de Rede → Empresa → Funcionário(s), com atualização automática das listas.

**SPEC-FE-ICP-FILTRO-002:** O sistema DEVE filtrar automaticamente os funcionários ativos na empresa no período selecionado, excluindo demitidos.

**SPEC-FE-ICP-FILTRO-003:** O sistema DEVE permitir a seleção de um período específico (início e fim) com controle de data (DTPicker).

**SPEC-FE-ICP-FILTRO-004:** O sistema DEVE permitir a escolha do layout do arquivo a ser importado, carregado de uma tabela de layouts cadastrados.

**SPEC-FE-ICP-FILTRO-005:** O sistema DEVE validar se o arquivo selecionado existe e está acessível antes de permitir a importação.

**SPEC-FE-ICP-FILTRO-006:** O sistema DEVE impedir a importação se houver uma tela de digitação de ponto aberta e com alterações não finalizadas.

**SPEC-FE-ICP-FILTRO-007:** O sistema DEVE exibir uma barra de progresso durante o processamento, indicando o funcionário e o dia sendo processado.

**SPEC-FE-ICP-FILTRO-008:** O sistema DEVE permitir a atualização das listas de Rede, Empresa e Layout mediante clique no botão "Atualizar".

---

### **22.1.3 – Regras de Negócio e Validações**

**SPEC-FE-ICP-RN-001:** O sistema DEVE validar se o arquivo de importação contém datas dentro do período selecionado.

**SPEC-FE-ICP-RN-002:** O sistema DEVE considerar a escala noturna do funcionário para ajustar o cálculo de horas noturnas.

**SPEC-FE-ICP-RN-003:** O sistema DEVE tratar dias com menos de 4 batidas como inconsistência, exceto quando configurado para controle extenso.

**SPEC-FE-ICP-RN-004:** O sistema DEVE calcular automaticamente horas extras, adicional noturno e banco de horas com base nas batidas importadas e no horário padrão do funcionário.

**SPEC-FE-ICP-RN-005:** O sistema DEVE considerar folgas, faltas e feriados no cálculo, atribuindo os motivos corretos de cartão de ponto.

**SPEC-FE-ICP-RN-006:** O sistema DEVE compensar automaticamente o banco de horas do funcionário com base nas horas credoras e devedoras apuradas.

---

### **22.1.4 – Tratamento de Erros e Logs**

**SPEC-FE-ICP-ERRO-001:** O sistema DEVE exibir mensagens de erro claras para validações de dados, como:
- Empresa não selecionada
- Caminho inválido
- Período inválido
- Layout não selecionado
- Parâmetros não configurados

**SPEC-FE-ICP-ERRO-002:** O sistema DEVE gerar um arquivo de log com os dias e funcionários que apresentaram inconsistências na importação.

**SPEC-FE-ICP-ERRO-003:** O sistema DEVE abortar a importação se o arquivo estiver em formato inválido ou fora do período selecionado.

**SPEC-FE-ICP-ERRO-004:** O sistema DEVE restaurar a interface para estado normal após erro ou cancelamento.

---

### **22.1.5 – Integração com Outros Módulos**

**SPEC-FE-ICP-INT-001:** O sistema DEVE integrar-se com o módulo de Digitação de Cartão de Ponto, impedindo importação se houver alterações em aberto.

**SPEC-FE-ICP-INT-002:** O sistema DEVE atualizar as tabelas de banco de horas automaticamente após a importação.

**SPEC-FE-ICP-INT-003:** O sistema DEVE utilizar a mesma estrutura de cálculo do módulo de totalização de cartão de ponto.

**SPEC-FE-ICP-INT-004:** O sistema DEVE respeitar as permissões de segurança do usuário, verificando acesso através da classe clsSeguranca.

---

### **22.1.6 – Performance e Usabilidade**

**SPEC-FE-ICP-PERF-001:** O sistema DEVE processar a importação em segundo plano, sem travar a interface do usuário.

**SPEC-FE-ICP-PERF-002:** O sistema DEVE utilizar tabelas temporárias para processamento intermediário, otimizando o desempenho.

**SPEC-FE-ICP-PERF-003:** O sistema DEVE permitir a importação de múltiplos funcionários em lote, com processamento sequencial.

**SPEC-FE-ICP-USAB-001:** O sistema DEVE permitir navegação por teclado (Tab, Enter, Esc) em todos os campos.

**SPEC-FE-ICP-USAB-002:** O sistema DEVE restaurar os valores padrão (data atual, empresa padrão do usuário) ao carregar a tela.

--- 

Com base no formulário VB6 fornecido para exportação do Arquivo Eletrônico de Jornada (AEJ), aqui estão os requisitos de sistema detalhados:

---

## **23.0 Ferramentas Exportação do Arquivo AEJ**

**SPEC-FE-AEJ-UI-001:** O sistema DEVE apresentar uma tela de exportação do arquivo AEJ com campos para seleção hierárquica de Rede e Empresa, período (data inicial e final) e caminho de destino do arquivo.

**SPEC-FE-AEJ-UI-002:** A tela DEVE possuir uma barra de progresso na parte inferior, visível apenas durante o processamento da exportação.

**SPEC-FE-AEJ-UI-003:** Todos os botões DEVEM ter ícones representativos e tooltips descritivos: Confirmar, Cancelar, Sair e Atualizar.

---

## **23.1 Funcionalidades do Módulo**

### **23.1.1 Ferramentas Exportação do Arquivo AEJ**

**SPEC-FE-AEJ-FUNC-001:** O sistema DEVE gerar o Arquivo Eletrônico de Jornada (AEJ) no formato TXT, conforme layout oficial da legislação trabalhista.

**SPEC-FE-AEJ-FUNC-002:** O sistema DEVE utilizar uma stored procedure (`sp_cp_exportar_arquivo_aej`) para centralizar a lógica de geração dos registros do AEJ.

**SPEC-FE-AEJ-FUNC-003:** O sistema DEVE validar se a empresa selecionada possui REP cadastrado antes de permitir a exportação.

**SPEC-FE-AEJ-FUNC-004:** O sistema DEVE verificar a existência de batidas incompletas (ex.: saída não registrada, segundo turno faltante) no período e gerar um log de inconsistências, impedindo a exportação até a regularização.

**SPEC-FE-AEJ-FUNC-005:** O sistema DEVE gerar automaticamente o nome do arquivo no formato: `Exp_AEJ_Emp_XX.txt`, onde XX é o código da empresa com dois dígitos.

**SPEC-FE-AEJ-FUNC-006:** O sistema DEVE permitir a seleção do diretório de destino através de um diálogo de pastas.

**SPEC-FE-AEJ-FUNC-007:** O sistema DEVE exibir uma mensagem de sucesso após a exportação ou informar quando não houver dados para o período/empresa selecionados.

**SPEC-FE-AEJ-FUNC-008:** O sistema DEVE limpar os campos (exceto rede) ao clicar no botão "Cancelar".

**SPEC-FE-AEJ-FUNC-009:** O sistema DEVE permitir a atualização das listas de Rede e Empresa através do botão "Atualizar".

---

### **23.1.2 – Configuração de Filtros para Apuração**

**SPEC-FE-AEJ-FILTRO-001:** O sistema DEVE permitir a seleção hierárquica de Rede → Empresa, atualizando automaticamente a lista de empresas conforme a rede selecionada.

**SPEC-FE-AEJ-FILTRO-002:** O sistema DEVE permitir a definição do período de apuração através de dois controles de data (DTPicker) para data inicial e final.

**SPEC-FE-AEJ-FILTRO-003:** O sistema DEVE carregar a data atual como valor padrão para as datas inicial e final.

**SPEC-FE-AEJ-FILTRO-004:** O sistema DEVE validar se a data inicial não é posterior à data final.

**SPEC-FE-AEJ-FILTRO-005:** O sistema DEVE impedir a exportação se o caminho do arquivo não for informado.

---

### **23.1.3 – Regras de Negócio e Validações**

**SPEC-FE-AEJ-RN-001:** O sistema DEVE validar a existência de REP cadastrado para a empresa antes de permitir a exportação.

**SPEC-FE-AEJ-RN-002:** O sistema DEVE verificar batidas incompletas no período, considerando:
- Saídas não registradas no primeiro turno
- Segundo turno faltante quando o primeiro turno possui saída
- Ausência de ocorrência de alteração de ponto que justifique a inconsistência

**SPEC-FE-AEJ-RN-003:** O sistema DEVE gerar o arquivo AEJ apenas para funcionários que possuam cartão de ponto no período selecionado.

**SPEC-FE-AEJ-RN-004:** O sistema DEVE incluir no arquivo AEJ todos os registros necessários conforme layout oficial (cabeçalho, detalhes das batidas, horários contratuais, ausências, rodapé).

**SPEC-FE-AEJ-RN-005:** O sistema DEVE formatar datas e horas no padrão exigido pelo AEJ (formato ISO 8601 com fuso horário).

---

### **23.1.4 – Tratamento de Erros e Logs**

**SPEC-FE-AEJ-ERRO-001:** O sistema DEVE exibir mensagens de erro claras para:
- Rede não selecionada
- Empresa não selecionada
- Caminho não informado
- REP não cadastrado para a empresa
- Data inicial maior que data final
- Existência de batidas incompletas

**SPEC-FE-AEJ-ERRO-002:** O sistema DEVE gerar um arquivo de log (`LogExportacaoAEJ.txt`) no diretório temporário, listando funcionários e dias com batidas incompletas.

**SPEC-FE-AEJ-ERRO-003:** O sistema DEVE abrir automaticamente o arquivo de log no Bloco de Notas quando houver inconsistências.

**SPEC-FE-AEJ-ERRO-004:** O sistema DEVE abortar a exportação se a stored procedure não retornar registros.

**SPEC-FE-AEJ-ERRO-005:** O sistema DEVE restaurar a interface para estado normal após erro ou cancelamento.

---

### **23.1.5 – Integração com Outros Módulos**

**SPEC-FE-AEJ-INT-001:** O sistema DEVE integrar-se com o módulo de Cartão de Ponto, utilizando as tabelas:
- `TBcartao_ponto`
- `TBcartao_ponto_movimento`
- `TBfuncionario`
- `TBpessoa`
- `TBrep`
- `TBparametro_cartao_ponto`
- `TBocorrencia_alteracao_ponto`

**SPEC-FE-AEJ-INT-002:** O sistema DEVE executar a stored procedure `sp_cp_exportar_arquivo_aej` que contém toda a lógica de formatação do arquivo AEJ.

**SPEC-FE-AEJ-INT-003:** O sistema DEVE respeitar as permissões de segurança do usuário através da classe `clsSeguranca`.

---

### **23.1.6 – Performance e Usabilidade**

**SPEC-FE-AEJ-PERF-001:** O sistema DEVE executar a geração do arquivo através de uma stored procedure no banco de dados, otimizando o desempenho.

**SPEC-FE-AEJ-PERF-002:** O sistema DEVE utilizar tabelas temporárias para processamento intermediário de validações.

**SPEC-FE-AEJ-PERF-003:** O sistema DEVE desabilitar a interface durante o processamento (modo de espera) para evitar operações concorrentes.

**SPEC-FE-AEJ-USAB-001:** O sistema DEVE permitir navegação por teclado (Tab, Enter, Esc) em todos os campos.

**SPEC-FE-AEJ-USAB-002:** O sistema DEVE carregar automaticamente a rede padrão do usuário ao abrir a tela.

**SPEC-FE-AEJ-USAB-003:** O campo de caminho DEVE ser somente leitura, obrigando o uso do botão de diálogo para seleção.

**SPEC-FE-AEJ-USAB-004:** O sistema DEVE exibir uma barra de progresso durante o processamento para fornecer feedback visual ao usuário.

--- 

**Especificação Técnica - Ferramentas de Exportação do Arquivo Madis**

---

### **SPEC-FE-ICP-UI-001: Estrutura da Interface**
O sistema DEVE apresentar um formulário intitulado “Exportação Madis”, com as seguintes características:
- Dimensões fixas (7050 x 4320 twips)
- Posicionamento centralizado na inicialização
- Ícone específico da funcionalidade
- Navegação por teclado habilitada (KeyPreview = True)
- Integração como janela MDI filha (MDIChild = True)
- Exibição oculta na barra de tarefas (ShowInTaskbar = False)

---

### **SPEC-FE-ICP-UI-002: Componentes da Interface**
A tela DEVE possuir os seguintes elementos dispostos verticalmente:

1. **Controle de Seleção Hierárquica:**
   - Combobox "Rede" (adbRede) – Primeiro campo focalizável (TabIndex=0)
   - Combobox "Empresa" (adbEmpresa) – Atualização condicional à seleção de rede
   - Controle de múltipla seleção "Funcionário" (mltFuncionario) – Com colunas:
     * ID (oculta)
     * Matrícula (largura 1500)
     * Nome (largura 3500)

2. **Área de Filtros:**
   - Frame "Período" (fraPeriodo) com:
     * Data inicial (dtpInicio) – Checkbox de habilitação
     * Data final (dtpFim) – Checkbox de habilitação
     * Rótulo "até" entre os controles
   - Frame "Opção" (framOpcao) com:
     * Botão de opção "Admissão" (padrão selecionado)
     * Botão de opção "Demissão"

3. **Controle de Destino:**
   - Campo "Caminho Selecionado" (txaCaminho) – Somente leitura
   - Botão de navegação "..." (cmdDialog) para seleção de diretório

4. **Barra de Ferramentas Inferior (mxPainel4):**
   - Botão "Confirmar" (ícone de verificação) – TabIndex=10
   - Botão "Cancelar" (ícone "X") – TabIndex=11
   - Botão "Atualizar" (ícone de atualização) – TabIndex=13
   - Botão "Sair" (ícone de porta) – TabIndex=12 – Alinhado à direita

5. **Indicador de Progresso:**
   - Barra de progresso (ProgressBar1) – Oculto inicialmente, posicionada na base da janela

---

### **SPEC-FE-ICP-UI-003: Comportamento dos Controles**
Todos os botões DEVEM implementar os seguintes comportamentos:

1. **Foco e Navegação:**
   - Ao receber foco: Desabilitar KeyPreview do formulário
   - Ao perder foco: Reabilitar KeyPreview do formulário
   - Propagação de eventos KeyDown/KeyPress para o formulário

2. **Barra de Status:**
   - Exibir texto dica (ToolTipText) para cada botão:
     * Confirmar: "Confirmar"
     * Cancelar: "Cancelar"
     * Atualizar: "Atualizar"
     * Sair: "Sair"

3. **Comportamentos Específicos:**
   - Botão "Atualizar": Recarregar lista de redes e reposicionar foco
   - Botão "Cancelar": Executar procedimento Limpar_Campos
   - Botão "Sair": Encerrar formulário (Unload Me)
   - Botão "Confirmar": Executar validações e processo de exportação

---

### **SPEC-FE-ICP-FN-001: Carregamento Inicial**
O sistema DEVE executar ao carregar o formulário:
- Chamada do procedimento Limpar_Campos
- Configuração inicial da rede com base em clsUsuario.Id_Rede_Empresa_Padrao

---

### **SPEC-FE-ICP-FN-002: Validações de Exportação**
O sistema DEVE validar antes da geração do arquivo:
1. Seleção obrigatória de empresa (mensagem: "Selecione a empresa!")
2. Definição obrigatória do caminho (mensagem: "Informe o caminho!")
3. Verificação de existência de dados para exportação (mensagem: "Não existem dados para exportação.")

---

### **SPEC-FE-ICP-FN-003: Processamento de Dados**
O sistema DEVE durante a exportação:

1. **Controle de Interface:**
   - Expandir interface via clsSeguranca.Interface(interfaceExpandir)
   - Configurar ProgressBar1 com máximo 3 estágios
   - Atualizar progresso em cada fase:
     * Estágio 1: Preparação
     * Estágio 2: Consulta ao banco
     * Estágio 3: Gravação do arquivo

2. **Construção de Consulta:**
   - Para Admissões/Ativos:
     * Incluir funcionários das categorias 1, 7 e 901
     * Aplicar filtro por empresa
     * Considerar período quando informado
     * Excluir funcionários demitidos
     * Ordenar por nome
   - Para Demissões:
     * Incluir funcionários demitidos no período
     * Aplicar filtro por empresa
     * Considerar período quando informado
     * Ordenar por nome

3. **Geração do Arquivo:**
   - Criar arquivo texto no caminho especificado
   - Formatar cada linha conforme especificação:
     * Admissão: 15 caracteres (empresa+matrícula) + 7 espaços + 40 caracteres (nome) + 1 caractere (0) + 8 caracteres (data admissão DDMMYYYY) + 21 espaços + 5 caracteres (horas) + 8 espaços + 4 caracteres (código horário) + 2 caracteres (00) + 6 espaços + 11 caracteres (PIS) + 18 espaços + 2 caracteres (00) + 8 caracteres (código cargo) + 50 espaços + 72 espaços (e-mail)
     * Demissão: 17 caracteres (matrícula) + 3 caracteres (902) + 45 espaços + 8 caracteres (data demissão DDMMYYYY) + 46 espaços + 11 caracteres (PIS)

4. **Finalização:**
   - Fechar arquivo gerado
   - Recolher interface via clsSeguranca.Interface(interfaceRecolher)
   - Exibir mensagem de sucesso: "Arquivo gerado com sucesso!"
   - Executar Limpar_Campos

---

### **SPEC-FE-ICP-FN-004: Comportamento dos Filtros**
O sistema DEVE implementar:

1. **Cascateamento Rede→Empresa:**
   - Ao alterar rede: Limpar empresa se rede vazia
   - Ao selecionar rede: Atualizar lista de empresas vinculadas

2. **Cascateamento Empresa→Funcionários:**
   - Ao receber foco no controle mltFuncionario: Executar CarregarFuncionarios
   - Atualização condicional ao tipo (Admissão/Demissão) e período

3. **Controle de Período:**
   - Checkboxes habilitam/desabilitam filtro por data
   - Valores nulos indicam "sem restrição"

4. **Geração de Nome de Arquivo:**
   - Padrão: "ExpMadis_[Adm|Dem]_Emp_[CódigoEmpresa2dígitos].txt"
   - Exemplo: "ExpMadis_Adm_Emp_05.txt"

---

### **SPEC-FE-ICP-FN-005: Tratamento de Erros**
O sistema DEVE capturar e tratar exceções através de clsSeguranca.Erro, mantendo a interface em estado consistente após falhas.

---

### **SPEC-FE-ICP-FN-006: Segurança e Auditoria**
O sistema DEVE:
- Registrar identificador do formulário (Id = 4323)
- Controlar estado da interface via clsSeguranca.booInterface_Em_Espera
- Utilizar transações implícitas no acesso ao banco de dados
- Implementar log através do mecanismo padrão da aplicação

---

