import type { SessionChecklist } from '@/tools/run-monitor/lib/types'

interface ChecklistPanelProps {
  checklist: SessionChecklist
}

interface CheckItem {
  checked: boolean
  text: string
}

function parseChecklistItems(content: string): { title: string; items: CheckItem[] } {
  const lines = content.split('\n')
  let title = ''
  const items: CheckItem[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!title && trimmed.startsWith('# ')) {
      title = trimmed.replace(/^#\s+/, '')
      continue
    }
    const match = trimmed.match(/^- \[([ x])\]\s+(.*)$/)
    if (match) {
      items.push({ checked: match[1] === 'x', text: match[2] })
    }
  }

  return { title, items }
}

export function ChecklistPanel({ checklist }: ChecklistPanelProps) {
  if (!checklist.content) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Aguardando checklist...
      </div>
    )
  }

  const { title, items } = parseChecklistItems(checklist.content)
  const total = items.length
  const checked = items.filter(i => i.checked).length
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border shrink-0">
        {title && <h3 className="font-semibold text-sm truncate mb-2">{title}</h3>}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {checked}/{total}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item, i) => (
          <label key={i} className="flex items-start gap-2 text-sm py-0.5">
            <input
              type="checkbox"
              checked={item.checked}
              readOnly
              className="mt-0.5 shrink-0 accent-green-500 pointer-events-none"
            />
            <span className={item.checked ? 'text-muted-foreground line-through' : ''}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
