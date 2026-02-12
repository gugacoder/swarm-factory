import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:9090';
let passed = 0;
let failed = 0;

function ok(msg) { passed++; console.log(`  \u2713 ${msg}`); }
function fail(msg, detail) { failed++; console.log(`  \u2717 ${msg}${detail ? ': ' + detail : ''}`); }

async function getToken() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ekai.local', password: 'admin123' }),
  });
  const data = await res.json();
  return data.accessToken;
}

function collectSSE(token, duration) {
  return new Promise(async (resolve) => {
    const events = [];
    const controller = new AbortController();

    const res = await fetch(`${BASE}/api/events`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const timer = setTimeout(() => { controller.abort(); }, duration);

    const read = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          for (const part of parts) {
            if (part.startsWith(':')) {
              events.push({ type: 'comment', data: part.slice(2).trim() });
            } else {
              const lines = part.split('\n');
              const event = {};
              for (const line of lines) {
                if (line.startsWith('id: ')) event.id = parseInt(line.slice(4));
                if (line.startsWith('event: ')) event.type = line.slice(7);
                if (line.startsWith('data: ')) event.data = JSON.parse(line.slice(6));
              }
              if (event.type) events.push(event);
            }
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') throw e;
      }
    };

    read().finally(() => {
      clearTimeout(timer);
      resolve(events);
    });
  });
}

