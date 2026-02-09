import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const workspaceRoot = resolve(__dirname, '..', '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    console.log(`FAIL: ${name}`);
    console.log(`  → ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// T1 — Arquivo existe e exporta as 4 funções
const artifactsPath = resolve(workspaceRoot, 'runs', '.meta', 'lib', 'artifacts.mjs');
const mod = await import(`file://${artifactsPath.replace(/\\/g, '/')}`);

test('T1 - artifacts.mjs existe e exporta getDefaultArtifacts, getDefaultSessionTemplate, ensureArtifactDirs, readArtifact', () => {
  assert(existsSync(artifactsPath), 'artifacts.mjs não encontrado');
  assert(typeof mod.getDefaultArtifacts === 'function', 'getDefaultArtifacts não é função');
  assert(typeof mod.getDefaultSessionTemplate === 'function', 'getDefaultSessionTemplate não é função');
  assert(typeof mod.ensureArtifactDirs === 'function', 'ensureArtifactDirs não é função');
  assert(typeof mod.readArtifact === 'function', 'readArtifact não é função');
});

// T2 — getDefaultArtifacts(1) retorna os 9 artefatos v1
test('T2 - getDefaultArtifacts(1) retorna Record com todos os 9 artefatos da versão 1 conforme er.md', () => {
  const artifacts = mod.getDefaultArtifacts(1);
  const expectedKeys = [
    'harness_config', 'harness_script', 'setup_script',
    'features', 'progress', 'state', 'pid',
    'sessions', 'current_milestone'
  ];
  assert(Object.keys(artifacts).length === 9, `Esperado 9 artefatos, recebido ${Object.keys(artifacts).length}`);
  for (const key of expectedKeys) {
    assert(artifacts[key], `Artefato '${key}' ausente`);
    assert(artifacts[key].type === 'file' || artifacts[key].type === 'dir', `Tipo inválido para '${key}': ${artifacts[key].type}`);
    assert(typeof artifacts[key].path === 'string', `Path inválido para '${key}'`);
  }
  // Verificar paths específicos conforme er.md
  assert(artifacts.harness_config.path === './agent-harness.json', 'harness_config path incorreto');
  assert(artifacts.harness_script.path === './agent-harness.mjs', 'harness_script path incorreto');
  assert(artifacts.setup_script.path === './agent-setup.mjs', 'setup_script path incorreto');
  assert(artifacts.features.path === './features.json', 'features path incorreto');
  assert(artifacts.progress.path === './agent-progress.txt', 'progress path incorreto');
  assert(artifacts.state.path === './agent-harness.state', 'state path incorreto');
  assert(artifacts.pid.path === './agent-harness.pid', 'pid path incorreto');
  assert(artifacts.sessions.type === 'dir', 'sessions deve ser tipo dir');
  assert(artifacts.sessions.path === './.sessions', 'sessions path incorreto');
  assert(artifacts.current_milestone.path === './.sessions/.current-milestone', 'current_milestone path incorreto');
});

// T3 — getDefaultSessionTemplate(1) retorna template com worktree em dirs
test('T3 - getDefaultSessionTemplate(1) retorna { pattern, files, dirs } com worktree em dirs', () => {
  const template = mod.getDefaultSessionTemplate(1);
  assert(typeof template.pattern === 'string', 'pattern deve ser string');
  assert(template.pattern.includes('{feature-id}'), 'pattern deve conter {feature-id}');
  assert(Array.isArray(template.files), 'files deve ser array');
  assert(template.files.length > 0, 'files não pode ser vazio');
  assert(Array.isArray(template.dirs), 'dirs deve ser array');
  assert(template.dirs.includes('worktree'), 'dirs deve conter worktree');
  // Verificar arquivos conforme er.md
  const expectedFiles = ['checklist.md', 'output.jsonl', 'pid', 'started_at', 'finished_at'];
  for (const f of expectedFiles) {
    assert(template.files.includes(f), `files deve conter '${f}'`);
  }
});

// T4 — ensureArtifactDirs cria diretórios para artefatos tipo dir
const tmpWorkspace = join(tmpdir(), `test-artifacts-${Date.now()}`);
mkdirSync(tmpWorkspace, { recursive: true });

test('T4 - ensureArtifactDirs cria diretórios para artefatos do tipo dir', async () => {
  const artifacts = mod.getDefaultArtifacts(1);
  await mod.ensureArtifactDirs(tmpWorkspace, artifacts);
  // Verificar que .sessions foi criado
  const sessionsDir = resolve(tmpWorkspace, '.sessions');
  assert(existsSync(sessionsDir), '.sessions não foi criado');
});

// Aguardar T4 (async)
await new Promise(r => setTimeout(r, 100));

// T5 — readArtifact lê conteúdo e retorna null se não existir
test('T5 - readArtifact lê conteúdo de artefato file e retorna null se não existir', async () => {
  const artifacts = mod.getDefaultArtifacts(1);
  // Não existe — deve retornar null
  const missing = await mod.readArtifact(tmpWorkspace, artifacts, 'features');
  assert(missing === null, `Esperado null para artefato inexistente, recebido: ${missing}`);
  // Criar arquivo e ler
  const featuresPath = resolve(tmpWorkspace, 'features.json');
  writeFileSync(featuresPath, '[]', 'utf8');
  const content = await mod.readArtifact(tmpWorkspace, artifacts, 'features');
  assert(content === '[]', `Esperado '[]', recebido: ${content}`);
  // Chave inexistente — deve retornar null
  const noKey = await mod.readArtifact(tmpWorkspace, artifacts, 'inexistente');
  assert(noKey === null, 'Esperado null para chave inexistente');
});

// Aguardar T5 (async)
await new Promise(r => setTimeout(r, 100));

// T6 — Usa apenas node: built-ins
test('T6 - Usa apenas node: built-ins', () => {
  const source = readFileSync(artifactsPath, 'utf8');
  const importLines = source.match(/import .+ from ['"](.+)['"]/g) || [];
  for (const line of importLines) {
    const match = line.match(/from ['"](.+)['"]/);
    if (match) {
      assert(match[1].startsWith('node:'), `Import não-node: ${match[1]}`);
    }
  }
});

// Cleanup
try { rmSync(tmpWorkspace, { recursive: true, force: true }); } catch {}

console.log(`\n=== Resultado: ${passed}/${passed + failed} PASS, ${failed}/${passed + failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);
