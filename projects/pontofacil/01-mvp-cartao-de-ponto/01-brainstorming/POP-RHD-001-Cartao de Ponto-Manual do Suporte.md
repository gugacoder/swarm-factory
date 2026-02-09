# POP-RHD-001 — Guia Cartão de Ponto no Director

**Tipo do Documento:** Procedimento Operacional Padrão (Manual do suporte)

| Código | Versão | Páginas |
|---|---|---|
| POP-RHD-001 | 1 | 19 |

Outros formulários impactados pela atualização: Detalhamento de Totalizador - Id:3652; Importação Cartão de Ponto - Id: 3985; Digitação de Cartão de Ponto - Id: 3651; Registro de Ponto Detalhado - Id: 4800, Espelho de Ponto Eletrônico - Id: 4796 e Exportação AEJ - Id: 4792.

---

## 1 Introdução (Em revisão)

O Cartão de Ponto é o módulo do sistema Director GE utilizado para registrar os horários de entrada, almoço e saída dos colaboradores.

Este POP orienta sobre as principais funcionalidades do módulo, incluindo:

- Importação de dados do relógio de ponto eletrônico;
- Digitação manual das marcações;
- Edição, ajuste e exclusão de batidas;
- Geração de relatórios como espelho de ponto, banco de horas e jornada calculada.

## 2 Alcance

Este POP destina-se a equipe de recursos humanos do Director.

## 3 Requisitos

Não se aplica.

## 4 Procedimentos

### 4.1 Importação das ocorrências do ponto

Para importação dos dados de ponto, é necessário que exista previamente cadastro no sistema Director os seguintes formulários:

- Escala de Trabalho — Id: 991;
- Horário — Id: 990;
- Parâmetro de Cartão de Ponto — Id: 3650.

A seguir, orientações para realizar os cadastros. Se você já possui esses cadastros, avance diretamente para o tópico 4.1.4 — Cadastro de Funcionário.

#### 4.1.1 Cadastro "Horário — Id: 990"

Este formulário é utilizada para cadastrar horários existentes no ponto, temos a possibilidade de 4 marcações diárias onde o sistema preencherá automaticamente no formulário de "Digitação do Cartão de Ponto Id: 3651".

Para cadastro logue no sistema Director, acesse o módulo "Cartão de Ponto" no menu "Cadastros" > "Funcionário" > "Escala" > "Horário".

Na aba "Cadastro" preencha os campos abaixo:

- **"Código:"** campo de preenchimento automático;
- **"Descrição:"** cadastre os horários de acordo com a escala de trabalho da sua loja.
  Exemplo: 06:00 11:00 12:30 14:50, início do expediente às 06h00, intervalo das 11h00 ao 12h30, com término às 14h50;
- **"Jornada (Flexibilidade):"** nesta opção marque o botão "Sim" caso haja flexibilidade de horário na jornada ou "Não" caso contrário;
- **"Jornada (Início):"** neste campo especificar o início da jornada de trabalho;
- **"Jornada (Refeição):"** especificar o início do intervalo da refeição do funcionário;
- **"Fim (Refeição):"** especificar o fim do intervalo para a refeição do funcionário;
- **"Fim (Jornada):"** especificar o término da jornada de trabalho;
- **"Turno de Trabalho:"** selecionar o turno de trabalho correspondente a jornada;
- **"Horário de Intervalo:"** escolha entre intervalo fixo ou variável.

> *Figura 1 — Cadastro de horário Id: 990*

#### 4.1.2 Cadastro "Escala de Trabalho Id: 991"

Este formulário é utilizado para cadastrar a escala semanal de trabalho, permitindo lançar totais de horas correspondente aos horários da jornada, assim como os dias de folga. Também é possível cadastrar escalas especiais para funcionários que se enquadram em regime trabalho diferenciado.

Para cadastro acesse o módulo "Cartão de Ponto" no menu "Cadastros" > "Funcionário" > "Escala" > "Escala".

Na aba "Cadastro" preenchas os campos abaixo:

