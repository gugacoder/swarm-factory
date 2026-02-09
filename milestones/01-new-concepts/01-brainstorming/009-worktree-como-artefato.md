# Worktree como Artefato Declarado

## Decisão

O worktree passa a ser um artefato declarado no `session_template` do project.json:

```jsonc
"session_template": {
  "pattern": "./.sessions/{feature-id}/",
  "files": [
    "checklist.md",
    "output.jsonl",
    "pid",
    "started_at",
    "finished_at"
  ],
  "dirs": [
    "worktree"
  ]
}
```

## Possibilidade: preview isolado por sessão

Como o worktree é isolado por feature e declarado no manifesto, a ferramenta de monitoramento pode rodar o app daquela sessão para o usuário testar. Cada feature em desenvolvimento tem seu próprio ambiente executável — o monitor sabe onde está o worktree, pode subir o dev server de lá, e o usuário testa a feature em andamento sem interferir no workspace principal.
