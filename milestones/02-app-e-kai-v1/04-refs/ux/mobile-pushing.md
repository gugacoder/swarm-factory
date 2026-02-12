# PWA Push Notifications & Badges — Referência Estado da Arte

> **Última atualização:** Fevereiro 2026  
> **Escopo:** Integração completa de notificações push e badges para Android e iOS  
> **Stack de referência:** Vite/React PWA + Node.js Backend

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (PWA)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  App Shell    │  │  Service      │  │  Push Subscription    │ │
│  │  (React/Vite) │  │  Worker       │  │  Manager              │ │
│  │              │──│  (sw.js)      │──│  - subscribe()        │ │
│  │  - UI/UX     │  │  - push event │  │  - unsubscribe()      │ │
│  │  - Badge API │  │  - click event│  │  - feature detection  │ │
│  │  - Install   │  │  - badge sync │  │  - permission flow    │ │
│  └──────────────┘  └──────┬───────┘  └───────────┬───────────┘ │
│                           │                       │             │
└───────────────────────────┼───────────────────────┼─────────────┘
                            │                       │
                     Push Service                   │
              ┌─────────────┤─────────────┐         │
              │             │             │         │
        ┌─────────┐  ┌──────────┐  ┌──────────┐   │
        │  FCM     │  │  Mozilla  │  │  APNs    │   │
        │ (Chrome) │  │ Autopush  │  │ (Safari) │   │
        └────┬────┘  └────┬─────┘  └────┬─────┘   │
             └─────────────┼────────────┘          │
                           │                       │
┌──────────────────────────┼───────────────────────┼─────────────┐
│                   BACKEND (Node.js)              │             │
│  ┌──────────────────┐  ┌─────────────────────────┴───────────┐ │
│  │  Web Push Server  │  │  Subscription Store (DB)            │ │
│  │  - VAPID auth     │  │  - endpoint                        │ │
│  │  - Payload encrypt│  │  - keys (p256dh + auth)            │ │
│  │  - TTL/Urgency    │  │  - user_id / tenant_id             │ │
│  │  - Retry logic    │  │  - platform (android/ios/desktop)  │ │
│  └──────────────────┘  └─────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Compatibilidade por Plataforma

| Feature | Android (Chrome) | iOS (Safari 16.4+) | Desktop (Chrome/Edge) |
|---|---|---|---|
| Push API | ✅ Full | ✅ Requer instalação | ✅ Full |
| Notification API | ✅ Full | ✅ Com limitações | ✅ Full |
| Badge API (`setAppBadge`) | ⚠️ Automático via notif. | ✅ Requer perm. notif. | ✅ Win/macOS |
| Service Worker | ✅ Full | ✅ Full | ✅ Full |
| Background Sync | ✅ Full | ⚠️ Limitado | ✅ Full |
| Periodic Background Sync | ✅ Chrome 80+ | ❌ | ✅ Chrome 80+ |
| Silent Push | ✅ Com quota | ❌ | ✅ Com quota |
| Rich Notifications (imagem) | ✅ Full | ❌ | ✅ Full |
| Action Buttons | ✅ Até 2 ações | ❌ | ✅ Full |
| Notification Sound | ✅ Sistema | ✅ Sistema | ✅ Sistema |
| Persistent Notification | ✅ | ⚠️ Apple pode parar | ✅ |

**Notas críticas do iOS:**
- A PWA **precisa estar instalada** (Add to Home Screen) — notificações push NÃO funcionam no Safari browser tab
- O `display` do manifest **precisa ser** `standalone` ou `fullscreen`
- Permissão de notificação **só pode ser solicitada via user gesture** (click, tap)
- Se o usuário não interagir com pushes por um tempo, o iOS pode **parar de entregar**
- Cross-browser no iOS: Chrome e Edge no iOS usam WebKit, então seguem as mesmas regras do Safari
- Sem suporte a rich media (imagens grandes), action buttons ou silent push

---

## 3. Manifest (manifest.json)

O manifest é obrigatório para que a PWA seja instalável e suporte push no iOS.

```json
{
  "name": "Cia Cuidadores",
  "short_name": "CiaCuidadores",
  "description": "Plataforma de gestão de cuidadores",
  "start_url": "/?utm_source=pwa",
  "id": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1a73e8",
  "background_color": "#ffffff",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

**HTML head tags obrigatórios:**

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1a73e8" />

<!-- iOS-specific -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="CiaCuidadores" />
<link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
```

