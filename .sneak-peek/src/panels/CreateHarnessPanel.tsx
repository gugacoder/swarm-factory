import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { harnessInfer, harnessCreate, harnessSetup, harnessStart, harnessStop, switchWorkspace } from '@/lib/api'
import type { HarnessInferResponse } from '@/lib/types'
import { cn } from '@/lib/utils'

type Step = 'infer' | 'confirm' | 'setup' | 'done'

export function CreateHarnessPanel({ onWorkspaceChange }: { onWorkspaceChange: () => void }) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('infer')

  // Step 1 — Infer
  const [specsPath, setSpecsPath] = useState('')
  const [inferring, setInferring] = useState(false)
  const [inferError, setInferError] = useState('')
  const [, setInferred] = useState<HarnessInferResponse | null>(null)

  // Step 2 — Confirm
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [workspace, setWorkspace] = useState('')
  const [specs, setSpecs] = useState('')
  const [harness, setHarness] = useState('claude-code')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Step 3 — Setup
  const [setupRunning, setSetupRunning] = useState(false)
  const [setupOutput, setSetupOutput] = useState('')
  const [setupDone, setSetupDone] = useState(false)
  const [setupError, setSetupError] = useState('')

  // Controls
  const [starting, setStarting] = useState(false)
  const [stopping, setStopping] = useState(false)

  const handleInfer = useCallback(async () => {
    setInferring(true)
    setInferError('')
    try {
      const result = await harnessInfer(specsPath.trim())
      setInferred(result)
      setSlug(result.suggestedSlug)
      setName(result.suggestedName)
      setWorkspace(result.workspace)
      setSpecs((result as any).specs || '')
      setStep('confirm')
    } catch (e: any) {
      setInferError(e.message)
    }
    setInferring(false)
  }, [specsPath])

  const handleCreate = useCallback(async () => {
    setCreating(true)
    setCreateError('')
    try {
      await harnessCreate({ slug, name, workspace, specs, harness })
      setStep('setup')
    } catch (e: any) {
      setCreateError(e.message)
    }
    setCreating(false)
  }, [slug, name, workspace, specs, harness])

  const handleSetup = useCallback(async () => {
    setSetupRunning(true)
    setSetupOutput('')
    setSetupError('')
    try {
      const result = await harnessSetup(workspace)
      setSetupOutput(result.output || '')
      if (result.success) {
        setSetupDone(true)
        // Switch to the new workspace
        try {
          await switchWorkspace(workspace)
          onWorkspaceChange()
        } catch { /* silent */ }
      } else {
        setSetupError(`Setup falhou com código ${result.exitCode}`)
      }
    } catch (e: any) {
      setSetupError(e.message)
    }
    setSetupRunning(false)
  }, [workspace, onWorkspaceChange])

  const handleStart = useCallback(async () => {
    setStarting(true)
    try {
      await harnessStart(workspace)
      onWorkspaceChange()
    } catch { /* silent */ }
    setStarting(false)
  }, [workspace, onWorkspaceChange])

  const handleStop = useCallback(async () => {
    setStopping(true)
    try {
      await harnessStop(workspace)
    } catch { /* silent */ }
    setStopping(false)
  }, [workspace])

  const handleGoToFeatures = useCallback(() => {
    navigate('/features')
  }, [navigate])

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Novo Harness</h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-sm">
          {(['infer', 'confirm', 'setup'] as Step[]).map((s, i) => {
            const labels = ['Specs', 'Confirmar', 'Setup']
            const stepIdx = ['infer', 'confirm', 'setup'].indexOf(step)
            const isActive = step === s
            const isDone = i < stepIdx || step === 'done'
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={cn('w-8 h-px', isDone ? 'bg-primary' : 'bg-border')} />}
                <div className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                  isActive ? 'bg-primary text-primary-foreground' :
                  isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  <span>{i + 1}</span>
                  <span>{labels[i]}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step 1: Input specs path */}
        {step === 'infer' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Caminho da documentação (specs)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Cole o caminho absoluto para o diretório de specs/milestone do projeto.
              </p>
              <input
                type="text"
                value={specsPath}
                onChange={e => setSpecsPath(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && specsPath.trim() && handleInfer()}
                placeholder="D:/sources/.../milestone/01-escala"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {inferError && (
              <div className="px-3 py-2 rounded-md bg-destructive/10 text-destructive text-sm">{inferError}</div>
            )}
            <button
              onClick={handleInfer}
              disabled={!specsPath.trim() || inferring}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {inferring ? 'Inferindo...' : 'Inferir'}
            </button>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Field label="Workspace" value={workspace} onChange={setWorkspace} mono />
              <Field label="Specs (relativo)" value={specs} onChange={setSpecs} mono />
              <Field label="Slug" value={slug} onChange={setSlug} mono />
              <Field label="Nome" value={name} onChange={setName} />
              <div>
                <label className="block text-sm font-medium mb-1">Harness</label>
                <select
                  value={harness}
                  onChange={e => setHarness(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="claude-code">Claude Code</option>
                  <option value="codex">Codex</option>
                </select>
              </div>
            </div>
            {createError && (
              <div className="px-3 py-2 rounded-md bg-destructive/10 text-destructive text-sm">{createError}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setStep('infer')}
                className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted"
              >
                Voltar
              </button>
              <button
                onClick={handleCreate}
                disabled={!slug.trim() || !workspace.trim() || !specs.trim() || creating}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {creating ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Setup */}
        {(step === 'setup' || step === 'done') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Run config e scripts copiados para o workspace. Agora inicialize para gerar o features.json.
              </p>
            </div>

            {!setupDone && (
              <button
                onClick={handleSetup}
                disabled={setupRunning}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {setupRunning ? 'Inicializando...' : 'Inicializar'}
              </button>
            )}

            {setupError && (
              <div className="px-3 py-2 rounded-md bg-destructive/10 text-destructive text-sm">{setupError}</div>
            )}

            {setupOutput && (
              <div className="rounded-md border border-border bg-muted/30 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-border text-xs font-medium text-muted-foreground">Output</div>
                <pre className="p-3 text-xs font-mono overflow-auto max-h-[400px] whitespace-pre-wrap">{setupOutput}</pre>
              </div>
            )}

            {setupDone && (
              <div className="space-y-4">
                <div className="px-3 py-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                  Setup concluído com sucesso!
                </div>

                {/* Controles de execução */}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <span className="text-sm font-medium">Loop:</span>
                  <button
                    onClick={handleStart}
                    disabled={starting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    {starting ? 'Iniciando...' : 'Iniciar'}
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={stopping}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
                    {stopping ? 'Parando...' : 'Parar'}
                  </button>
                  <button
                    onClick={handleGoToFeatures}
                    className="ml-auto px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted"
                  >
                    Ver Features
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary',
          mono && 'font-mono'
        )}
      />
    </div>
  )
}
