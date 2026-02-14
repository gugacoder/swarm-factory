import { Hono } from 'hono';
import { z } from 'zod';
import pool from '../db.js';
import { getKaiGraph } from '../kai/agent.js';

const kai = new Hono();

const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1),
});

// POST /api/kai/chat — streaming SSE
kai.post('/chat', async (c) => {
  const userId = (c as any).get('userId') as string;
  const body = await c.req.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, 400);
  }

  const { message } = parsed.data;
  let { conversationId } = parsed.data;

  const executionStart = Date.now();

  // Criar ou buscar conversa
  if (!conversationId) {
    const title = message.length > 60 ? message.slice(0, 57) + '...' : message;
    const res = await pool.query(
      'INSERT INTO kai_conversations (user_id, title) VALUES ($1, $2) RETURNING id',
      [userId, title],
    );
    conversationId = res.rows[0].id;
  } else {
    // Verificar que conversa pertence ao usuário
    const check = await pool.query(
      'SELECT id FROM kai_conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId],
    );
    if (check.rows.length === 0) {
      return c.json({ error: 'Conversa não encontrada' }, 404);
    }
    // Atualizar updated_at
    await pool.query(
      'UPDATE kai_conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId],
    );
  }

  // Salvar mensagem do usuário
  const userMsgRes = await pool.query(
    'INSERT INTO kai_messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING id',
    [conversationId, 'user', message],
  );
  const userMessageId = userMsgRes.rows[0].id;

  // Carregar histórico da conversa (últimas 20 mensagens)
  const historyRes = await pool.query(
    'SELECT role, content FROM kai_messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 20',
    [conversationId],
  );
  const conversationHistory = historyRes.rows.reverse().slice(0, -1).map((r: any) => ({
    role: r.role,
    content: r.content,
  }));

  // Streaming SSE response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let eventId = 0;

      function sendEvent(type: string, data: any) {
        eventId++;
        const payload = `id: ${eventId}\nevent: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      try {
        // Executar graph
        const graph = getKaiGraph();
        const result = await graph.invoke({
          message,
          conversationHistory,
        });

        // Enviar tool calls como eventos
        if (result.toolResults && result.toolResults.length > 0) {
          for (const tr of result.toolResults) {
            sendEvent('tool_call', {
              name: tr.name,
              status: tr.status,
              duration_ms: tr.duration_ms,
            });
            sendEvent('tool_result', {
              name: tr.name,
              result: tr.result.length > 2000 ? tr.result.slice(0, 2000) + '...' : tr.result,
              status: tr.status,
            });
          }
        }

        // Enviar resposta como tokens (simulando streaming por chunks)
        const response = result.response || 'Sem resposta';
        const chunks = splitIntoChunks(response, 20);
        for (const chunk of chunks) {
          sendEvent('token', { content: chunk });
        }

        // Persistir mensagem da Kai
        const assistantMsgRes = await pool.query(
          'INSERT INTO kai_messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING id',
          [conversationId, 'assistant', response],
        );
        const assistantMessageId = assistantMsgRes.rows[0].id;

        // Persistir tool calls
        if (result.toolResults && result.toolResults.length > 0) {
          for (const tr of result.toolResults) {
            let inputData = {};
            const toolCall = result.toolsToUse?.find(
              (t: any) => t.name === tr.name,
            );
            if (toolCall) inputData = toolCall.args || {};

            let outputData;
            try {
              outputData = JSON.parse(tr.result);
            } catch {
              outputData = { raw: tr.result };
            }

            await pool.query(
              `INSERT INTO kai_tool_calls (message_id, tool_name, input, output, duration_ms, status)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                assistantMessageId,
                tr.name,
                JSON.stringify(inputData),
                JSON.stringify(outputData),
                tr.duration_ms,
                tr.status === 'success' ? 'success' : 'error',
              ],
            );
          }
        }

        // Persistir execução
        const totalDuration = Date.now() - executionStart;
        await pool.query(
          `INSERT INTO kai_executions (conversation_id, intent, model_used, total_duration_ms, tools_called, success)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            conversationId,
            result.intent || 'unknown',
            'primary+response',
            totalDuration,
            result.toolResults?.length || 0,
            true,
          ],
        );

        // Evento final
        sendEvent('done', {
          conversationId,
          messageId: assistantMessageId,
        });
      } catch (e: any) {
        // Registrar erro
        const totalDuration = Date.now() - executionStart;
        await pool.query(
          `INSERT INTO kai_executions (conversation_id, intent, model_used, total_duration_ms, tools_called, success, error)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [conversationId, 'unknown', 'primary', totalDuration, 0, false, e.message],
        ).catch(() => {});

        sendEvent('error', { error: e.message });
        sendEvent('done', { conversationId, error: true });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});

// GET /api/kai/conversations — lista conversas do usuário
kai.get('/conversations', async (c) => {
  const userId = (c as any).get('userId') as string;

  const res = await pool.query(
    `SELECT id, title, created_at, updated_at
     FROM kai_conversations
     WHERE user_id = $1
     ORDER BY updated_at DESC
     LIMIT 50`,
    [userId],
  );

  return c.json(res.rows);
});

// GET /api/kai/conversations/:id/messages — mensagens de uma conversa
kai.get('/conversations/:id/messages', async (c) => {
  const userId = (c as any).get('userId') as string;
  const conversationId = c.req.param('id');

  // Verificar que conversa pertence ao usuário
  const check = await pool.query(
    'SELECT id FROM kai_conversations WHERE id = $1 AND user_id = $2',
    [conversationId, userId],
  );
  if (check.rows.length === 0) {
    return c.json({ error: 'Conversa não encontrada' }, 404);
  }

  // Mensagens com tool calls
  const msgRes = await pool.query(
    `SELECT m.id, m.role, m.content, m.created_at,
            COALESCE(json_agg(
              json_build_object(
                'id', tc.id,
                'tool_name', tc.tool_name,
                'input', tc.input,
                'output', tc.output,
                'duration_ms', tc.duration_ms,
                'status', tc.status
              )
            ) FILTER (WHERE tc.id IS NOT NULL), '[]') AS tool_calls
     FROM kai_messages m
     LEFT JOIN kai_tool_calls tc ON tc.message_id = m.id
     WHERE m.conversation_id = $1
     GROUP BY m.id, m.role, m.content, m.created_at
     ORDER BY m.created_at`,
    [conversationId],
  );

  return c.json(msgRes.rows);
});

// Utility: split text into word-boundary chunks
function splitIntoChunks(text: string, wordsPerChunk: number): string[] {
  const words = text.split(/(\s+)/);
  const chunks: string[] = [];
  let current = '';
  let wordCount = 0;

  for (const word of words) {
    current += word;
    if (word.trim()) wordCount++;
    if (wordCount >= wordsPerChunk) {
      chunks.push(current);
      current = '';
      wordCount = 0;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

export default kai;
