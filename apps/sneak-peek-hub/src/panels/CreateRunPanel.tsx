import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { harnessInfer, runCreate } from '@/lib/api'
import type { HarnessInferResponse } from '@/lib/types'
import { cn } from '@/lib/utils'

type Step = 'infer' | 'confirm'

export function CreateRunPanel() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('infer')

  // Step 1 — Infer
  const [specsPath, setSpecsPath] = useState('')
  const [inferring, setInferring] = useState(false)
  const [, setInferred] = useState<HarnessInferResponse | null>(null)

  // Step 2 — Confirm
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [workspace, setWorkspace] = useState('')
  const [specs, setSpecs] = useState('')
  const [harness, setHarness] = useState('claude-code')
  const [maxTurns, setMaxTurns] = useState(200)
  const [maxTurnsUnlimited, setMaxTurnsUnlimited] = useState(false)
  const [maxIterations, setMaxIterations] = useState(0)
  const [maxIterationsUnlimited, setMaxIterationsUnlimited] = useState(true)
  const [maxFeatures, setMaxFeatures] = useState(0)
  const [maxFeaturesUnlimited, setMaxFeaturesUnlimited] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const handleAdvance = useCallback(async () => {
    setInferring(true)
    try {
      const result = await harnessInfer(specsPath.trim())
      setInferred(result)
      setSlug(result.suggestedSlug || '')
      setName(result.suggestedName || '')
      setWorkspace(result.workspace || '')
      setSpecs((result as any).specs || specsPath.trim())
    } catch {
      setSpecs(specsPath.trim())
    }
    setStep('confirm')
    setInferring(false)
  }, [specsPath])

  const handleCreate = useCallback(async () => {
    setCreating(true)
    setCreateError('')
    try {
      const result = await runCreate({
        slug, name, workspace, specs, harness,
        max_turns: maxTurnsUnlimited ? null : maxTurns,
        max_iterations: maxIterationsUnlimited ? null : maxIterations,
        max_features: maxFeaturesUnlimited ? null : maxFeatures,
      })
      // Redirect to manage page
      navigate(`/runs/${result.slug}/manage`)
    } catch (e: any) {
      setCreateError(e.message)
    }
    setCreating(false)
  }, [slug, name, workspace, specs, harness, maxTurns, maxTurnsUnlimited, maxIterations, maxIterationsUnlimited, maxFeatures, maxFeaturesUnlimited, navigate])

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Novo Run</h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-sm">
          {(['infer', 'confirm'] as Step[]).map((s, i) => {
            const labels = ['Specs', 'Confirmar']
            const stepIdx = ['infer', 'confirm'].indexOf(step)
            const isActive = step === s
            const isDone = i < stepIdx
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
                onKeyDown={e => e.key === 'Enter' && specsPath.trim() && handleAdvance()}
                placeholder="D:/sources/.../milestone/01-escala"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleAdvance}
              disabled={!specsPath.trim() || inferring}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {inferring ? 'Carregando...' : 'Avançar'}
            </button>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Field label="Workspace" value={workspace} onChange={setWorkspace} mono />
              <Field label="Specs" value={specs} onChange={setSpecs} mono />
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

              {/* Limites do agente */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Limites do agente</p>
                <div className="grid grid-cols-1 gap-3">
                  <LimitField
                    label="Turns por sessão"
                    hint="Quanto o agente pode trabalhar em cada feature"
                    value={maxTurns}
                    onChange={setMaxTurns}
                    unlimited={maxTurnsUnlimited}
                    onToggleUnlimited={setMaxTurnsUnlimited}
                    placeholder="200"
                  />
                  <LimitField
                    label="Iterações do loop"
                    hint="Quantas vezes o loop roda (features + retries)"
                    value={maxIterations}
                    onChange={setMaxIterations}
                    unlimited={maxIterationsUnlimited}
                    onToggleUnlimited={setMaxIterationsUnlimited}
                    placeholder="50"
                  />
                  <LimitField
                    label="Max features"
                    hint="Quantas features completar antes de parar"
                    value={maxFeatures}
                    onChange={setMaxFeatures}
                    unlimited={maxFeaturesUnlimited}
                    onToggleUnlimited={setMaxFeaturesUnlimited}
                    placeholder="10"
                  />
                </div>
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
                {creating ? 'Criando...' : 'Criar Run'}
              </button>
            </div>
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

function LimitField({ label, hint, value, onChange, unlimited, onToggleUnlimited, placeholder }: {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
  unlimited: boolean
  onToggleUnlimited: (v: boolean) => void
  placeholder: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium">{label}</label>
        <button
          type="button"
          onClick={() => onToggleUnlimited(!unlimited)}
          className={cn(
            'text-xs px-2 py-0.5 rounded-full border transition-colors',
            unlimited
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
          )}
        >
          {unlimited ? '∞ sem limite' : 'limitado'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{hint}</p>
      {!unlimited && (
        <input
          type="number"
          min={1}
          value={value || ''}
          onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  )
}