---

## 4. VAPID Keys — Geração e Configuração

VAPID (Voluntary Application Server Identification) autentica seu servidor com os push services.

### Geração (uma vez)

```bash
# Via CLI
npm install -g web-push
web-push generate-vapid-keys

# Output:
# Public Key: BDO0P...base64url...
# Private Key: 3J303...base64url...
```

```javascript
// Ou programaticamente
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public:', vapidKeys.publicKey);
console.log('Private:', vapidKeys.privateKey);
```

### Variáveis de Ambiente (.env)

```env
VAPID_PUBLIC_KEY=BDO0P...sua_chave_publica_aqui
VAPID_PRIVATE_KEY=3J303...sua_chave_privada_aqui
VAPID_MAILTO=mailto:admin@ciacuidadores.com.br
```

**Regras de segurança:**
- A chave privada NUNCA deve ser exposta no cliente
- A chave pública É compartilhada com o browser (é segura)
- NUNCA reutilize VAPID keys como chaves de encriptação de dados
- Se trocar as keys, TODAS as subscriptions existentes serão invalidadas

---

## 5. Service Worker Completo (sw.js)

```javascript
// =============================================================
// sw.js — Service Worker com Push, Badge e Cache
// =============================================================

const CACHE_NAME = 'cia-cuidadores-v1';
const OFFLINE_URL = '/offline.html';

// ─── INSTALL ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/icons/icon-192x192.png',
        '/icons/badge-72x72.png',
      ]);
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── FETCH (Network First com Fallback) ─────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// ─── PUSH ────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: 'Nova notificação',
      body: event.data ? event.data.text() : 'Você tem uma atualização',
    };
  }

  const {
    title = 'Cia Cuidadores',
    body = 'Você tem uma nova atualização',
    icon = '/icons/icon-192x192.png',
    badge = '/icons/badge-72x72.png',
    image,               // URL da imagem grande (Android/Desktop only)
    tag,                 // agrupa notificações com mesmo tag
    renotify = false,    // re-notifica mesmo se tag existe
    requireInteraction = false,
    silent = false,
    data: notifData = {},
    actions = [],        // [{action: 'open', title: 'Abrir'}, ...]
    badgeCount,          // contador para badge do ícone
  } = data;

  const options = {
    body,
    icon,
    badge,                // ícone pequeno na status bar (Android)
    tag,
    renotify,
    requireInteraction,
    silent,
    data: {
      url: notifData.url || '/',
      ...notifData,
    },
    vibrate: [200, 100, 200],
  };

  // Adiciona imagem se suportada (Android/Desktop)
  if (image) {
    options.image = image;
  }

  // Adiciona action buttons se suportados (Android/Desktop)
  if (actions.length > 0) {
    options.actions = actions.slice(0, 2); // máximo 2 no Android
  }

  const promises = [];

  // 1. Mostra a notificação (OBRIGATÓRIO — push sem notificação viola a spec)
  promises.push(
    self.registration.showNotification(title, options)
  );

  // 2. Atualiza o badge do ícone do app
  if ('setAppBadge' in navigator && badgeCount !== undefined) {
    if (badgeCount > 0) {
      promises.push(navigator.setAppBadge(badgeCount));
    } else {
      promises.push(navigator.clearAppBadge());
    }
  }

  // 3. Comunica com a página aberta (se existir)
  promises.push(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            payload: data,
          });
        });
      })
  );

  event.waitUntil(Promise.all(promises));
});

// ─── NOTIFICATION CLICK ─────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';
  const actionUrl = event.action
    ? event.notification.data?.[`action_${event.action}_url`] || targetUrl
    : targetUrl;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Tenta focar uma janela existente
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: actionUrl,
              action: event.action,
            });
            return client.focus();
          }
        }
        // Abre nova janela se não existe
        if (self.clients.openWindow) {
          return self.clients.openWindow(actionUrl);
        }
      })
  );
});

// ─── NOTIFICATION CLOSE ─────────────────────────────────────
self.addEventListener('notificationclose', (event) => {
  // Analytics: notificação foi descartada
  const data = event.notification.data;
  // Opcional: enviar evento de analytics
  // fetch('/api/analytics/notification-dismissed', { ... });
});

// ─── PUSH SUBSCRIPTION CHANGE ───────────────────────────────
// Importante: subscriptions podem expirar ou ser revogadas
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(self.__VAPID_PUBLIC_KEY__),
      })
      .then((newSubscription) => {
        // Atualiza no backend
        return fetch('/api/push/subscription/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            old: event.oldSubscription ? event.oldSubscription.toJSON() : null,
            new: newSubscription.toJSON(),
          }),
        });
      })
  );
});

// ─── HELPER ──────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

---

## 6. Cliente — Push Manager (React/TypeScript)

```typescript
// =============================================================
// lib/push-manager.ts — Gerenciamento completo de Push
// =============================================================

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// ─── TIPOS ───────────────────────────────────────────────────

