# Pesquisa: Copilots Context-Aware - Estado da Arte

> **Data**: 2026-01-14
> **Objetivo**: Entender como implementar captura de contexto de pagina para um Copilot embarcado em SaaS

---

## Como GitLab Duo Captura Contexto

Segundo a [documentacao de contextual awareness do GitLab](https://docs.gitlab.com/user/gitlab_duo/context/), o Duo captura:

| Categoria | Dados |
|-----------|-------|
| **Sempre disponivel** | Titulo e URL da pagina atual, conteudo do arquivo sendo visualizado |
| **Baseado em localizacao** | Issues, Epics, MRs quando esta nessas paginas |
| **Referenciado** | Recursos por ID ou URL (ex: `!123`, `#456`) |

A [arquitetura de AI](https://docs.gitlab.com/development/ai_architecture/) mostra que existe um **AI Abstraction Layer** em cada instancia que:
1. Intercepta requisicoes
2. **Adiciona informacoes contextuais automaticamente**
3. Faz pre/pos-processamento

---

## Como GitHub Copilot Captura Contexto

Segundo [analise de arquitetura multi-file](https://dzone.com/articles/github-copilot-multi-file-context-internal-architecture):

1. **Context Retriever**: Puxa contexto de arquivos relacionados, simbolos, imports
2. **Prompt Assembler**: Organiza snippets em estrutura ranqueada
3. **Token Estimation**: Encaixa no limite do modelo

No GitHub.com, captura [paginas abertas + historico de prompts](https://github.com/orgs/community/discussions/51323).

---

## MCP: Model Context Protocol

[GitLab implementou MCP](https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/) como "adaptador universal" - permite que o AI acesse dados de sistemas externos (Jira, Zendesk) pelo mesmo protocolo.

---

## Gap Analysis: App Tipico vs Estado da Arte

### O que um app tipico tem hoje

```typescript
// useCopilotPage.ts - Declarativo, manual
copilot.setEntity({
  type: 'record',
  id: record.id,
  data: { title: record.title, status: record.status }, // Dados minimos
});
```

**Problema**: Cada pagina precisa declarar manualmente o que passar. Os dados sao superficiais.

### O que falta

| Aspecto | GitLab/GitHub | App Tipico |
|---------|---------------|------------|
| **Captura automatica** | Infere do DOM/estado | Manual via `setEntity()` |
| **Dados profundos** | Todo o conteudo visivel | So o que a pagina passa |
| **Operations** | Detecta do contexto | Array estatico |
| **Historico de acoes** | Sabe o que usuario fez | Nao captura |

---

## Proposta de Arquitetura

### Opcao 1: Entity Resolvers (Recomendada)

Criar uma camada que **resolve dados completos** a partir de IDs:

```typescript
// Quando o contexto tem entity.type = 'record' e entity.id = 'xxx'
// O backend resolve automaticamente:
{
  record: {
    id, title, status, created_at,
    labels: [...],
    comments_count: 5,
    last_comment: { body: "...", author: "..." },
    assigned_to: { name: "Maria", role: "admin" },
  },
  availableOperations: [
    { name: 'record.close', description: 'Fechar registro', requires_confirmation: true },
    { name: 'record.assign', description: 'Atribuir registro', params: ['user_id'] },
  ]
}
```

**Fluxo:**
```
Frontend                    Backend/Backbone
   |                              |
   | entity: {type:'record',id}   |
   |----------------------------►|
   |                              | resolve(type, id)
   |                              | → busca dados completos
   |                              | → infere operations disponiveis
   |                              | → monta system prompt rico
   |◄-----------------------------|
   |      resposta contextual     |
```

### Opcao 2: Page State Snapshots

Frontend captura estado completo da pagina e envia:

```typescript
// Hook que captura dados da pagina automaticamente
const pageState = useCopilotPageState({
  selectors: {
    record: '[data-entity="record"]',
    comments: '[data-entity="comment"]',
  },
  dataAttributes: ['data-id', 'data-status', 'data-labels'],
});
```

**Problema**: Mais complexo, requer instrumentar todo o DOM.

### Opcao 3: Hibrida (GitLab Style)

1. Frontend passa **minimo** (type + id)
2. Backend tem **Entity Resolver** que busca dados completos
3. **Operations Registry** infere acoes disponiveis baseado no tipo + estado

---

## Proximos Passos Recomendados

1. **Criar Entity Resolvers no Backbone**
   - `resolveRecord(id)` → dados completos + operations
   - `resolveUser(id)` → dados completos + operations
   - `resolveDocument(id)` → conteudo + metadata

2. **Enriquecer System Prompt Automaticamente**
   - Ao receber `entity.type`, chamar resolver apropriado
   - Injetar dados completos no prompt

3. **Operations Registry**
   - Mapear tipo de entidade → operations disponiveis
   - Considerar estado (registro fechado nao tem `record.close`)
   - Considerar permissoes do usuario

---

## Fontes

- [GitLab Duo contextual awareness](https://docs.gitlab.com/user/gitlab_duo/context/)
- [GitLab AI Architecture](https://docs.gitlab.com/development/ai_architecture/)
- [GitLab MCP](https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/)
- [GitHub Copilot Multi-File Context](https://dzone.com/articles/github-copilot-multi-file-context-internal-architecture)
- [GitHub Community - Context awareness](https://github.com/orgs/community/discussions/51323)
- [AI Assistant Context-Aware SaaS Best Practices](https://www.unifiedaihub.com/blog/building-ai-powered-saas-products-a-technical-blueprint)
