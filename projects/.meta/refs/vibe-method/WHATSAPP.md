# WhatsApp Pattern

Padrão de integração WhatsApp com múltiplas instâncias e Actions.

---

## Visão Geral

O WhatsApp Pattern define como gerenciar múltiplas conexões WhatsApp (instâncias) em um ecossistema de aplicação, com configuração automática via Evolution API e integração com a Actions Layer.

**Características principais**:
- Múltiplas instâncias (1 número = 1 instância)
- Atribuição de operações (template de configuração)
- Gestão de status com monitoramento
- Actions consultáveis e auditadas

---

## Conceitos

### Instância WhatsApp

**O que é**: Conexão Evolution API vinculada a um número de telefone.

**Características**:
- Identificador único (instanceName + token)
- Settings de comportamento (Evolution API)
- Status de conexão (open, close, needs_reconnect, error)
- Atribuída a uma Operação

**Ciclo de vida**:
```
Criação → Atribuição → Conexão → Monitoramento → Reconexão/Desconexão
```

---

### Operação (Assignment)

**O que é**: Template de configuração aplicável a uma instância.

**Propósito**: Definir comportamento e roteamento de uma linha WhatsApp.

**Composição**:
- **Settings**: Configurações de comportamento (rejectCall, msgCall, etc.)
- **Webhook**: Endpoint que recebe eventos + lista de eventos
- **userRequired**: Define se é nível sistema ou nível usuário

**Exemplo de uso**:
- Operação "Central de Atendimento" → webhook `/webhook/central` + userRequired=true
- Operação "Notificações Sistema" → webhook `/webhook/notifications` + userRequired=false

---

### Actions

**O que é**: Operations específicas do domínio WhatsApp seguindo Operations Layer.

**Padrão**: Seguem `backbone/operations/types.ts`:
- Input/Output schemas (Zod)
- Permissions
- Audit trail automático
- Catálogo consultável

**Ver**: Operations Layer (antiga camada operations, novo nome: actions)

---

## Parâmetros da Instância

### Criação

Parâmetros fornecidos à Evolution API ao criar instância:

| Parâmetro | Tipo | Geração | Nota |
|-----------|------|---------|------|
| instanceName | string | Automática | ID único (UUID ou slug) |
| token | string | Automática | Token de acesso à instância |
| qrcode | boolean | `true` | Sempre habilitado |
| integration | string | `'WHATSAPP-BAILEYS'` | Fixo |

---

### Settings

Configurações de comportamento aplicadas via Evolution API após criação:

| Parâmetro | Tipo | Recomendação | Descrição |
|-----------|------|--------------|-----------|
| rejectCall | boolean | `true` | Rejeitar chamadas de voz |
| msgCall | string | Customizável | Mensagem ao rejeitar (max 100 chars) |
| groupsIgnore | boolean | `true` | Ignorar mensagens de grupos |
| alwaysOnline | boolean | `true` | Manter status "online" |
| readMessages | boolean | Variável | Marcar mensagens como lidas (depende da operação) |
| readStatus | boolean | `false` | Não ler status/stories |
| syncFullHistory | boolean | `false` | Não sincronizar histórico antigo |

**Aplicação**: Via endpoint Evolution API `/settings/set/{instanceName}`

---

### Webhook

Configuração de roteamento de eventos:

| Parâmetro | Tipo | Fonte | Nota |
|-----------|------|-------|------|
| url | string | Operação | Endpoint do backbone que recebe eventos |
| events | string[] | Padrão fixo | Eventos a escutar |
| webhookByEvents | boolean | `false` | Enviar todos eventos para mesma URL |
| webhookBase64 | boolean | `false` | Não converter mídia para base64 |

**Eventos Padrão** (não customizável):
```javascript
[
  'MESSAGES_UPSERT',      // Mensagens novas/atualizadas
  'MESSAGES_UPDATE',      // Status de mensagens (delivered, read)
  'CONNECTION_UPDATE',    // Mudanças de conexão ⚠️ CRÍTICO para health
  'QRCODE_UPDATED'        // QR code atualizado
]
```

