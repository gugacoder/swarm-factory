import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const COMMANDS_DIR = join(import.meta.dirname, '..', '..', '.claude', 'commands', 'run');
let pass = 0;
let fail = 0;

function assert(condition, msg) {
  if (condition) { pass++; console.log(`  ✅ ${msg}`); }
  else { fail++; console.log(`  ❌ ${msg}`); }
}

// Ler todos os commands
const create = await readFile(join(COMMANDS_DIR, 'create.md'), 'utf8');
const setup = await readFile(join(COMMANDS_DIR, 'setup.md'), 'utf8');
const code = await readFile(join(COMMANDS_DIR, 'code.md'), 'utf8');
const loop = await readFile(join(COMMANDS_DIR, 'loop.md'), 'utf8');
const status = await readFile(join(COMMANDS_DIR, 'status.md'), 'utf8');

console.log('T01 — create.md reescrito como thin wrapper que invoca create-project.mjs');
assert(create.includes('create-project.mjs'), 'Invoca create-project.mjs');
assert(create.includes('--slug'), 'Aceita --slug');
assert(create.includes('--name'), 'Aceita --name');
assert(!create.includes('mkdir -p'), 'Não reimplementa mkdir');
assert(!create.includes('cp -r'), 'Não reimplementa cp');

console.log('T02 — setup.md reescrito: invoca init-workspace.mjs + /vibe:initialize');
assert(setup.includes('init-workspace.mjs'), 'Invoca init-workspace.mjs');
assert(setup.includes('initialize.md') || setup.includes('vibe:initialize'), 'Referencia initializer');
assert(setup.includes('claude -p'), 'Spawna claude para initializer');

console.log('T03 — code.md reescrito: invoca agent-harness.mjs com MAX_FEATURES=1');
assert(code.includes('agent-harness.mjs'), 'Invoca agent-harness.mjs');
assert(code.includes('MAX_FEATURES=1'), 'Usa MAX_FEATURES=1');
assert(!code.includes('claude -p'), 'Não spawna claude diretamente');

console.log('T04 — loop.md reescrito: invoca agent-harness.mjs sem limite');
assert(loop.includes('agent-harness.mjs'), 'Invoca agent-harness.mjs');
assert(!loop.includes('MAX_FEATURES=1'), 'Não limita a 1 feature');
assert(loop.includes('.stop'), 'Documenta graceful stop');

console.log('T05 — status.md reescrito: invoca get-status.mjs ou list-projects.mjs');
assert(status.includes('get-status.mjs'), 'Invoca get-status.mjs');
assert(status.includes('list-projects.mjs'), 'Invoca list-projects.mjs');

console.log('T06 — Cada command tem no máximo ~30 linhas de markdown');
const lines = { create: create.split('\n').length, setup: setup.split('\n').length, code: code.split('\n').length, loop: loop.split('\n').length, status: status.split('\n').length };
for (const [name, count] of Object.entries(lines)) {
  assert(count <= 35, `${name}.md: ${count} linhas (<= 35)`);
}

console.log('T07 — Nenhum command reimplementa lógica — apenas coleta params e invoca API');
const all = [create, setup, code, loop, status];
const allNames = ['create', 'setup', 'code', 'loop', 'status'];
for (let i = 0; i < all.length; i++) {
  const content = all[i];
  assert(!content.includes('readFile') && !content.includes('writeFile'), `${allNames[i]}.md: sem fs operations`);
  assert(!content.includes('JSON.parse') && !content.includes('JSON.stringify'), `${allNames[i]}.md: sem JSON parsing`);
}

console.log(`\n${pass}/${pass + fail} testes passing`);
if (fail > 0) process.exit(1);
