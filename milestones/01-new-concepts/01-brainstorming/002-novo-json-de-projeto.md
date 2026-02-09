# Novo JSON de Projeto (Runs)

## Problema atual

O JSON atual é pouco específico — parece um registro de banco de dados. Campos genéricos como `project`, `milestone`, `location` que não comunicam o que são sem ler documentação. Além disso, tem acoplamento com a estrutura interna da fábrica (`projects/{project}/{milestone}/`) e carrega o conceito de scaffold, que não pertence ao Runs.

## Princípios do novo formato

- **Portável**: o JSON carrega sua identidade (slug, name, description). Se sai do filesystem e vai pra uma API, não perde significado.
- **Auto-descritivo**: quem abre o arquivo entende tudo sem ler docs.
- **Manifesto completo**: declara todos os artefatos do projeto — o que existe, onde está, se é arquivo ou diretório.
- **Sem scaffold**: Runs é completamente alheio ao conceito de scaffolds.
- **Versionado**: o campo `version` define quais artefatos existem. Artefatos gerados carregam a versão dentro deles.

## Resolução de paths

Regra única e consistente pra todo o JSON:
- **Relativo** (`./` ou `../`) → resolve a partir do `workspace`
- **Absoluto** → usa direto

Isso vale pra `specs` e pra cada path dentro de `artifacts`.

## Dois formatos de arquivo suportados

1. `runs/{project}_{milestone}.json` — flat, user-friendly, pra projetos avulsos criados manualmente
2. `runs/{project}/{milestone}/project.json` — structured, padrão, escolha do `/runs:create`

Ambos produzem o mesmo objeto em memória. A diferença é organização no filesystem.

## Estrutura do JSON

```jsonc
{
  "version": 1,
  "slug": "agiliza_01-mvp",
  "name": "Agiliza — MVP",
  "description": "Primeiro worker agêntico do Agiliza",

  "specs": "./milestones/01-mvp",
  "workspace": "D:\\sources\\codr.studio\\agiliza",

  "agent": {
    "harness": "claude-code",
    "model": null,
    "max_turns": 50,
    "max_iterations": null
  },

  "artifacts": {
    "features":       { "type": "file", "path": "./features.json" },
    "progress":       { "type": "file", "path": "./agent-progress.txt" },
    "harness_script": { "type": "file", "path": "./agent-harness.sh" },
    "sessions":       { "type": "dir",  "path": "./.sessions" }
  }
}
```

## Campos

- **slug**: identificador machine-friendly. Chave pra APIs, dashboards, logs. Elimina parsing de path.
- **name**: nome humano do projeto.
- **description**: opcional. Contexto sobre o que é o projeto.
- **specs**: de onde vêm os requisitos (specs, PRPs, refs). Relativo ao workspace ou absoluto.
- **workspace**: onde o código é desenvolvido. Sempre absoluto.
- **agent**: como o agente se comporta (harness, modelo, limites).
- **artifacts**: artefatos do projeto, declarados pelo sistema com base na versão. Não customizável pelo usuário (quais artefatos existem é definido pela versão), mas os paths podem variar.

## Artifacts

Artefatos não são customizáveis — a versão define quais existem. Mas estão declarados explicitamente no JSON pra que qualquer leitor saiba o que existe e onde. Os paths seguem a mesma regra de resolução (relativo ao workspace ou absoluto), permitindo que em projetos onde não se pode escrever na raiz do workspace, os artefatos sejam redirecionados.

## Comandos devem respeitar o JSON

Todos os comandos do sistema devem ler os paths declarados no JSON em vez de assumir paths hardcoded. O `project.json` é a fonte da verdade.
