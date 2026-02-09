# Guia de UI/UX

Padrões visuais e de experiência do usuário.

## Princípio Fundamental

**Usar padrões existentes. Não inventar.**

Toda interface deve ser construída com:
1. Componentes shadcn/ui — ref: `04-refs/ux/shadcn-v4/`
2. Classes utilitárias Tailwind padrão
3. Tokens semânticos do projeto
4. Animações com Framer Motion — ref: `04-refs/ux/framer-motion.md`
5. Padrões responsivos com Vaul — ref: `04-refs/ux/vaul.md`
6. Padrões mobile-first — ref: `04-refs/ux/mobile-patterns.md`

## Tema Base

Configuração shadcn/ui — escolher o tema built-in mais próximo das cores do brand (`assets/brand/brand.json`). Priorizar consistência do tema sobre correspondência exata com o brand.

| Config | Valor |
|--------|-------|
| Style | Mira |
| Base Color | Gray |
| Theme | O mais próximo de `primary: #e25050`, `accent: #2ad4ff` |
| Font | Inter |
| Radius | Medium |
| Menu Accent | Subtle |

**Brand como referência, não como regra**: o brand.json define a identidade visual (vermelho `#e25050`, ciano `#2ad4ff`). O app deve usar o tema shadcn built-in ou da comunidade que melhor aproxime essas cores, mantendo a consistência interna do tema. Não forçar cores customizadas que quebrem a harmonia dos componentes.

## Dark Mode

Todos os apps (landing, app) devem suportar tema claro e escuro.

### Implementação

- Usar `next-themes` (landing) ou classe `dark` no `<html>` (app) para toggle
- Tokens CSS do shadcn/ui já suportam dark mode nativamente
- Respeitar `prefers-color-scheme` do sistema como padrão inicial
- Toggle manual acessível no header ou settings

### Brand por tema

O brand tem variantes explícitas para cada tema:

| Variante | Arquivo | Texto | Fundo |
|----------|---------|-------|-------|
| icon (light) | `assets/brand/icon.svg` | branco sobre vermelho | transparente |
| icon (dark) | `assets/brand/icon-dark.svg` | branco sobre vermelho | transparente |
| logotype (light) | `assets/brand/logotype.svg` | preto | transparente |
| logotype (dark) | `assets/brand/logotype-dark.svg` | branco | transparente |
| creative (light) | `assets/brand/creative.svg` | preto + ciano | transparente |
| creative (dark) | `assets/brand/creative-dark.svg` | branco + ciano | transparente |

Usar a variante correta conforme o tema ativo. O `<img>` ou `<picture>` deve trocar o `src` quando o tema muda.

## Brand Assets

### Arquivos fonte

Todos os assets são SVGs criados no Inkscape, localizados em `assets/brand/`:

| Asset | Composição | Variantes |
|-------|------------|-----------|
| `icon` | Ícone ".f" em rounded square vermelho | light, dark |
| `logotype` | Ícone + "pontofácil" (Montserrat Bold) | light, dark |
| `creative` | Ícone + "pontofácil" + slogan | light, dark |

- **Slogan**: "Jornada **simples**. Gestão **inteligente**." (Montserrat Light Italic, ciano `#2ad4ff`)
- **Metadados**: `assets/brand/brand.json` contém cores, nome e descrição

### Margens e exportação

Os SVGs de ícone e logotype **não têm margens**. Para gerar imagens para PWA, favicon e demais finalidades, o pipeline de exportação deve usar **Inkscape CLI** para:

1. Adicionar margem adequada à finalidade (safe zone)
2. Exportar em PNG nos tamanhos necessários
3. Gerar formatos otimizados (ICO, WebP quando aplicável)

### Imagens necessárias (geradas via Inkscape)

| Finalidade | Tamanho | Margem | Fonte | Formato |
|------------|---------|--------|-------|---------|
| favicon | 32x32 | nenhuma | icon | .ico (multi-res: 16, 32, 48) |
| PWA icon | 192x192 | ~15% safe zone | icon | .png |
| PWA icon large | 512x512 | ~15% safe zone | icon | .png |
| PWA maskable | 512x512 | ~20% safe zone (dentro do safe area) | icon | .png |
| Apple touch icon | 180x180 | ~10% | icon | .png |
| OG image (social) | 1200x630 | livre | creative | .png |
| Splash (PWA) | 2048x2732 | centralizado | logotype | .png |

