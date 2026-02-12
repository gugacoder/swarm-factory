import { mkdir, readFile } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';

/**
 * Artefatos padrão por versão.
 * Cada artefato tem type (file|dir) e path (relativo ao workspace).
 */
const ARTIFACTS_V1 = {
  harness_config: { type: 'file', path: './agent-harness.json' },
  harness_script: { type: 'file', path: './agent-harness.mjs' },
  setup_script:   { type: 'file', path: './agent-setup.mjs' },
  features:       { type: 'file', path: './features.json' },
  progress:       { type: 'file', path: './agent-progress.txt' },
  state:          { type: 'file', path: './agent-harness.state' },
  pid:            { type: 'file', path: './agent-harness.pid' },
  sessions:       { type: 'dir',  path: './.sessions' },
  current_milestone: { type: 'file', path: './.sessions/.current-milestone' }
};

/**
 * Artefatos V2 — estrutura .harness/ com sessions per-milestone.
 * {session} é substituído pelo nome da session (ex: 08-precificacao).
 */
const ARTIFACTS_V2 = {
  harness_dir:    { type: 'dir',  path: './.harness' },
  scripts_dir:    { type: 'dir',  path: './.harness/scripts' },
  prompt:         { type: 'file', path: './.harness/prompt.md' },
  learnings:      { type: 'file', path: './.harness/learnings.md' },
  active:         { type: 'file', path: './.harness/active' },
  session_dir:    { type: 'dir',  path: './.harness/{session}' },
  config:         { type: 'file', path: './.harness/{session}/config.json' },
  features:       { type: 'file', path: './.harness/{session}/features.json' },
  progress:       { type: 'file', path: './.harness/{session}/progress.txt' },
  loop_state:     { type: 'file', path: './.harness/{session}/loop.json' },
  runs_dir:       { type: 'dir',  path: './.harness/{session}/runs' },
};

/**
 * Session template padrão por versão.
 * Define a estrutura de cada sessão de feature.
 */
const SESSION_TEMPLATE_V1 = {
  pattern: './.sessions/{feature-id}/',
  files: ['checklist.md', 'output.jsonl', 'pid', 'started_at', 'finished_at'],
  dirs: ['worktree']
};

/**
 * Session template V2 — feature runs dentro de .harness/{session}/runs/.
 */
const SESSION_TEMPLATE_V2 = {
  pattern: './.harness/{session}/runs/{feature-id}',
  files: ['{feature-id}.jsonl', '{feature-id}.json'],
  dirs: []
};

/**
 * Retorna artefatos padrão para a versão especificada.
 * @param {number} version - versão do schema
 * @returns {Record<string, {type: string, path: string}>} artefatos padrão
 */
export function getDefaultArtifacts(version) {
  if (version === 1) {
    return structuredClone(ARTIFACTS_V1);
  }
  if (version === 2) {
    return structuredClone(ARTIFACTS_V2);
  }
  throw new Error(`Versão de artefatos não suportada: ${version}`);
}

/**
 * Retorna session template padrão para a versão especificada.
 * @param {number} version - versão do schema
 * @returns {{pattern: string, files: string[], dirs: string[]}} template de sessão
 */
export function getDefaultSessionTemplate(version) {
  if (version === 1) {
    return structuredClone(SESSION_TEMPLATE_V1);
  }
  if (version === 2) {
    return structuredClone(SESSION_TEMPLATE_V2);
  }
  throw new Error(`Versão de session template não suportada: ${version}`);
}

/**
 * Resolve placeholders em paths de artefatos V2.
 * @param {Record<string, {type: string, path: string}>} artifacts - artefatos com placeholders
 * @param {string} session - nome da session (ex: '08-precificacao')
 * @returns {Record<string, {type: string, path: string}>} artefatos com paths resolvidos
 */
export function resolveSessionArtifacts(artifacts, session) {
  const resolved = {};
  for (const [key, artifact] of Object.entries(artifacts)) {
    resolved[key] = {
      ...artifact,
      path: artifact.path.replace(/\{session\}/g, session),
    };
  }
  return resolved;
}

/**
 * Cria diretórios para artefatos do tipo dir.
 * @param {string} workspace - caminho absoluto do workspace
 * @param {Record<string, {type: string, path: string}>} artifacts - artefatos declarados
 */
export async function ensureArtifactDirs(workspace, artifacts) {
  for (const artifact of Object.values(artifacts)) {
    if (artifact.type === 'dir') {
      const dirPath = isAbsolute(artifact.path)
        ? artifact.path
        : resolve(workspace, artifact.path);
      await mkdir(dirPath, { recursive: true });
    }
  }
}

/**
 * Lê conteúdo de um artefato do tipo file.
 * Retorna null se o artefato não existir no filesystem.
 * @param {string} workspace - caminho absoluto do workspace
 * @param {Record<string, {type: string, path: string}>} artifacts - artefatos declarados
 * @param {string} key - chave do artefato a ler
 * @returns {Promise<string|null>} conteúdo do arquivo ou null
 */
export async function readArtifact(workspace, artifacts, key) {
  const artifact = artifacts[key];
  if (!artifact) {
    return null;
  }
  const filePath = isAbsolute(artifact.path)
    ? artifact.path
    : resolve(workspace, artifact.path);
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}