- **"Código:"** acesse a aba "Listagem" para identificar o último código utilizado. Informe o número seguinte para o novo cadastro.
- **"Descrição:"** informe uma jornada de trabalha. Exemplo: 06:00 11:00 12:30 14:50, início do expediente às 06h00, intervalo das 11h00 ao 12h30, com término às 14h50);
- **"Número de Horas:"** informe o total de horas trabalhadas por semana e por mês, conforme a jornada. Exemplo: 06:00 11:00 12:30 14:50, considerando essa jornada de segunda a sexta-feira, o total seria de 44 horas semanais e 220 horas por mês;
- **"Folga Feriado:"** marque esta opção caso o funcionário folgue nos feriados;
- **"Nº Dias Fixos:"** informe o número de dias fixos que o funcionário irá trabalhar independente de feriado, por exemplo.
- **"Tipo de Jornada eSocial:"** verifique com o seu setor de departamento pessoal para cadastro;
- **"Descrição Tipo Jornada:"** este campo habilita conforme a seleção do campo "Tipo de Jornada eSocial".
- **"Dias Folga Sáb. Alternado:"** marque esta opção caso as folgas sejam sábados alternados. Exemplo: se folga a cada dois sábados com compensação nos outros.
- **"Contrato de trabalho em regime de tempo Parcial:"** marque esta opção em caso de menor aprendiz ou estagiário, pois esses casos podem seguir regras específicas.
- **"Data:"** selecione uma data para o cadastro para escala da semana. Lembrando que a escala é de segunda à domingo.
- Marque uma das opções **"Trabalhado"** ou **"Não trabalho"**, sendo a última para indicar folga.

Repita esse procedimento na opção "Data" para os demais dias da semana corresponde a escala.

Após isso selecione um horário que já foi pré-cadastrado no formulário "Horário Id — 990, para inserir clique na seta azul no canto direito da tela. Se precisar alterar o horário, utilize o botão "Editar". Para finalizar, clique no botão verde para salvar o cadastro.

> *Figura 2 — Escala de trabalho Id: 991*
>
> *Figura 3 — com o domingo*

O sistema exige que as escalas estejam cadastradas e pré-definidas corretamente, para identificar corretamente o horário de trabalho do funcionário e o dia folga.

Se houver outras escalas de trabalho, repita o mesmo procedimento descrito neste cadastro.

#### 4.1.3 Cadastro "Parâmetros Cartão de Ponto — Id: 3650"

Este cadastro é um dos mais importantes, pois é aqui que define as principais regras de cálculo do sistema, como politica de tolerâncias, horas extras entre outros.

Para cadastro acesse o módulo "Cartão de Ponto" no menu: "Cadastros" > "Parâmetros de Cartão de Ponto".

Na aba "Cadastro" preenchas os campos abaixo:

- **"Rede:"** selecione a rede da sua empresa;
- **"Empresa:"** selecione a loja. Caso a empresa possua mais de uma loja, será necessário cadastrar um parâmetro individualmente para cada filial;
- Na opção **"Tolerância"**, informe a tolerância permitida com atrasos, informando no campo "Entrada", no campo "Saída" e para o "Limite de Min Intervalo";
- **"Utiliza Banco de Horas:"** marque esta opção caso a empresa utiliza banco de horas. Se marcado como "Sim", preencha os seguintes campos:
- **"Lim. Meses Compensação:"** informe a quantidade máxima de meses em que o funcionário pode compensar as horas acumuladas;
- **"Lim. Horas/Dia vão BH:"** informe o limite de horas por dia que o funcionário pode registrar no banco de horas;
- **"Separa hora extra domingo e feriados:"** separar as horas extras de domingo e feriados dos demais dias;

> **Observação:** caso a empresa opte por trabalhar com banco de horas, é necessário ativar esta opção. Caso contrário, as horas extras serão registradas diretamente na folha de pagamento.

- **"Acumulo:"** horas negativa no BH: se tiver marcado, acumula as horas negativas no banco de horas;
- **"Lançamento Detalhado:"** verificar com fernando
- **"Usar Totalizadores:"**
- **"Lançamento Extenso:"**
- **"Grava ocorrência na alteração do ponto:"** ao marcar esta opção, todas as alterações realizadas serão registradas como ocorrências e exibidas no relatório "Espelho de Ponto Eletrônico".