**Aplicação**: Via endpoint Evolution API `/webhook/set/{instanceName}`

**Nota**: `CONNECTION_UPDATE` é obrigatório para detectar desconexões e alertar o usuário.

---

## Gestão de Status

### Estados

```typescript
type WhatsAppStatus =
  | "not_configured"    // Nunca conectou
  | "open"              // Conectado e funcionando
  | "close"             // Desconectado (QR disponível)
  | "needs_reconnect"   // Sessão expirada (requer ação)
  | "error";            // Erro no serviço
```

**Descrição**:

| Estado | Significado | Ação Requerida |
|--------|-------------|----------------|
| `not_configured` | Instância criada mas nunca conectou | Usuário deve conectar |
| `open` | Conectado e operacional | Nenhuma |
| `close` | Desconectado, aguardando QR scan | Usuário deve escanear QR |
| `needs_reconnect` | Sessão expirou ou foi desconectada no celular | Usuário deve reconectar |
| `error` | Erro de comunicação com Evolution API | Admin deve verificar serviço |

---

### Transições de Estado

```
not_configured ───[Conectar]───────► close (gera QR)
                                      │
                                      │ [Scan QR]
                                      ▼
close ◄───[Timeout 5min]───────── open
  │                                   │
  │                                   │ [Sessão expirou]
  │                                   ▼
  └────────────────────────► needs_reconnect
                                      │
                                      │ [Reconectar]
                                      ▼
                                    close (gera QR)

Qualquer estado ───[Desconectar manual]───► close ou not_configured
```

---

### Polling (durante QR)

Quando QR code é gerado, sistema inicia polling para detectar conexão:

| Parâmetro | Valor | Razão |
|-----------|-------|-------|
| Intervalo | 3s | Balanceamento entre responsividade e carga |
| Timeout | 5min | QR code expira após 5 minutos |
| Detecta | `close → open` | Transição indica sucesso |
| Ação | Toast + parar polling | Notificar usuário |

**Implementação**:
- Polling roda no frontend (client-side)
- Chama endpoint `/api/whatsapp?action=status` a cada 3s
- Para quando `status === "open"` OU timeout
- Mostra toast de sucesso ao detectar conexão

---

### UI por Estado

| Estado | Visual | Cor | Ícone | Ações Disponíveis |
|--------|--------|-----|-------|-------------------|
| `not_configured` | "WhatsApp não conectado" | Neutro | QrCode | [Conectar] |
| `open` | "Conectado" + perfil + número | Verde | CheckCircle2 | [Desconectar] |
| `close` | "Escaneie QR code" + QR exibido | Amarelo | XCircle | [Atualizar QR] [Desconectar] |
| `needs_reconnect` | "Sessão expirada" + explicação | Vermelho | AlertTriangle | [Reconectar] [Desconectar] |
| `error` | "Erro ao conectar" + mensagem | Vermelho | XCircle | [Tentar novamente] |

**Dados exibidos quando `open`**:
- Avatar (profilePicUrl ou ícone placeholder)
- Nome do perfil (profileName)
- Número formatado (+55 32 99999-0000)

---

## Modelo de Dados

### Operação (Template)

```typescript
interface WhatsAppOperation {
  id: string;                     // UUID
  name: string;                   // "Central de Atendimento"
  description: string;            // Descrição legível

  // Settings aplicados na instância Evolution
  settings: {
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
    syncFullHistory: boolean;
  };

  // Roteamento de eventos
  webhook: string;                // "http://backbone:8000/webhook/central"
  events: string[];               // Padrão fixo (ver acima)

  // Restrição de uso
  userRequired: boolean;          // true = nível usuário, false = nível sistema

  // Auditoria
  createdAt: Date;
  updatedAt: Date;
}
```

**Níveis de atribuição**:

| userRequired | Semântica | Exemplo |
|--------------|-----------|---------|
| `false` | Nível sistema - linha institucional | "Notificações", "Cobrança Automática" |
| `true` | Nível usuário - linha pessoal dentro da operação | "Central (João)", "Vendas (Maria)" |

