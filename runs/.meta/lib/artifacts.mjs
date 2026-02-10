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
 * Session template padrão por versão.
 * Define a estrutura de cada sessão de feature.
 */
const SESSION_TEMPLATE_V1 = {
  pattern: './.sessions/{feature-id}/',
  files: ['checklist.md', 'output.jsonl', 'pid', 'started_at', 'finished_at'],
  dirs: ['worktree']
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
  throw new Error(`Versão de session template não suportada: ${version}`);
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