interface PushState {
  isSupported: boolean;
  isInstalled: boolean;
  permission: NotificationPermission | 'unsupported';
  subscription: PushSubscription | null;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
}

interface SubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  platform: string;
  userAgent: string;
}

// ─── DETECÇÃO DE PLATAFORMA ──────────────────────────────────

export function detectPlatform(): PushState['platform'] {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (/Android/.test(ua)) {
    return 'android';
  }
  return 'desktop';
}

export function isInstalledPWA(): boolean {
  // Modo standalone (Android + iOS)
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // iOS fallback
  if ((navigator as any).standalone === true) return true;
  // Fallback via referrer
  if (document.referrer.includes('android-app://')) return true;
  return false;
}

// ─── FEATURE DETECTION ───────────────────────────────────────

export function getPushState(): PushState {
  const platform = detectPlatform();
  const isSupported = 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;

  return {
    isSupported,
    isInstalled: isInstalledPWA(),
    permission: isSupported ? Notification.permission : 'unsupported',
    subscription: null, // será preenchido após getSubscription()
    platform,
  };
}

// ─── REGISTRO DO SERVICE WORKER ──────────────────────────────

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    // Verifica updates periodicamente
    setInterval(() => registration.update(), 60 * 60 * 1000); // 1h

    return registration;
  } catch (error) {
    console.error('[Push] SW registration failed:', error);
    return null;
  }
}

// ─── PERMISSÃO ───────────────────────────────────────────────

