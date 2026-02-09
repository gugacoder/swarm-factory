import { resolve, isAbsolute, sep } from 'node:path';

/**
 * Resolve targetPath relativo a basePath, ou retorna targetPath se absoluto.
 * Não verifica existência no filesystem.
 * @param {string} basePath - diretório base para resolução
 * @param {string} targetPath - path a resolver (relativo ou absoluto)
 * @returns {string} path absoluto resolvido
 */
export function resolvePath(basePath, targetPath) {
  if (isAbsolute(targetPath)) {
    return targetPath;
  }
  return resolve(basePath, targetPath);
}

/**
 * Resolve todos os paths de artefatos de relativos para absolutos.
 * @param {string} workspace - diretório base do workspace
 * @param {Record<string, {type: string, path: string}>} artifacts - artefatos com paths relativos ou absolutos
 * @returns {Record<string, string>} paths absolutos resolvidos por chave
 */
export function resolveArtifacts(workspace, artifacts) {
  const resolved = {};
  for (const [key, artifact] of Object.entries(artifacts)) {
    const path = typeof artifact === 'string' ? artifact : artifact.path;
    resolved[key] = resolvePath(workspace, path);
  }
  return resolved;
}

/**
 * Normaliza separadores de path para o SO corrente.
 * @param {string} path - path a normalizar
 * @returns {string} path com separadores do SO corrente
 */
export function normalizeSlashes(path) {
  if (sep === '\\') {
    return path.replace(/\//g, '\\');
  }
  return path.replace(/\\/g, '/');
}
