import { useState, useMemo } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { LogModal } from '@/components/LogModal'
import { cn } from '@/lib/utils'
import type { FeatureStatus } from '@/lib/types'

const STATUS_ORDER: FeatureStatus[] = ['passing', 'failing', 'in_progress', 'pending', 'blocked', 'skipped']

const STATUS_COLORS: Record<string, string> = {
  passing:     'border-green-500/30 bg-green-50 dark:bg-green-900/10',
  failing:     'border-red-500/30 bg-red-50 dark:bg-red-900/10',
  in_progress: 'border-blue-500/30 bg-blue-50 dark:bg-blue-900/10',
  pending:     'border-zinc-500/30 bg-zinc-50 dark:bg-zinc-800/30',
  blocked:     'border-amber-500/30 bg-amber-50 dark:bg-amber-900/10',
  skipped:     'border-orange-500/30 bg-orange-50 dark:bg-orange-900/10',
}

export function FeaturesPanel() {
  const { features, summary, total } = useWorkspace()
  const [filter, setFilter] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showLog, setShowLog] = useState(false)

  const passing = summary.passing ?? 0

  const filtered = useMemo(() => {
    if (!filter) return features
    return features.filter(f => f.status === filter)
  }, [features, filter])

  return (
    <div className="flex flex-col h-full">
      {/* Summary cards */}
      <div className="px-4 py-3 border-b border-border space-y-3">
        <ProgressBar done={passing} total={total} />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STATUS_ORDER.map(s => {
            const count = summary[s] ?? 0
            const isActive = filter === s
            return (
              <button
                key={s}
                onClick={() => setFilter(isActive ? null : s)}
                className={cn(
                  'flex flex-col items-center p-2 rounded-md border text-xs transition-colors',
                  isActive ? 'ring-2 ring-primary' : '',
                  STATUS_COLORS[s] ?? ''
                )}
              >
                <span className="font-bold text-lg leading-none">{count}</span>
                <span className="text-muted-foreground mt-0.5">{s}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">ID</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground w-full">Título</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">Pri</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">Deps</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <>
                <tr
                  key={f.id}
                  onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2 font-mono text-xs whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      {f.status === 'in_progress' && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                      )}
                      {f.id}
                    </span>
                  </td>
                  <td className="px-4 py-2">{f.title}</td>
                  <td className="px-4 py-2 whitespace-nowrap"><StatusBadge status={f.status} /></td>
                  <td className="px-4 py-2 text-center font-mono text-xs whitespace-nowrap">{f.priority}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {f.dependencies.length > 0 ? f.dependencies.join(', ') : '—'}
                  </td>
                </tr>
                {expandedId === f.id && (
                  <tr key={`${f.id}-detail`} className="bg-muted/20">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="space-y-2 text-xs">
                        {f.description && (
                          <div>
                            <span className="font-medium text-muted-foreground">Descrição: </span>
                            <span>{f.description}</span>
                          </div>
                        )}
                        {f.tests && f.tests.length > 0 && (
                          <div>
                            <span className="font-medium text-muted-foreground">Testes ({f.tests.length}):</span>
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                              {f.tests.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          </div>
                        )}
                        {f.prp_path && (
                          <div>
                            <span className="font-medium text-muted-foreground">PRP: </span>
                            <span className="font-mono">{f.prp_path.split(/[/\\]/).pop()}</span>
                          </div>
                        )}
                        {f.completed_at && (
                          <div>
                            <span className="font-medium text-muted-foreground">Completado em: </span>
                            <span>{new Date(f.completed_at).toLocaleString('pt-BR')}</span>
                          </div>
                        )}
                        {f.status === 'in_progress' && (
                          <button
                            onClick={e => { e.stopPropagation(); setShowLog(true) }}
                            className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Ver log
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {showLog && <LogModal onClose={() => setShowLog(false)} />}
    </div>
  )
}
