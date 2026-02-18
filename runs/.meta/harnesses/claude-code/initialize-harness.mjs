#!/usr/bin/env node
// =============================================================================
// Initialize Harness — Claude Code
// Script autocontido que roda no workspace destino.
// Invoca o initializer agent para gerar features.json.
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
import { createWriteStream } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';

// --- Utilitários ---
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function log(msg) {
  process.stdout.write(stripAnsi(msg) + '\n');
}

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

// --- Resumo legível de eventos stream-json ---
function summarizeEvent(event) {
  if (!event || !event.type) return null;

  switch (event.type) {
    case 'system': {
      const model = event.model || event.data?.model || '';
      return model ? `[init] model=${model}` : '[init] sistema iniciado';
    }

    case 'assistant': {
      if (event.message?.content) {
        for (const block of event.message.content) {
          if (block.type === 'text') {
            const text = block.text?.trim();
            if (!text) continue;
            return text.length > 300 ? text.slice(0, 300) + '…' : text;
          }
          if (block.type === 'tool_use') {
            const name = block.name || 'unknown';
            const input = block.input || {};
            const summary = summarizeToolInput(name, input);
            return `[tool] ${name}: ${summary}`;
          }
        }
      }
      // subtype direto (text sem wrapper)
      if (event.subtype === 'text' && event.text) {
        const text = event.text.trim();
        if (!text) return null;
        return text.length > 300 ? text.slice(0, 300) + '…' : text;
      }
      if (event.subtype === 'tool_use') {
        const name = event.tool_name || event.name || 'unknown';
        const input = event.input || {};
        const summary = summarizeToolInput(name, input);
        return `[tool] ${name}: ${summary}`;
      }
      return null;
    }

    case 'user':
      // tool_result — ignorar (muito grande, tool_use já mostra a ação)
      return null;

    case 'result': {
      const turns = event.num_turns ?? event.turns ?? '?';
      const cost = typeof event.cost_usd === 'number'
        ? `$${event.cost_usd.toFixed(2)}`
        : (event.cost ?? '?');
      const duration = typeof event.duration_seconds === 'number'
        ? `${event.duration_seconds.toFixed(0)}s`
        : (typeof event.duration_ms === 'number' ? `${(event.duration_ms / 1000).toFixed(0)}s` : '?');
      return `[done] ${turns} turns · ${cost} · ${duration}`;
    }

    default:
      // stream_event e outros — ignorar
      return null;
  }
}

function summarizeToolInput(name, input) {
  switch (name) {
    case 'Read':
      return input.file_path || input.path || '(file)';
    case 'Write':
      return input.file_path || input.path || '(file)';
    case 'Edit':
      return input.file_path || input.path || '(file)';
    case 'Bash':
      return (input.command || '').slice(0, 120) || '(cmd)';
    case 'Glob':
      return input.pattern || '(pattern)';
    case 'Grep':
      return input.pattern || '(pattern)';
    default:
      return JSON.stringify(input).slice(0, 100);
  }
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

  log('=======================================');
  log('  Setup Harness — Claude Code');
  log('=======================================');
  log('');

  // 1. Resolver session via argumento --session
  const session = values.session || '';
  if (!session) {
    log('--session é obrigatório. Uso: node initialize-harness.mjs --session <nome>');
    process.exit(1);
  }

  // 2. Ler config da session
  const configPath = resolve('.harness', session, 'config.json');
  if (!await fileExists(configPath)) {
    log(`.harness/${session}/config.json não encontrado.`);
    process.exit(1);
  }

  const config = await readJson(configPath);
  log(`Projeto: ${config.project || config.slug}`);
  log(`Session: ${session}`);

  if (values.append) {
    log('Modo --append: features existentes serão preservadas.');
  }

  // 3. Verificar se features.json já existe
  const featuresPath = resolve('.harness', session, 'features.json');
  if (await fileExists(featuresPath)) {
    try {
      const features = await readJson(featuresPath);
      const featuresList = Array.isArray(features) ? features : (features.features ?? []);
      if (featuresList.length > 0 && !values.force && !values.append) {
        log(`features.json já existe com ${featuresList.length} features.`);
        log('Use --force para re-gerar ou --append para adicionar.');
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
      log('features.json e progress resetados.');
    } catch {
      // ok
    }
  }

  // 5. Spawnar initializer agent
  const commandPath = resolve('.claude', 'commands', 'vibe', 'initialize.md');
  if (!await fileExists(commandPath)) {
    log('initialize.md não encontrado em .claude/commands/vibe/');
    log('Execute init-workspace primeiro para copiar os templates.');
    process.exit(1);
  }

  log('Spawnando initializer agent...');
  log('');

  // Ler template e substituir {session} pelo nome real da sessão
  const rawPrompt = await readFile(commandPath, 'utf8');
  const configContent = JSON.stringify(config, null, 2);
  const initPrompt = rawPrompt.replace(/\{session\}/g, session)
    + `\n\n## Configuração da sessão (config.json)\n\nSessão: \`${session}\`\n\n\`\`\`json\n${configContent}\n\`\`\`\n`;

  const args = [
    '-p', '-',
    '--verbose',
    '--output-format', 'stream-json',
    '--allowedTools', 'Edit,Write,Bash,Read,Glob,Grep',
  ];

  const model = process.env.MODEL || config.agent?.model || '';
  if (model) {
    args.push('--model', model);
  }

  // JSONL output file (source of truth)
  const jsonlPath = join(resolve('.harness', session), 'init.jsonl');
  const jsonlStream = createWriteStream(jsonlPath, { flags: 'a' });

  const proc = spawn('claude', args, {
    cwd: resolve('.'),
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });

  proc.stdin.write(initPrompt);
  proc.stdin.end();

  // Processar stdout linha a linha — salvar raw + emitir resumo
  const rl = createInterface({ input: proc.stdout });
  rl.on('line', (line) => {
    jsonlStream.write(line + '\n');

    try {
      const event = JSON.parse(line);
      const summary = summarizeEvent(event);
      if (summary) {
        process.stdout.write(summary + '\n');
      }
    } catch {
      // Linha não-JSON (raro) — emitir como está
      if (line.trim()) {
        process.stdout.write(line + '\n');
      }
    }
  });

  // Forward stderr para process.stderr
  proc.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  const exitCode = await new Promise((resolvePromise, reject) => {
    proc.on('close', (code) => {
      jsonlStream.end();
      resolvePromise(code);
    });
    proc.on('error', (err) => {
      jsonlStream.end();
      reject(err);
    });
  });

  if (exitCode === 0) {
    log('');
    log('=======================================');
    log('  Setup concluído com sucesso!');
    log('=======================================');
  } else {
    log('');
    log(`Setup falhou com código ${exitCode}.`);
    process.exit(exitCode);
  }
}

// --- Entry point ---
main().catch(err => {
  log(`Erro fatal no setup: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
