import { readdir, readFile } from 'node:fs/promises';
import { join, basename, extname, resolve } from 'node:path';

const EXCLUDED_DIRS = new Set(['.meta', 'workspaces']);

/**
 * Descobre projetos em ambos os formatos (flat e structured) dentro de runsDir.
 * Flat: arquivos .json na raiz de runs/ (exceto .meta/ e workspaces/)
 * Structured: project.json dentro de subdiretórios de runs/
 * @param {string} runsDir - caminho absoluto do diretório runs/
 * @returns {Promise<Array<{path: string, format: 'flat'|'structured'}>>}
 */
export async function discoverProjects(runsDir) {
  const entries = await readdir(runsDir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;

    if (entry.isFile() && extname(entry.name) === '.json') {
      // Formato flat: runs/{slug}.json
      results.push({
        path: resolve(runsDir, entry.name),
        format: 'flat'
      });
    } else if (entry.isDirectory()) {
      // Formato structured: buscar project.json dentro do subdiretório
      const found = await findProjectJsonInDir(resolve(runsDir, entry.name));
      results.push(...found);
    }
  }

  return results;
}

/**
 * Busca project.json dentro de um diretório de projeto.
 * Verifica tanto {dir}/project.json quanto {dir}/{subdir}/project.json.
 * @param {string} dir - diretório a buscar
 * @returns {Promise<Array<{path: string, format: 'structured'}>>}
 */
async function findProjectJsonInDir(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name === 'project.json') {
      // Encontrou project.json diretamente: runs/{slug}/project.json
      results.push({
        path: resolve(dir, entry.name),
        format: 'structured'
      });
    } else if (entry.isDirectory()) {
      // Buscar project.json em nível de milestone: runs/{slug}/{milestone}/project.json
      const nested = resolve(dir, entry.name, 'project.json');
      try {
        await readFile(nested, 'utf8');
        results.push({
          path: nested,
          format: 'structured'
        });
      } catch {
        // Não existe — ignorar
      }
    }
  }

  return results;
}

/**
 * Resolve o caminho de um project.json a partir de um slug.
 * Busca em ambos os formatos e retorna o path do primeiro match, ou null.
 * @param {string} runsDir - caminho absoluto do diretório runs/
 * @param {string} identifier - slug do projeto a buscar
 * @returns {Promise<string|null>} path absoluto do project.json ou null
 */
export async function resolveProjectPath(runsDir, identifier) {
  const projects = await discoverProjects(runsDir);

  for (const project of projects) {
    if (project.format === 'flat') {
      // Flat: runs/{slug}.json — compara basename sem extensão
      const name = basename(project.path, '.json');
      if (name === identifier) {
        return project.path;
      }
    } else {
      // Structured: extrai slug do path
      // runs/{slug}/project.json → slug
      // runs/{slug}/{milestone}/project.json → slug ou slug/{milestone}
      try {
        const content = await readFile(project.path, 'utf8');
        const json = JSON.parse(content);
        if (json.slug === identifier) {
          return project.path;
        }
      } catch {
        // JSON inválido — ignorar para fins de resolução
      }
    }
  }

  return null;
}
