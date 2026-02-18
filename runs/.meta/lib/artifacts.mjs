import { mkdir, readFile } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';

/**
 * Artefatos padrão do harness.
 * Cada artefato tem type (file|dir) e path (relativo ao workspace).
 * {session} é substituído pelo nome da session (ex: 08-precificacao).
 */
const DEFAULT_ARTIFACTS = {
  harness_dir:    { type: 'dir',  path: './.harness' },
  scripts_dir:    { type: 'dir',  path: './.harness/scripts' },
  prompt:         { type: 'file', path: './.harness/prompt.md' },
  learnings:      { type: 'file', path: './.harness/learnings.md' },
  session_dir:    { type: 'dir',  path: './.harness/{session}' },
  config:         { type: 'file', path: './.harness/{session}/config.json' },
  features:       { type: 'file', path: './.harness/{session}/features.json' },
  progress:       { type: 'file', path: './.harness/{session}/progress.txt' },
  loop_state:     { type: 'file', path: './.harness/{session}/loop.json' },
  runs_dir:       { type: 'dir',  path: './.harness/{session}/runs' },
};

/**
 * Session template — feature runs dentro de .harness/{session}/runs/.
 */
const DEFAULT_SESSION_TEMPLATE = {
  pattern: './.harness/{session}/runs/{feature-id}',
  files: ['{feature-id}.jsonl', '{feature-id}.json'],
  dirs: []
};

/**
 * Retorna artefatos padrão.
 * @returns {Record<string, {type: string, path: string}>} artefatos padrão
 */
export function getDefaultArtifacts() {
  return structuredClone(DEFAULT_ARTIFACTS);
}

/**
 * Retorna session template padrão.
 * @returns {{pattern: string, files: string[], dirs: string[]}} template de sessão
 */
export function getDefaultSessionTemplate() {
  return structuredClone(DEFAULT_SESSION_TEMPLATE);
}

/**
 * Resolve placeholders em paths de artefatos.
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
