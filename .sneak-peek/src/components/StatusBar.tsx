import { useWorkspace } from '@/hooks/useWorkspace'
import { LoopStateBadge } from './LoopStateBadge'
import { ProcessBadge } from './ProcessBadge'
import { ProgressBar } from './ProgressBar'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useTheme } from '@/hooks/useTheme'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchWorkspaces, harnessStart, harnessStop } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { WorkspaceInfo } from '@/lib/types'

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

function WorkspaceSelector() {
  const { slug: currentSlug, config } = useWorkspace()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([])
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

  // Close on click outside
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

    // Navigate to same panel type but with new slug
    const pathname = location.pathname
    // Detect current panel
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

  const displayName = config?.project ?? currentSlug ?? 'Carregando...'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-semibold text-sm hover:text-primary transition-colors max-w-[280px]"
        title={displayName}
      >
        <span className="truncate">{displayName}</span>
        {currentSlug && (
          <span className="text-[10px] font-mono text-muted-foreground ml-1">({currentSlug})</span>
        )}
        <svg className={cn('w-3.5 h-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[320px] max-w-[420px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border text-xs font-medium text-muted-foreground">
            Projetos ({workspaces.length})
          </div>
          <div className="max-h-[300px] overflow-auto">
            {workspaces.map(ws => {
              const isCurrent = ws.slug === currentSlug
              const pct = ws.features.total > 0 ? Math.round((ws.features.passing / ws.features.total) * 100) : 0
              return (
                <button
                  key={ws.slug}
                  onClick={() => handleSelect(ws)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm transition-colors border-b border-border/50 last:border-0',
                    isCurrent ? 'bg-primary/10' : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    <span className={cn('font-medium truncate', isCurrent && 'text-primary')}>{ws.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-1">{ws.slug}</span>
                    <span className="ml-auto text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {ws.features.passing}/{ws.features.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground">{ws.harness}</span>
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', pct === 100 ? 'bg-green-500' : 'bg-primary')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{pct}%</span>
                  </div>
                </button>
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
      className="flex items-center justify-center w-6 h-6 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  )
}

function LoopControls({ slug, alive }: { slug: string; alive: boolean }) {
  const [acting, setActing] = useState(false)

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

  if (alive) {
    return (
      <button
        onClick={handleStop}
        disabled={acting}
        title="Parar loop"
        className="flex items-center justify-center w-6 h-6 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
      </button>
    )
  }

  return (
    <button
      onClick={handleStart}
      disabled={acting}
      title="Iniciar loop"
      className="flex items-center justify-center w-6 h-6 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
    </button>
  )
}

export function StatusBar() {
  const { slug, state, stateDetail, pid, alive, features, summary, total } = useWorkspace()
  const { theme, setTheme } = useTheme()

  const passing = summary.passing ?? 0
  const currentFeature = stateDetail?.feature_id ?? null

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card shrink-0 flex-wrap">
      <WorkspaceSelector />
      <CreateHarnessButton />

      <LoopStateBadge state={state} />
      <ProcessBadge pid={pid} alive={alive} />

      {currentFeature && (state === 'running' || state === 'between') && (
        <span className="text-xs text-muted-foreground">
          Feature: <span className="font-mono font-medium text-foreground">{currentFeature}</span>
        </span>
      )}

      {stateDetail?.iteration != null && (
        <span className="text-xs text-muted-foreground">
          Iter: <span className="font-mono">{stateDetail.iteration}</span>
        </span>
      )}

      {stateDetail?.started_at && (state === 'running' || state === 'between') && (
        <ElapsedTime since={stateDetail.started_at} />
      )}

      {total > 0 && (
        <>
          {stateDetail?.started_at && passing < total && (
            <span className="text-[11px] text-muted-foreground">
              ETA: ~{estimateEta(stateDetail, features.length, passing)}
            </span>
          )}
          <ProgressBar done={passing} total={total} className="w-32 hidden sm:flex" />
        </>
      )}

      {slug && (
        <LoopControls slug={slug} alive={alive} />
      )}

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