### Creative

O creative (ícone + brand + slogan) não contém fundo. Pode ser usado:
- **As-is**: sobre fundo sólido claro/escuro
- **Composto com Inkscape**: sobre imagem de fundo para materiais de marketing, OG images, splash screens

## Landing Page — Recursos Visuais

A landing page deve ser enriquecida visualmente com imagens e vídeo gratuitos de uso comercial.

### Hero

Usar **vídeo** no hero section, preferencialmente de fontes livres (Pexels, Pixabay, Coverr, Mixkit). O vídeo deve transmitir:
- Ambiente de trabalho moderno
- Gestão de equipe / RH
- Tecnologia / digital
- Pessoas em contexto profissional

O vídeo deve rodar em loop, muted, com overlay escuro + texto por cima. Fallback para imagem estática em conexões lentas.

### Seções de conteúdo

Imagens de stock de fontes livres (Unsplash, Pexels, Pixabay) para:
- Features showcase (mockup de dashboard em laptop/celular)
- Equipe / gestão de pessoas
- Mobile em uso (pessoa usando celular)

### Otimização

- Vídeo: MP4 comprimido, max 5MB, 720p suficiente, preload="metadata"
- Imagens: WebP com fallback JPEG, lazy loading, srcset para responsividade
- Todas as imagens devem ter alt text descritivo

## Tokens Semânticos

### Cores

Usar APENAS tokens semânticos. **Nunca** classes de cor Tailwind diretas.

| Token | Uso | Exemplo |
|-------|-----|---------|
| `primary` | Ações principais, CTAs | Botão "Salvar" |
| `primary-foreground` | Texto sobre primary | Texto do botão |
| `secondary` | Ações secundárias | Botão "Cancelar" |
| `destructive` | Ações destrutivas, erros | Botão "Excluir" |
| `muted` | Fundos suaves, texto secundário | Placeholder |
| `accent` | Destaques, badges | Contador de notificações |
| `background` | Fundo de página | Body |
| `foreground` | Texto principal | Parágrafos |
| `card` | Fundo de cards | Card container |
| `border` | Bordas | Divisores |
| `input` | Fundo de inputs | Form fields |
| `ring` | Focus ring | Outline de foco |

### Uso Correto

```jsx
// PROIBIDO
<div className="bg-fuchsia-500 text-white">
<button className="bg-red-600">

// OBRIGATÓRIO
<div className="bg-primary text-primary-foreground">
<button className="bg-destructive text-destructive-foreground">
```

## Tipografia

### Escala

| Classe | Tamanho | Uso |
|--------|---------|-----|
| `text-xs` | 12px | Labels pequenos, badges |
| `text-sm` | 14px | Texto secundário, captions |
| `text-base` | 16px | Texto de corpo |
| `text-lg` | 18px | Subtítulos |
| `text-xl` | 20px | Títulos de seção |
| `text-2xl` | 24px | Títulos de página |
| `text-3xl` | 30px | Títulos principais |

### Pesos

| Classe | Peso | Uso |
|--------|------|-----|
| `font-normal` | 400 | Texto de corpo |
| `font-medium` | 500 | Labels, ênfase leve |
| `font-semibold` | 600 | Subtítulos |
| `font-bold` | 700 | Títulos |

## Espaçamento

### Escala

| Classe | Valor | Uso comum |
|--------|-------|-----------|
| `1` | 4px | Micro ajustes |
| `2` | 8px | Entre ícone e texto |
| `3` | 12px | Padding interno pequeno |
| `4` | 16px | Padding padrão |
| `6` | 24px | Gap entre elementos |
| `8` | 32px | Margem entre seções |
| `12` | 48px | Separação de blocos |
| `16` | 64px | Margem de página |

### Padrões

```jsx
// Card interno
<Card className="p-4 md:p-6">

// Lista de itens
<div className="space-y-4">

// Grid com gap
<div className="grid gap-4 md:gap-6">

// Seções da página
<div className="space-y-8">
```

## Breakpoints

