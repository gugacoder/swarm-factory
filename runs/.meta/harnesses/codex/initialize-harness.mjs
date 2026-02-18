#!/usr/bin/env node
// =============================================================================
// Initialize Harness — Codex
// Script autocontido que roda no workspace destino.
// Invoca o initializer agent (Codex) para gerar features.json.
//
// Lê config de .harness/{session}/config.json.
//
// Invocação:
//   cd /path/to/workspace
//   node initialize-harness.mjs [--force] [--append]
//
// --force:  re-gera features.json mesmo se já existir.
// --append: executa o initializer sem apagar features/progress existentes.
// =============================================================================

import { spawn } from 'node:child_process';
import { readFile, access, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';

// --- Cores ---
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const CYAN = '\x1b[0;36m';
const NC = '\x1b[0m';

// --- Utilitários ---
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

// --- Main ---
async function main() {
  const { values } = parseArgs({
    options: {
      session: { type: 'string' },
      force: { type: 'boolean', default: false },
      append: { type: 'boolean', default: false },
    },
    strict: true,
  });

  console.log(`${CYAN}=======================================${NC}`);
  console.log(`${CYAN}  Setup Harness — Codex${NC}`);
  console.log(`${CYAN}=======================================${NC}`);
  console.log('');

  // 1. Resolver session via argumento --session
  const session = values.session || '';
  if (!session) {
    console.error(`${RED}--session é obrigatório. Uso: node initialize-harness.mjs --session <nome>${NC}`);
    process.exit(1);
  }

  // 2. Ler config da session
  const configPath = resolve('.harness', session, 'config.json');
  if (!await fileExists(configPath)) {
    console.error(`${RED}.harness/${session}/config.json não encontrado.${NC}`);
    process.exit(1);
  }

  const config = await readJson(configPath);
  console.log(`${CYAN}Projeto: ${config.project || config.slug}${NC}`);
  console.log(`${CYAN}Session: ${session}${NC}`);

  if (values.append) {
    console.log(`${YELLOW}Modo --append: features existentes serão preservadas.${NC}`);
  }

  // 3. Verificar se features.json já existe
  const featuresPath = resolve('.harness', session, 'features.json');
  if (await fileExists(featuresPath)) {
    try {
      const features = await readJson(featuresPath);
      const featuresList = Array.isArray(features) ? features : (features.features ?? []);
      if (featuresList.length > 0 && !values.force && !values.append) {
        console.error(`${RED}features.json já existe com ${featuresList.length} features.${NC}`);
        console.error(`${RED}Use --force para re-gerar ou --append para adicionar.${NC}`);
        process.exit(1);
      }
    } catch {
      // features.json inválido — pode continuar
    }
  }

  // 4. Limpar features.json e progress se --force
  if (values.force) {
    const progressPath = resolve('.harness', session, 'progress.txt');
    try {
      await writeFile(featuresPath, '[]', 'utf8');
      await writeFile(progressPath, '', 'utf8');
      console.log(`${YELLOW}features.json e progress resetados.${NC}`);
    } catch {
      // ok
    }
  }

  // 5. Spawnar initializer agent (Codex)
  const commandPath = resolve('.claude', 'commands', 'vibe', 'initialize.md');
  if (!await fileExists(commandPath)) {
    console.error(`${RED}initialize.md não encontrado em .claude/commands/vibe/${NC}`);
    console.error(`${RED}Execute init-workspace primeiro para copiar os templates.${NC}`);
    process.exit(1);
  }

  console.log(`${CYAN}Spawnando initializer agent (Codex)...${NC}`);
  console.log('');

  // Ler template e substituir {session} pelo nome real da sessão
  const rawPrompt = await readFile(commandPath, 'utf8');
  const configContent = JSON.stringify(config, null, 2);
  const initPrompt = rawPrompt.replace(/\{session\}/g, session)
    + `\n\n## Configuração da sessão (config.json)\n\nSessão: \`${session}\`\n\n\`\`\`json\n${configContent}\n\`\`\`\n`;

  const model = process.env.MODEL || config.agent?.model || '';
  const args = ['--approval-mode', 'full-auto', '-q', initPrompt];
  if (model) {
    args.unshift('--model', model);
  }

  const proc = spawn('codex', args, {
    cwd: resolve('.'),
    stdio: ['inherit', 'inherit', 'inherit'],
    shell: true,
  });

  const exitCode = await new Promise((resolvePromise, reject) => {
    proc.on('close', (code) => resolvePromise(code));
    proc.on('error', (err) => reject(err));
  });

  if (exitCode === 0) {
    console.log('');
    console.log(`${GREEN}=======================================${NC}`);
    console.log(`${GREEN}  Setup concluído com sucesso!${NC}`);
    console.log(`${GREEN}=======================================${NC}`);
  } else {
    console.log('');
    console.error(`${RED}Setup falhou com código ${exitCode}.${NC}`);
    process.exit(exitCode);
  }
}

// --- Entry point ---
main().catch(err => {
  console.error(`${RED}Erro fatal no setup: ${err.message}${NC}`);
  console.error(err.stack);
  process.exit(1);
});
