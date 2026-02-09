import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { RunFeature } from '../lib/types'

interface FeatureListProps {
  features: RunFeature[]
  runId?: string
  currentFeatureId?: string
  onOpenSession?: (featureId: string) => void
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full shrink-0',
        status === 'passing' ? 'bg-green-500' : 'bg-red-500'
      )}
      title={status}
    />
  )
}

export function FeatureList({ features, runId, currentFeatureId, onOpenSession }: FeatureListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (features.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">Nenhuma feature encontrada</p>
      </div>
    )
  }

  const sorted = [...features].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))

  return (
    <div className="space-y-0.5">
      {sorted.map((feature) => {
        const isExpanded = expandedId === feature.id
        const hasDetails = feature.description || (feature.tests && feature.tests.length > 0)

        return (
          <div key={feature.id}>
            <div
              onClick={() => hasDetails && setExpandedId(isExpanded ? null : feature.id)}
              className={cn(
                'flex items-start gap-2.5 px-3 py-2 rounded-md text-sm',
                feature.status === 'passing'
                  ? 'bg-green-500/5'
                  : 'bg-red-500/5',
                hasDetails && 'cursor-pointer hover:bg-muted/50'
              )}
            >
              <StatusDot status={feature.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {feature.id}
                  </span>
                  <span className="font-medium truncate">{feature.name}</span>
                  {feature.prp_path && (
                    <span title={`PRP: ${feature.prp_path}`} className="text-muted-foreground shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                  )}
                  {hasDetails && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {isExpanded ? '\u25B4' : '\u25BE'}
                    </span>
                  )}
                </div>
                {feature.dependencies.length > 0 && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    deps: {feature.dependencies.join(', ')}
                  </div>
                )}
              </div>
              {feature.completed_at && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(feature.completed_at).toLocaleDateString('pt-BR')}
                </span>
              )}
              {runId && feature.status !== 'passing' && currentFeatureId === feature.id && (
                <Link
                  to={`/session-live/${runId}/${feature.id}`}
                  className="text-[10px] text-primary hover:underline shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  title="Abrir sessao ao vivo"
                >
                  ao vivo
                </Link>
              )}
              {onOpenSession && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenSession(feature.id) }}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Ver sessao"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {isExpanded && (
              <div className="ml-7 px-3 py-2 text-xs text-muted-foreground space-y-1.5">
                {feature.description && (
                  <p>{feature.description}</p>
                )}
                {feature.tests && feature.tests.length > 0 && (
                  <ul className="space-y-0.5">
                    {feature.tests.map((test, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className={feature.status === 'passing' ? 'text-green-500' : 'text-muted-foreground'}>
                          {feature.status === 'passing' ? '\u2713' : '\u25CB'}
                        </span>
                        {test}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