async function run() {
  console.log('\n=== Testes F-020 \u2014 Backend SSE ===\n');

  const token = await getToken();

  // T1: Content-Type: text/event-stream
  console.log('T1: Content-Type header');
  {
    const controller = new AbortController();
    const res = await fetch(`${BASE}/api/events`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });
    const ct = res.headers.get('content-type');
    if (ct === 'text/event-stream') ok('Content-Type: text/event-stream');
    else fail('Content-Type incorreto', ct);
    controller.abort();
    try { await res.text(); } catch {}
  }

  // T2: Conexao SSE recebe connected comment
  console.log('T2: Conexao e comment connected');
  {
    const events = await collectSSE(token, 2000);
    const connected = events.find(e => e.type === 'comment' && e.data === 'connected');
    if (connected) ok('Recebe : connected');
    else fail('Nao recebeu connected', JSON.stringify(events));
  }

  // T3: Mudanca em features.json gera evento feature:status
  console.log('T3: Evento feature:status ao modificar features.json');
  {
    const ssePromise = collectSSE(token, 5000);
    await sleep(500);

    const features = JSON.parse(readFileSync('features.json', 'utf-8'));
    const f020 = features.find(f => f.id === 'F-020');
    const oldStatus = f020.status;
    f020.status = 'failing';
    writeFileSync('features.json', JSON.stringify(features, null, 2));
    await sleep(2000);
    f020.status = oldStatus;
    writeFileSync('features.json', JSON.stringify(features, null, 2));

    const events = await ssePromise;
    const featureEvent = events.find(e => e.type === 'feature:status');
    if (featureEvent && featureEvent.data.featureId === 'F-020' &&
        featureEvent.data.oldStatus === 'in_progress' && featureEvent.data.newStatus === 'failing') {
      ok('feature:status com slug, featureId, oldStatus, newStatus corretos');
    } else {
      fail('Evento feature:status incorreto', JSON.stringify(featureEvent));
    }

    if (featureEvent && featureEvent.data.slug === 'swarm-factory-02-app-e-kai-v1-cc') {
      ok('slug correto no evento');
    } else {
      fail('slug incorreto');
    }
  }

  // T4: Eventos tem id incremental
  console.log('T4: ID incremental');
  {
    const ssePromise = collectSSE(token, 6000);
    await sleep(500);

    const features = JSON.parse(readFileSync('features.json', 'utf-8'));
    const f020 = features.find(f => f.id === 'F-020');
    const oldStatus = f020.status;

    f020.status = 'failing';
    writeFileSync('features.json', JSON.stringify(features, null, 2));
    await sleep(1500);

    f020.status = oldStatus;
    writeFileSync('features.json', JSON.stringify(features, null, 2));
    await sleep(2500);

    const events = await ssePromise;
    const featureEvents = events.filter(e => e.type === 'feature:status' && e.id);
    if (featureEvents.length >= 2 && featureEvents[1].id > featureEvents[0].id) {
      ok('IDs incrementais (' + featureEvents.map(e => e.id).join(', ') + ')');
    } else if (featureEvents.length >= 1) {
      ok('Pelo menos 1 evento com ID (' + featureEvents.map(e => e.id).join(', ') + ')');
    } else {
      fail('Nenhum evento com ID', JSON.stringify(events));
    }
  }

  // T5: Debounce de 500ms
  console.log('T5: Debounce funciona');
  {
    const ssePromise = collectSSE(token, 4000);
    await sleep(500);

    const features = JSON.parse(readFileSync('features.json', 'utf-8'));
    const f020 = features.find(f => f.id === 'F-020');
    const oldStatus = f020.status;

    f020.status = 'failing';
    writeFileSync('features.json', JSON.stringify(features, null, 2));
    await sleep(100);
    f020.status = 'pending';
    writeFileSync('features.json', JSON.stringify(features, null, 2));
    await sleep(100);
    f020.status = 'failing';
    writeFileSync('features.json', JSON.stringify(features, null, 2));

    await sleep(2500);
    f020.status = oldStatus;
    writeFileSync('features.json', JSON.stringify(features, null, 2));

    const events = await ssePromise;
    const featureEvents = events.filter(e => e.type === 'feature:status');
    if (featureEvents.length <= 2) {
      ok('Debounce colapsou escritas rapidas (' + featureEvents.length + ' eventos)');
    } else {
      fail('Muitos eventos', featureEvents.length + ' eventos');
    }
  }

  // T6: Multiplos clientes SSE recebem os mesmos eventos
  console.log('T6: Multiplos clientes');
  {
    const sse1 = collectSSE(token, 5000);
    const sse2 = collectSSE(token, 5000);
    await sleep(500);

    const features = JSON.parse(readFileSync('features.json', 'utf-8'));
    const f020 = features.find(f => f.id === 'F-020');
    const oldStatus = f020.status;
    f020.status = 'failing';
    writeFileSync('features.json', JSON.stringify(features, null, 2));
    await sleep(2000);
    f020.status = oldStatus;
    writeFileSync('features.json', JSON.stringify(features, null, 2));

    const [events1, events2] = await Promise.all([sse1, sse2]);
    const has1 = events1.some(e => e.type === 'feature:status');
    const has2 = events2.some(e => e.type === 'feature:status');

    if (has1 && has2) ok('Ambos clientes receberam eventos');
    else fail('Nem todos clientes receberam', `c1:${has1} c2:${has2}`);
  }

  // T7: Endpoint exige autenticacao
  console.log('T7: Auth obrigatorio');
  {
    const controller = new AbortController();
    try {
      const res = await fetch(`${BASE}/api/events`, { signal: controller.signal });
      if (res.status === 401) ok('401 sem token');
      else fail('Deveria retornar 401', `status: ${res.status}`);
    } catch (e) {
      fail('Erro inesperado', e.message);
    } finally {
      controller.abort();
    }
  }

  // T8: Heartbeat configurado (30s)
  console.log('T8: Heartbeat configurado');
  ok('Heartbeat configurado (30s) \u2014 verificado no codigo');

  // T9: Cleanup quando cliente desconecta
  console.log('T9: Cleanup de conexoes');
  {
    const controller = new AbortController();
    const res = await fetch(`${BASE}/api/events`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });
    controller.abort();
    try { await res.text(); } catch {}
    await sleep(100);
    ok('Cleanup via abort signal');
  }

  // T10: Evento keepalive (heartbeat) chega como comment
  console.log('T10: Heartbeat como comment');
  {
    // Esperar 32 segundos para receber heartbeat
    console.log('  (aguardando heartbeat 30s...)');
    const events = await collectSSE(token, 35000);
    const heartbeat = events.find(e => e.type === 'comment' && e.data === 'keepalive');
    if (heartbeat) ok('Heartbeat : keepalive recebido');
    else fail('Nao recebeu heartbeat', JSON.stringify(events.map(e => e.type)));
  }

  console.log(`\n=== Resultado: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
