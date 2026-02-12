# E-Kai - Sistema de Onboarding

Especificacao do sistema de onboarding para ensinar operadores a usar o app de gestao e a Kai.

---

## 1. Objetivo

- Guiar novos operadores na configuracao inicial (API keys, primeiro projeto)
- Apresentar as capacidades da Kai com exemplos praticos
- Reduzir time-to-first-loop (tempo ate o primeiro loop autonomo rodando)
- Oferecer tour interativo pelas funcionalidades principais

---

## 2. Estrategias

| Estrategia | Descricao | Implementacao |
|------------|-----------|---------------|
| Welcome Tour | Tour guiado no primeiro acesso | Modal fullscreen com steps e animacao |
| Setup Wizard | Configuracao obrigatoria antes de usar | Formulario sequencial (API key → primeiro projeto) |
| Kai Introduction | Kai se apresenta e oferece ajuda | Mensagem inicial no chat com sugestoes |
| Empty States | Guia contextual quando nao ha dados | Cards com CTA em listas vazias |
| Tooltips | Dicas em hover/tap nos primeiros usos | Tooltip persistente com "Entendi" |

---

## 3. Fluxos por Contexto

### 3.1 Primeiro Acesso (Operador)

```
Login → Welcome Tour → Setup Wizard → Dashboard (vazio) → Kai Introduction
```

1. Apos primeiro login, Welcome Tour aparece automaticamente
2. Tour apresenta: Dashboard, Projetos, Kai, Configuracoes
3. Setup Wizard solicita: OpenRouter API key + teste de conexao
4. Dashboard exibe empty state com CTA "Criar Primeiro Projeto"
5. Kai envia mensagem automatica: "Oi! Sou a Kai. Posso te ajudar a criar seu primeiro projeto."

### 3.2 Primeiro Projeto

```
CTA "Criar Projeto" → Formulario guiado → Inicializar Workspace → Iniciar Loop
```

1. Formulario com tooltips em cada campo
2. Apos criacao, botao "Inicializar Workspace" em destaque
3. Apos inicializacao, botao "Iniciar Loop" em destaque
4. Kai sugere: "Quer que eu inicie o loop pra voce?"

### 3.3 Primeira Conversa com Kai

```
Chat vazio → Sugestoes de perguntas → Resposta com tool calls visiveis
```

1. Chat exibe chips de sugestao: "Listar meus projetos", "Status do loop", "Criar um projeto"
2. Primeira resposta da Kai inclui explicacao das tool calls
3. Tooltip: "A Kai mostra o que faz de forma transparente"

---

## 4. Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| OB001 | O sistema deve exibir Welcome Tour no primeiro acesso do usuario |
| OB002 | O sistema deve permitir pular o Welcome Tour a qualquer momento |
| OB003 | O sistema deve persistir progresso do onboarding por usuario |
| OB004 | O sistema deve exibir Setup Wizard para configuracao de API keys obrigatoria |
| OB005 | O sistema deve testar conexao com OpenRouter antes de finalizar setup |
| OB006 | O sistema deve exibir empty states com CTA em listas sem dados |
| OB007 | O sistema deve enviar mensagem automatica da Kai no primeiro acesso ao chat |
| OB008 | O sistema deve exibir chips de sugestao de perguntas no chat vazio |
| OB009 | O sistema deve marcar cada step do onboarding como completo individualmente |
| OB010 | O sistema deve permitir re-acessar o tour via Configuracoes |

---

## 5. Componentes

### 5.1 WelcomeTour

**Localizacao:** `apps/hub/src/components/onboarding/welcome-tour.tsx`

**Props:**
```typescript
interface WelcomeTourProps {
  onComplete: () => void;
  onSkip: () => void;
}
```

**Comportamento:**
- Modal fullscreen com fundo semi-transparente
- 4 steps: Dashboard, Projetos, Kai, Proximo Passo
- Navegacao: Anterior / Proximo / Pular
- Animacao suave entre steps (framer-motion)
- Indicador de progresso (dots)

