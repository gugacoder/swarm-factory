import { writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { validateProject } from '../lib/validate.mjs';
import { getDefaultArtifacts } from '../lib/artifacts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RUNS_DIR = resolve(__dirname, '..', '..');

/**
 * Cria um project.json validado a partir dos parâmetros recebidos.
 *
 * @param {object} params
 * @param {string} params.slug - Identificador machine-friendly
 * @param {string} params.name - Nome humano do projeto
 * @param {string} [params.description] - Contexto sobre o projeto
 * @param {string} params.workspace - Caminho absoluto do workspace
 * @param {string} params.specs - Caminho para specs (relativo ao workspace ou absoluto)
 * @param {string} params.harness - Agente a usar (claude-code, opencode, codex)
 * @param {string} [params.model] - Modelo do agente
 * @param {number} [params.max_turns=50] - Turns por sessão
 * @param {number} [params.max_iterations] - Iterações do loop
 * @param {number} [params.max_features] - Features a completar
 * @param {number} [params.max_retries=5] - Tentativas por feature
 * @param {string} [params.format='structured'] - Formato: flat ou structured
 * @param {string} [params.runsDir] - Diretório runs (default: auto-detectado)
 * @param {boolean} [params.force=false] - Sobrescrever se já existir
 * @returns {Promise<object>} Objeto do projeto criado
 */
export async function createProject(params) {
  const {
    slug,
    name,
    description = null,
    workspace,
    specs,
    harness,
    model = null,
    max_turns = 50,
    max_iterations = null,
    max_features = null,
    max_retries = 5,
    format = 'structured',
    runsDir = RUNS_DIR,
    force = false,
  } = params;

  // Montar agent config
  const agent = { harness };
  if (model !== null) agent.model = model;
  if (max_turns !== null) agent.max_turns = max_turns;
  if (max_iterations !== null) agent.max_iterations = max_iterations;
  if (max_features !== null) agent.max_features = max_features;
  agent.max_retries = max_retries;

  // Montar project.json
  const project = {
    slug,
    name,
    description,
    specs,
    workspace,
    agent,
    artifacts: getDefaultArtifacts(),
  };

  // Validar contra schema
  const result = await validateProject(project);
  if (!result.valid) {
    throw new Error(`Validação falhou:\n${result.errors.join('\n')}`);
  }

  // Determinar path de escrita
  let targetPath;
  if (format === 'flat') {
    targetPath = join(runsDir, `${slug}.json`);
  } else {
    targetPath = join(runsDir, slug, 'project.json');
  }

  // Verificar se já existe
  try {
    await access(targetPath);
    if (!force) {
      throw new Error(`Projeto já existe em ${targetPath}. Use outro slug ou remova o existente.`);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  // Criar diretório se structured
  if (format !== 'flat') {
    await mkdir(dirname(targetPath), { recursive: true });
  }

  // Escrever JSON formatado
  await writeFile(targetPath, JSON.stringify(project, null, 2) + '\n', 'utf8');

  return project;
}

// --- CLI ---
const isMainModule = process.argv[1] &&
  resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const { values } = parseArgs({
    options: {
      slug:            { type: 'string' },
      name:            { type: 'string' },
      description:     { type: 'string' },
      workspace:       { type: 'string' },
      specs:           { type: 'string' },
      harness:         { type: 'string' },
      model:           { type: 'string' },
      'max-turns':     { type: 'string' },
      'max-iterations':{ type: 'string' },
      'max-features':  { type: 'string' },
      'max-retries':   { type: 'string' },
      format:          { type: 'string' },
      force:           { type: 'boolean', default: false },
    },
    strict: true,
  });

  // Converter dash para underscore e parsear inteiros
  const params = {
    slug: values.slug,
    name: values.name,
    workspace: values.workspace,
    specs: values.specs,
    harness: values.harness,
    format: values.format,
  };

  if (values.force) params.force = true;
  if (values.description !== undefined) params.description = values.description;
  if (values.model !== undefined) params.model = values.model;
  if (values['max-turns'] !== undefined) params.max_turns = parseInt(values['max-turns'], 10);
  if (values['max-iterations'] !== undefined) params.max_iterations = parseInt(values['max-iterations'], 10);
  if (values['max-features'] !== undefined) params.max_features = parseInt(values['max-features'], 10);
  if (values['max-retries'] !== undefined) params.max_retries = parseInt(values['max-retries'], 10);

  try {
    const project = await createProject(params);
    console.log(JSON.stringify(project, null, 2));
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  }
}