---

### Instância (Vinculada a Operação)

```typescript
interface WhatsAppInstance {
  id: string;                     // UUID (DB)
  instanceName: string;           // ID na Evolution API
  token: string;                  // Token de acesso (armazenar criptografado)

  // Atribuição
  operationId: string;            // FK → WhatsAppOperation
  userId?: string;                // FK → User (se userRequired=true)

  // Status atual
  status: WhatsAppStatus;
  number?: string;                // Número conectado (ex: "5532999990000")
  profileName?: string;           // Nome do perfil
  profilePicUrl?: string;         // URL do avatar

  // Conexão temporária
  qrCode?: string;                // Base64 do QR (temporário, não persistir)
  qrCodeExpiry?: Date;            // Expiração do QR

  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  lastConnectedAt?: Date;         // Última vez que ficou "open"
  lastDisconnectedAt?: Date;      // Última desconexão
  disconnectReason?: string;      // Motivo da desconexão
}
```

**Restrições**:
- Relação 1:1 → 1 instância = 1 operação
- Se `userRequired=true` na operação, `userId` é obrigatório na instância
- `token` deve ser armazenado criptografado (nunca em plain text)
- `qrCode` é temporário (expira em 5min, não persistir no banco)

---

## Actions (Operations)

### Padrão Geral

Todas actions WhatsApp seguem Operations Layer:

```typescript
import { defineOperation } from '../registry.js';
import { z } from 'zod';

export const myAction = defineOperation({
  name: 'whatsapp.{dominio}.{acao}',    // Convenção de nomenclatura
  description: 'Descrição legível',
  keywords: ['palavras', 'chave', 'pt-BR'],

  inputSchema: z.object({ ... }),       // Validação Zod
  outputSchema: z.object({ ... }),

  permissions: ['whatsapp.{permission}'],

  async execute(ctx, params) {
    // Implementação
  }
});
```

**Convenções**:
- Namespace: `whatsapp.*`
- Permissions: `whatsapp.manage` (admin) ou `whatsapp.send` (enviar mensagens)
- Audit: Automático via registry

---

### Catálogo de Actions

| Action | Descrição | Permissions | Input | Output |
|--------|-----------|-------------|-------|--------|
| `whatsapp.instance.create` | Criar nova instância | `['whatsapp.manage']` | `{ operationId, userId? }` | `{ instanceId, qrCode }` |
| `whatsapp.instance.connect` | Gerar QR code para conexão | `['whatsapp.manage']` | `{ instanceId }` | `{ qrCode, expiresAt }` |
| `whatsapp.instance.disconnect` | Encerrar sessão | `['whatsapp.manage']` | `{ instanceId }` | `{ disconnectedAt }` |
| `whatsapp.instance.reset` | Resetar sessão expirada | `['whatsapp.manage']` | `{ instanceId }` | `{ qrCode, expiresAt }` |
| `whatsapp.instance.assign` | Atribuir operação à instância | `['whatsapp.manage']` | `{ instanceId, operationId, userId? }` | `{ assigned: true }` |
| `whatsapp.instance.updateSettings` | Modificar settings | `['whatsapp.manage']` | `{ instanceId, settings }` | `{ updated: true }` |
| `whatsapp.instance.delete` | Remover instância | `['whatsapp.manage']` | `{ instanceId }` | `{ deleted: true }` |
| `whatsapp.message.send` | Enviar mensagem | `['whatsapp.send']` | `{ instanceId, phone, text }` | `{ messageId, sentAt }` |

---

### Exemplo: whatsapp.instance.create

