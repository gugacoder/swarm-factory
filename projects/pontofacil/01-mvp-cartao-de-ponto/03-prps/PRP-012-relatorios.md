# PRP-012 — Relatórios

## Objetivo

Implementar todos os relatórios do módulo Cartão de Ponto: Cartão Calculado, Banco de Horas Acumulado, Inconsistências, Espelho, Funcionários por Empresa, Gestores, Detalhado de Ponto, Histórico BH, Motivo do Cartão, Totalizador de Horas e Importação.

## Execution Mode

`implementar`

## Contexto

Todos os dados operacionais já existem nas tabelas criadas nos PRPs anteriores. PRP-010 implementou apuração e fechamento. PRP-009 implementou importação e motor de cálculo.

Decisão de design:
- DES015 — Padrão Report Viewer: filtros + barra de progresso + resultado paginado + impressão CSS + exportação CSV
- DES016 — Substituição de Crystal Reports do legado por renderização web nativa

## Especificação

### Padrão base para todos os relatórios

Cada relatório segue o padrão DES015:

1. **Tela com filtros**: filtro hierárquico (DES013) + período + opções específicas
2. **Barra de progresso** durante geração (NFR002)
3. **Resultado em tabela paginada**
4. **Botão imprimir** via CSS `@media print`
5. **Botão exportar CSV**
6. **API Route**: `/api/ponto/relatorios/{nome}` com query params de filtros

Filtros hierárquicos padrão (a menos que especificado): Rede → Empresa → Centro de Custo → Funcionário

### Relatórios individuais

#### 1. Cartão de Ponto Calculado (REQ230)
- **Rota**: `/ponto/relatorios/cartao-calculado`
- **Filtros adicionais**: Competência MM/yyyy, opções (omitir saldo diário, histórico BH, somente resumo)
- **Modos**: Detalhado (lançamentos individuais, saldos diários) / Totalizador (múltiplas batidas, totais mensais)
- **Conteúdo**: horas trabalhadas, saldo diário, totais por tipo, saldo BH

#### 2. Banco de Horas Acumulado (REQ231)
- **Rota**: `/ponto/relatorios/banco-horas-acumulado`
- **Filtros adicionais**: Gestor, Período (mês/ano início e fim), excluir demitidos
- **Modos**: Banco de Horas (saldos, registros não quitados) / Cartão de Ponto (crédito/débito por motivo)
- **Conteúdo**: horas extras (crédito), faltosas (débito), saldo, horas a pagar

#### 3. Inconsistências do Cartão (REQ232)
- **Rota**: `/ponto/relatorios/inconsistencias`
- **Filtros adicionais**: Competência, ordem (alfabética/numérica), "A partir de"
- **Conteúdo**: faltas não justificadas, atrasos, saídas antecipadas, HE não autorizadas, sobreposição de turnos
- **Formato**: dois cartões por página (REQ232)

#### 4. Espelho do Cartão de Ponto (REQ233)
- **Rota**: `/ponto/relatorios/espelho`
- **Filtros adicionais**: Competência, ordem, "A partir de"
- **Formato para impressora**: empresa, CNPJ, endereço, funcionário, CTPS, matrícula, função, jornada, intervalo
- **Layout**: duas colunas por página (REQ233)

#### 5. Funcionários por Empresa (REQ234)
- **Rota**: `/ponto/relatorios/funcionarios-empresa`
- **Modos**: Analítico (lista detalhada) / Sintético (contagem)
- **Filtros adicionais**: Cargo, admitidos até (data), status (Afastados/Ativos/Demitidos/Somente Ativos), agrupamento (CC/Cargo/Nível CC), ordenação
- **Conteúdo modo analítico**: dados do funcionário por grupo
- **Conteúdo modo sintético**: contagem por grupo

#### 6. Gestores do Cartão de Ponto (REQ235)
- **Rota**: `/ponto/relatorios/gestores`
- **Filtros adicionais**: Gestor
- **Conteúdo**: gestores e funcionários subordinados, ordenados por empresa e matrícula

#### 7. Detalhado de Ponto (REQ236)
- **Rota**: `/ponto/relatorios/detalhado-ponto`
- **Filtros adicionais**: Período data início/fim (mesmo mês)
- **Conteúdo**: empresa, funcionário, matrícula, cargo, data, dia semana, turno, horários, intervalo, HE, faltas, normais, totais, saldo BH, observações

#### 8. Histórico de Banco de Horas (REQ237)
- **Rota**: `/ponto/relatorios/historico-banco-horas`
- **Filtros adicionais**: Período mês/ano de/até, agrupar por CC, excluir demitidos
- **Conteúdo**: saldos, horas extras, faltosas por funcionário no período

#### 9. Motivo do Cartão de Ponto (REQ238)
- **Rota**: `/ponto/relatorios/motivo-cartao`
- **Tipos**: Sintético (agrupado por motivo) / Analítico (por funcionário) / Indicador RH
- **Filtros adicionais**: Cargo, Motivo, agrupamento (CC/Cargo — mutuamente exclusivos)
- **Indicador RH**: turnover, absenteísmo (% horas absenteísmo / horas efetivas)

#### 10. Totalizador de Horas (REQ239)
- **Rota**: `/ponto/relatorios/totalizador-horas`
- **Filtros adicionais**: Período MM/AAAA, agrupar por CC
- **Modos**: Detalhado (batidas) / Totalizador (motivos)
- **Conteúdo**: empresa, CC, carga horária, total horas, nº funcionários

#### 11. Importação do Cartão de Ponto (REQ240)
- **Rota**: `/ponto/relatorios/importacao`
- **Filtros adicionais**: Período, caminho do arquivo
- **Conteúdo**: funcionário, data, data/hora, nome (processamento PIS+Data+Hora)

### Estrutura de código

```
app/src/
├── routes/ponto/relatorios/
│   ├── index.tsx                      # Índice com cards dos relatórios
│   ├── cartao-calculado.tsx
│   ├── banco-horas-acumulado.tsx
│   ├── inconsistencias.tsx
│   ├── espelho.tsx
│   ├── funcionarios-empresa.tsx
│   ├── gestores.tsx
│   ├── detalhado-ponto.tsx
│   ├── historico-banco-horas.tsx
│   ├── motivo-cartao.tsx
│   ├── totalizador-horas.tsx
│   └── importacao.tsx
└── components/
    └── relatorios/
        └── report-viewer.tsx          # Componente base reutilizável (DES015)

backbone/src/routes/ponto/relatorios/
├── cartao-calculado.ts
├── banco-horas-acumulado.ts
└── ... (1 route por relatório)
```

O componente `report-viewer.tsx` encapsula o padrão DES015: filtros → fetch → progresso → tabela → print → CSV.

## Limites

- Não implementar geração de PDF — renderização web com @media print é suficiente (DES015)
- Não implementar dashboard com gráficos a partir dos relatórios — apenas tabelas
- Não implementar cache de relatórios — gerar sob demanda
- Não implementar agendamento de relatórios
- Relatórios usam tabelas temporárias para otimização conforme NFR002 — implementar como CTEs (Common Table Expressions) no SQL, não como tabelas temporárias literais
- Não criar mais de 11 relatórios — apenas os listados nas specs
