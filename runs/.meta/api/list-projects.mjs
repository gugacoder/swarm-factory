import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { discoverProjects } from '../lib/discovery.mjs';
import { loadProject } from './load-project.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RUNS_DIR = resolve(__dirname, '..', '..');

/**
 * Lista todos os projetos encontrados em runsDir.
 * Projetos com JSON inválido aparecem com _error, não são ignorados.
 *
 * @param {object} [options]
 * @param {string} [options.runsDir] - Diretório de runs (default: auto-detectado)
 * @returns {Promise<Array<{slug: string, name: string, workspace: string, harness: string, format: string, _source: string, _error?: string}>>}
 */
export async function listProjects(options = {}) {
  const { runsDir = RUNS_DIR } = options;
  const discovered = await discoverProjects(runsDir);
  const results = [];

  for (const entry of discovered) {
    try {
      const project = await loadProject(entry.path);
      results.push({
        slug: project.slug,
        name: project.name,
        workspace: project.workspace,
        harness: project.agent.harness,
        format: entry.format,
        _source: entry.path,
      });
    } catch (err) {
      // Projetos inválidos aparecem com _error
      results.push({
        slug: extractSlug(entry),
        name: null,
        workspace: null,
        harness: null,
        format: entry.format,
        _source: entry.path,
        _error: err.message,
      });
    }
  }

  return results;
}

/**
 * Extrai um slug aproximado a partir do path quando o JSON é inválido.
 */
function extractSlug(entry) {
  const { path: p, format } = entry;
  if (format === 'flat') {
    // runs/{slug}.json → basename sem extensão
    const base = p.split(/[/\\]/).pop();
    return base.replace(/\.json$/, '');
  }
  // structured: runs/{slug}/project.json ou runs/{slug}/{milestone}/project.json
  const parts = p.split(/[/\\]/);
  const idx = parts.lastIndexOf('project.json');
  return idx >= 2 ? parts[idx - 1] : parts[idx - 1] || '(unknown)';
}

/**
 * Formata os projetos como tabela para CLI.
 */
function formatTable(projects) {
  if (projects.length === 0) {
    return 'Nenhum projeto encontrado.';
  }

  // Colunas e headers
  const headers = ['Slug', 'Name', 'Workspace', 'Harness', 'Format'];
  const rows = projects.map(p => [
    p.slug || '—',
    p._error ? `(erro)` : (p.name || '—'),
    p.workspace || '—',
    p.harness || '—',
    p.format,
  ]);

  // Calcular larguras
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => r[i].length))
  );

  // Montar linhas
  const header = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  const body = rows.map(row =>
    row.map((cell, i) => cell.padEnd(widths[i])).join('  ')
  );

  const lines = [header, ...body];

  // Adicionar erros como notas ao final
  const errors = projects.filter(p => p._error);
  if (errors.length > 0) {
    lines.push('');
    for (const p of errors) {
      lines.push(`⚠ ${p.slug}: ${p._error}`);
    }
  }

  return lines.join('\n');
}

// --- CLI ---
const isMainModule = process.argv[1] &&
  resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const { values } = parseArgs({
    options: {
      'runs-dir': { type: 'string' },
      format:     { type: 'string', default: 'table' },
    },
    strict: true,
  });

  try {
    const opts = {};
    if (values['runs-dir']) opts.runsDir = resolve(values['runs-dir']);

    const projects = await listProjects(opts);
    const fmt = values.format || 'table';

    if (fmt === 'json') {
      console.log(JSON.stringify(projects, null, 2));
    } else {
      console.log(formatTable(projects));
    }
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  }
}