```typescript
import { defineOperation } from '../registry.js';
import { z } from 'zod';
import { createEvolutionInstance, applySettings, configureWebhook } from '../../services/evolution.js';

export const createInstance = defineOperation({
  name: 'whatsapp.instance.create',
  description: 'Criar nova instância WhatsApp e gerar QR code',
  keywords: ['whatsapp', 'criar', 'instância', 'conectar', 'qr code'],

  inputSchema: z.object({
    operationId: z.string().uuid(),
    userId: z.string().uuid().optional(),
  }),

  outputSchema: z.object({
    instanceId: z.string().uuid(),
    instanceName: z.string(),
    qrCode: z.string(),
    expiresAt: z.date(),
  }),

  permissions: ['whatsapp.manage'],

  async execute(ctx, params) {
    // 1. Buscar operação
    const operation = await db.findOperation(params.operationId);
    if (!operation) {
      throw new OperationError('NOT_FOUND', 'Operação não encontrada');
    }

    // 2. Validar userRequired
    if (operation.userRequired && !params.userId) {
      throw new OperationError('VALIDATION_ERROR', 'userId é obrigatório para esta operação');
    }

    // 3. Gerar instanceName e token únicos
    const instanceName = generateUniqueInstanceName();
    const token = generateSecureToken();

    // 4. Criar via Evolution API
    const evolutionResult = await createEvolutionInstance({
      instanceName,
      token,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    });

    // 5. Aplicar settings da operação
    await applySettings(instanceName, operation.settings);

    // 6. Configurar webhook
    await configureWebhook(instanceName, {
      url: operation.webhook,
      events: operation.events,
      webhookByEvents: false,
      webhookBase64: false,
    });

    // 7. Salvar no DB
    const instance = await db.createInstance({
      instanceName,
      token: encrypt(token),
      operationId: params.operationId,
      userId: params.userId,
      status: 'close',
      qrCodeExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5min
    });

    // 8. Retornar QR code
    return {
      instanceId: instance.id,
      instanceName: instanceName,
      qrCode: evolutionResult.qrCode,
      expiresAt: instance.qrCodeExpiry,
    };
  }
});
```

---

## Fluxo: Atribuir Operação

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CRIAR INSTÂNCIA                                          │
│    Action: whatsapp.instance.create                         │
├─────────────────────────────────────────────────────────────┤
│ Input:                                                      │
│   - operationId: "uuid-central-atendimento"                 │
│   - userId: "uuid-joao-silva" (se userRequired=true)        │
│                                                             │
│ Sistema:                                                    │
│   ├─ Gera instanceName único                                │
│   ├─ Gera token seguro                                      │
│   ├─ Cria via Evolution API                                 │
│   └─ Salva no DB                                            │
│                                                             │
│ Output:                                                     │
│   - instanceId                                              │
│   - qrCode (base64)                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. APLICAR CONFIGURAÇÕES                                    │
│    (automático, parte do create)                            │
├─────────────────────────────────────────────────────────────┤
│ Sistema busca operação atribuída:                           │
│   - settings (rejectCall, msgCall, etc.)                    │
│   - webhook (URL + eventos)                                 │
│                                                             │
│ Aplica via Evolution API:                                   │
│   ├─ POST /settings/set/{instanceName}                      │
│   └─ POST /webhook/set/{instanceName}                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CONECTAR (usuário)                                       │
│    UI exibe QR code                                         │
├─────────────────────────────────────────────────────────────┤
│ Frontend:                                                   │
│   ├─ Exibe QR code (base64)                                 │
│   ├─ Inicia polling (3s interval)                           │
│   └─ Timeout em 5min                                        │
│                                                             │
│ Usuário:                                                    │
│   └─ Escaneia com WhatsApp                                  │
│                                                             │
│ Polling detecta status=open:                                │
│   ├─ Para polling                                           │
│   ├─ Mostra toast de sucesso                                │
│   └─ Atualiza UI com perfil conectado                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. MONITORAR (contínuo)                                     │
│    Webhook: CONNECTION_UPDATE                               │
├─────────────────────────────────────────────────────────────┤
│ Evolution envia webhook quando conexão muda:                │
│                                                             │
│ Se status=close:                                            │
│   ├─ Atualiza DB: status="needs_reconnect"                  │
│   ├─ UI mostra alerta persistente                           │
│   └─ Notifica admin via WhatsApp (instância saudável)       │
│                                                             │
│ Se status=open (após reconexão):                            │
│   ├─ Atualiza DB: status="open"                             │
│   └─ Remove alerta da UI                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## UI: Configurador de Instâncias