> *Figura x — Aba cadastro*

Continue o cadastro na aba **"Horas/Percent."**, preenchas os campos:

- **"Tipo do Dia:"** selecione o tipo de dia correspondente "dia normal", "DSR" (Descanso semanal remunerado) ou "feriado", conforme o caso. Para cada tipo de dia, é possível definir uma faixa de horas a ser cumprida pelo funcionário;
- **"Faixa Inicial:"** faixa inicial de horas;
- **"Faixa Final:"** faixa final de horas;
- **"Percentual:"** percentual sobre o tipo de dia.

Após preencher, clique no botão seta azul para inserir os dados.

Continue o cadastro na aba **"Motivos"**.

Nesta aba encontram-se os cadastros dos motivos de registro do ponto. Estes parâmetros que definem como os dados serão tratados para efeito de cálculos como horas extras, folgas, intervalos para almoço, entre outros. Exemplo: as horas extras serão creditadas no banco de horas ou o adicional noturno será lançado como crédito na folha de pagamento.

Essas e outras configurações foram previamente definidas na interface "Motivo Cartão de Ponto — Id: 2139".

Se tiver dúvida para preencher algum parâmetro dos motivos, consulte as configurações previamente cadastrados no caminho "Cadastro" > "Motivo" > "Cartão de Ponto" > Formulário "Motivo Cartão de Ponto Id — 2139".

O usuário tem acesso para validar as configurações, podendo haver diferentes cadastros para cada loja.

É importante que os dados dos parâmetros estejam lançados corretamente para que a importação no sistema ocorra sem problemas.

As informações referente aos totalizadores dos motivos do cartão de ponto podem ser visualizadas no formulários "Digitação do Cartão de Ponto — Id: 3651".

#### 4.1.4 Formulário "Cadastro de Funcionários — Id: 1102"

Neste formulário "Cadastro de Funcionários — Id: 1102, verifique se os campos **"Horário"**, **"Cargo"** e **"Escala"** foram preenchidos. Esses campos são obrigatórios para a importação dos dados de ponto.

Para cadastro acesse o módulo "Cartão de Ponto", menu "Cadastros" > "Funcionários". Pesquise pelo funcionário desejado, na aba "Cadastro", informe o horário e o cargo correspondente.

Na aba "Competência" preencha o campo "Escala". Confirme para salvar o cadastro.

Em caso de dúvidas sobre o cadastro de funcionário, entre em contato com a equipe de suporte.

#### 4.1.5 Importação de Dados do Ponto

Antes de iniciar a importação, certifique-se de que o arquivo do sistema do ponto foi salvo corretamente em uma pasta compartilhada para garantir o correto reconhecimento pelo sistema.

Para importação dos registros, acesse o módulo "Cartão de Ponto", menu "Ferramentas" > "Importar Cartão de Ponto".

No formulários "Importação Cartão de Ponto — Id: 3985, preencha os campos:

- **"Rede:"** este local selecione a rede a qual a loja pertence;
- **"Empresa:"** selecione a loja desejada;
- **"Funcionário:"** selecione um, se desejar importar as batidas de um único funcionário ou deixe em branco para aplicar a todos;
- **"Período:"** neste campo informe a data ou intervalo de datas referente às batidas que deseja importar. Pode ser um único dia ou um período;
- **"Caminho:"** informe o arquivo gerado pelo relógio de ponto e busque o arquivo de ponto a ser importado. Observação: o arquivo deve estar salvo em uma pasta compartilhada acessível para que o sistema Director possa localizá-lo.
- **"Layout:"** selecione a opção de acordo com tipo de relógio de ponto eletrônico que está exportando o arquivo.

> **Atenção:** ao realizar a importação pela primeira vez, deixe a opção **"Sobrescrever" desmarcada**. Para importações seguintes, marque essa opção.

Após confirmar o cadastro, o sistema exibe uma mensagem informando que a importação foi um sucesso.

