import { useWorkspace } from '@/hooks/useWorkspace'
import { LoopStateBadge } from './LoopStateBadge'
import { ProcessBadge } from './ProcessBadge'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useTheme } from '@/hooks/useTheme'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchWorkspaces, harnessStart, harnessStop } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { WorkspaceInfo } from '@/lib/types'

const cardClass = 'border border-border rounded-lg px-3 py-1.5 bg-card min-w-0'

const toolAbbrev: Record<string, string> = {
  'claude-code': 'CC',
  codex: 'CDX',
}

function ElapsedTime({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const start = new Date(since).getTime()
    const tick = () => {
      const diff = Date.now() - start
      const s = Math.floor(diff / 1000) % 60
      const m = Math.floor(diff / 60000) % 60
      const h = Math.floor(diff / 3600000)
      setElapsed(h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [since])

  return <span className="text-xs font-mono text-muted-foreground">{elapsed}</span>
}

interface WorkspaceGroup {
  workspace: string
  label: string
  items: WorkspaceInfo[]
  totalPassing: number
  totalFeatures: number
}

function groupByWorkspace(workspaces: WorkspaceInfo[]): WorkspaceGroup[] {
  const map = new Map<string, WorkspaceInfo[]>()
  for (const ws of workspaces) {
    const key = ws.workspace
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(ws)
  }
  const groups: WorkspaceGroup[] = []
  for (const [workspace, items] of map) {
    const parts = workspace.replace(/\\/g, '/').replace(/\/$/, '').split('/')
    const label = parts[parts.length - 1] || workspace
    const totalPassing = items.reduce((s, w) => s + w.features.passing, 0)
    const totalFeatures = items.reduce((s, w) => s + w.features.total, 0)
    groups.push({ workspace, label, items, totalPassing, totalFeatures })
  }
  return groups
}

function WorkspaceSelector() {
  const { slug: currentSlug, config, summary, total } = useWorkspace()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([])
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchWorkspaces()
      setWorkspaces(data.workspaces)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = (ws: WorkspaceInfo) => {
    if (ws.slug === currentSlug) { setOpen(false); return }
    setOpen(false)
    const pathname = location.pathname
    const panelMatch = pathname.match(/^\/(features|sessions|console|specs|progress)\//)
    const manageMatch = pathname.match(/^\/runs\/[^/]+\/manage/)
    if (manageMatch) {
      navigate(`/runs/${ws.slug}/manage`)
    } else if (panelMatch) {
      navigate(`/${panelMatch[1]}/${ws.slug}`)
    } else {
      navigate(`/features/${ws.slug}`)
    }
  }

  const toggleGroup = (workspace: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(workspace)) next.delete(workspace)
      else next.add(workspace)
      return next
    })
  }

  const projectName = config?.project ?? 'Carregando...'
  const sessionName = config?.session_name ?? null
  const harness = config?.agent?.harness ?? null
  const passing = summary.passing ?? 0
  const pct = total > 0 ? Math.round((passing / total) * 100) : 0

  const groups = groupByWorkspace(workspaces)
  const hasManyGroups = groups.length > 1

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(cardClass, 'flex flex-col gap-0.5 hover:bg-muted/40 transition-colors cursor-pointer text-left max-w-[340px]')}
        title={currentSlug ?? projectName}
      >
        {/* Linha 1: Projeto + badges + chevron */}
        <div className="flex items-center gap-1.5 w-full">
          <span className="font-semibold text-sm truncate">{projectName}</span>
          {harness && (
            <span className="shrink-0 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {toolAbbrev[harness] ?? harness.toUpperCase()}
            </span>
          )}
          <svg
            className={cn('w-3.5 h-3.5 shrink-0 text-muted-foreground transition-transform ml-auto', open && 'rotate-180')}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {/* Linha 2: Session + progress mini */}
        <div className="flex items-center gap-2 w-full">
          {sessionName && (
            <span className="text-[11px] text-muted-foreground truncate">{sessionName}</span>
          )}
          {total > 0 && (
            <>
              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap ml-auto">
                {passing}/{total}
              </span>
              <div className="w-16 h-1 rounded-full bg-muted overflow-hidden shrink-0">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-primary' : 'bg-transparent')}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{pct}%</span>
            </>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-[380px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border text-xs font-medium text-muted-foreground">
            Projetos ({workspaces.length})
          </div>
          <div className="max-h-[400px] overflow-auto p-1.5 flex flex-col gap-1">
            {groups.map(group => {
              const isCollapsed = collapsed.has(group.workspace)
              const containsCurrent = group.items.some(w => w.slug === currentSlug)
              const groupHasRunning = group.items.some(w => w.loop_state === 'running' || w.loop_state === 'between' || w.loop_state === 'stopping')
              const gPct = group.totalFeatures > 0 ? Math.round((group.totalPassing / group.totalFeatures) * 100) : 0

              return (
                <div key={group.workspace}>
                  {/* Group header */}
                  {hasManyGroups && (
                    <button
                      onClick={() => toggleGroup(group.workspace)}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left"
                    >
                      <svg
                        className={cn('w-3 h-3 shrink-0 text-muted-foreground transition-transform', !isCollapsed && 'rotate-90')}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {groupHasRunning ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                      ) : containsCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      ) : null}
                      <span className="text-xs font-semibold text-muted-foreground truncate">{group.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                        {group.totalPassing}/{group.totalFeatures}
                      </span>
                      <div className="w-10 h-1 rounded-full bg-muted overflow-hidden shrink-0">
                        <div
                          className={cn('h-full rounded-full', gPct === 100 ? 'bg-green-500' : 'bg-primary')}
                          style={{ width: `${gPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{gPct}%</span>
                    </button>
                  )}

                  {/* Group items */}
                  {!isCollapsed && (
                    <div className={cn('flex flex-col gap-1', hasManyGroups && 'pl-3 mt-0.5 mb-1')}>
                      {group.items.map(ws => {
                        const isCurrent = ws.slug === currentSlug
                        const wsPct = ws.features.total > 0 ? Math.round((ws.features.passing / ws.features.total) * 100) : 0
                        const wsHarnessAbbrev = toolAbbrev[ws.harness] ?? ws.harness.toUpperCase()
                        const wsIsActive = ws.loop_state === 'running' || ws.loop_state === 'between' || ws.loop_state === 'stopping'
                        return (
                          <button
                            key={ws.slug}
                            onClick={() => handleSelect(ws)}
                            className={cn(
                              'w-full text-left rounded-md border px-3 py-2 transition-colors',
                              isCurrent
                                ? 'border-primary/40 bg-primary/10'
                                : wsIsActive
                                  ? 'border-green-500/40 bg-green-500/5 hover:bg-green-500/10'
                                  : 'border-border/50 hover:bg-muted/50 hover:border-border'
                            )}
                          >
                            {/* Linha 1: Nome + badge harness */}
                            <div className="flex items-center gap-1.5">
                              {wsIsActive ? (
                                <span className={cn(
                                  'w-2 h-2 rounded-full shrink-0 animate-pulse',
                                  ws.loop_state === 'running' ? 'bg-green-500' :
                                  ws.loop_state === 'between' ? 'bg-amber-500' : 'bg-red-500'
                                )} />
                              ) : isCurrent ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              ) : null}
                              <span className={cn('font-medium text-sm truncate', isCurrent && 'text-primary')}>{ws.name}</span>
                              <span className="shrink-0 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-auto">
                                {wsHarnessAbbrev}
                              </span>
                            </div>
                            {/* Linha 2: Slug + progresso */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono text-muted-foreground truncate">{ws.slug}</span>
                              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap ml-auto">
                                {ws.features.passing}/{ws.features.total}
                              </span>
                              <div className="w-14 h-1 rounded-full bg-muted overflow-hidden shrink-0">
                                <div
                                  className={cn('h-full rounded-full', wsPct === 100 ? 'bg-green-500' : 'bg-primary')}
                                  style={{ width: `${wsPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground">{wsPct}%</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            {workspaces.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">Nenhum projeto encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CreateHarnessButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/runs/new')}
      title="Novo Run"
      className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  )
}

function ProgressCard() {
  const { state, stateDetail, features, summary, total } = useWorkspace()

  const passing = summary.passing ?? 0
  const currentFeature = stateDetail?.feature_id ?? null
  const isActive = state === 'running' || state === 'between'

  if (!isActive || !stateDetail) return null

  return (
    <div className={cn(cardClass, 'flex flex-col gap-0.5')}>
      {/* Linha 1: Feature + Iteração */}
      <div className="flex items-center gap-3">
        {currentFeature && (
          <span className="text-xs text-muted-foreground">
            Feature <span className="font-mono font-medium text-foreground">{currentFeature}</span>
          </span>
        )}
        {stateDetail.iteration != null && (
          <span className="text-xs text-muted-foreground">
            Iter <span className="font-mono">#{stateDetail.iteration}</span>
          </span>
        )}
      </div>
      {/* Linha 2: Elapsed + ETA */}
      <div className="flex items-center gap-3">
        {stateDetail.started_at && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>⏱</span>
            <ElapsedTime since={stateDetail.started_at} />
          </span>
        )}
        {stateDetail.started_at && passing < total && total > 0 && (
          <span className="text-[11px] text-muted-foreground">
            ETA ~{estimateEta(stateDetail, features.length, passing)}
          </span>
        )}
      </div>
    </div>
  )
}

function LoopControlCard() {
  const { slug, state, pid, alive } = useWorkspace()
  const [acting, setActing] = useState(false)

  if (!slug) return null

  const handleStart = async () => {
    setActing(true)
    try { await harnessStart(slug) } catch { /* silent */ }
    setActing(false)
  }

  const handleStop = async () => {
    setActing(true)
    try { await harnessStop(slug) } catch { /* silent */ }
    setActing(false)
  }

  return (
    <div className={cn(cardClass, 'flex flex-col gap-0.5')}>
      {/* Linha 1: Estado + PID */}
      <div className="flex items-center gap-2">
        <LoopStateBadge state={state} />
        <ProcessBadge pid={pid} alive={alive} />
      </div>
      {/* Linha 2: Botão de controle */}
      <div className="flex items-center gap-1">
        {alive ? (
          <button
            onClick={handleStop}
            disabled={acting}
            title="Parar loop"
            className="flex items-center gap-1.5 text-[11px] font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
            Parar
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={acting}
            title="Iniciar loop"
            className="flex items-center gap-1.5 text-[11px] font-medium text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            Iniciar
          </button>
        )}
      </div>
    </div>
  )
}

export function StatusBar() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0">
      <button
        onClick={() => navigate('/dashboard')}
        title="Dashboard"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <CreateHarnessButton />
      <WorkspaceSelector />
      <ProgressCard />
      <LoopControlCard />

      <div className="ml-auto">
        <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
      </div>
    </div>
  )
}

function estimateEta(detail: any, total: number, done: number): string {
  if (!detail?.started_at || done === 0) return '?'
  const elapsed = Date.now() - new Date(detail.started_at).getTime()
  const perFeature = elapsed / done
  const remaining = total - done
  const etaMs = perFeature * remaining
  const m = Math.floor(etaMs / 60000)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m}m`
}
