import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';

let pass = 0;
let fail = 0;
const total = 7;

function ok(n, msg) { pass++; console.log(`PASS: T${n} - ${msg}`); }
function nok(n, msg, err) { fail++; console.log(`FAIL: T${n} - ${msg}\n  ${err}`); }

// --- Setup: criar filesystem temporário ---
const tmp = await mkdtemp(join(tmpdir(), 'discovery-test-'));
const runsDir = join(tmp, 'runs');
await mkdir(runsDir);
await mkdir(join(runsDir, '.meta'));
await mkdir(join(runsDir, 'workspaces'));

// Flat: runs/myapp.json
await writeFile(join(runsDir, 'myapp.json'), JSON.stringify({
  version: 1, slug: 'myapp', name: 'My App',
  workspace: '/tmp/myapp', specs: './specs'
}));

// Flat: runs/other.json
await writeFile(join(runsDir, 'other.json'), JSON.stringify({
  version: 1, slug: 'other', name: 'Other',
  workspace: '/tmp/other', specs: './specs'
}));

// .meta deve ser ignorado — colocar um .json lá dentro
await writeFile(join(runsDir, '.meta', 'run.schema.json'), '{}');

// Structured: runs/gestao/01-mvp/project.json
await mkdir(join(runsDir, 'gestao'));
await mkdir(join(runsDir, 'gestao', '01-mvp'));
await writeFile(join(runsDir, 'gestao', '01-mvp', 'project.json'), JSON.stringify({
  version: 1, slug: 'gestao', name: 'Gestão',
  workspace: '/tmp/gestao', specs: './specs'
}));

// Structured: runs/acme/project.json (direto no subdir)
await mkdir(join(runsDir, 'acme'));
await writeFile(join(runsDir, 'acme', 'project.json'), JSON.stringify({
  version: 1, slug: 'acme', name: 'Acme Corp',
  workspace: '/tmp/acme', specs: './specs'
}));

// --- Import ---
const { discoverProjects, resolveProjectPath } = await import('../../runs/.meta/lib/discovery.mjs');

// --- T1: Existe e exporta funções ---
try {
  if (typeof discoverProjects === 'function' && typeof resolveProjectPath === 'function') {
    ok(1, 'discovery.mjs existe e exporta discoverProjects, resolveProjectPath');
  } else {
    nok(1, 'discovery.mjs existe e exporta discoverProjects, resolveProjectPath', 'exports missing');
  }
} catch (e) { nok(1, 'discovery.mjs existe e exporta discoverProjects, resolveProjectPath', e.message); }

// --- T2: discoverProjects retorna array com ambos os formatos ---
try {
  const results = await discoverProjects(runsDir);
  const formats = new Set(results.map(r => r.format));
  const hasBoth = formats.has('flat') && formats.has('structured');
  const allHavePath = results.every(r => typeof r.path === 'string' && r.path.length > 0);
  if (hasBoth && allHavePath && results.length >= 4) {
    ok(2, 'discoverProjects retorna array de { path, format } para ambos os formatos');
  } else {
    nok(2, 'discoverProjects retorna array de { path, format } para ambos os formatos',
      `formats=${[...formats].join(',')}, count=${results.length}, allHavePath=${allHavePath}`);
  }
} catch (e) { nok(2, 'discoverProjects retorna array de { path, format } para ambos os formatos', e.message); }

// --- T3: Formato flat detecta .json na raiz, excluindo .meta/ e workspaces/ ---
try {
  const results = await discoverProjects(runsDir);
  const flat = results.filter(r => r.format === 'flat');
  const names = flat.map(r => {
    const parts = r.path.split(sep);
    return parts[parts.length - 1];
  });
  const hasMyapp = names.includes('myapp.json');
  const hasOther = names.includes('other.json');
  const noSchema = !names.includes('run.schema.json');
  if (hasMyapp && hasOther && noSchema && flat.length === 2) {
    ok(3, 'Formato flat: detecta arquivos .json na raiz de runs/ (exceto .meta/ e workspaces/)');
  } else {
    nok(3, 'Formato flat: detecta arquivos .json na raiz de runs/ (exceto .meta/ e workspaces/)',
      `names=${names.join(',')}, count=${flat.length}`);
  }
} catch (e) { nok(3, 'Formato flat: detecta arquivos .json na raiz de runs/ (exceto .meta/ e workspaces/)', e.message); }

// --- T4: Formato structured detecta project.json em subdiretórios ---
try {
  const results = await discoverProjects(runsDir);
  const structured = results.filter(r => r.format === 'structured');
  const hasPaths = structured.every(r => r.path.endsWith('project.json'));
  if (structured.length === 2 && hasPaths) {
    ok(4, 'Formato structured: detecta project.json dentro de subdiretórios de runs/');
  } else {
    nok(4, 'Formato structured: detecta project.json dentro de subdiretórios de runs/',
      `count=${structured.length}, hasPaths=${hasPaths}`);
  }
} catch (e) { nok(4, 'Formato structured: detecta project.json dentro de subdiretórios de runs/', e.message); }

// --- T5: resolveProjectPath encontra path por slug ---
try {
  const path = await resolveProjectPath(runsDir, 'myapp');
  if (path && path.endsWith('myapp.json')) {
    ok(5, 'resolveProjectPath encontra path por slug');
  } else {
    nok(5, 'resolveProjectPath encontra path por slug', `got: ${path}`);
  }
} catch (e) { nok(5, 'resolveProjectPath encontra path por slug', e.message); }

// --- T6: resolveProjectPath retorna null se slug não encontrado ---
try {
  const path = await resolveProjectPath(runsDir, 'nao-existe');
  if (path === null) {
    ok(6, 'resolveProjectPath retorna null se slug não encontrado');
  } else {
    nok(6, 'resolveProjectPath retorna null se slug não encontrado', `got: ${path}`);
  }
} catch (e) { nok(6, 'resolveProjectPath retorna null se slug não encontrado', e.message); }

// --- T7: Usa apenas node: built-ins ---
try {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../../runs/.meta/lib/discovery.mjs', import.meta.url), 'utf8');
  const imports = src.match(/from\s+['"]([^'"]+)['"]/g) || [];
  const allNode = imports.every(i => i.includes("'node:") || i.includes('"node:'));
  if (allNode && imports.length > 0) {
    ok(7, 'Usa apenas node: built-ins (node:fs/promises, node:path)');
  } else {
    nok(7, 'Usa apenas node: built-ins (node:fs/promises, node:path)', `imports=${imports.join(', ')}`);
  }
} catch (e) { nok(7, 'Usa apenas node: built-ins (node:fs/promises, node:path)', e.message); }

// --- Cleanup ---
await rm(tmp, { recursive: true, force: true });

// --- Resultado ---
console.log(`\n=== Resultado: ${pass}/${total} PASS, ${fail}/${total} FAIL ===`);
process.exit(fail > 0 ? 1 : 0);