### Página: Settings > WhatsApp

```
┌─────────────────────────────────────────────────────────────┐
│ Instâncias WhatsApp                             [+ Nova]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ✓ Central de Atendimento                                ││
│ │ +55 32 99999-0000                                       ││
│ │ Atendente: João Silva                                   ││
│ │ Online                                    [Configurar]  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ⚠ Notificações Sistema                                  ││
│ │ +55 32 99999-1111                                       ││
│ │ Sessão expirada                           [Reconectar]  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ○ Vendas                                                ││
│ │ Não conectado                             [Conectar]    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Estados visuais**:
- ✓ Verde = `open`
- ⚠ Amarelo/Vermelho = `needs_reconnect`
- ○ Cinza = `not_configured` ou `close`

---

### Wizard: Nova Instância

**Passo 1: Selecionar Operação**

```
┌─────────────────────────────────────────────────────────────┐
│ Nova Instância WhatsApp                               [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Passo 1 de 3: Operação                                     │
│                                                             │
│ Selecione a operação para esta linha:                      │
│                                                             │
│ ( ) Central de Atendimento                                 │
│     Requer atribuição a um atendente                       │
│     Webhook: /webhook/central                              │
│                                                             │
│ ( ) Notificações Sistema                                   │
│     Linha automática (não requer usuário)                  │
│     Webhook: /webhook/notifications                        │
│                                                             │
│ ( ) Vendas                                                 │
│     Requer atribuição a um vendedor                        │
│     Webhook: /webhook/sales                                │
│                                                             │
│                                        [Cancelar] [Avançar]│
└─────────────────────────────────────────────────────────────┘
```

**Passo 2: Atribuir Usuário (se userRequired=true)**

```
┌─────────────────────────────────────────────────────────────┐
│ Nova Instância WhatsApp                               [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Passo 2 de 3: Atribuição                                   │
│                                                             │
│ Operação: Central de Atendimento                           │
│                                                             │
│ Atribuir a qual atendente?                                 │
│                                                             │
│ [Dropdown: Selecione um atendente ▼                    ]   │
│   - João Silva                                             │
│   - Maria Souza                                            │
│   - Pedro Santos                                           │
│                                                             │
│                                         [Voltar] [Avançar] │
└─────────────────────────────────────────────────────────────┘
```

**Passo 3: Conectar**

```
┌─────────────────────────────────────────────────────────────┐
│ Nova Instância WhatsApp                               [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Passo 3 de 3: Conexão                                      │
│                                                             │
│ Escaneie o QR code com WhatsApp:                           │
│                                                             │
│              ┌───────────────────────┐                     │
│              │                       │                     │
│              │      [QR CODE]        │                     │
│              │                       │                     │
│              └───────────────────────┘                     │
│                                                             │
│ Ou use o código: ABC-123-XYZ             [Copiar]          │
│                                                             │
│ ⏱ Aguardando conexão... (expira em 4:32)                   │
│                                                             │
│                            [Atualizar QR] [Cancelar]       │
└─────────────────────────────────────────────────────────────┘
```

**Mobile**: Prioriza código alfanumérico em vez de QR (melhor UX)

---

### Detalhes da Instância

Ao clicar em [Configurar] em uma instância conectada:

```
┌─────────────────────────────────────────────────────────────┐
│ Central de Atendimento                                [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Status                                                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ✓ Conectado                                             ││
│ │ [Avatar] +55 32 99999-0000                              ││
│ │          João da Silva                                  ││
│ │                                                         ││
│ │ Conectado desde: 15/01/2026 às 14:30                   ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Configurações                                               │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Operação: Central de Atendimento                        ││
│ │ Atendente: João Silva                                   ││
│ │ Webhook: http://backbone:8000/webhook/central           ││
│ │                                                         ││
│ │ Comportamento:                                          ││
│ │ ☑ Rejeitar chamadas de voz                             ││
│ │ ☑ Ignorar grupos                                       ││
│ │ ☑ Manter online                                        ││
│ │ ☐ Marcar mensagens como lidas                          ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Ações                                                       │
│ [Desconectar]                              [Salvar]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoramento: Alertas de Desconexão

### Banner Persistente (Header)

Quando uma ou mais instâncias entram em estado `needs_reconnect`:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ 2 linhas WhatsApp desconectadas      [Ver detalhes] [X] │
└─────────────────────────────────────────────────────────────┘
```

**Comportamento**:
- Exibido em todas as páginas
- Cor: Amarelo/Vermelho (warning/error)
- Link [Ver detalhes] → redireciona para /settings/whatsapp
- Dismiss temporário (volta a aparecer na próxima sessão se não resolvido)

---

### Modal de Detalhes

Ao clicar em [Ver detalhes]:

```
┌─────────────────────────────────────────────────────────────┐
│ Linhas WhatsApp Desconectadas                         [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ As seguintes linhas perderam conexão:                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ⚠ Central de Atendimento                                ││
│ │ +55 32 99999-0000 · João Silva                          ││
│ │ Desconectado há 2 horas                                 ││
│ │                                           [Reconectar]  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ⚠ Vendas                                                ││
│ │ +55 32 99999-1111 · Maria Souza                         ││
│ │ Desconectado há 30 minutos                              ││
│ │                                           [Reconectar]  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│                                              [Ir para Configurações]│
└─────────────────────────────────────────────────────────────┘
```

---

### Notificações

**Via WhatsApp** (usando instância saudável):

```
⚠️ ALERTA: WhatsApp Desconectado

Instância: Central de Atendimento
Número: +55 32 99999-0000
Atendente: João Silva

Ação necessária: Reconectar
Link: https://app.empresa.com/settings/whatsapp

--
Sistema de Notificações
```

**Via Email** (fallback se todas instâncias falharem):

```
From: Sistema <noreply@empresa.com>
To: admin@empresa.com
Subject: [URGENTE] WhatsApp Desconectado

Olá Admin,

As seguintes linhas WhatsApp foram desconectadas:

1. Central de Atendimento
   Número: +55 32 99999-0000
   Atendente: João Silva
   Desconectado em: 15/01/2026 16:45

2. Vendas
   Número: +55 32 99999-1111
   Atendente: Maria Souza
   Desconectado em: 15/01/2026 17:10

AÇÃO NECESSÁRIA:
Acesse o painel de configurações e reconecte as linhas:
https://app.empresa.com/settings/whatsapp

--
Sistema de Monitoramento
```

---

## Inicialização Docker

### docker-compose.yml

```yaml
services:
  # Evolution API
  evolution:
    image: evoapicloud/evolution-api:v2.3.7
    environment:
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: postgres://admin:12345678@postgres:5432/evolution
      CACHE_REDIS_ENABLED: "true"
      CACHE_REDIS_URI: redis://redis:6379
      AUTHENTICATION_API_KEY: ${EVOLUTION_API_KEY}
    volumes:
      - ./data/evolution/instances:/evolution/instances
      - ./data/evolution/store:/evolution/store
    networks:
      internal:
        aliases:
          - evolution.internal

  # Evolution Init (não mais cria instância padrão)
  # Em vez disso, instâncias são criadas via UI/Actions
  evolution-init:
    build:
      context: .
      dockerfile: docker/evolution-init/Dockerfile
    depends_on:
      evolution:
        condition: service_healthy
    environment:
      - EVOLUTION_HOST=evolution.internal
      - EVOLUTION_PORT=8080
      - EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
    networks:
      - internal
    restart: "no"
```

**Mudança importante**: Evolution Init agora apenas verifica se Evolution está saudável, não cria instância padrão (instâncias são criadas via Actions).

---

### scripts/init-evolution.mjs

```javascript
// Script simplificado - apenas health check
async function main() {
  console.log('=== Verificando Evolution API ===');

  const ready = await waitForEvolution();
  if (!ready) {
    console.error('Evolution API não ficou disponível');
    process.exit(1);
  }

  console.log('Evolution API está pronto!');
  console.log('Instâncias devem ser criadas via UI ou Actions');
}
```

**Nota**: A criação de instâncias agora é responsabilidade da aplicação (via Actions), não do init script.

---

## Segurança

### Armazenamento de Tokens

```typescript
// ❌ NUNCA
await db.insert('instances', {
  token: 'plain-text-token'  // INSEGURO!
});

// ✅ SEMPRE
import { encrypt, decrypt } from './crypto.js';

await db.insert('instances', {
  token: encrypt(token)  // Criptografado
});

// Ao usar
const decryptedToken = decrypt(instance.token);
```

---

### Exibição na UI

```typescript
// ❌ NUNCA mostrar token completo
<p>Token: {instance.token}</p>

// ✅ Mostrar apenas últimos 4 caracteres
<p>Token: ****{instance.token.slice(-4)}</p>

// ✅ Ou não mostrar (geralmente desnecessário)
```

---

### Validação de Webhook

```typescript
// Webhook recebe CONNECTION_UPDATE
app.post('/webhook/:operation', async (req, res) => {
  // ✅ Validar origem (IP, API key, etc.)
  if (!isValidEvolutionRequest(req)) {
    return res.status(403).send('Forbidden');
  }

  // Processar evento
  const { instanceName, status } = req.body;
  await updateInstanceStatus(instanceName, status);

  res.status(200).send('OK');
});
```

---

## Anti-patterns

### ❌ Não Fazer

**1. Instância sem operação atribuída**
```typescript
// ❌ Criar instância órfã
await createInstance({ /* sem operationId */ });
```
Sempre atribuir uma operação. Sem operação, não há configuração aplicada.

---

**2. Webhook hardcoded**
```typescript
// ❌ Hardcoded no código
await configureWebhook(instanceName, {
  url: 'http://backbone:8000/webhook/central'  // Não! Deve vir da operação
});
```
Webhook vem da operação atribuída.

---

**3. Polling infinito**
```javascript
// ❌ Sem timeout
setInterval(fetchStatus, 3000);  // Roda para sempre!
```
Sempre usar timeout (5min é padrão).

---

**4. Token em plain text**
```sql
-- ❌ Armazenar desprotegido
INSERT INTO instances (token) VALUES ('my-token-123');
```
Sempre criptografar antes de salvar.

---

**5. QR code persistente**
```typescript
// ❌ Salvar QR no banco
await db.update('instances', {
  qrCode: base64QR  // Expira em 5min, não persistir!
});
```
QR code é temporário (memória ou cache curto).

---

**6. Ignorar CONNECTION_UPDATE**
```typescript
// ❌ Não escutar desconexões
const events = ['MESSAGES_UPSERT'];  // Faltou CONNECTION_UPDATE!
```
`CONNECTION_UPDATE` é obrigatório para monitoramento.

---

**7. Criar múltiplas instâncias para mesmo número**
```typescript
// ❌ Duplicar números
await createInstance({ operationId: 'A' });  // Número X
await createInstance({ operationId: 'B' });  // Número X (ERRO!)
```
1 número = 1 instância. WhatsApp não permite múltiplas sessões simultâneas.

---

### ✅ Fazer

**1. Sempre atribuir operação**
```typescript
await createInstance({
  operationId: 'uuid-central',
  userId: operation.userRequired ? 'uuid-joao' : undefined
});
```

---

**2. Webhook da operação**
```typescript
const operation = await getOperation(params.operationId);
await configureWebhook(instanceName, {
  url: operation.webhook,  // Da operação
  events: operation.events
});
```

---

**3. Polling com timeout**
```javascript
const TIMEOUT = 5 * 60 * 1000;
const start = Date.now();

const interval = setInterval(() => {
  if (Date.now() - start > TIMEOUT) {
    clearInterval(interval);
    onTimeout();
  }
  fetchStatus();
}, 3000);
```

---

**4. Criptografar tokens**
```typescript
await db.insert('instances', {
  token: encrypt(token)
});
```

---

**5. QR code temporário**
```typescript
// Retornar QR no response, não persistir
return {
  qrCode: base64QR,  // Cliente exibe
  expiresAt: new Date(Date.now() + 5 * 60 * 1000)
};
```

---

**6. Escutar CONNECTION_UPDATE**
```typescript
const events = [
  'MESSAGES_UPSERT',
  'MESSAGES_UPDATE',
  'CONNECTION_UPDATE',  // ✅ Obrigatório
  'QRCODE_UPDATED'
];
```

---

**7. Validar unicidade de número**
```typescript
// Antes de criar
const existing = await db.findByNumber(phoneNumber);
if (existing) {
  throw new Error('Número já conectado em outra instância');
}
```

---

## Referências

| Documento | Descrição |
|-----------|-----------|
| [ENV-PATTERN.md](./ENV-PATTERN.md) | Padrão de variáveis de ambiente |
| [DEPLOY-PATTERN.md](./DEPLOY-PATTERN.md) | Docker Compose e init scripts |
| `backbone/operations/types.ts` | Interface OperationDef e contexto |
| `PLAN-04-OPERATIONS.md` | Implementação da Operations Layer |

---

## Checklist de Implementação

### Backend - Database
- [ ] Tabela `whatsapp_operations` (id, name, settings, webhook, userRequired)
- [ ] Tabela `whatsapp_instances` (id, instanceName, token, operationId, userId, status)
- [ ] Índices: `instances.operationId`, `instances.userId`, `instances.status`

### Backend - Actions
- [ ] `whatsapp.instance.create`
- [ ] `whatsapp.instance.connect`
- [ ] `whatsapp.instance.disconnect`
- [ ] `whatsapp.instance.reset`
- [ ] `whatsapp.instance.assign`
- [ ] `whatsapp.message.send`

### Backend - Webhook Handler
- [ ] Endpoint `/webhook/:operation`
- [ ] Handler para `CONNECTION_UPDATE`
- [ ] Atualizar status no DB
- [ ] Disparar notificações

### Frontend - UI
- [ ] Página `/settings/whatsapp`
- [ ] Lista de instâncias com status visual
- [ ] Wizard de criação (3 passos)
- [ ] Modal de detalhes/configuração
- [ ] Banner de alerta persistente
- [ ] Polling de QR code (3s, timeout 5min)

### Frontend - Componentes
- [ ] `WhatsAppInstanceCard` (status + ações)
- [ ] `QRCodeDisplay` (QR + código alfanumérico)
- [ ] `OperationSelector` (dropdown de operações)
- [ ] `UserSelector` (dropdown de usuários)
- [ ] `ConnectionStatus` (badge colorido)

### Monitoramento
- [ ] Webhook `CONNECTION_UPDATE` → atualiza DB
- [ ] Job periódico verifica instâncias stale
- [ ] Notificação WhatsApp (instância saudável)
- [ ] Notificação Email (fallback)
- [ ] Log de desconexões (audit trail)

### Segurança
- [ ] Criptografia de tokens (AES-256)
- [ ] Validação de origem nos webhooks
- [ ] Rate limiting na API
- [ ] Sanitização de inputs (msgCall, etc.)

### Testes
- [ ] Unit: Actions individuais
- [ ] Integration: Fluxo criar → atribuir → conectar
- [ ] E2E: UI wizard completo
- [ ] Monitoramento: Detectar desconexão e alertar

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **Instância** | Conexão WhatsApp única (1 número) |
| **Operação** | Template de configuração para instância |
| **Action** | Operation da camada de ações (auditada) |
| **Evolution API** | Gateway WhatsApp (Baileys wrapper) |
| **QR Code** | Método de autenticação WhatsApp |
| **Polling** | Verificação periódica de status |
| **Webhook** | Endpoint que recebe eventos |
| **userRequired** | Flag: nível sistema vs nível usuário |
| **CONNECTION_UPDATE** | Evento crítico de mudança de status |
