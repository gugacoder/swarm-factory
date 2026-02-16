import { test, expect } from '@playwright/test'

test('cria um projeto via fluxo Novo Harness', async ({ page }) => {
  // Mock /api/harness/infer — simula inferência de specs
  await page.route('**/api/harness/infer', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        specsPath: 'D:/sources/test-project/specs/01-mvp',
        workspace: 'D:/sources/test-project',
        repoRoot: 'D:/sources/test-project',
        milestone: '01-mvp',
        suggestedSlug: 'testproject-01mvp--cc',
        suggestedName: 'test-project — 01-mvp',
        specs: 'specs/01-mvp',
      }),
    })
  })

  // Mock /api/harness/create — simula criação do harness
  await page.route('**/api/harness/create', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        slug: body.slug,
        workspace: body.workspace,
        artifacts_created: ['project.json', 'agent-harness.json'],
      }),
    })
  })

  // Mock workspaces (para a página não quebrar ao carregar)
  await page.route('**/api/workspaces', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ workspaces: [], active: '' }),
    })
  })

  // Mock config e state (podem ser chamados no background)
  await page.route('**/api/config', async (route) => {
    await route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"not found"}' })
  })
  await page.route('**/api/state', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ state: 'idle', detail: null, pid: null, alive: false }),
    })
  })
  await page.route('**/api/features', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ features: [], summary: {}, total: 0 }),
    })
  })

  // --- Step 1: Infer ---
  await page.goto('/create')
  await expect(page.getByText('Novo Harness')).toBeVisible()

  // Preencher caminho de specs e inferir
  const specsInput = page.getByPlaceholder('D:/sources/.../milestone/01-escala')
  await specsInput.fill('D:/sources/test-project/specs/01-mvp')
  await page.getByRole('button', { name: 'Inferir' }).click()

  // --- Step 2: Confirm ---
  await expect(page.getByText('Confirmar').first()).toBeVisible()

  // Verificar campos inferidos
  await expect(page.locator('input[value="D:/sources/test-project"]')).toBeVisible()
  await expect(page.locator('input[value="specs/01-mvp"]')).toBeVisible()
  await expect(page.locator('input[value="testproject-01mvp--cc"]')).toBeVisible()
  await expect(page.locator('input[value="test-project — 01-mvp"]')).toBeVisible()

  // Clicar em Criar
  await page.getByRole('button', { name: 'Criar' }).click()

  // --- Step 3: Setup ---
  await expect(page.getByText('Run config e scripts copiados')).toBeVisible()
})