Em seguida, caso tenha algum registro com inconsistência, será gerado um arquivo contendo uma página de log com as informações da importação.

**Importante:** caso o registro contenha as 8 batidas de ponto, essa informação também será registrada no log.

O próximo passo é analisar estas ocorrências e caso necessário ajustar no formulário "Digitação do Cartão de Ponto — Id: 3651".

### 4.2 Digitação e Ajuste das ocorrências

#### 4.2.1 Ajuste das ocorrências

No formulário "Digitação do Cartão de Ponto — Id: 3651" serão tratadas as ocorrências encontradas ao final da importação do ponto. Análise cuidadosamente se os dados de cada período estão completos, verificando os horários de entrada e saída e confirme se os campos "Dia", "Motivo" e o "Tipo do dia" por exemplo estão corretos.

Para ajustes das ocorrências:

1. Selecione o **Mês e o Ano** (1) no canto superior direito do formulário;
2. Selecione o **Funcionário** desejado (2);
3. Na grade (4) selecione a data da ocorrência desejada, clique no **"X"** (3);
4. Nos campos correspondentes aos Períodos, ajuste o horário (4);
5. Clique no botão **"incluir"** (5) para inserir o registro e em seguida será exibido o formulário "Ocorrência na alteração do ponto — Id 4791".

No formulário "Ocorrência na alteração do ponto — Id: 4791", informe o motivo que justifique a alteração realizada — Essa informação ficará registrada e pode ser consultada posteriormente no relatório espelho de ponto eletrônico, utilizado para informações dedicadas a fiscalização.

Prossiga preenchendo os campos:

- **"Fonte de Marcação:"** escolha uma das opções referente a marcação do ponto
- **"Período:"** qual período refere-se ao registro de horas desta ocorrência
- **"Exclusão de excesso de batidas":** marque se for o caso
- **"Observação:"** digite uma justificativa. Esta observação é exibida no relatório

Após preencher os dados, clique em "Confirmar". Logo abaixo, na grade, o sistema exibirá o lançamento realizado.

> **Atenção:**
>
> - O registro das alterações de ocorrências é obrigatória para que haja controle das modificações realizadas nos registros do ponto do funcionário. A fiscalização exige o registro das alterações realizadas nos registros de ponto.
> - A exibição da interface de ocorrência é configurável. Caso a empresa opte por não exibir este formulário, essa preferência deve ser ajustada no cadastro de parâmetro (Parâmetros Cartão de Ponto — Id: 3650).

#### 4.2.2 Ajuste de 8 ocorrências de ponto

O sistema permite a digitação de 8 ocorrências de ponto, além das 4 atualmente disponíveis. A inclusão pode ser feita no formulário "Digitação do Cartão de Ponto".

Lembrando de utilizar o formato de registro adotado pela sua loja (4 ocorrências ou 8 ocorrências).

#### 4.2.3 Inclusão de registro de ponto manual

Esse formulário tem a possibilidade de lançar manualmente as marcações do ponto do empregado.

Para lançamento, acesse o menu "Movimentações" > "Digitação do Cartão de Ponto":

No formulário "Digitação do Cartão de Ponto Id: 3651", preencha os campos:

- **"Rede:"** selecione a rede;
- **"Empresa:"** informe a loja;
- **"Funcionário:"** indique o nome do funcionário;
- **"Mês/Ano:"** informe o mês e ano da ocorrência. Clique no botão "Confirmar".
- **"Dia:"** informe o dia do lançamento do ponto;
- **"Tipo do Dia:"** selecione o tipo de dia como por exemplo DSR (Descanso semanal remunerado), feriado, dia normal, entre outros.
- **"Motivo:"** selecione, neste campo, o motivo correspondente, como hora normal, ajuste, almoço devedor, horas extra entre outros.
- **"Período:"** preencha os campos com os horário correspondente ao período, podendo registrar até 8 batidas de ponto.

O formulário "Ocorrência na alteração do ponto — Id: 4791" será aberto na inclusão do registro. Basta fechar a tela para cancelar e confirmar o cadastro.

Conhecendo alguns recursos do formulário:

