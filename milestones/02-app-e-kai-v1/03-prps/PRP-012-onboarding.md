# PRP-012 — Sistema de Onboarding

## Objetivo

Implementar o welcome tour, setup wizard e introducao da Kai para novos usuarios conforme `onboarding.md`.

## Execution Mode

`implementar`

## Contexto

O PRP-002 criou a tabela `onboarding_progress`. O PRP-007 criou o app shell e auth. O PRP-010 criou o chat da Kai com sugestoes. A spec completa do onboarding esta em `onboarding.md` com componentes (WelcomeTour, SetupWizard, KaiIntroMessage), fluxos, hook (useOnboarding) e integracao.

## Especificacao

### Onboarding Service (apps/backbone/src/services/onboarding-service.ts)

- `getProgress(userId)` — query `onboarding_progress` por usuario, retorna array de steps completos
- `completeStep(userId, step)` — insere step com `ON CONFLICT DO NOTHING`
- `resetOnboarding(userId)` — deleta todos os registros do usuario
- Steps validos: `welcome_tour`, `setup_wizard`, `first_project`, `first_loop`, `first_kai_chat`

### Onboarding Routes (apps/backbone/src/routes/onboarding.ts)

- `GET /api/onboarding/progress` — retorna steps completos do usuario logado
- `POST /api/onboarding/complete` — body `{ step }`, marca step como completo
- `POST /api/onboarding/reset` — reseta onboarding (para poder re-acessar tour)

### Onboarding Hook (apps/hub/src/hooks/use-onboarding.ts)

Conforme `onboarding.md` secao 8:

```typescript
interface UseOnboardingReturn {
  isLoading: boolean;
  completedSteps: string[];
  shouldShowTour: boolean;     // !completedSteps.includes('welcome_tour')
  shouldShowSetup: boolean;    // !completedSteps.includes('setup_wizard')
  completeStep: (step: string) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}
```

- Carrega progresso na montagem (GET /api/onboarding/progress)
- `shouldShowTour` e `shouldShowSetup` derivados dos steps completos
- `completeStep` faz POST e atualiza estado local

### WelcomeTour (apps/hub/src/components/onboarding/welcome-tour.tsx)

Conforme `onboarding.md` secao 5.1:

- Modal fullscreen com fundo semi-transparente escuro
- 4 steps com animacao de slide (framer-motion):
  1. **Dashboard** — "Veja todos os seus projetos em um lugar" + icone LayoutDashboard
  2. **Projetos** — "Crie, configure e monitore seus projetos" + icone FolderKanban
  3. **Kai** — "Sua copilot de IA. Pergunte qualquer coisa" + icone Bot
  4. **Vamos comecar** — "Configure sua API key e crie seu primeiro projeto" + icone Rocket
- Navegacao: botoes "Anterior" / "Proximo" / "Pular" (OB001, OB002)
- Indicador de progresso: dots clicaveis
- Ultimo step: botao "Comecar" ao inves de "Proximo"

### SetupWizard (apps/hub/src/components/onboarding/setup-wizard.tsx)

Conforme `onboarding.md` secao 5.2:

- Card centralizado (max-w-md)
- Step 1: Input para OpenRouter API key + explicacao de como obter
- Step 2: Botao "Testar Conexao" — POST para endpoint que testa key no OpenRouter (OB005)
  - Loading spinner durante teste
  - Sucesso: badge verde "Conexao OK"
  - Erro: alert destructive com mensagem
- Step 3: Sucesso — "Tudo pronto! Vamos criar seu primeiro projeto"
- Nao pode ser pulado (OB004)
- Salva API key via `POST /api/settings` (tabela system_settings)

### Backend: Test OpenRouter

- `POST /api/settings/test-openrouter` — body `{ apiKey }`
- Faz request para OpenRouter `/models` com a key
- Retorna `{ valid: boolean, error?: string }`

### KaiIntroMessage Enhancement

Integrar com o componente de sugestoes criado no PRP-010:
- No primeiro acesso ao chat (first_kai_chat nao completado), exibir mensagem especial da Kai:
  "Oi! Sou a Kai, sua copilot da fabrica. Posso criar projetos, monitorar loops, diagnosticar falhas e muito mais. Tenta me perguntar algo!" (OB007)
- Chips de sugestao conforme OB008
- Ao enviar primeira mensagem, completar step `first_kai_chat`

### Empty States (OB006)

Adicionar empty states nas paginas que podem estar vazias:
- Dashboard sem projetos: icone FolderKanban + "Nenhum projeto ainda" + "Crie seu primeiro projeto" (botao)
- Lista de sessoes vazia: icone Play + "Nenhuma sessao" + "Inicie o loop para gerar sessoes"
- Conversas Kai vazia: icone MessageSquare + "Nenhuma conversa" + "Comece uma conversa com a Kai"

### Auto-Complete Steps

Alem dos steps manuais, completar automaticamente:
- `first_project` — quando POST /api/projects retorna sucesso
- `first_loop` — quando POST /api/projects/:slug/loop/start retorna sucesso

### Integracao no App Shell

Conforme `onboarding.md` secao 9:
- No `app.tsx`, renderizar WelcomeTour e SetupWizard condicionalmente baseado no `useOnboarding()`
- WelcomeTour aparece sobre todo o conteudo
- SetupWizard bloqueia acesso ao app (nao renderiza AppShell ate completar)

### Settings: Re-acessar Tour (OB010)

Na pagina de Settings, botao "Rever Tour de Boas-vindas" que chama `resetOnboarding()` e exibe o tour novamente.

### Verificacao

Primeiro login: tour aparece. Pular ou completar tour → setup wizard aparece. Configurar API key com teste → dashboard vazio com CTA. Criar primeiro projeto → step first_project completado. Chat da Kai exibe intro e sugestoes. Re-acessar tour via settings.

## Limites

- Nao implementar tutorial interativo (step-by-step com highlight de elementos)
- Nao implementar tooltips contextuais alem do tour e do setup
- Tour tem exatamente 4 steps — nao adicionar mais
- Nao bloquear uso do app apos setup wizard (apenas tour e wizard sao blocking)
- Nao enviar email de boas-vindas (sistema e self-hosted)
