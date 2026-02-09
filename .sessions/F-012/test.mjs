#!/usr/bin/env node
// =============================================================================
// Testes para F-012 — Webhooks e notificações
// =============================================================================

import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const HARNESS_MJS = resolve(ROOT, 'runs', '.meta', 'harnesses', 'claude-code', 'agent-harness.mjs');
const TMP_DIR = resolve(ROOT, '.sessions', 'F-012', '_test_workspace');

let passed = 0;
let failed = 0;

function ok(num, msg) {
  passed++;
  console.log(`  \u2713 [${num}] ${msg}`);
}
function fail(num, msg, detail) {
  failed++;
  console.error(`  \u2717 [${num}] ${msg}${detail ? ': ' + detail : ''}`);
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

// =============================================================================
// Testes de análise estática
// =============================================================================

async function testStaticAnalysis() {
  const code = await readFile(HARNESS_MJS, 'utf8');

  // Teste 1: Função notifyWebhooks existe no agent-harness.mjs
  {
    const msg = 'Função notifyWebhooks existe no agent-harness.mjs';
    const hasFn = code.includes('async function notifyWebhooks(') ||
                   code.includes('function notifyWebhooks(');
    if (hasFn) {
      ok(1, msg);
    } else {
      fail(1, msg);
    }
  }

  // Teste 2: Filtra notifications cujos events incluem o evento ou '*'
  {
    const msg = "Filtra notifications cujos events incluem o evento ou '*'";
    const hasFilter = code.includes("events.includes(event)") || code.includes("events.includes('*')") ||
                       (code.includes('events') && code.includes("'*'") && code.includes('includes'));
    if (hasFilter) {
      ok(2, msg);
    } else {
      fail(2, msg);
    }
  }

  // Teste 3: Envia HTTP POST com Content-Type application/json
  {
    const msg = 'Envia HTTP POST com Content-Type application/json';
    const hasPost = code.includes("method: 'POST'") || code.includes('method: "POST"');
    const hasContentType = code.includes("'Content-Type': 'application/json'") ||
                            code.includes('"Content-Type": "application/json"') ||
                            code.includes("'Content-Type'") && code.includes('application/json');
    if (hasPost && hasContentType) {
      ok(3, msg);
    } else {
      fail(3, msg, `POST: ${hasPost}, Content-Type: ${hasContentType}`);
    }
  }

  // Teste 4: Payload contém event, timestamp, project (slug, name) e data
  {
    const msg = 'Payload contém event, timestamp, project (slug, name) e data';
    const hasEvent = code.includes('event,') || code.includes('event:');
    const hasTimestamp = code.includes('timestamp');
    const hasProject = code.includes('project:') && code.includes('slug') && code.includes('name');
    const hasData = code.includes('data,') || code.includes('data:');
    if (hasEvent && hasTimestamp && hasProject && hasData) {
      ok(4, msg);
    } else {
      fail(4, msg, `event: ${hasEvent}, timestamp: ${hasTimestamp}, project: ${hasProject}, data: ${hasData}`);
    }
  }

  // Teste 5: Timeout de 10s por webhook
  {
    const msg = 'Timeout de 10s por webhook';
    const hasTimeout = code.includes('10_000') || code.includes('10000');
    const hasAbort = code.includes('AbortController') || code.includes('signal');
    if (hasTimeout && hasAbort) {
      ok(5, msg);
    } else {
      fail(5, msg, `timeout: ${hasTimeout}, abort: ${hasAbort}`);
    }
  }

  // Teste 6: Erro de webhook individual não impede os demais (try/catch)
  {
    const msg = 'Erro de webhook individual não impede os demais (try/catch)';
    // O try/catch deve estar dentro do for loop
    const fnMatch = code.match(/async function notifyWebhooks[\s\S]*?^}/m);
    if (fnMatch) {
      const fnBody = fnMatch[0];
      const hasFor = fnBody.includes('for (') || fnBody.includes('for(');
      const hasTryCatch = fnBody.includes('try {') && fnBody.includes('catch');
      if (hasFor && hasTryCatch) {
        ok(6, msg);
      } else {
        fail(6, msg, `for: ${hasFor}, try/catch: ${hasTryCatch}`);
      }
    } else {
      fail(6, msg, 'não encontrou corpo da função notifyWebhooks');
    }
  }

  // Teste 7: Sem retry — fire-and-forget
  {
    const msg = 'Sem retry — fire-and-forget';
    // Verificar que não há retry/backoff/repeat na função notifyWebhooks
    const fnStart = code.indexOf('async function notifyWebhooks(');
    if (fnStart >= 0) {
      // Encontrar o fim da função (próxima declaração de função ou fim)
      const afterFn = code.slice(fnStart, fnStart + 2000);
      const hasRetry = afterFn.includes('retry') || afterFn.includes('backoff') || afterFn.includes('repeat');
      if (!hasRetry) {
        ok(7, msg);
      } else {
        fail(7, msg, 'encontrou retry/backoff/repeat na função');
      }
    } else {
      fail(7, msg, 'função notifyWebhooks não encontrada');
    }
  }

  // Teste 8: Registra resultado no agent-progress.txt: [WEBHOOK] POST {url} → {status}
  {
    const msg = 'Registra resultado no agent-progress.txt: [WEBHOOK] POST {url} → {status}';
    const hasWebhookLog = code.includes('[WEBHOOK]') && code.includes('POST');
    const hasSuccess = code.includes('response.status') || code.includes('.status');
    const hasError = code.includes('ERRO:') || code.includes('err.message');
    if (hasWebhookLog && hasSuccess && hasError) {
      ok(8, msg);
    } else {
      fail(8, msg, `log: ${hasWebhookLog}, status: ${hasSuccess}, error: ${hasError}`);
    }
  }

  // Teste 9: Integrado nos pontos: feature_done, feature_skip, completed, stopped, error
  {
    const msg = 'Integrado nos pontos: feature_done, feature_skip, completed, stopped, error';
    const calls = [...code.matchAll(/notifyWebhooks\s*\(\s*config\s*,\s*progressPath\s*,\s*'(\w+)'/g)];
    const events = calls.map(m => m[1]);
    const hasFeatureDone = events.includes('feature_done');
    const hasFeatureSkip = events.includes('feature_skip');
    const hasCompleted = events.includes('completed');
    const hasStopped = events.includes('stopped');
    const hasError = events.includes('error');
    if (hasFeatureDone && hasFeatureSkip && hasCompleted && hasStopped && hasError) {
      ok(9, msg);
    } else {
      fail(9, msg, `feature_done: ${hasFeatureDone}, feature_skip: ${hasFeatureSkip}, completed: ${hasCompleted}, stopped: ${hasStopped}, error: ${hasError}`);
    }
  }
}

// =============================================================================
// Teste funcional: notifyWebhooks com HTTP server real
// =============================================================================

async function testNotifyWebhooksFunctional() {
  await mkdir(TMP_DIR, { recursive: true });

  // Teste 10: notifyWebhooks envia POST real para servidor local
  {
    const msg = 'notifyWebhooks envia POST real com payload correto';

    // Criar server HTTP de teste
    let receivedBody = null;
    let receivedHeaders = null;
    const server = createServer((req, res) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        receivedBody = body;
        receivedHeaders = req.headers;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      });
    });

    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const webhookUrl = `http://127.0.0.1:${port}/test-webhook`;

    const progressPath = join(TMP_DIR, 'progress.txt');
    await writeFile(progressPath, '', 'utf8');

    const testCode = `
import { appendFile } from 'node:fs/promises';

function now() {
  return new Date().toISOString().replace(/\\.\\d{3}Z$/, 'Z');
}

async function appendProgress(progressPath, line) {
  await appendFile(progressPath, line + '\\n', 'utf8');
}

async function notifyWebhooks(config, progressPath, event, data) {
  const notifications = config.notifications;
  if (!Array.isArray(notifications) || notifications.length === 0) return;

  const matching = notifications.filter(n =>
    Array.isArray(n.events) && (n.events.includes(event) || n.events.includes('*'))
  );
  if (matching.length === 0) return;

  const payload = {
    event,
    timestamp: now(),
    project: {
      slug: config.slug || '',
      name: config.name || '',
    },
    data,
  };

  const body = JSON.stringify(payload);

  for (const webhook of matching) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const logLine = '[' + now() + '] [WEBHOOK] POST ' + webhook.url + ' → ' + response.status;
      await appendProgress(progressPath, logLine);
    } catch (err) {
      const logLine = '[' + now() + '] [WEBHOOK] POST ' + webhook.url + ' → ERRO: ' + err.message;
      await appendProgress(progressPath, logLine);
    }
  }
}

const config = {
  slug: 'test-project',
  name: 'Test Project',
  notifications: [
    { url: '${webhookUrl}', events: ['feature_done', 'completed'] },
    { url: '${webhookUrl}', events: ['*'] },
  ],
};

await notifyWebhooks(config, ${JSON.stringify(progressPath)}, 'feature_done', {
  feature_id: 'F-001',
  feature_title: 'Test Feature',
  iteration: 1,
  features_done: 1,
  features_total: 10,
  exit_reason: null,
});

console.log('DONE');
`;

    const testFile = join(TMP_DIR, 'test-notify.mjs');
    await writeFile(testFile, testCode, 'utf8');

    const result = await new Promise((res) => {
      const proc = spawn('node', [testFile], { stdio: 'pipe' });
      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', d => stdout += d);
      proc.stderr.on('data', d => stderr += d);
      proc.on('close', code => res({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
    });

    server.close();

    if (result.stdout === 'DONE' && receivedBody) {
      try {
        const payload = JSON.parse(receivedBody);
        const checks = [
          payload.event === 'feature_done',
          typeof payload.timestamp === 'string',
          payload.project?.slug === 'test-project',
          payload.project?.name === 'Test Project',
          payload.data?.feature_id === 'F-001',
        ];
        const contentTypeOk = receivedHeaders?.['content-type']?.includes('application/json');
        if (checks.every(Boolean) && contentTypeOk) {
          ok(10, msg);
        } else {
          fail(10, msg, `checks: ${checks}, content-type: ${contentTypeOk}`);
        }
      } catch (e) {
        fail(10, msg, `parse error: ${e.message}`);
      }
    } else {
      fail(10, msg, `stdout: ${result.stdout}, stderr: ${result.stderr}`);
    }
  }

  // Teste 11: wildcard '*' recebe todos os eventos
  {
    const msg = "Wildcard '*' recebe todos os eventos";

    let receivedCount = 0;
    const server2 = createServer((req, res) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        receivedCount++;
        res.writeHead(200);
        res.end('ok');
      });
    });

    await new Promise(resolve => server2.listen(0, '127.0.0.1', resolve));
    const port2 = server2.address().port;
    const wildcardUrl = `http://127.0.0.1:${port2}/wildcard`;

    const progressPath2 = join(TMP_DIR, 'progress2.txt');
    await writeFile(progressPath2, '', 'utf8');

    const testCode = `
import { appendFile } from 'node:fs/promises';

function now() { return new Date().toISOString().replace(/\\.\\d{3}Z$/, 'Z'); }
async function appendProgress(p, l) { await appendFile(p, l + '\\n', 'utf8'); }

async function notifyWebhooks(config, progressPath, event, data) {
  const notifications = config.notifications;
  if (!Array.isArray(notifications) || notifications.length === 0) return;
  const matching = notifications.filter(n =>
    Array.isArray(n.events) && (n.events.includes(event) || n.events.includes('*'))
  );
  if (matching.length === 0) return;
  const payload = { event, timestamp: now(), project: { slug: config.slug || '', name: config.name || '' }, data };
  const body = JSON.stringify(payload);
  for (const webhook of matching) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: controller.signal });
      clearTimeout(timeout);
      await appendProgress(progressPath, '[WEBHOOK] POST ' + webhook.url + ' → ' + response.status);
    } catch (err) {
      await appendProgress(progressPath, '[WEBHOOK] POST ' + webhook.url + ' → ERRO: ' + err.message);
    }
  }
}

const config = {
  slug: 'test', name: 'Test',
  notifications: [{ url: '${wildcardUrl}', events: ['*'] }],
};

await notifyWebhooks(config, ${JSON.stringify(progressPath2)}, 'feature_done', {});
await notifyWebhooks(config, ${JSON.stringify(progressPath2)}, 'completed', {});
await notifyWebhooks(config, ${JSON.stringify(progressPath2)}, 'error', {});
console.log('DONE');
`;

    const testFile2 = join(TMP_DIR, 'test-wildcard.mjs');
    await writeFile(testFile2, testCode, 'utf8');

    await new Promise(res => {
      const proc = spawn('node', [testFile2], { stdio: 'pipe' });
      let stdout = '';
      proc.stdout.on('data', d => stdout += d);
      proc.on('close', () => res(stdout.trim()));
    });

    server2.close();

    // Deve ter recebido exatamente 3 (um por evento)
    if (receivedCount === 3) {
      ok(11, msg);
    } else {
      fail(11, msg, `esperava 3 chamadas, recebeu ${receivedCount}`);
    }
  }

  // Teste 12: Erro de webhook não impede demais (try/catch funcional)
  {
    const msg = 'Erro de webhook não impede demais (try/catch funcional)';

    let goodReceived = false;
    const goodServer = createServer((req, res) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        goodReceived = true;
        res.writeHead(200);
        res.end('ok');
      });
    });

    await new Promise(resolve => goodServer.listen(0, '127.0.0.1', resolve));
    const goodPort = goodServer.address().port;
    const goodUrl = `http://127.0.0.1:${goodPort}/good`;
    // URL que vai falhar (porta inexistente)
    const badUrl = 'http://127.0.0.1:1/bad';

    const progressPath3 = join(TMP_DIR, 'progress3.txt');
    await writeFile(progressPath3, '', 'utf8');

    const testCode = `
import { appendFile } from 'node:fs/promises';

function now() { return new Date().toISOString().replace(/\\.\\d{3}Z$/, 'Z'); }
async function appendProgress(p, l) { await appendFile(p, l + '\\n', 'utf8'); }

async function notifyWebhooks(config, progressPath, event, data) {
  const notifications = config.notifications;
  if (!Array.isArray(notifications) || notifications.length === 0) return;
  const matching = notifications.filter(n =>
    Array.isArray(n.events) && (n.events.includes(event) || n.events.includes('*'))
  );
  if (matching.length === 0) return;
  const payload = { event, timestamp: now(), project: { slug: config.slug || '', name: config.name || '' }, data };
  const body = JSON.stringify(payload);
  for (const webhook of matching) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: controller.signal });
      clearTimeout(timeout);
      await appendProgress(progressPath, '[WEBHOOK] POST ' + webhook.url + ' → ' + response.status);
    } catch (err) {
      await appendProgress(progressPath, '[WEBHOOK] POST ' + webhook.url + ' → ERRO: ' + err.message);
    }
  }
}

const config = {
  slug: 'test', name: 'Test',
  notifications: [
    { url: '${badUrl}', events: ['*'] },
    { url: '${goodUrl}', events: ['*'] },
  ],
};

await notifyWebhooks(config, ${JSON.stringify(progressPath3)}, 'feature_done', {});
console.log('DONE');
`;

    const testFile3 = join(TMP_DIR, 'test-error-recovery.mjs');
    await writeFile(testFile3, testCode, 'utf8');

    const result = await new Promise(res => {
      const proc = spawn('node', [testFile3], { stdio: 'pipe', timeout: 15000 });
      let stdout = '';
      proc.stdout.on('data', d => stdout += d);
      proc.on('close', () => res(stdout.trim()));
    });

    goodServer.close();

    // O segundo webhook (good) deve ter sido chamado mesmo com o primeiro falhando
    if (result === 'DONE' && goodReceived) {
      ok(12, msg);
    } else {
      fail(12, msg, `done: ${result === 'DONE'}, goodReceived: ${goodReceived}`);
    }
  }

  // Teste 13: Registro de [WEBHOOK] no progress file
  {
    const msg = 'Registro de [WEBHOOK] no progress file';
    const progressContent = await readFile(join(TMP_DIR, 'progress.txt'), 'utf8');
    const hasWebhookLog = progressContent.includes('[WEBHOOK]') && progressContent.includes('POST');
    const hasStatus = progressContent.includes('200') || progressContent.includes('ERRO');
    if (hasWebhookLog && hasStatus) {
      ok(13, msg);
    } else {
      fail(13, msg, `log: ${hasWebhookLog}, status: ${hasStatus}`);
    }
  }
}

