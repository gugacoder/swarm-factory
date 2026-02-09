import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCHEMA_DIR = join(__dirname, '..', 'schema');

const ajv = new Ajv({ allErrors: true });

const schemaCache = new Map();

/**
 * Carrega um JSON Schema pelo nome (sem extensão).
 * @param {string} name - Nome do schema (ex: 'project', 'features')
 * @returns {Promise<object>} Schema JSON parseado
 */
export async function loadSchema(name) {
  if (schemaCache.has(name)) return schemaCache.get(name);

  const filePath = join(SCHEMA_DIR, `${name}.schema.json`);
  const raw = await readFile(filePath, 'utf8');
  const schema = JSON.parse(raw);
  schemaCache.set(name, schema);
  return schema;
}

/**
 * Formata erros do ajv em strings legíveis.
 * @param {import('ajv').ErrorObject[]} errors
 * @returns {string[]}
 */
function formatErrors(errors) {
  if (!errors) return [];
  return errors.map(e => {
    const path = e.instancePath || '/';
    return `${path} ${e.message}`;
  });
}

/**
 * Valida dados contra project.schema.json.
 * @param {unknown} data - Dados a validar
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateProject(data) {
  const schema = await loadSchema('project');
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid, errors: valid ? [] : formatErrors(validate.errors) };
}

/**
 * Valida dados contra features.schema.json.
 * @param {unknown} data - Dados a validar
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateFeatures(data) {
  const schema = await loadSchema('features');
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid, errors: valid ? [] : formatErrors(validate.errors) };
}