| Prefixo | Largura | Dispositivo |
|---------|---------|-------------|
| (none) | < 640px | Mobile |
| `sm:` | ≥ 640px | Mobile grande |
| `md:` | ≥ 768px | Tablet |
| `lg:` | ≥ 1024px | Desktop |
| `xl:` | ≥ 1280px | Desktop grande |
| `2xl:` | ≥ 1536px | Telas largas |

### Mobile-First

```jsx
// Começa mobile, adapta para maior
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="p-4 md:p-6 lg:p-8">
<div className="text-sm md:text-base">
```

## Layout Responsivo

O menu de navegação é **único** (DRY) — a mesma estrutura de menu serve mobile e desktop, adaptando apenas a apresentação.

### Mobile (< 768px)

```
┌─────────────────────┐
│                     │
│      CONTENT        │
│                     │
│                     │
├─────────────────────┤
│ ⭐  ⭐  ⭐  ⭐  ☰  │  ← Bottom shortcut bar (fixed)
└─────────────────────┘
```

- **Sem topbar** — conteúdo ocupa tela inteira
- **Sem sidebar** — navegação via bottom bar e menu fullscreen
- **Bottom shortcut bar**: 5 ícones fixos na parte inferior
  - Posições 1-4: atalhos customizáveis pelo usuário (em Configurações > Atalhos)
  - Posição 5: sempre **Menu** (☰) — abre o menu completo
  - Defaults pré-selecionados conforme perfil do usuário (ex: gestor RH vs operador)
- **Vaul bottom drawer** para ações, formulários e detalhes
- Touch targets mínimo 44x44px
- Ações principais na thumb zone
- Feedback háptico via `navigator.vibrate()`

### Desktop (≥ 768px) — Web Enhancements

```
┌──────┬──────────────────────┐
│      │ 📍 Breadcrumb bar    │
│  S   ├──────────────────────┤
│  I   │                      │
│  D   │      CONTENT         │
│  E   │                      │
│  B   │                      │
│  A   │                      │
│  R   │                      │
│      │                      │
└──────┴──────────────────────┘
```

- **Sidebar colapsável**: mesmo menu do mobile, apresentado como sidebar. Colapsável (ícones only) para otimização de espaço
- **Sem topbar**: não há barra de topo — o espaço vertical é maximizado
- **Breadcrumb bar**: barra horizontal no topo do conteúdo com breadcrumbs para navegação hierárquica
- **Vaul drawers substituídos por**:
  - **Popup (Dialog)** — ações rápidas, confirmações, formulários curtos
  - **Right Drawer (Sheet)** — conteúdo extenso, detalhes, formulários complexos (desliza da direita para esquerda)

### Critérios: Popup vs Right Drawer (desktop)

Seguir o padrão definido em `04-refs/ux/vaul.md`:

| Pergunta | Sim | Não |
|----------|-----|-----|
| Precisa ver conteúdo atrás? | Right Drawer | Popup |
| Conteúdo cabe em 400px de altura? | Popup | Right Drawer |
| Ação de < 10 segundos? | Popup | Right Drawer |
| Tem scroll interno ou tabs? | Right Drawer | Popup |

Usar componente `ResponsivePanel` conforme ref — detecta breakpoint e renderiza Vaul (mobile), Dialog ou Sheet (desktop) automaticamente.

## Animações

Seguir padrões de `04-refs/ux/framer-motion.md`:

### Timing

| Tipo | Duração | Easing |
|------|---------|--------|
| Micro-interação | 100-200ms | easeOut |
| Transição de componente | 200-300ms | easeInOut |
| Transição de página | 300-400ms | easeInOut |
| Animação de atenção | 400-600ms | spring |

### Patterns essenciais

- **Fade in**: elementos aparecendo na tela
- **Slide up**: cards e conteúdo entrando
- **Stagger children**: listas animadas item a item
- **Page transitions**: via AnimatePresence + React Router
- **Hover scale**: feedback visual em botões/cards (desktop)
- **Swipe gestures**: swipe-to-delete, swipe-to-archive (mobile)

### Integração com shadcn/ui

Wrapping de componentes shadcn com `motion()` para animações:
```jsx
const MotionCard = motion(Card);
```

Respeitar `prefers-reduced-motion` — desabilitar animações quando o usuário preferir.

