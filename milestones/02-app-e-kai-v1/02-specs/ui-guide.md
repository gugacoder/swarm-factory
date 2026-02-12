# Guia de UI/UX

Padrões visuais e de experiência do usuário.

## Princípio Fundamental

**Usar padrões existentes. Não inventar.**

Toda interface deve ser construída com:
1. Componentes shadcn/ui (web) ou equivalentes NativeWind (mobile)
2. Classes utilitárias Tailwind padrão
3. Tokens semânticos do projeto

## Tema Base

Configuração shadcn/ui:

| Config | Valor |
|--------|-------|
| Style | Mira |
| Base Color | Gray |
| Theme | Fuchsia |
| Font | Inter |
| Radius | Medium |
| Menu Accent | Subtle |

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
// ❌ PROIBIDO
<div className="bg-fuchsia-500 text-white">
<button className="bg-red-600">

// ✅ OBRIGATÓRIO
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

## Componentes shadcn/ui

### Layout e Navegação

| Componente | Uso |
|------------|-----|
| `Sidebar` | Menu lateral (web admin) |
| `Navigation Menu` | Navegação principal |
| `Breadcrumb` | Caminho hierárquico |
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
| `Dialog` | Modal |
| `Drawer` | Gaveta lateral |
| `Sheet` | Painel deslizante |
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
    <h1 className="text-2xl font-bold">Membros</h1>
    <Button>Novo Membro</Button>
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
    <h1 className="text-2xl font-bold">Novo Membro</h1>
    <p className="text-muted-foreground">
      Preencha os dados do membro.
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
        <p className="text-muted-foreground">Membro desde 2020</p>
      </div>
    </div>
    <div className="flex gap-2">
      <Button variant="outline">Editar</Button>
      <Button variant="destructive">Excluir</Button>
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
          Membros
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
        <CardTitle>Presença por Culto</CardTitle>
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
  <h3 className="mt-4 text-lg font-semibold">Nenhum membro encontrado</h3>
  <p className="text-muted-foreground">
    Comece adicionando seu primeiro membro.
  </p>
  <Button className="mt-4">Adicionar Membro</Button>
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

## Acessibilidade

### Checklist

- [ ] Todos os inputs têm labels associados
- [ ] Imagens têm alt text
- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Focus visible em elementos interativos
- [ ] Navegação por teclado funciona
- [ ] aria-labels em ícones sem texto

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

## Mobile (NativeWind)

### Diferenças do Web

| Web (shadcn) | Mobile (NativeWind) |
|--------------|---------------------|
| `<Button>` | `<Pressable className="...">` |
| `<Dialog>` | `<Modal>` (React Native) |
| `hover:` | Não existe |
| `window.print()` | Share sheet |

### Tokens Compartilhados

Os mesmos tokens semânticos funcionam em ambas plataformas via `packages/tokens/`.

```jsx
// Web
<div className="bg-primary">

// Mobile
<View className="bg-primary">
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
| QR Code | `QrCode` |
| Imprimir | `Printer` |
