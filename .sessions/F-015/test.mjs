// Teste F-015 — Documentação de integração do módulo Runs
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..', '..')
const readmePath = resolve(root, 'runs', '.meta', 'README.md')

let passed = 0
let failed = 0

function test(name, condition) {
  if (condition) {
    console.log(`  ✔ ${name}`)
    passed++
  } else {
    console.log(`  ✘ ${name}`)
    failed++
  }
}

console.log('F-015 — Documentação de integração do módulo Runs\n')

// 1. Arquivo existe
let content
try {
  content = await readFile(readmePath, 'utf-8')
  test('Arquivo runs/.meta/README.md existe', true)
} catch {
  test('Arquivo runs/.meta/README.md existe', false)
  process.exit(1)
}

// 2. Seções obrigatórias (grupo 1)
const sections1 = ['## Visão Geral', '## Conceitos', '## Guia Rápido', '## Uso como SDK', '## Formatos de Arquivo']
test(
  'Contém seções: Visão Geral, Conceitos, Guia Rápido, Uso como SDK, Formatos de Arquivo',
  sections1.every(s => content.includes(s))
)

// 3. Seções obrigatórias (grupo 2)
const sections2 = ['## Artefatos do Workspace', '## Configuração do Agente', '## Webhooks']
test(
  'Contém seções: Artefatos do Workspace, Configuração do Agente, Webhooks',
  sections2.every(s => content.includes(s))
)

// 4. Seções obrigatórias (grupo 3)
const sections3 = ['## Sessões de Feature', '## Graceful Stop', '## Gutter Detection', '## Troubleshooting']
test(
  'Contém seções: Sessões de Feature, Graceful Stop, Gutter Detection, Troubleshooting',
  sections3.every(s => content.includes(s))
)

// 5. CLI com exemplos completos (output esperado)
const cliOps = [
  'create-project.mjs',
  'init-workspace.mjs',
  'agent-harness.mjs',
  'get-status.mjs',
  'list-projects.mjs'
]
const cliWithOutput = cliOps.every(op => {
  const idx = content.indexOf(op)
  if (idx === -1) return false
  // Verifica se há bloco de código com saída após a menção
  const after = content.slice(idx, idx + 2000)
  return after.includes('# Saída') || after.includes('# Loop executa') || after.includes('# Saída (')
})
test('Cada operação CLI tem exemplo completo com output esperado', cliWithOutput)

// 6. SDK com assinatura, parâmetros, retorno e exemplo
const sdkFunctions = ['### createProject(params)', '### loadProject(pathOrOptions)', '### initWorkspace(pathOrOptions)', '### listProjects(options)', '### getStatus(pathOrOptions)']
const sdkComplete = sdkFunctions.every(fn => {
  const idx = content.indexOf(fn)
  if (idx === -1) return false
  const section = content.slice(idx, idx + 3000)
  // Cada função deve ter: parâmetros, retorno e exemplo de código
  const hasParams = section.includes('Parâm') || section.includes('Param')
  const hasReturn = section.includes('Retorno') || section.includes('Promise')
  const hasExample = section.includes('```javascript')
  return hasParams && hasReturn && hasExample
})
test('Cada função SDK tem assinatura, parâmetros, retorno e exemplo', sdkComplete)

// 7. Idioma pt-BR no texto, inglês no código
const ptBrIndicators = ['Visão Geral', 'Conceitos', 'Guia Rápido', 'Configuração', 'Sessões', 'Descrição']
const hasPtBr = ptBrIndicators.every(w => content.includes(w))
// Blocos de código devem ter termos em inglês
const codeBlocks = content.match(/```(?:javascript|json|bash)[\s\S]*?```/g) || []
const hasEngCode = codeBlocks.length > 0 && codeBlocks.some(b => b.includes('import') || b.includes('slug') || b.includes('node'))
test('Idioma: pt-BR no texto, inglês no código', hasPtBr && hasEngCode)

// 8. Não documenta implementação interna
const internalTerms = ['function selectNextFeature', 'spawnAgent(', 'appendProgress(', 'executeRollback(']
const noInternal = internalTerms.every(t => !content.includes(t))
test('Não documenta implementação interna — apenas interface externa', noInternal)

// 9. Marca worktrees/execução paralela como 'Futuro'
const hasFuturo = content.includes('Futuro')
const worktreeSection = content.includes('worktree') || content.includes('Worktree')
test('Marca worktrees/execução paralela como Futuro', hasFuturo && worktreeSection)

console.log(`\n${passed}/${passed + failed} testes passing`)
process.exit(failed > 0 ? 1 : 0)
