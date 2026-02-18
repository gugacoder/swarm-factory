import { useState, useCallback, useEffect, useRef } from 'react'
import { useSlug } from '@/hooks/useSlug'
import { useWorkspace } from '@/hooks/useWorkspace'
import { fetchRunStatus, fetchConfig, createStream, initializeStream, harnessStart, harnessStop, fetchHarnessSessions, switchSession } from '@/lib/api'
import { StreamLog } from '@/components/StreamLog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { StreamEvent, HarnessSessionInfo } from '@/lib/types'

type RunPhase = 'pending' | 'created' | 'initialized' | 'executed'

interface RunStatus {
  exists: boolean
  slug: string
  workspace?: string
  workspace_exists?: boolean
  has_harness?: boolean
  phase?: RunPhase
  features_count?: number
  features_passing?: number
}

export function ManagePanel() {
  const slug = useSlug()
  const { state, alive, pid, refreshState } = useWorkspace()
  const [status, setStatus] = useState<RunStatus | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [startError, setStartError] = useState<string | null>(null)
  const [stopError, setStopError] = useState<string | null>(null)

  // Session selector
  const [sessions, setSessions] = useState<HarnessSessionInfo[]>([])
  const [activeSession, setActiveSession] = useState<string>('')
  const [switchingSession, setSwitchingSession] = useState(false)

  // Create section
  const [createLogs, setCreateLogs] = useState<StreamEvent[]>([])
  const [creating, setCreating] = useState(false)
  const closeCreateRef = useRef<(() => void) | null>(null)

  // Initialize section
  const [initLogs, setInitLogs] = useState<StreamEvent[]>([])
  const [initializing, setInitializing] = useState(false)
  const [confirmInit, setConfirmInit] = useState(false)
  const closeInitRef = useRef<(() => void) | null>(null)

  // Execute section
  const [starting, setStarting] = useState(false)
  const [stopping, setStopping] = useState(false)

  // Loop overrides (populated from config, editable before start)
  const [maxTurns, setMaxTurns] = useState(0)
  const [maxTurnsUnlimited, setMaxTurnsUnlimited] = useState(true)
  const [maxIterations, setMaxIterations] = useState(0)
  const [maxIterationsUnlimited, setMaxIterationsUnlimited] = useState(true)
  const [maxFeatures, setMaxFeatures] = useState(0)
  const [maxFeaturesUnlimited, setMaxFeaturesUnlimited] = useState(true)

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({})

  const loadStatus = useCallback(async () => {
    if (!slug) return
    try {
      const s = await fetchRunStatus(slug)
      setStatus(s)
    } catch { /* silent */ }
    setLoadingStatus(false)
  }, [slug])

  const loadSessions = useCallback(async () => {
    if (!slug) return
    try {
      const data = await fetchHarnessSessions(slug)
      setSessions(data.sessions)
      setActiveSession(data.active)
    } catch { /* silent */ }
  }, [slug])

  // Load config to populate limit defaults
  const loadConfig = useCallback(async () => {
    if (!slug) return
    try {
      const { config } = await fetchConfig(slug)
      const agent = config?.agent
      if (agent) {
        const turns = agent.max_turns ?? 0
        setMaxTurns(turns)
        setMaxTurnsUnlimited(!turns)
        const iters = agent.max_iterations ?? 0
        setMaxIterations(iters)
        setMaxIterationsUnlimited(!iters)
      }
    } catch { /* silent */ }
  }, [slug])

  useEffect(() => { loadStatus(); loadSessions(); loadConfig() }, [loadStatus, loadSessions, loadConfig])

  // Polling status while running operations
  useEffect(() => {
    if (!creating && !initializing) return
    const id = setInterval(() => { loadStatus(); loadSessions() }, 3000)
    return () => clearInterval(id)
  }, [creating, initializing, loadStatus, loadSessions])

  // Poll sessions periodically
  useEffect(() => {
    const id = setInterval(loadSessions, 10_000)
    return () => clearInterval(id)
  }, [loadSessions])

  const handleSwitchSession = useCallback(async (session: string) => {
    if (!slug || session === activeSession) return
    setSwitchingSession(true)
    try {
      await switchSession(slug, session)
      setActiveSession(session)
      loadStatus()
      refreshState()
    } catch { /* silent */ }
    setSwitchingSession(false)
  }, [slug, activeSession, loadStatus, refreshState])

  const handleCreate = useCallback(() => {
    if (!slug) return
    setCreating(true)
    setCreateLogs([])
    const close = createStream(slug, (ev) => {
      setCreateLogs(prev => [...prev, ev])
      if (ev.type === 'done' || ev.type === 'error') {
        setCreating(false)
        loadStatus()
        loadSessions()
      }
    })
    closeCreateRef.current = close
  }, [slug, loadStatus, loadSessions])

  const handleInitialize = useCallback(() => {
    if (!slug) return
    setInitializing(true)
    setInitLogs([])
    const close = initializeStream(slug, (ev) => {
      setInitLogs(prev => [...prev, ev])
      if (ev.type === 'done' || ev.type === 'error') {
        setInitializing(false)
        loadStatus()
        loadSessions()
      }
    })
    closeInitRef.current = close
  }, [slug, loadStatus, loadSessions])

  const handleStart = useCallback(async () => {
    if (!slug) return
    setStarting(true)
    setStartError(null)
    try {
      await harnessStart(slug, {
        max_turns: maxTurnsUnlimited ? 0 : maxTurns,
        max_iterations: maxIterationsUnlimited ? 0 : maxIterations,
        max_features: maxFeaturesUnlimited ? 0 : maxFeatures,
      })
      setTimeout(refreshState, 500)
      setTimeout(refreshState, 2000)
    } catch (e: any) {
      setStartError(e.message || 'Erro ao iniciar')
    }
    setStarting(false)
  }, [slug, refreshState, maxTurns, maxTurnsUnlimited, maxIterations, maxIterationsUnlimited, maxFeatures, maxFeaturesUnlimited])

  const handleStop = useCallback(async () => {
    if (!slug) return
    setStopping(true)
    setStopError(null)
    try {
      await harnessStop(slug)
      setTimeout(refreshState, 500)
      setTimeout(refreshState, 2000)
    } catch (e: any) {
      setStopError(e.message || 'Erro ao parar')
    }
    setStopping(false)
  }, [slug, refreshState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeCreateRef.current?.()
      closeInitRef.current?.()
    }
  }, [])

  const phase = status?.phase || 'pending'
  const phaseIdx = ['pending', 'created', 'initialized', 'executed'].indexOf(phase)

  // Collapsible sections — completed sections start collapsed, current one starts open
  useEffect(() => {
    setOpenSections({
      1: phaseIdx < 1 || creating,
      2: phaseIdx >= 1 && phaseIdx < 2 || initializing,
      3: phaseIdx >= 2,
    })
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!slug) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Nenhum slug selecionado
      </div>
    )
  }

  if (loadingStatus) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Carregando...
      </div>
    )
  }

  const phaseLabels = ['Pendente', 'Criado', 'Inicializado', 'Executado']

  const toggleSection = (n: number) => setOpenSections(prev => ({ ...prev, [n]: !prev[n] }))

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Gerenciar: <span className="font-mono text-primary">{slug}</span></h1>

        {/* Phase stepper */}
        <div className="flex items-center gap-1.5">
          {phaseLabels.map((label, i) => {
            const isDone = i <= phaseIdx
            const isCurrent = i === phaseIdx
            return (
              <div key={label} className="flex items-center gap-1.5">
                {i > 0 && <div className={`w-6 h-px ${isDone ? 'bg-primary' : 'bg-border'}`} />}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isCurrent ? 'bg-primary text-primary-foreground' :
                  isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Session Selector */}
        {sessions.length > 0 && (
          <section className="rounded-lg border border-border p-4 space-y-3">
            <h2 className="text-sm font-semibold">Session ativa</h2>
            <div className="flex items-center gap-2">
              <select
                value={activeSession}
                onChange={(e) => handleSwitchSession(e.target.value)}
                disabled={switchingSession}
                className="px-3 py-1.5 rounded-md border border-border bg-card text-sm font-mono disabled:opacity-50"
              >
                {sessions.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.featuresPassingCount}/{s.featuresCount})
                  </option>
                ))}
              </select>
              {switchingSession && <span className="text-xs text-muted-foreground">Trocando...</span>}
            </div>
          </section>
        )}

        {/* 1. Criar harness */}
        <section className={`rounded-lg border ${phaseIdx >= 1 ? 'border-border' : 'border-primary/50'}`}>
          <button
            type="button"
            onClick={() => toggleSection(1)}
            className="w-full flex items-center justify-between p-4 cursor-pointer select-none"
          >
            <h2 className="text-sm font-semibold">1. Criar</h2>
            <div className="flex items-center gap-2">
              {phaseIdx >= 1 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Concluido</span>
              )}
              <svg className={`w-4 h-4 text-muted-foreground transition-transform ${openSections[1] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {openSections[1] && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Cria o .harness/ no workspace do milestone com scripts e config.
              </p>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {creating ? 'Criando...' : phaseIdx >= 1 ? 'Recriar' : 'Criar'}
              </button>

              <StreamLog lines={createLogs} />
            </div>
          )}
        </section>

        {/* 2. Inicializar */}
        <section className={`rounded-lg border ${
          phaseIdx >= 2 ? 'border-border' : phaseIdx === 1 ? 'border-primary/50' : 'border-border opacity-50'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection(2)}
            className="w-full flex items-center justify-between p-4 cursor-pointer select-none"
          >
            <h2 className="text-sm font-semibold">2. Inicializar</h2>
            <div className="flex items-center gap-2">
              {phaseIdx >= 2 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {status?.features_count} features
                </span>
              )}
              <svg className={`w-4 h-4 text-muted-foreground transition-transform ${openSections[2] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {openSections[2] && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Executa o inicializador para gerar features.json a partir dos PRPs.
              </p>

              <button
                onClick={phaseIdx >= 2 ? () => setConfirmInit(true) : handleInitialize}
                disabled={initializing || phaseIdx < 1}
                className={`px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 ${
                  phaseIdx >= 2
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {initializing ? 'Inicializando...' : phaseIdx >= 2 ? 'Reinicializar' : 'Inicializar'}
              </button>

              <StreamLog lines={initLogs} />
            </div>
          )}
        </section>

        {/* 3. Executar */}
        <section className={`rounded-lg border ${
          phaseIdx >= 2 ? 'border-border' : 'border-border opacity-50'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection(3)}
            className="w-full flex items-center justify-between p-4 cursor-pointer select-none"
          >
            <h2 className="text-sm font-semibold">3. Executar</h2>
            <div className="flex items-center gap-2">
              {alive && pid && (
                <span className="text-xs font-mono text-muted-foreground">PID {pid}</span>
              )}
              {alive && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
              <span className={`text-xs font-medium ${alive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                {alive ? (state === 'stopping' ? 'Parando...' : 'Rodando') : phaseIdx >= 3 ? 'Parado' : ''}
              </span>
              <svg className={`w-4 h-4 text-muted-foreground transition-transform ${openSections[3] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {openSections[3] && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Inicia ou para o loop autonomo.
                {alive ? ' O processo roda em background — feche a aba sem medo.' : ''}
              </p>

              {status?.features_count != null && status.features_count > 0 && (
                <div className="text-xs text-muted-foreground">
                  Progresso: {status.features_passing ?? 0}/{status.features_count} features
                </div>
              )}

              {/* Limites editáveis — só mostra quando não está rodando */}
              {!alive && phaseIdx >= 2 && (
                <div className="grid grid-cols-3 gap-3 p-3 rounded-md border border-border bg-card">
                  <LimitInput
                    label="Turns/sessão"
                    value={maxTurns}
                    onChange={setMaxTurns}
                    unlimited={maxTurnsUnlimited}
                    onToggle={setMaxTurnsUnlimited}
                    placeholder="200"
                  />
                  <LimitInput
                    label="Iterações"
                    value={maxIterations}
                    onChange={setMaxIterations}
                    unlimited={maxIterationsUnlimited}
                    onToggle={setMaxIterationsUnlimited}
                    placeholder="50"
                  />
                  <LimitInput
                    label="Max features"
                    value={maxFeatures}
                    onChange={setMaxFeatures}
                    unlimited={maxFeaturesUnlimited}
                    onToggle={setMaxFeaturesUnlimited}
                    placeholder="10"
                  />
                </div>
              )}

              {/* Resumo dos limites quando rodando */}
              {alive && (
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Turns: {maxTurnsUnlimited ? '∞' : maxTurns}</span>
                  <span>Iterações: {maxIterationsUnlimited ? '∞' : maxIterations}</span>
                  <span>Features: {maxFeaturesUnlimited ? '∞' : maxFeatures}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStart}
                  disabled={starting || alive || phaseIdx < 2}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  {starting ? 'Iniciando...' : 'Iniciar'}
                </button>
                <button
                  onClick={handleStop}
                  disabled={stopping || !alive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
                  {stopping ? 'Parando...' : 'Parar'}
                </button>
              </div>

              {startError && (
                <div className="text-xs text-red-500 bg-red-500/10 rounded px-2 py-1.5">{startError}</div>
              )}
              {stopError && (
                <div className="text-xs text-red-500 bg-red-500/10 rounded px-2 py-1.5">{stopError}</div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmInit}
        title="Reinicializar"
        message="Isso regenera o features.json e reseta o progress da session ativa. Continuar?"
        confirmLabel="Reinicializar"
        onConfirm={() => { setConfirmInit(false); handleInitialize() }}
        onCancel={() => setConfirmInit(false)}
      />
    </div>
  )
}

function LimitInput({ label, value, onChange, unlimited, onToggle, placeholder }: {
  label: string
  value: number
  onChange: (v: number) => void
  unlimited: boolean
  onToggle: (v: boolean) => void
  placeholder: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={() => onToggle(!unlimited)}
          className={`text-[10px] px-1.5 py-px rounded-full border transition-colors ${
            unlimited
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          {unlimited ? '∞' : '#'}
        </button>
      </div>
      {unlimited ? (
        <div className="text-xs text-primary font-medium">sem limite</div>
      ) : (
        <input
          type="number"
          min={1}
          value={value || ''}
          onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
          placeholder={placeholder}
          className="w-full px-2 py-1 rounded border border-border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </div>
  )
}
