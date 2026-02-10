import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { validateProject } from '../lib/validate.mjs';
import { resolvePath, resolveArtifacts } from '../lib/paths.mjs';
import { resolveProjectPath } from '../lib/discovery.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RUNS_DIR = resolve(__dirname, '..', '..');

/**
 * Carrega, valida e enriquece um project.json.
 *
 * @param {string|object} pathOrOptions - path direto ou { slug, runsDir }
 * @returns {Promise<object>} projeto enriquecido com _source e _resolved
 */
export async function loadProject(pathOrOptions) {
  let projectPath;

  if (typeof pathOrOptions === 'string') {
    projectPath = resolve(pathOrOptions);
  } else {
    const { slug, runsDir = RUNS_DIR } = pathOrOptions;
    const found = await resolveProjectPath(runsDir, slug);
    if (!found) {
      throw new Error(`Projeto não encontrado com slug "${slug}" em ${runsDir}`);
    }
    projectPath = found;
  }

  // Ler e parsear JSON
  let raw;
  try {
    raw = await readFile(projectPath, 'utf8');
  } catch (err) {
    throw new Error(`Não foi possível ler ${projectPath}: ${err.message}`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`JSON inválido em ${projectPath}: ${err.message}`);
  }

  // Validar contra schema
  const result = await validateProject(data);
  if (!result.valid) {
    throw new Error(
      `project.json inválido em ${projectPath}:\n  - ${result.errors.join('\n  - ')}`
    );
  }

  // Resolver paths
  const workspace = data.workspace;
  const resolvedSpecs = resolvePath(workspace, data.specs);
  const resolvedArtifacts = resolveArtifacts(workspace, data.artifacts);

  return {
    ...data,
    _source: projectPath,
    _resolved: {
      specs: resolvedSpecs,
      artifacts: resolvedArtifacts,
    },
  };
}

// --- CLI ---
const isMainModule = process.argv[1] &&
  resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const { values, positionals } = parseArgs({
    options: {
      slug:     { type: 'string' },
      'runs-dir': { type: 'string' },
    },
    allowPositionals: true,
    strict: true,
  });

  try {
    let project;

    if (positionals.length > 0) {
      project = await loadProject(positionals[0]);
    } else if (values.slug) {
      const opts = { slug: values.slug };
      if (values['runs-dir']) opts.runsDir = resolve(values['runs-dir']);
      project = await loadProject(opts);
    } else {
      console.error('Uso: node load-project.mjs <path> | --slug <slug> [--runs-dir <dir>]');
      process.exit(1);
    }

    console.log(JSON.stringify(project, null, 2));
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  }
}
