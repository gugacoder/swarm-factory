import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWorkspaces, harnessStart, harnessStop } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { WorkspaceInfo, LoopState } from '@/lib/types'

// --- Agrupamento por workspace ---

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

// --- Helpers ---

const toolAbbrev: Record<string, string> = {
  'claude-code': 'CC',
  codex: 'CDX',
}

function isActive(state: LoopState) {
  return state === 'running' || state === 'between' || state === 'stopping'
}

function stateColor(state: LoopState) {
  if (state === 'running') return 'bg-green-500'
  if (state === 'between') return 'bg-amber-500'
  if (state === 'stopping') return 'bg-red-500'
  if (state === 'completed') return 'bg-blue-500'
  return 'bg-gray-400'
}

// --- RunBar ---

function RunBar({ ws, onRefresh }: { ws: WorkspaceInfo; onRefresh: () => void }) {
  const navigate = useNavigate()
  const [acting, setActing] = useState(false)
  const pct = ws.features.total > 0 ? Math.round((ws.features.passing / ws.features.total) * 100) : 0
  const abbrev = toolAbbrev[ws.harness] ?? ws.harness.toUpperCase()
  const active = isActive(ws.loop_state)

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setActing(true)
    try { await harnessStart(ws.slug); onRefresh() } catch { /* silent */ }
    setActing(false)
  }

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setActing(true)
    try { await harnessStop(ws.slug); onRefresh() } catch { /* silent */ }
    setActing(false)
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card',
        'hover:border-primary/40 transition-colors cursor-pointer',
      )}
      onClick={() => navigate(`/features/${ws.slug}`)}
    >
      {/* State dot */}
      <span
        className={cn('w-2.5 h-2.5 rounded-full shrink-0', stateColor(ws.loop_state), active && 'animate-pulse')}
        title={ws.loop_state}
      />

      {/* Identity */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{ws.name}</span>
          <span className="shrink-0 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {abbrev}
          </span>
        </div>
        <p className="text-[11px] font-mono text-muted-foreground truncate">{ws.slug}</p>
      </div>

      {/* Progress bar */}
      <div className="hidden sm:flex items-center gap-2 min-w-[140px]">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-primary' : 'bg-transparent')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{pct}%</span>
      </div>

      {/* Feature counts */}
      <span className="hidden md:inline text-xs text-muted-foreground whitespace-nowrap">
        <span className="font-medium text-foreground">{ws.features.passing}</span>/{ws.features.total}
      </span>

      {/* Hover links */}
      <div className={cn(
        'flex items-center gap-0.5',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        'max-md:opacity-100',
      )}>
        {[
          { path: `/features/${ws.slug}`, title: 'Features', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
          { path: `/sessions/${ws.slug}`, title: 'Sessions', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { path: `/console/${ws.slug}`, title: 'Console', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { path: `/runs/${ws.slug}/manage`, title: 'Gerenciar', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        ].map(({ path, title, icon }) => (
          <button
            key={path}
            title={title}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate(path) }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </button>
        ))}
      </div>

      {/* Loop control */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        {active ? (
          <button
            onClick={handleStop}
            disabled={acting}
            title="Parar loop"
            className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={acting}
            title="Iniciar loop"
            className="p-1.5 rounded-md text-green-500 hover:bg-green-500/10 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </button>
        )}
      </div>
    </div>
  )
}

// --- Dashboard ---

export function DashboardPanel() {
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    try {
      const data = await fetchWorkspaces()
      setWorkspaces(data.workspaces)
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Polling
  useEffect(() => {
    const id = setInterval(load, 5_000)
    return () => clearInterval(id)
  }, [load])

  const groups = groupByWorkspace(workspaces)
  const hasManyGroups = groups.length > 1

  const totalRuns = workspaces.length
  const totalFeatures = workspaces.reduce((s, w) => s + w.features.total, 0)
  const totalPassing = workspaces.reduce((s, w) => s + w.features.passing, 0)
  const successRate = totalFeatures > 0 ? Math.round((totalPassing / totalFeatures) * 100) : 0
  const runningCount = workspaces.filter(w => isActive(w.loop_state)).length

  const toggleGroup = (workspace: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(workspace)) next.delete(workspace)
      else next.add(workspace)
      return next
    })
  }

  if (loading) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-6 w-80 bg-muted animate-pulse rounded" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <button
            onClick={() => navigate('/runs/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Run
          </button>
        </div>

        {/* Summary strip */}
        {workspaces.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{totalRuns}</strong> runs</span>
            <span className="text-border">|</span>
            <span><strong className="text-foreground">{totalFeatures}</strong> features</span>
            <span className="text-border">|</span>
            <span><strong className="text-foreground">{totalPassing}</strong> passing</span>
            <span className="text-border">|</span>
            <span><strong className="text-foreground">{successRate}%</strong> sucesso</span>
            {runningCount > 0 && (
              <>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <strong className="text-foreground">{runningCount}</strong> rodando
                </span>
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {workspaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-lg font-semibold mb-2">Nenhum run</h2>
            <p className="text-muted-foreground mb-4">Crie seu primeiro run para comecar.</p>
            <button
              onClick={() => navigate('/runs/new')}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Criar Run
            </button>
          </div>
        )}

        {/* Run list — grouped */}
        {groups.map(group => {
          const isCollapsed = collapsed.has(group.workspace)
          const gPct = group.totalFeatures > 0 ? Math.round((group.totalPassing / group.totalFeatures) * 100) : 0
          const groupHasRunning = group.items.some(w => isActive(w.loop_state))

          return (
            <div key={group.workspace} className="space-y-2">
              {/* Group header */}
              {hasManyGroups && (
                <button
                  onClick={() => toggleGroup(group.workspace)}
                  className="w-full flex items-center gap-2 px-1 py-1 text-left"
                >
                  <svg
                    className={cn('w-3.5 h-3.5 shrink-0 text-muted-foreground transition-transform', !isCollapsed && 'rotate-90')}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {groupHasRunning && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />}
                  <span className="text-sm font-semibold text-muted-foreground">{group.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                    {group.totalPassing}/{group.totalFeatures}
                  </span>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                    <div
                      className={cn('h-full rounded-full', gPct === 100 ? 'bg-green-500' : 'bg-primary')}
                      style={{ width: `${gPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{gPct}%</span>
                </button>
              )}

              {/* RunBars */}
              {!isCollapsed && (
                <div className={cn('space-y-1.5', hasManyGroups && 'pl-2')}>
                  {group.items.map(ws => (
                    <RunBar key={ws.slug} ws={ws} onRefresh={load} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
