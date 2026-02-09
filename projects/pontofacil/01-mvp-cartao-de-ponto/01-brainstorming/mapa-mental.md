# **MAPA MENTAL — Módulo Cartão de Ponto**

## **1. Cadastros**

* **Cadastro de Funcionários**: registra dados pessoais, vínculo, unidade e situação ativa/inativa.
* **Cadastro de Horários**: cria e mantém horários.
* **Cadastro de Escalas**: cria e mantém tipos de escala (fixa, turnos, 12x36) com histórico de vigência.
* **Cadastro de Tipos de Movimentação**: cria e mantém tipos de movimentação(Hora Extra, Hora Negativa, Hora Trabalhada, etc).
* **Parametrização do Cartão de Ponto**: define tolerâncias, intervalos, políticas de horas extras aplicáveis e utilização de banco de hora.
* **Parametrização de Exportação**: Define os parâmetros para exportação do ponto para folha de pagamento.
* **Cadastro de Saldo Inicial do Banco de Horas**: cria e mantém o saldo inicial do banco de horas dos funcionários.
* **Cadastro do Modelo do REP**: cria e mantém o os REPs(Registro de Ponto Eletrônico).
---

## **2. Movimentações**

* **Importação de Batidas**: recebe registros de ponto via arquivo .txt.
* **Processamento de Marcações**: aplica regras da escala, valida inconsistências e calcula as marcações do cartão de ponto.
* **Digitação Manual de Ponto**: permite inserção manual de marcações pelo RH/gestor conforme permissões.
* **Solicitação de Ajuste**: colaborador solicita correções informando justificativa.
* **Aplicação de Ajustes no Cartão**: sistema grava ajustes mantendo o registro original e o histórico.
* **Apuração/Fechamento das informações do Cartão de Ponto**: sistema calcula as marcações para o fechamento mensal do ponto(hora extra, hora negativa, etc).

---

## **3. Auditoria**

* **Trilha de Alterações de Ponto**: registra marcação original, nova marcação, autor, data e motivo.
* **Log de Importações e Ajustes**: documenta erros, duplicidades, falhas, status de cada importação e ocorrências de ajustes.

---

## **4. Extração de Dados**

* **Relatório Batidas Originais x Ajustadas**: compara lado a lado registros originais, ajustes, responsáveis e motivos.
* **Relatório de Jornada Apurada**: exibe totais de horas trabalhadas, extras, banco de horas e ausências.
* **Exportação de Dados (Excel/PDF/TXT)**: permite extrair informações filtradas por período, funcionário, unidade ou origem da batida.
* **Relatório de Inconsistências**: gera inconsistências das marcações(mais de 2 horas de almoço, mais de 11 horas trabalhadas, etc).
* **Relatório de Banco de Horas**: exibe banco de horas, histórico do banco, etc.
