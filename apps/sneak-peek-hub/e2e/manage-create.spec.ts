import { test, expect } from '@playwright/test'

test('botão Criar cria .harness/ e avança para fase Criado', async ({ page }) => {
  const slug = 'agenticbackbone-04-kai-mcp--cc'

  // Primeiro, limpar .harness/ do workspace se existir (para testar do zero)
  // Usamos o status para verificar o estado atual
  const statusRes = await page.request.get(`/api/runs/${slug}/status`)
  const statusBefore = await statusRes.json()

  // Navegar para a página de gerenciamento
  await page.goto(`/runs/${slug}/manage`)

  // Verificar que a página carregou
  await expect(page.locator('h1').getByText(slug)).toBeVisible()

  // Verificar que o botão Criar existe (pode ser "Criar" ou "Recriar")
  const createBtn = page.getByRole('button', { name: /Criar|Recriar/ })
  await expect(createBtn).toBeVisible()

  // Clicar no botão Criar
  await createBtn.click()

  // Verificar que mostra "Criando..." durante a operação
  await expect(page.getByRole('button', { name: 'Criando...' })).toBeVisible()

  // Esperar o log do stream aparecer com "Concluído"
  await expect(page.getByText('Concluído (exit code: 0)')).toBeVisible({ timeout: 30_000 })

  // Verificar que a fase avançou para "Criado"
  // O stepper deve mostrar "Criado" como fase atual (com destaque)
  await expect(page.getByText('Criado')).toBeVisible()

  // Verificar via API que o status é 'created'
  const statusAfterRes = await page.request.get(`/api/runs/${slug}/status`)
  const statusAfter = await statusAfterRes.json()
  expect(statusAfter.has_harness).toBe(true)
  expect(statusAfter.phase).toBe('created')

  // Verificar que o botão Inicializar agora está habilitado
  const initBtn = page.getByRole('button', { name: /Inicializar/ })
  await expect(initBtn).toBeVisible()
  await expect(initBtn).toBeEnabled()
})