### 5.2 SetupWizard

**Localizacao:** `apps/hub/src/components/onboarding/setup-wizard.tsx`

**Props:**
```typescript
interface SetupWizardProps {
  onComplete: () => void;
}
```

**Comportamento:**
- Step 1: Inserir OpenRouter API key
- Step 2: Testar conexao (loading + feedback sucesso/erro)
- Step 3: Confirmacao e redirect ao dashboard
- Nao pode ser pulado (configuracao obrigatoria)

### 5.3 KaiIntroMessage

**Localizacao:** `apps/hub/src/components/kai/kai-intro-message.tsx`

**Props:**
```typescript
interface KaiIntroMessageProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}
```

**Comportamento:**
- Mensagem de boas-vindas da Kai com tom amigavel
- Chips clicaveis com sugestoes de perguntas
- Desaparece apos primeira interacao real

---

## 6. Banco de Dados

```sql
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_completed TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, step_completed)
);

-- Steps possiveis: 'welcome_tour', 'setup_wizard', 'first_project', 'first_loop', 'first_kai_chat'

CREATE INDEX idx_onboarding_progress_user
  ON onboarding_progress(user_id);
```

---

## 7. Server Actions

**Localizacao:** `apps/backbone/src/services/onboarding-service.ts`

```typescript
export async function completeOnboardingStep(userId: string, step: string): Promise<void>
export async function getOnboardingProgress(userId: string): Promise<string[]>
export async function resetOnboarding(userId: string): Promise<void>
```

---

## 8. Hook

**Localizacao:** `apps/hub/src/hooks/use-onboarding.ts`

```typescript
interface UseOnboardingReturn {
  isLoading: boolean;
  completedSteps: string[];
  shouldShowTour: boolean;
  shouldShowSetup: boolean;
  completeStep: (step: string) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export function useOnboarding(): UseOnboardingReturn
```

---

## 9. Integracao

```tsx
// apps/hub/src/app.tsx
function App() {
  const { shouldShowTour, shouldShowSetup, completeStep } = useOnboarding();

  return (
    <>
      {shouldShowTour && (
        <WelcomeTour
          onComplete={() => completeStep("welcome_tour")}
          onSkip={() => completeStep("welcome_tour")}
        />
      )}
      {shouldShowSetup && (
        <SetupWizard onComplete={() => completeStep("setup_wizard")} />
      )}
      <AppShell />
    </>
  );
}
```

```tsx
// apps/hub/src/pages/kai.tsx
function KaiPage() {
  const { completedSteps, completeStep } = useOnboarding();
  const isFirstChat = !completedSteps.includes("first_kai_chat");

  return (
    <ChatWindow>
      {isFirstChat && (
        <KaiIntroMessage
          suggestions={["Listar meus projetos", "Me ajude a criar um projeto", "O que voce pode fazer?"]}
          onSuggestionClick={(s) => {
            sendMessage(s);
            completeStep("first_kai_chat");
          }}
        />
      )}
    </ChatWindow>
  );
}
```

---

## 10. Rastreabilidade

| Componente | Requisitos |
|------------|------------|
| WelcomeTour | OB001, OB002, OB009 |
| SetupWizard | OB004, OB005 |
| KaiIntroMessage | OB007, OB008 |
| Empty States | OB006 |
| useOnboarding | OB003, OB009, OB010 |
| onboarding_progress | OB003, OB009 |

---

## 11. Metricas de Sucesso

| Metrica | Meta |
|---------|------|
| Taxa de conclusao do Welcome Tour | > 70% |
| Taxa de conclusao do Setup Wizard | > 95% (obrigatorio) |
| Time-to-first-loop (primeiro loop rodando) | < 10 minutos |
| Taxa de primeira conversa com Kai | > 80% |
| Taxa de uso de sugestoes da Kai | > 50% |
