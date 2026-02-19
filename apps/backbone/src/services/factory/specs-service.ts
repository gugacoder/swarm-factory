/**
 * SpecsService — navegação de diretório de specs.
 * Portado de apps/sneak-peek-hub/src/plugin.ts (linhas 1013-1044)
 */

import { resolve, isAbsolute, basename } from 'node:path';
import { existsSync, statSync, readFileSync, readdirSync } from 'node:fs';
import type { SpecsResponse } from './types.js';
import { resolveHarnessSession, readJsonSafe } from './workspace-service.js';

export function readSpecs(wsPath: string, slug: string, subPath: string): SpecsResponse {
  const hp = resolveHarnessSession(wsPath, slug);
  const config = hp ? readJsonSafe(hp.configPath) : null;
  if (!config?.specs) throw new Error('specs path não configurado');

  let specsRoot = config.specs.replace(/\\/g, '/');
  if (!isAbsolute(specsRoot)) {
    specsRoot = resolve(wsPath, specsRoot);
  }

  const decodedPath = decodeURIComponent(subPath || '');
  const targetPath = decodedPath ? resolve(specsRoot, decodedPath) : specsRoot;

  if (!existsSync(targetPath)) throw new Error('Não encontrado');
  const stat = statSync(targetPath);

  if (stat.isFile()) {
    return {
      type: 'file',
      path: decodedPath || basename(targetPath),
      content: readFileSync(targetPath, 'utf-8'),
    };
  } else if (stat.isDirectory()) {
    const items = readdirSync(targetPath, { withFileTypes: true })
      .filter(e => !e.name.startsWith('.'))
      .map(e => ({
        name: e.name,
        type: (e.isDirectory() ? 'directory' : 'file') as 'file' | 'directory',
        path: decodedPath ? `${decodedPath}/${e.name}` : e.name,
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    return { type: 'directory', path: decodedPath || '.', items };
  }

  throw new Error('Tipo de arquivo não suportado');
}
