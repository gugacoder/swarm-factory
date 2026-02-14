#!/usr/bin/env node
// Teste dos endpoints da API de projetos (F-019)

const BASE = 'http://localhost:8101';
const SLUG = 'swarm-factory-02-app-e-kai-v1-cc'; // Projeto com workspace ativo

async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ekai.local', password: 'admin123' }),
  });
  const data = await r.json();
  return data.accessToken;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

let passed = 0;
let failed = 0;

function assert(name, condition, detail) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name} — ${detail || 'falhou'}`);
    failed++;
  }
}

async function main() {
  console.log('Obtendo token...');
  const token = await login();
  assert('Login OK', !!token, 'Sem token');

  const h = authHeaders(token);

  // 1. GET /api/projects — lista projetos
  console.log('\n=== GET /api/projects ===');
  let r = await fetch(`${BASE}/api/projects`, { headers: h });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const projects = await r.json();
  assert('Retorna array', Array.isArray(projects), typeof projects);
  assert('Tem projetos', projects.length > 0, 'vazio');
  if (projects.length > 0) {
    const first = projects[0];
    assert('Projeto tem slug', !!first.slug, JSON.stringify(first));
    assert('Projeto tem name', first.name !== undefined, JSON.stringify(first));
  }
  console.log(`  → ${projects.length} projetos encontrados`);

  // 2. Todas as rotas exigem autenticação
  console.log('\n=== Auth obrigatória ===');
  r = await fetch(`${BASE}/api/projects`);
  assert('GET /api/projects sem auth → 401', r.status === 401, `Status: ${r.status}`);

  // 3. POST /api/projects — slug duplicado = 409
  console.log('\n=== POST /api/projects (slug existente) ===');
  r = await fetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      slug: SLUG,
      name: 'Test',
      workspace: '/tmp/test',
      specs: '/tmp/specs',
      harness: 'claude-code',
    }),
  });
  assert('Slug duplicado retorna 409', r.status === 409, `Status: ${r.status}`);

  // 4. POST /api/projects — body inválido = 400
  console.log('\n=== POST /api/projects (body invalido) ===');
  r = await fetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ slug: 'AB' }),
  });
  assert('Body invalido retorna 400', r.status === 400, `Status: ${r.status}`);

  // 5. GET /api/projects/:slug — detalhes
  console.log(`\n=== GET /api/projects/${SLUG} ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}`, { headers: h });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const detail = await r.json();
  assert('Tem version', detail.version !== undefined, JSON.stringify(detail).substring(0, 200));
  assert('Tem workspace', !!detail.workspace, 'workspace vazio');
  assert('Tem agent', !!detail.agent, 'agent vazio');

  // 6. GET /api/projects/:slug/status — status com features count
  console.log(`\n=== GET /api/projects/${SLUG}/status ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}/status`, { headers: h });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const status = await r.json();
  assert('Tem state', !!status.state, JSON.stringify(status).substring(0, 200));
  assert('Tem features', !!status.features, 'features vazio');
  assert('Tem progress (number)', typeof status.progress === 'number', typeof status.progress);
  assert('Features tem total', typeof status.features.total === 'number', typeof status.features.total);
  assert('Features tem passing', typeof status.features.passing === 'number', typeof status.features.passing);
  console.log(`  → State: ${status.state}, Progress: ${status.progress}%, Features: ${status.features.passing}/${status.features.total}`);

  // 7. PATCH /api/projects/:slug — atualizar parametros
  console.log(`\n=== PATCH /api/projects/${SLUG} ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}`, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ max_turns: 100 }),
  });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const updated = await r.json();
  assert('max_turns atualizado para 100', updated.agent?.max_turns === 100, `max_turns: ${updated.agent?.max_turns}`);
  // Reverter
  await fetch(`${BASE}/api/projects/${SLUG}`, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ max_turns: 50 }),
  });
  console.log('  → Revertido para 50');

  // 8. GET /api/projects/:slug/features — features.json parseado
  console.log(`\n=== GET /api/projects/${SLUG}/features ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}/features`, { headers: h });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const features = await r.json();
  assert('Retorna array de features', Array.isArray(features), typeof features);
  assert('Tem features', features.length > 0, 'vazio');
  if (features.length > 0) {
    assert('Feature tem id', !!features[0].id, JSON.stringify(features[0]).substring(0, 100));
    assert('Feature tem status', !!features[0].status, JSON.stringify(features[0]).substring(0, 100));
    assert('Feature tem priority', typeof features[0].priority === 'number', typeof features[0].priority);
  }
  console.log(`  → ${features.length} features`);

  // 9. GET /api/projects/:slug/sessions — listar sessões
  console.log(`\n=== GET /api/projects/${SLUG}/sessions ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}/sessions`, { headers: h });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const sessions = await r.json();
  assert('Retorna array', Array.isArray(sessions), typeof sessions);
  console.log(`  → ${sessions.length} sessões`);

  // 10. GET /api/projects/:slug/progress — agent-progress.txt
  console.log(`\n=== GET /api/projects/${SLUG}/progress ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}/progress`, { headers: h });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const progress = await r.text();
  assert('Retorna texto do progress', progress.length > 0, 'vazio');
  console.log(`  → ${progress.length} chars`);

  // 11. GET /api/projects/:slug/loop/logs
  console.log(`\n=== GET /api/projects/${SLUG}/loop/logs ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}/loop/logs`, { headers: h });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const logs = await r.text();
  assert('Retorna texto dos logs', logs.length > 0, 'vazio');
  console.log(`  → ${logs.length} chars`);

  // 12. GET /api/projects/:slug/loop/logs?tail=5
  console.log(`\n=== GET /api/projects/${SLUG}/loop/logs?tail=5 ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}/loop/logs?tail=5`, { headers: h });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const tailLogs = await r.text();
  assert('Tail retorna <= total', tailLogs.length > 0 && tailLogs.length <= logs.length, `${tailLogs.length} chars`);

  // 13. Validação Zod em inputs
  console.log('\n=== Validação Zod ===');
  r = await fetch(`${BASE}/api/projects/${SLUG}`, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ max_turns: -1 }),
  });
  assert('PATCH com max_turns negativo → 400', r.status === 400, `Status: ${r.status}`);

  // 14. GET /api/projects/slug-inexistente → 404
  console.log('\n=== GET /api/projects/slug-inexistente ===');
  r = await fetch(`${BASE}/api/projects/slug-inexistente`, { headers: h });
  assert('Slug inexistente retorna 404', r.status === 404, `Status: ${r.status}`);

  // 15. Loop stop (graceful) — cria .stop file
  console.log(`\n=== POST /api/projects/${SLUG}/loop/stop (graceful) ===`);
  r = await fetch(`${BASE}/api/projects/${SLUG}/loop/stop`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ force: false }),
  });
  assert('Status 200', r.status === 200, `Status: ${r.status}`);
  const stopResult = await r.json();
  assert('Method graceful', stopResult.method === 'graceful', stopResult.method);
  // Limpar .stop file
  const fs = await import('node:fs/promises');
  try {
    await fs.unlink(
      'D:\\sources\\_unowned\\swarm-factory\\runs\\worktrees\\02-app-e-kai-v1\\.stop',
    );
  } catch {}

  console.log(`\n========================================`);
  console.log(`Resultado: ${passed} passaram, ${failed} falharam`);
  console.log(`========================================`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('ERRO FATAL:', e);
  process.exit(1);
});