- Se o cadastrado estiver correto, o formulário trará automaticamente o horário do funcionário;
- Para inserir, editar ou excluir um período, utilize os botões localizados à direita da interface;
- Para navegar entre os períodos utilize as setas << >>;
- Para repetir o horário nos demais dias, selecione a opção **"Ult. Lcto até"** e informe até qual dia o horário deve ser replicado. Este recurso é útil, por exemplo, quando o funcionário registra o ponto até um dia e entra de férias a partir desta data.

**Importante:** a importação das batidas sempre sobrescreve os registros inseridos manualmente.

### 4.3 Exclusão das batidas do ponto

No módulo "Cartão de Ponto", acesse o menu: "Movimentações" > "Exclusão de Batidas".

No formulário "Excluir Ponto — Id: 4533", preencha os campos, incluindo o período desejado. Utilize o botão "+" para selecionar mais de um funcionário para o mesmo período.

### 4.4 Fechamento do Ponto

No módulo "Cartão de Ponto" > menu "Movimentações" > "Apuração de Horas Extras/Fechamento Mensal".

Nesta etapa são apurados os dados registrados no formulário "Digitação do Cartão de Ponto — Id 3651", considerando lançamentos como faltas, horas extras, adicional noturno, entre outros.

#### 4.4.1 Para iniciar o fechamento apurando as horas do mês

Acesse a aba "Apuração", informe o Mês e o Ano e clique no botão "Apurar Horas". Neste momento o sistema faz a leitura do ponto, verificando se tem horas extra para pagar, adicional noturno, faltas entre outros. O resultado será exibido na grade. Em nosso exemplo, identificou que o funcionário possui um total de 14h00 em falta, que será descontado na folha de pagamento.

Se tiver tudo ok, passe para aba "Fechamento", clique no botão "Fechamento Mensal".

Essas informações serão utilizadas para cálculo da folha de pagamento do funcionário. Caso haja necessidade descontar, ele será feito de forma automática, considerando as configurações do parâmetro.

Se for necessário corrigir algum dado, a correção deve ser feita antes do fechamento da folha.

Caso haja batidas faltando e o usuário tente realizar o fechamento, o sistema exibe uma mensagem de alerta e o fechamento não será permitido até que o ajuste seja realizado.

Caso o registro de ponto não seja integrado, é possível exportar o arquivo para o fechamento da folha — Para isso importe o arquivo na aba "Fechamento".

### 4.5 Visualização de batidas registradas (Relatório)

A seguir estão listados os relatórios disponíveis para visualização das batidas registradas no sistema. Cada relatório pode ser acessado por meio do módulo "Cartão de Ponto" no menu "Relatórios", conforme indicado abaixo:

| Relatório | Caminho | Observação |
|---|---|---|
| Relatório do Cartão de Ponto — Id 3654 | Relatórios > Cartão de Ponto | Visualização detalhada das batidas. Exibe horas extras, inconsistências. |
| Relatório Cartão de Ponto Calculado — Id 2134 | Relatório > Cartão de Ponto Calculado | Ideal para o funcionário. |
| Espelho do Ponto Eletrônico — Id 4796 | Relatório > Espelho do Ponto Eletrônico | Detalhes das horas trabalhadas, folga, horas extras e histórico de banco de horas. Ideal para fiscalização. Exibe a jornada realizada pelo funcionário no ponto e os ajustes realizados no Director. Inclui as 8 batidas. |
| Relatório Histórico de Banco de Horas — Id 3857 | Relatório > Histórico de Banco de Horas | Verificar o saldo do banco de horas. |
| Registro de Ponto Detalhado — Id: 4800 | Relatórios > Registro de Ponto Detalhado | Ponto detalhado. Exibe total de horas. |
| Relação de Horas — Id 3859 | Relatório > Relação de Horas | Relação tipo de hora analítico ou sintético. |
| Relatório Importação Ponto — Id 4578 | Relatório > Importação Ponto | Espelho do ponto original. |
| Relatório de Banco de Horas Acumulado — Id 3856 | Relatório > Banco de Horas Acumulado | Relatório de horas acumuladas. |
