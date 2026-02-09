**Funcionalidades do Módulo Cartão de Ponto**

**1. Cadastro de Funcionários, Escalas e Horários**

- **Cadastro de Funcionários**

  - Dados pessoais essenciais (nome, matrícula, cargo, centro de custo,
    etc.)

  - Associação com unidade/filial

  - Situação (ativo/inativo)

- **Configuração de Escalas**

  - Escalas fixas (ex.: 08:00–17:00)

  - Escalas variáveis ou turnos (ex.: rodízio semanal)

  - Escalas especiais (12x36, plantões)

- **Horários e Regras**

  - Tolerância de atraso e saída antecipada

  - Regras de intervalos (intrajornada/interjornada)

  - Política de horas extras (limites e compensação)

**Fluxo associado**

1.  RH cadastra funcionário

2.  RH define escala e horário

3.  Sistema vincula funcionário → escala → cálculo de jornada

**2. Importação de Batidas ou Integração Direta (Biometria)**

- **Importação de Arquivo**

  - Formatos suportados (CSV, TXT, AFD/AFDT ou padrão do relógio)

  - Validação da integridade do arquivo

  - Feedback de erros (batidas incompletas, funcionário não encontrado,
    etc.)

- **Integração Direta com Relógio Biométrico**

  - Captura automática em tempo real ou sincronização programada

  - Identificação do colaborador via digital ou RFID

  - Registro imediato no cartão de ponto

**Fluxo associado**

1.  Sistema recebe batidas (importação manual ou automática)

2.  Registros são processados e aplicados conforme escala

3.  Sistema detecta inconsistências (ex.: falta de saída) e sinaliza no
    cartão

**3. Relatórios com Diferenciação entre:**

- Horas obtidas por captura/importação **original (ponto físico/app)**

- Horas **alteradas manualmente pelo usuário do sistema**

**Requisitos do Relatório**

- Exibir:

  - Marcações originais

  - Marcações ajustadas

  - Usuário responsável pela alteração

  - Motivo informado (ex.: esquecimento, falha de relógio, liberação de
    gestor)

  - Data e hora da alteração (trilha de auditoria)

- Filtros:

  - Período

  - Funcionário

  - Equipe/Unidade/Gestor

  - Tipo de origem da marcação (importação, biometria, ajuste manual)

- Opções de exportação:

  - Excel

  - PDF

  - Envio automático por e-mail (opcional)

**Fluxo associado**

1.  Colaborador/gestor solicita ajuste (quando necessário)

2.  Gestor aprova/recusa

3.  Sistema registra trilha de auditoria + recalcula jornada

4.  Relatório exibe diferença entre registro original e ajustado

**Visão Resumida das Necessidades Atendidas**

| **Necessidade** | **Solução Proposta** | **Resultado Esperado** |
|----|----|----|
| Cadastro de funcionários e escalas | Módulo de cadastro + parametrizações | Jornada correta para cálculo |
| Integração/importação de batidas | Importador de arquivos + integração biométrica | Registros automáticos e seguros |
| Controle sobre ajustes e mudanças | Workflow de aprovação + auditoria | Rastreabilidade e conformidade |
| Relatórios diferenciando registros originais e alterados | Relatórios com origem da marcação e trilha de alterações | Transparência e controle para auditoria e folha |
