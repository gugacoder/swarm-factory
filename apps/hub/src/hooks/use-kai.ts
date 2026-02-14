import { useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface ToolCall {
  name: string;
  status: string;
  duration_ms: number;
  result?: string;
}

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useKai() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.get<Conversation[]>('/api/kai/conversations');
      setConversations(data);
    } catch { /* ignora */ }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setConversationId(id);
    try {
      const data = await api.get<any[]>(`/api/kai/conversations/${id}/messages`);
      setMessages(data.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        toolCalls: m.tool_calls?.filter((tc: any) => tc.id) || [],
      })));
    } catch { /* ignora */ }
  }, []);

  const newConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    // Adicionar mensagem do usuário
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = getAccessToken();
      const res = await fetch('/api/kai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ conversationId, message: text }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('Erro na requisição');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Sem body');

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      const toolCalls: ToolCall[] = [];
      let newConvId = conversationId;

      // Adicionar mensagem vazia da assistente
      setMessages((prev) => [...prev, { role: 'assistant', content: '', toolCalls: [] }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const eventLine = lines.find((l) => l.startsWith('event: '));
              const eventType = eventLine?.slice(7) || 'message';

              if (eventType === 'token' || data.content) {
                assistantContent += data.content || '';
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: 'assistant', content: assistantContent, toolCalls };
                  return next;
                });
              } else if (eventType === 'tool_call') {
                toolCalls.push({ name: data.name, status: data.status, duration_ms: data.duration_ms });
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: 'assistant', content: assistantContent, toolCalls: [...toolCalls] };
                  return next;
                });
              } else if (eventType === 'done' && data.conversationId) {
                newConvId = data.conversationId;
              }
            } catch { /* ignora linhas não-JSON */ }
          }
        }
      }

      if (newConvId && newConvId !== conversationId) {
        setConversationId(newConvId);
      }
      fetchConversations();
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' },
        ]);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [conversationId, fetchConversations]);

  return {
    messages,
    conversations,
    conversationId,
    streaming,
    sendMessage,
    fetchConversations,
    loadConversation,
    newConversation,
  };
}