## Componentes shadcn/ui

Ref completa: `04-refs/ux/shadcn-v4/`

### Layout e Navegação

| Componente | Uso |
|------------|-----|
| `Sidebar` | Menu lateral colapsável (desktop) |
| Bottom shortcut bar | 5 ícones fixos na parte inferior (mobile) — componente customizado |
| `Breadcrumb` | Barra de breadcrumbs no topo do conteúdo (desktop) |
| `Tabs` | Conteúdo em abas |
| `Accordion` | Seções colapsáveis |
| `Separator` | Divisor visual |

### Formulários

| Componente | Uso |
|------------|-----|
| `Form` | Wrapper com React Hook Form + Zod |
| `Input` | Campo de texto |
| `Textarea` | Texto longo |
| `Select` | Dropdown |
| `Combobox` | Select com busca |
| `Checkbox` | Seleção múltipla |
| `Radio Group` | Seleção única |
| `Switch` | Toggle on/off |
| `Calendar` | Seletor de data |
| `Date Picker` | Data com range |

### Ações

| Componente | Uso |
|------------|-----|
| `Button` | Ações primárias/secundárias |
| `Toggle` | Estado on/off |
| `Dropdown Menu` | Menu de ações |

### Feedback

| Componente | Uso |
|------------|-----|
| `Alert` | Mensagem de atenção |
| `Alert Dialog` | Confirmação importante |
| `Toast` / `Sonner` | Notificações temporárias |
| `Progress` | Indicador de progresso |
| `Skeleton` | Loading placeholder |
| `Badge` | Status/contagem |

### Dados

| Componente | Uso |
|------------|-----|
| `Table` | Tabela simples |
| `Data Table` | Tabela com TanStack Table |
| `Card` | Container de conteúdo |
| `Avatar` | Foto de perfil |
| `Pagination` | Navegação de páginas |

### Sobreposições

| Componente | Uso |
|------------|-----|
| `Dialog` | Modal (desktop) |
| `Drawer` | Bottom drawer (mobile, via Vaul) |
| `Sheet` | Right drawer (desktop) |
| `Popover` | Popup contextual |
| `Tooltip` | Dica de hover |

### Charts

| Componente | Uso |
|------------|-----|
| `Area Chart` | Evolução ao longo do tempo |
| `Bar Chart` | Comparações |
| `Line Chart` | Tendências |
| `Pie Chart` | Distribuição |

## Padrões de Página

### Lista com Busca e Filtros

```jsx
<div className="space-y-4">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">Funcionários</h1>
    <Button>Novo Funcionário</Button>
  </div>

  {/* Filtros */}
  <div className="flex items-center gap-4">
    <Input placeholder="Buscar..." className="max-w-sm" />
    <Select>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>...</SelectContent>
    </Select>
  </div>

  {/* Tabela */}
  <DataTable columns={columns} data={data} />

  {/* Paginação */}
  <Pagination />
</div>
```

### Formulário

```jsx
<div className="max-w-2xl">
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Novo Funcionário</h1>
    <p className="text-muted-foreground">
      Preencha os dados do funcionário.
    </p>
  </div>

  <Form {...form}>
    <form onSubmit={...} className="space-y-6">
      <FormField ... />
      <FormField ... />

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  </Form>
</div>
```

### Detalhe com Ações

```jsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">...</Avatar>
      <div>
        <h1 className="text-2xl font-bold">João Silva</h1>
        <p className="text-muted-foreground">Matrícula 12345</p>
      </div>
    </div>
    <div className="flex gap-2">
      <Button variant="outline">Editar</Button>
      <Button variant="destructive">Inativar</Button>
    </div>
  </div>

  {/* Conteúdo em cards */}
  <div className="grid gap-4 md:grid-cols-2">
    <Card>...</Card>
    <Card>...</Card>
  </div>
</div>
```

### Dashboard

```jsx
<div className="space-y-6">
  <h1 className="text-2xl font-bold">Dashboard</h1>

  {/* KPIs */}
  <div className="grid gap-4 md:grid-cols-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Funcionários Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">245</div>
      </CardContent>
    </Card>
    ...
  </div>

  {/* Gráficos */}
  <div className="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Horas Extras por Setor</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart data={...} />
      </CardContent>
    </Card>
    ...
  </div>
</div>
```

