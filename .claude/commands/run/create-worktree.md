Cria um git worktree isolado para um milestone, com run config e .harness/ prontos.

## Argumentos: $ARGUMENTS

## Instruções

1. Identifique os parâmetros necessários (via $ARGUMENTS ou pergunte ao usuário):
   - `target`: path do repositório principal (obrigatório)
   - `milestone`: nome do milestone (obrigatório, ex: `08-precificacao`)
   - `harness`: agente a usar (default: `claude-code`)
   - `force`: ignorar working tree suja (default: false)
   - `project`: nome do projeto (default: derivado do target)
   - `specs`: path para specs (default: `milestones/{milestone}`)

2. Valide que o target é um repositório git:
   ```bash
   cd {target} && git rev-parse --git-dir
   ```

3. Verifique working tree (a menos que --force):
   ```bash
   cd {target} && git status --porcelain
   ```

4. Execute a API:
   ```bash
   node runs/.meta/api/create-worktree.mjs \
     --target {target} \
     --milestone {milestone} \
     --harness {harness}
   ```

5. Após sucesso, ofereça ao usuário:
   - Executar o initializer: `/run:setup {slug}`
   - Iniciar o loop: `/run:loop {slug}`

## Resultado

A API cria:
1. Git worktree em `{target}/../{project}-{milestone}` na branch `milestone/{milestone}`
2. Run config em `runs/{slug}.json`
3. Estrutura `.harness/` no worktree com:
   - `.harness/scripts/` — loop.mjs, run.mjs, init.mjs
   - `.harness/prompt.md` — prompt do coder agent
   - `.harness/{milestone}/config.json` — config da session
   - `.harness/{milestone}/runs/` — dir para feature runs
   - `.harness/active` — milestone ativo

## Notas

- Toda a lógica está em `runs/.meta/api/create-worktree.mjs`
- O worktree permite trabalhar no milestone sem afetar a branch principal
- Em caso de erro, mostre a mensagem da API ao usuário