/**
 * Solicita permissão de notificação.
 * DEVE ser chamado dentro de um user gesture (click/tap) — obrigatório no iOS.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  // Se já decidido, retorna o estado atual
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('[Push] Permission request failed:', error);
    return 'denied';
  }
}

// ─── SUBSCRIPTION ────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    // Verifica se já existe subscription ativa
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Valida se a subscription ainda é válida
      await syncSubscriptionWithBackend(subscription);
      return subscription;
    }

    // Cria nova subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // OBRIGATÓRIO — sem isso iOS rejeita
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Salva no backend
    await saveSubscriptionToBackend(subscription);

    return subscription;
  } catch (error) {
    console.error('[Push] Subscribe failed:', error);

    // Trata erros comuns
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        console.warn('[Push] Permission not granted');
      } else if (error.name === 'AbortError') {
        console.warn('[Push] Subscription aborted — provavelmente iOS sem instalação');
      }
    }

    return null;
  }
}

export async function unsubscribeFromPush(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    // Remove do backend ANTES de cancelar local
    await removeSubscriptionFromBackend(subscription);

    return await subscription.unsubscribe();
  } catch (error) {
    console.error('[Push] Unsubscribe failed:', error);
    return false;
  }
}

// ─── BACKEND SYNC ────────────────────────────────────────────

async function saveSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
  const sub = subscription.toJSON();
  const payload: SubscriptionPayload = {
    endpoint: sub.endpoint!,
    keys: {
      p256dh: sub.keys!.p256dh!,
      auth: sub.keys!.auth!,
    },
    platform: detectPlatform(),
    userAgent: navigator.userAgent,
  };

  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`, // seu JWT
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to save subscription: ${response.status}`);
  }
}

async function syncSubscriptionWithBackend(subscription: PushSubscription): Promise<void> {
  const sub = subscription.toJSON();
  await fetch('/api/push/subscription/sync', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      platform: detectPlatform(),
    }),
  });
}

async function removeSubscriptionFromBackend(subscription: PushSubscription): Promise<void> {
  const sub = subscription.toJSON();
  await fetch('/api/push/unsubscribe', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
}

function getAuthToken(): string {
  return localStorage.getItem('auth_token') || '';
}

// ─── BADGE API ───────────────────────────────────────────────

export async function setBadge(count: number): Promise<void> {
  if (!('setAppBadge' in navigator)) return;

  try {
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge();
    }
  } catch (error) {
    console.error('[Badge] Failed to set badge:', error);
  }
}

export async function clearBadge(): Promise<void> {
  if (!('clearAppBadge' in navigator)) return;

  try {
    await navigator.clearAppBadge();
  } catch (error) {
    console.error('[Badge] Failed to clear badge:', error);
  }
}

// ─── MENSAGENS DO SW ─────────────────────────────────────────

export function onPushMessage(callback: (data: any) => void): () => void {
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'PUSH_RECEIVED') {
      callback(event.data.payload);
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}

export function onNotificationClick(callback: (data: any) => void): () => void {
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NOTIFICATION_CLICK') {
      callback(event.data);
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}
```

---

## 7. React Hook — usePushNotifications

```tsx
// =============================================================
// hooks/usePushNotifications.ts
// =============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPushState,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  setBadge,
  clearBadge,
  onPushMessage,
  onNotificationClick,
  detectPlatform,
  isInstalledPWA,
} from '../lib/push-manager';

interface UsePushReturn {
  // Estado
  isSupported: boolean;
  isInstalled: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'unsupported';
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  loading: boolean;
  error: string | null;
  needsInstall: boolean; // true se iOS e não instalado

  // Ações
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  updateBadge: (count: number) => Promise<void>;
}

export function usePushNotifications(
  onMessage?: (data: any) => void,
  onNotifClick?: (data: any) => void
): UsePushReturn {
  const [state, setState] = useState(() => getPushState());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Inicialização
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const reg = await registerServiceWorker();
        if (!mounted || !reg) {
          setLoading(false);
          return;
        }

        registrationRef.current = reg;

        // Verifica subscription existente
        const sub = await reg.pushManager.getSubscription();
        if (mounted) {
          setIsSubscribed(!!sub);
          setState((prev) => ({
            ...prev,
            subscription: sub,
            permission: Notification.permission,
          }));
        }
      } catch (err) {
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  // Listeners de mensagens do SW
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    if (onMessage) {
      cleanups.push(onPushMessage(onMessage));
    }
    if (onNotifClick) {
      cleanups.push(onNotificationClick(onNotifClick));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [onMessage, onNotifClick]);

  // Subscribe
  const subscribe = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Verifica plataforma
      const platform = detectPlatform();
      if (platform === 'ios' && !isInstalledPWA()) {
        setError('iOS requer que o app seja instalado na tela inicial antes de ativar notificações.');
        setLoading(false);
        return false;
      }

      // 2. Pede permissão
      const permission = await requestNotificationPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission !== 'granted') {
        setError('Permissão de notificação negada pelo usuário.');
        setLoading(false);
        return false;
      }

      // 3. Registra subscription
      const reg = registrationRef.current;
      if (!reg) {
        setError('Service Worker não registrado.');
        setLoading(false);
        return false;
      }

      const subscription = await subscribeToPush(reg);
      if (!subscription) {
        setError('Falha ao criar subscription.');
        setLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setState((prev) => ({ ...prev, subscription }));
      return true;
    } catch (err) {
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Unsubscribe
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const reg = registrationRef.current;
      if (!reg) return false;

      const success = await unsubscribeFromPush(reg);
      if (success) {
        setIsSubscribed(false);
        setState((prev) => ({ ...prev, subscription: null }));
        await clearBadge();
      }
      return success;
    } catch (err) {
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Badge
  const updateBadge = useCallback(async (count: number) => {
    await setBadge(count);
  }, []);

  return {
    isSupported: state.isSupported,
    isInstalled: state.isInstalled || isInstalledPWA(),
    isSubscribed,
    permission: state.permission,
    platform: state.platform,
    loading,
    error,
    needsInstall: state.platform === 'ios' && !isInstalledPWA(),
    subscribe,
    unsubscribe,
    updateBadge,
  };
}
```

---

## 8. Componente — Notification Permission UI

```tsx
// =============================================================
// components/PushNotificationSetup.tsx
// =============================================================

import { usePushNotifications } from '../hooks/usePushNotifications';

export function PushNotificationSetup() {
  const {
    isSupported,
    isInstalled,
    isSubscribed,
    permission,
    platform,
    loading,
    error,
    needsInstall,
    subscribe,
    unsubscribe,
  } = usePushNotifications(
    // Callback quando recebe push com app aberto
    (data) => {
      console.log('Push received in foreground:', data);
      // Atualizar UI, toasts, etc.
    },
    // Callback quando clica na notificação
    (data) => {
      console.log('Notification clicked:', data);
      // Navegar para a URL
      if (data.url) {
        window.location.href = data.url;
      }
    }
  );

  if (!isSupported) {
    return (
      <div className="notification-banner warning">
        Seu navegador não suporta notificações push.
      </div>
    );
  }

  // iOS: Precisa instalar primeiro
  if (needsInstall) {
    return (
      <div className="notification-banner info">
        <h3>Ative notificações</h3>
        <p>Para receber notificações no iPhone/iPad:</p>
        <ol>
          <li>Toque no botão <strong>Compartilhar</strong> (ícone ↑) do Safari</li>
          <li>Selecione <strong>"Adicionar à Tela de Início"</strong></li>
          <li>Abra o app pela tela inicial</li>
          <li>Ative as notificações quando solicitado</li>
        </ol>
        {/* Opcional: imagem/GIF mostrando o passo a passo */}
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="notification-banner warning">
        <p>Notificações estão bloqueadas.</p>
        <p>
          {platform === 'ios'
            ? 'Vá em Ajustes → Notificações → Cia Cuidadores e ative as notificações.'
            : 'Clique no ícone de cadeado na barra de endereço e permita notificações.'}
        </p>
      </div>
    );
  }

  return (
    <div className="notification-banner">
      {isSubscribed ? (
        <div>
          <p>✅ Notificações ativadas</p>
          <button onClick={unsubscribe} disabled={loading}>
            Desativar notificações
          </button>
        </div>
      ) : (
        <div>
          <p>🔔 Ative notificações para receber alertas em tempo real.</p>
          <button onClick={subscribe} disabled={loading}>
            {loading ? 'Ativando...' : 'Ativar notificações'}
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## 9. Backend — API de Push (Node.js)

```javascript
// =============================================================
// server/push-service.js — Servidor de Push Notifications
// =============================================================

const webpush = require('web-push');

// Configuração VAPID
webpush.setVapidDetails(
  process.env.VAPID_MAILTO,        // 'mailto:admin@ciacuidadores.com.br'
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ─── SCHEMA DO BANCO (Exemplo PostgreSQL) ────────────────────
/*
CREATE TABLE push_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  endpoint      TEXT NOT NULL UNIQUE,
  key_p256dh    TEXT NOT NULL,
  key_auth      TEXT NOT NULL,
  platform      VARCHAR(20) NOT NULL,  -- 'android' | 'ios' | 'desktop'
  user_agent    TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ
);

CREATE INDEX idx_push_sub_user ON push_subscriptions(user_id) WHERE is_active = true;
CREATE INDEX idx_push_sub_tenant ON push_subscriptions(tenant_id) WHERE is_active = true;
*/

// ─── ENVIO DE NOTIFICAÇÃO ────────────────────────────────────

/**
 * Payload padrão para push notification
 */
function buildPushPayload({
  title,
  body,
  url = '/',
  icon = '/icons/icon-192x192.png',
  badge = '/icons/badge-72x72.png',
  image,           // só funciona em Android/Desktop
  tag,
  badgeCount,
  actions = [],    // [{action: 'ver', title: 'Ver detalhes'}]
  data = {},
}) {
  return JSON.stringify({
    title,
    body,
    icon,
    badge,
    image,
    tag,
    renotify: !!tag,
    badgeCount,
    actions,
    data: { url, ...data },
  });
}

/**
 * Opções de envio por plataforma
 */
function getPushOptions(platform) {
  const base = {
    TTL: 86400,                 // 24h — tempo que o push service guarda a msg
    headers: {},
  };

  switch (platform) {
    case 'ios':
      return {
        ...base,
        urgency: 'high',       // iOS tende a atrasar 'normal'
        TTL: 43200,             // 12h — iOS é mais restritivo
      };
    case 'android':
      return {
        ...base,
        urgency: 'high',
        TTL: 86400,
      };
    default:
      return {
        ...base,
        urgency: 'normal',
      };
  }
}

/**
 * Envia push para um único subscription
 * Retorna: { success: boolean, statusCode?: number, shouldRemove?: boolean }
 */
async function sendPushToSubscription(subscription, payload, platform = 'unknown') {
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.key_p256dh,
      auth: subscription.key_auth,
    },
  };

  const options = getPushOptions(platform);

  try {
    const result = await webpush.sendNotification(pushSubscription, payload, options);
    return { success: true, statusCode: result.statusCode };
  } catch (error) {
    const statusCode = error.statusCode;

    // 404 ou 410: subscription não existe mais → remover
    if (statusCode === 404 || statusCode === 410) {
      return { success: false, statusCode, shouldRemove: true };
    }

    // 429: rate limit → retry depois
    if (statusCode === 429) {
      const retryAfter = error.headers?.['retry-after'] || 60;
      console.warn(`[Push] Rate limited. Retry after ${retryAfter}s`);
      return { success: false, statusCode, retryAfter };
    }

    // 413: payload muito grande (max ~4KB)
    if (statusCode === 413) {
      console.error('[Push] Payload too large');
      return { success: false, statusCode };
    }

    console.error('[Push] Send error:', statusCode, error.body);
    return { success: false, statusCode };
  }
}

/**
 * Envia push para todos os dispositivos de um usuário
 */
async function sendPushToUser(db, userId, notificationData) {
  const subscriptions = await db.query(
    'SELECT * FROM push_subscriptions WHERE user_id = $1 AND is_active = true',
    [userId]
  );

  const payload = buildPushPayload(notificationData);
  const results = [];

  for (const sub of subscriptions.rows) {
    const result = await sendPushToSubscription(sub, payload, sub.platform);
    results.push({ subscriptionId: sub.id, ...result });

    // Remove subscriptions inválidas
    if (result.shouldRemove) {
      await db.query(
        'UPDATE push_subscriptions SET is_active = false, updated_at = NOW() WHERE id = $1',
        [sub.id]
      );
    } else if (result.success) {
      await db.query(
        'UPDATE push_subscriptions SET last_used_at = NOW() WHERE id = $1',
        [sub.id]
      );
    }
  }

  return results;
}

/**
 * Envia push para todos os usuários de um tenant
 */
async function sendPushToTenant(db, tenantId, notificationData, excludeUserIds = []) {
  let query = 'SELECT * FROM push_subscriptions WHERE tenant_id = $1 AND is_active = true';
  const params = [tenantId];

  if (excludeUserIds.length > 0) {
    query += ' AND user_id != ALL($2)';
    params.push(excludeUserIds);
  }

  const subscriptions = await db.query(query, params);
  const payload = buildPushPayload(notificationData);

  // Envia em batch com concorrência limitada
  const BATCH_SIZE = 50;
  const results = [];

  for (let i = 0; i < subscriptions.rows.length; i += BATCH_SIZE) {
    const batch = subscriptions.rows.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (sub) => {
        const result = await sendPushToSubscription(sub, payload, sub.platform);
        if (result.shouldRemove) {
          await db.query(
            'UPDATE push_subscriptions SET is_active = false WHERE id = $1',
            [sub.id]
          );
        }
        return { subscriptionId: sub.id, ...result };
      })
    );
    results.push(...batchResults);
  }

  return results;
}

module.exports = {
  buildPushPayload,
  sendPushToSubscription,
  sendPushToUser,
  sendPushToTenant,
};
```

---

## 10. API Routes (Express)

```javascript
// =============================================================
// server/routes/push.js
// =============================================================

const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');

// POST /api/push/subscribe
router.post('/subscribe', authenticateJWT, async (req, res) => {
  const { endpoint, keys, platform, userAgent } = req.body;
  const { userId, tenantId } = req.user;

  try {
    await req.db.query(`
      INSERT INTO push_subscriptions (user_id, tenant_id, endpoint, key_p256dh, key_auth, platform, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (endpoint) DO UPDATE SET
        key_p256dh = $4,
        key_auth = $5,
        platform = $6,
        user_agent = $7,
        is_active = true,
        updated_at = NOW()
    `, [userId, tenantId, endpoint, keys.p256dh, keys.auth, platform, userAgent]);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('[Push] Subscribe error:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// PUT /api/push/subscription/sync
router.put('/subscription/sync', authenticateJWT, async (req, res) => {
  const { endpoint, platform } = req.body;
  const { userId } = req.user;

  await req.db.query(`
    UPDATE push_subscriptions
    SET platform = COALESCE($3, platform), updated_at = NOW()
    WHERE endpoint = $1 AND user_id = $2
  `, [endpoint, userId, platform]);

  res.json({ success: true });
});

// DELETE /api/push/unsubscribe
router.delete('/unsubscribe', authenticateJWT, async (req, res) => {
  const { endpoint } = req.body;
  const { userId } = req.user;

  await req.db.query(
    'UPDATE push_subscriptions SET is_active = false WHERE endpoint = $1 AND user_id = $2',
    [endpoint, userId]
  );

  res.json({ success: true });
});

// POST /api/push/subscription/refresh (chamado pelo SW no pushsubscriptionchange)
router.post('/subscription/refresh', async (req, res) => {
  const { old: oldSub, new: newSub } = req.body;

  try {
    if (oldSub?.endpoint) {
      // Busca o user/tenant da subscription antiga
      const existing = await req.db.query(
        'SELECT user_id, tenant_id FROM push_subscriptions WHERE endpoint = $1',
        [oldSub.endpoint]
      );

      if (existing.rows.length > 0) {
        const { user_id, tenant_id } = existing.rows[0];

        // Desativa a antiga
        await req.db.query(
          'UPDATE push_subscriptions SET is_active = false WHERE endpoint = $1',
          [oldSub.endpoint]
        );

        // Insere a nova
        const keys = newSub.keys || {};
        await req.db.query(`
          INSERT INTO push_subscriptions (user_id, tenant_id, endpoint, key_p256dh, key_auth, platform)
          VALUES ($1, $2, $3, $4, $5, 'unknown')
          ON CONFLICT (endpoint) DO UPDATE SET
            key_p256dh = $4, key_auth = $5, is_active = true, updated_at = NOW()
        `, [user_id, tenant_id, newSub.endpoint, keys.p256dh, keys.auth]);
      }
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('[Push] Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh subscription' });
  }
});

module.exports = router;
```

---

## 11. Integração com n8n (Webhook → Push)

Exemplo de workflow n8n para disparar push notifications:

```json
{
  "name": "Push Notification Trigger",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "push-notify",
        "authentication": "headerAuth"
      }
    },
    {
      "name": "Build Payload",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const input = $input.first().json;\nreturn [{\n  json: {\n    userId: input.userId,\n    tenantId: input.tenantId,\n    notification: {\n      title: input.title || 'Cia Cuidadores',\n      body: input.body,\n      url: input.url || '/',\n      tag: input.tag,\n      badgeCount: input.badgeCount || 1\n    }\n  }\n}];"
      }
    },
    {
      "name": "Send Push",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{$env.APP_URL}}/api/push/send",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "userId", "value": "={{$json.userId}}" },
            { "name": "tenantId", "value": "={{$json.tenantId}}" },
            { "name": "notification", "value": "={{JSON.stringify($json.notification)}}" }
          ]
        }
      }
    }
  ]
}
```

---

## 12. Casos de Uso para Cia Cuidadores

| Evento | Tag | Urgência | Badge |
|---|---|---|---|
| Nova escala atribuída | `escala-{id}` | high | +1 |
| Alteração de escala | `escala-{id}` | high | — |
| Mensagem do gestor | `msg-{chatId}` | high | unreadCount |
| Lembrete de check-in | `checkin-{date}` | normal | — |
| Documento pendente | `doc-{id}` | normal | +1 |
| Pagamento processado | `pagamento-{id}` | normal | — |
| Alerta de emergência | `emergencia` | high | — |

**Exemplos de payload:**

```javascript
// Nova escala
sendPushToUser(db, cuidadorId, {
  title: '📋 Nova Escala',
  body: 'Você foi escalado para Maria Silva — Seg 10/02, 08:00-20:00',
  url: '/escalas/123',
  tag: 'escala-123',
  badgeCount: 3, // total de pendências
  actions: [
    { action: 'aceitar', title: '✅ Aceitar' },
    { action: 'ver', title: '📋 Ver detalhes' },
  ],
  data: { action_aceitar_url: '/api/escalas/123/aceitar' },
});

// Mensagem
sendPushToUser(db, userId, {
  title: 'Maria Gestora',
  body: 'Bom dia! Confirma a escala de amanhã?',
  url: '/chat/456',
  tag: 'msg-456',
  badgeCount: 5,
});
```

---

## 13. Checklist de Implementação

### Pré-requisitos
- [ ] HTTPS configurado (obrigatório para Service Worker e Push API)
- [ ] VAPID keys geradas e armazenadas com segurança
- [ ] Manifest.json completo com todos os campos obrigatórios
- [ ] Ícones em todos os tamanhos necessários (72px até 512px + maskable)
- [ ] `display: "standalone"` no manifest (obrigatório para iOS)

### Service Worker
- [ ] Registro do SW no carregamento da página
- [ ] Handler de `push` event com `showNotification`
- [ ] Handler de `notificationclick` com navegação
- [ ] Handler de `notificationclose` (analytics)
- [ ] Handler de `pushsubscriptionchange` (renovação automática)
- [ ] Comunicação SW ↔ página via `postMessage`
- [ ] Cache offline com fallback page

### Cliente
- [ ] Feature detection completo (SW, PushManager, Notification)
- [ ] Detecção de plataforma (iOS/Android/Desktop)
- [ ] Detecção de instalação PWA
- [ ] Flow de permissão com user gesture (iOS obrigatório)
- [ ] UI de instrução "Add to Home Screen" para iOS
- [ ] UI para status denied com instruções de como reativar
- [ ] Badge API com feature detection
- [ ] Limpeza de badge ao abrir o app
- [ ] Sync de subscription com backend

### Backend
- [ ] Tabela de subscriptions com tenant isolation
- [ ] UPSERT de subscription (idempotente)
- [ ] Limpeza de subscriptions 410/404
- [ ] Rate limiting no envio (batch de 50)
- [ ] TTL e urgency por plataforma
- [ ] Logs de delivery e falhas
- [ ] Cleanup periódico de subscriptions inativas

### iOS Específico
- [ ] Meta tags Apple no HTML head
- [ ] Guide visual de "Add to Home Screen"
- [ ] Testar em Safari, Chrome e Edge (todos usam WebKit)
- [ ] Sem rich media/action buttons (fallback graceful)
- [ ] Monitorar delivery rate (iOS pode parar entregas silenciosamente)

### Testes
- [ ] Testar em Android (Chrome) — instalado e não instalado
- [ ] Testar em iOS (Safari) — instalado
- [ ] Testar em Desktop (Chrome, Edge, Firefox)
- [ ] Testar com app em foreground (postMessage)
- [ ] Testar com app fechado (push → notificação)
- [ ] Testar click na notificação (focus vs open window)
- [ ] Testar subscription renewal
- [ ] Testar badge count
- [ ] Testar tag/renotify grouping
- [ ] Testar fallback quando permission denied
- [ ] Testar offline → voltar online

---

## 14. Troubleshooting

| Problema | Causa | Solução |
|---|---|---|
| iOS não mostra prompt de permissão | PWA não instalada | Guiar Add to Home Screen |
| iOS push para de funcionar | Falta de interação | Monitorar e re-engajar |
| Android não mostra badge numérico | Comportamento padrão | Android usa dot automático |
| Subscription endpoint muda | Browser refresh/update | Handler `pushsubscriptionchange` |
| 403 no envio | VAPID key incorreta | Verificar keys e mailto |
| 410 Gone | Subscription expirada | Remover do banco e re-subscribe |
| 413 Payload Too Large | Payload > ~4KB | Reduzir tamanho do JSON |
| Push não chega com app fechado | SW não registrado corretamente | Verificar scope e registro |
| `notificationclick` não abre app | Falta `clients.openWindow` | Verificar handler e URL |

---

## 15. Dependências

```json
{
  "dependencies": {
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "vite-plugin-pwa": "^0.20.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0"
  }
}
```

**Instalação:**

```bash
# Backend
npm install web-push

# Frontend (se usar vite-plugin-pwa para gerar SW automaticamente)
npm install -D vite-plugin-pwa
```

> **Nota:** O Service Worker desta referência é escrito manualmente para controle total.
> Se preferir geração automática com Workbox, o `vite-plugin-pwa` pode ser configurado
> com `injectManifest` para combinar cache automático com o handler de push customizado.