**US01 – Cadastrar Funcionário**

**Como** profissional de RH  
**Quero** cadastrar colaboradores no sistema  
**Para** que suas jornadas e marcações de ponto sejam controladas
corretamente

**Critérios de Aceite**

- Deve permitir cadastrar dados básicos (nome, matrícula, cargo, setor,
  unidade).

- Deve permitir ativar e inativar funcionários.

- O funcionário só aparece no módulo de ponto se estiver ativo.

- Após salvar, o sistema exibe confirmação e registra a ação em trilha
  de auditoria.

**US02 – Configurar Escalas e Horários**

**Como** profissional de RH  
**Quero** definir a escala e horários de trabalho de cada colaborador  
**Para** garantir o cálculo correto da jornada

**Critérios de Aceite**

- Deve permitir criar diferentes tipos de escala (fixa, revezamento,
  12x36 etc.).

- Deve permitir configurar tolerâncias de atraso e saída antecipada.

- Ao vincular o funcionário à escala, os cálculos passam a seguir essa
  regra.

- Mudanças na escala devem manter histórico (data de início e fim de
  vigência).

**US03 – Importar Batidas ou Receber da Integração Biométrica**

**Como** sistema (processo automatizado)  
**Quero** inserir registros de marcação de ponto dos colaboradores  
**Para** registrar as horas trabalhadas

**Critérios de Aceite**

- Deve aceitar importação de arquivos (CSV/AFD/AFDT).

- Deve permitir integração automática com equipamentos biométricos.

- Registros duplicados devem ser identificados e ignorados.

- Em caso de inconsistência (funcionário não encontrado / batida
  incompleta), deve registrar log e notificar RH.

- Registros válidos devem ser exibidos no cartão de ponto imediatamente.

**US04 – Visualizar Cartão de Ponto**

**Como** colaborador  
**Quero** visualizar minhas marcações diárias  
**Para** acompanhar minhas horas e identificar erros

**Critérios de Aceite**

- Deve exibir marcações originais por data.

- Deve destacar dias com inconsistências (ex.: cor amarela ou ícone).

- Deve exibir total de horas trabalhadas, extras, banco e faltas.

- Não deve permitir edição direta das marcações.

**US05 – Solicitar Ajuste de Marcações**

**Como** colaborador  
**Quero** solicitar correções quando houver falhas nas marcações  
**Para** garantir que minhas horas reflitam corretamente o trabalho
realizado

**Critérios de Aceite**

- Deve permitir selecionar o dia e o tipo de correção
  (entrada/saída/intervalo).

- Deve exigir justificativa.

- Solicitação deve ser enviada ao gestor responsável.

- Após envio, o status deve aparecer como **“Aguardando Aprovação”**.

**US06 – Aprovar ou Recusar Ajustes**

**Como** gestor  
**Quero** aprovar ou recusar solicitações de ajuste de ponto  
**Para** validar corretamente as horas dos colaboradores

**Critérios de Aceite**

- Deve exibir solicitações pendentes com detalhes (data, horas,
  justificativa).

- Deve permitir aprovar ou recusar individualmente.

- Ao recusar, deve ser obrigatório informar motivo.

- A ação deve atualizar o cartão de ponto automaticamente.

- Todas as ações devem ser registradas em trilha de auditoria.

**US07 – Registrar Ajuste no Cartão de Ponto com Auditoria**

**Como** sistema  
**Quero** registrar qualquer alteração de ponto com histórico  
**Para** garantir rastreabilidade e conformidade trabalhista

**Critérios de Aceite**

- Deve armazenar marcação original e nova marcação.

- Deve registrar quem alterou, quando e o motivo.

- Historico deve ser consultável em auditoria/relatório.

- Nenhuma alteração pode apagar permanentemente o dado original.

**US08 – Gerar Relatório de Batidas Originais x Ajustadas**

**Como** analista de RH / auditor  
**Quero** visualizar relatórios que apresentem tanto registros originais
quanto ajustes  
**Para** verificar conformidade e controle interno

**Critérios de Aceite**

- Deve exibir lado a lado: marcação original, marcação ajustada, usuário
  que alterou e motivo.

- Deve permitir filtros por período, colaborador, setor e tipo de origem
  da marcação.

- Deve permitir exportar para **PDF** e **Excel**.

- Campos de auditoria devem aparecer claramente no relatório.
