import { resolvePath, resolveArtifacts, normalizeSlashes } from '../../runs/.meta/lib/paths.mjs';
import { sep } from 'node:path';

let pass = 0;
let fail = 0;

function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS:', name); }
  else { fail++; console.log('FAIL:', name, detail || ''); }
}

const TOTAL = 7;

// T1: paths.mjs existe e exporta resolvePath, resolveArtifacts, normalizeSlashes
check('T1 - paths.mjs exporta resolvePath, resolveArtifacts, normalizeSlashes',
  typeof resolvePath === 'function' && typeof resolveArtifacts === 'function' && typeof normalizeSlashes === 'function');

// T2: resolvePath('D:\\sources\\app', './features.json') retorna path correto
{
  const result = resolvePath('D:\\sources\\app', './features.json');
  const expected = sep === '\\' ? 'D:\\sources\\app\\features.json' : 'D:/sources/app/features.json';
  // Em plataforma Unix, resolve com basePath Windows gera caminho relativo ao cwd.
  // O contrato é: resolve relativo a basePath. Testar com path nativo.
  const nativeResult = resolvePath(
    sep === '\\' ? 'D:\\sources\\app' : '/home/user/app',
    './features.json'
  );
  const nativeExpected = sep === '\\' ? 'D:\\sources\\app\\features.json' : '/home/user/app/features.json';
  check('T2 - resolvePath com path relativo ./',
    nativeResult === nativeExpected,
    `got: ${nativeResult}, expected: ${nativeExpected}`);
}

// T3: resolvePath('D:\\sources\\app', 'D:\\specs\\mvp') retorna absoluto direto
{
  const absPath = sep === '\\' ? 'D:\\specs\\mvp' : '/specs/mvp';
  const result = resolvePath('D:\\sources\\app', absPath);
  check('T3 - resolvePath com path absoluto retorna direto',
    result === absPath,
    `got: ${result}, expected: ${absPath}`);
}

// T4: resolvePath com ../ resolve corretamente
{
  const basePath = sep === '\\' ? 'D:\\sources\\project' : '/home/user/project';
  const result = resolvePath(basePath, '../shared/specs');
  const expected = sep === '\\' ? 'D:\\sources\\shared\\specs' : '/home/user/shared/specs';
  check('T4 - resolvePath com ../ resolve corretamente',
    result === expected,
    `got: ${result}, expected: ${expected}`);
}

// T5: resolveArtifacts resolve todos os paths de artefatos
{
  const workspace = sep === '\\' ? 'D:\\sources\\app' : '/home/user/app';
  const artifacts = {
    harness_config: { type: 'file', path: './agent-harness.json' },
    harness_script: { type: 'file', path: './agent-harness.mjs' },
    features: { type: 'file', path: './features.json' },
    sessions: { type: 'dir', path: './.sessions' },
  };
  const resolved = resolveArtifacts(workspace, artifacts);
  const expectedConfig = sep === '\\' ? 'D:\\sources\\app\\agent-harness.json' : '/home/user/app/agent-harness.json';
  const expectedSessions = sep === '\\' ? 'D:\\sources\\app\\.sessions' : '/home/user/app/.sessions';
  check('T5 - resolveArtifacts resolve todos os paths',
    resolved.harness_config === expectedConfig && resolved.sessions === expectedSessions,
    `config: ${resolved.harness_config}, sessions: ${resolved.sessions}`);
}

// T6: normalizeSlashes funciona para separadores Windows e Linux
{
  if (sep === '\\') {
    const result = normalizeSlashes('D:/sources/app/features.json');
    check('T6 - normalizeSlashes converte para separador do SO',
      result === 'D:\\sources\\app\\features.json',
      `got: ${result}`);
  } else {
    const result = normalizeSlashes('D:\\sources\\app\\features.json');
    check('T6 - normalizeSlashes converte para separador do SO',
      result === 'D:/sources/app/features.json',
      `got: ${result}`);
  }
}

// T7: Usa apenas node: built-ins (verificar import)
{
  const { readFile } = await import('node:fs/promises');
  const code = await readFile(new URL('../../runs/.meta/lib/paths.mjs', import.meta.url), 'utf8');
  const hasNodePath = code.includes("'node:path'") || code.includes('"node:path"');
  const hasExternalImport = /from\s+['"](?!node:)[^.\/]/.test(code);
  check('T7 - Usa apenas node: built-ins (node:path)',
    hasNodePath && !hasExternalImport,
    `hasNodePath: ${hasNodePath}, hasExternalImport: ${hasExternalImport}`);
}

console.log('');
console.log(`=== Resultado: ${pass}/${TOTAL} PASS, ${fail}/${TOTAL} FAIL ===`);
if (fail > 0) process.exit(1);
