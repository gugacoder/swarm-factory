# PRP-011 — PWA e Notificacoes

## Objetivo

Tornar o hub instalavel como PWA com service worker, implementar sistema de notificacoes (toast + push), e ativar modo proativo da Kai.

## Execution Mode

`implementar`

## Contexto

O PRP-007 criou o hub React com shell mobile-first. O PRP-005 criou o SSE com eventos de feature:status, loop:start, loop:stop. O PRP-008 conectou SSE ao frontend. As notificacoes estao definidas em `requirements.md` (OSD190-OSD195, OSD210-OSD211) e `user-stories.md` (US014, US015). O PRP-002 criou as tabelas `notifications` e `notification_preferences`.

## Especificacao

### PWA Manifest (apps/hub/public/manifest.json)

```json
{
  "name": "E-Kai",
  "short_name": "E-Kai",
  "description": "Gestao da fabrica de software autonoma",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#d946ef",
  "icons": [...]
}
```

- Gerar icones em 192x192 e 512x512 (placeholder com letra "K" em fundo fuchsia)
- Link no `index.html`: `<link rel="manifest" href="/manifest.json">`
- Meta tags: `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable">`

### Service Worker (apps/hub/public/sw.js)

Usar Workbox (via plugin Vite ou registration manual):
- Precache de assets estaticos (JS, CSS, fonts) (OSD211)
- Cache-first para assets estaticos
- Network-first para API calls
- Fallback offline: pagina simples "Voce esta offline" (RNF012)
- Registration no `src/main.tsx`

### Push Notifications

- Endpoint backend: `POST /api/notifications/subscribe` — body com PushSubscription
- Backend armazena subscription na tabela `notification_preferences` (campo adicional `push_subscription jsonb`)
- Quando evento relevante ocorre (feature:status change, loop:stop, feature_max_retries), backend envia push via Web Push API (OSD195)
- Dependencia backend: `web-push` npm package
- VAPID keys no .env

### Toast System

- Usar Sonner (ja instalado via shadcn) para toasts na interface (OSD194)
- Hook `useNotifications()`:
  - Escuta eventos SSE
  - Exibe toast para cada evento relevante
  - Mapeamento evento → toast:
    - `feature:status` (para passing) → toast success "Feature X passou!"
    - `feature:status` (para failing) → toast warning "Feature X falhou"
    - `loop:start` → toast info "Loop iniciado para {slug}"
    - `loop:stop` → toast info "Loop parou para {slug}"
  - Se app nao esta em foco e push habilitado, dispara push notification ao inves de toast

### Notifications Page/Panel

- Icone de sino (Bell) no shell com badge de contagem de nao lidas
- Click abre panel (Sheet em mobile, Popover em desktop)
- Lista de notificacoes: titulo, body, timestamp relativo, indicador de lida/nao lida
- Botao "Marcar todas como lidas"
- Endpoints:
  - `GET /api/notifications` — lista notificacoes do usuario
  - `PATCH /api/notifications/:id/read` — marca como lida
  - `PATCH /api/notifications/read-all` — marca todas como lidas

### Notification Preferences

- Na pagina de Settings, secao "Notificacoes"
- Toggle por tipo de notificacao (toast on/off, push on/off)
- Endpoint: `PATCH /api/notifications/preferences`

### Kai Proativo (OSD169, US050)

- Toggle "Modo Proativo" na pagina de Settings
- Quando ativo, backbone roda um cron job (setInterval a cada 5 min) que:
  - Verifica se algum projeto tem loop ativo sem progresso por 10+ minutos (OSD078)
  - Verifica se alguma feature excedeu max_retries
  - Cria notificacao com type `kai_proactive_alert`
  - Sugere acao corretiva no body da notificacao
- Notificacao proativa inclui metadata com link para o projeto/feature

### Verificacao

App instalavel como PWA (icone na home screen). Push notifications funcionam quando app em background. Toasts aparecem ao mudar status de feature. Sino mostra contagem de nao lidas. Kai proativa gera alertas quando loop trava.

## Limites

- Nao implementar sincronizacao offline de dados (apenas fallback de pagina)
- Nao implementar background sync
- Push notifications apenas para Chrome e Safari (Firefox PWA push e experimental)
- Nao enviar mais de 1 push por minuto por usuario (throttle)
- Kai proativa apenas notifica — nao executa acoes automaticas sem confirmacao do operador