## Estados

### Loading

```jsx
// Skeleton para listas
<div className="space-y-2">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
</div>

// Skeleton para cards
<Card>
  <CardHeader>
    <Skeleton className="h-4 w-1/2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-8 w-1/4" />
  </CardContent>
</Card>
```

### Empty State

```jsx
<div className="flex flex-col items-center justify-center py-12">
  <Icon className="h-12 w-12 text-muted-foreground" />
  <h3 className="mt-4 text-lg font-semibold">Nenhum funcionário encontrado</h3>
  <p className="text-muted-foreground">
    Comece adicionando seu primeiro funcionário.
  </p>
  <Button className="mt-4">Adicionar Funcionário</Button>
</div>
```

### Error State

```jsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Erro</AlertTitle>
  <AlertDescription>
    Não foi possível carregar os dados. Tente novamente.
  </AlertDescription>
</Alert>
```

## PWA — Web Enhancements

O app é uma PWA mobile-first com web enhancements progressivos:

| Enhancement | Descrição |
|-------------|-----------|
| Manifest + service worker | Instalável no dispositivo (vite-plugin-pwa) |
| Haptic feedback | `navigator.vibrate()` em ações importantes |
| Pull-to-refresh | Atualização de dados via gesto |
| Offline cache | Cache de assets estáticos e última consulta |
| Push notifications | Alertas de inconsistência, importação concluída (futuro) |

### Performance mobile

- **Virtualização**: React Virtual para listas longas (funcionários, relatórios)
- **Lazy loading**: Imagens e componentes pesados com `React.lazy()` + `Suspense`
- **Skeleton**: Feedback imediato enquanto carrega
- **Optimistic UI**: Atualizar antes da resposta do servidor

## Acessibilidade

### Checklist

- [ ] Todos os inputs têm labels associados
- [ ] Imagens têm alt text
- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Focus visible em elementos interativos
- [ ] Navegação por teclado funciona
- [ ] aria-labels em ícones sem texto
- [ ] `prefers-reduced-motion` respeitado nas animações
- [ ] `prefers-color-scheme` respeitado no tema inicial

### Exemplos

```jsx
// Label associado
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// Botão com ícone
<Button aria-label="Fechar">
  <X className="h-4 w-4" />
</Button>

// Focus ring
<Button className="focus-visible:ring-2 focus-visible:ring-ring">
```

## Ícones

Usar **Lucide** em todo o projeto.

### Tamanhos Padrão

| Contexto | Classe |
|----------|--------|
| Inline com texto | `h-4 w-4` |
| Botão | `h-4 w-4` |
| Navegação | `h-5 w-5` |
| Feature/destaque | `h-6 w-6` |
| Empty state | `h-12 w-12` |

### Ícones Comuns

| Ação | Ícone |
|------|-------|
| Adicionar | `Plus` |
| Editar | `Pencil` |
| Excluir | `Trash2` |
| Salvar | `Save` |
| Buscar | `Search` |
| Filtrar | `Filter` |
| Menu | `Menu` |
| Fechar | `X` |
| Voltar | `ArrowLeft` |
| Configurações | `Settings` |
| Usuário | `User` |
| Notificação | `Bell` |
| Check-in | `UserCheck` |
| Check-out | `UserMinus` |
| Relógio | `Clock` |
| Calendário | `CalendarDays` |
| Imprimir | `Printer` |
| Tema claro | `Sun` |
| Tema escuro | `Moon` |

## Referências

| Ref | Conteúdo |
|-----|----------|
| `04-refs/ux/shadcn-v4/` | Componentes, docs de instalação, exemplos, blocks, charts |
| `04-refs/ux/framer-motion.md` | Patterns de animação, timing, spring configs, integração shadcn |
| `04-refs/ux/mobile-patterns.md` | Touch targets, gestos, bottom nav, performance, virtualização |
| `04-refs/ux/vaul.md` | ResponsivePanel: Vaul bottom drawer (mobile) → Dialog/Sheet (desktop) |
| `04-refs/base-layout/` | Exemplos de app-shell, sidebar, page-layout, FAB, mobile-header |
| `assets/brand/` | SVGs fonte (icon, logotype, creative) + brand.json |
