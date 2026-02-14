import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useKai } from '@/hooks/use-kai';
import { Send, Plus, MessageSquare, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'Liste meus projetos',
  'Qual o status geral da fábrica?',
  'Quais features estão falhando?',
  'Inicie o loop do projeto',
];

export function KaiPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    messages,
    conversations,
    conversationId,
    streaming,
    sendMessage,
    fetchConversations,
    loadConversation,
    newConversation,
  } = useKai();

  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    sendMessage(text);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    // Auto-resize (max 4 linhas)
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }

  // Sidebar de conversas
  const sidebar = (
    <div className={cn(
      'flex flex-col h-full bg-muted/30 border-r',
      isDesktop ? 'w-70' : 'w-full',
    )}>
      <div className="p-3 border-b flex items-center justify-between">
        <span className="font-semibold text-sm">Conversas</span>
        <Button variant="ghost" size="icon" onClick={newConversation}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => { loadConversation(c.id); setShowSidebar(false); }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm truncate transition-colors',
                c.id === conversationId ? 'bg-accent' : 'hover:bg-accent/50',
              )}
            >
              <p className="truncate">{c.title || 'Nova conversa'}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(c.updated_at).toLocaleDateString('pt-BR')}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Sidebar desktop */}
      {isDesktop && sidebar}

      {/* Mobile drawer */}
      {!isDesktop && showSidebar && (
        <div className="fixed inset-0 z-50 bg-background" onClick={() => setShowSidebar(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="border-b px-4 py-2 flex items-center gap-2">
          {!isDesktop && (
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)}>
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Kai</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Olá! Sou a Kai</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Sua copilot para a fábrica de software. Como posso ajudar?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    onClick={() => { setInput(s); sendMessage(s); }}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-lg px-4 py-2',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted',
              )}>
                {/* Tool calls */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {msg.toolCalls.map((tc, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs">
                        <Badge variant={tc.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                          {tc.name}
                        </Badge>
                        <span className="text-muted-foreground">{tc.duration_ms}ms</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                  <span className="inline-block w-1.5 h-4 bg-foreground animate-pulse ml-0.5" />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte à Kai..."
              disabled={streaming}
              rows={1}
              className="flex-1 resize-none bg-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              style={{ maxHeight: 96 }}
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || streaming}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