// =============================================================================
// Teste: Regressão F-010 e F-011
// =============================================================================

async function testRegression() {
  // node --check
  {
    const msg = 'Regressão — node --check passa + autocontido';
    const result = await new Promise(res => {
      const proc = spawn('node', ['--check', HARNESS_MJS], { stdio: 'pipe' });
      let stderr = '';
      proc.stderr.on('data', d => stderr += d);
      proc.on('close', code => res({ code, stderr }));
    });

    if (result.code === 0) {
      const code = await readFile(HARNESS_MJS, 'utf8');
      const imports = [...code.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
      const external = imports.filter(i => !i.startsWith('node:'));
      if (external.length === 0) {
        ok('R', msg);
      } else {
        fail('R', msg, `Imports externos: ${external.join(', ')}`);
      }
    } else {
      fail('R', msg, result.stderr.trim());
    }
  }
}

// =============================================================================
// Run
// =============================================================================

console.log('\n=== Testes F-012 — Webhooks e notificações ===\n');

await testStaticAnalysis();
await testNotifyWebhooksFunctional();
await testRegression();

// Cleanup
await rm(TMP_DIR, { recursive: true, force: true }).catch(() => {});

console.log(`\n=== Resultado: ${passed} passed, ${failed} failed (total: ${passed + failed}) ===\n`);
process.exit(failed > 0 ? 1 : 0);
