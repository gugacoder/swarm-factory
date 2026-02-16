import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchSpecs } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { SpecsResponse, SpecsItem } from '@/lib/types'

function FileViewer({ content }: { content: string }) {
  return (
    <pre className="flex-1 overflow-auto p-4 text-xs font-mono whitespace-pre-wrap break-words bg-card">
      {content}
    </pre>
  )
}

function FileTree({ items, onSelect, selectedPath }: { items: SpecsItem[]; onSelect: (path: string) => void; selectedPath: string | null }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggleDir = (dirPath: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(dirPath) ? next.delete(dirPath) : next.add(dirPath)
      return next
    })
  }

  return (
    <div className="space-y-0.5 text-xs">
      {items.map(item => {
        if (item.type === 'directory') {
          const isCollapsed = collapsed.has(item.path)
          return (
            <div key={item.path}>
              <button
                onClick={() => toggleDir(item.path)}
                className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-muted/50 rounded transition-colors text-left"
              >
                <span className="text-muted-foreground">{isCollapsed ? '▶' : '▼'}</span>
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <span className="font-medium">{item.name}</span>
              </button>
              {!isCollapsed && (
                <DirectoryContents parentPath={item.path} onSelect={onSelect} selectedPath={selectedPath} />
              )}
            </div>
          )
        }
        return (
          <button
            key={item.path}
            onClick={() => onSelect(item.path)}
            className={cn(
              'flex items-center gap-1.5 w-full px-2 py-1 rounded transition-colors text-left',
              selectedPath === item.path ? 'bg-muted' : 'hover:bg-muted/50'
            )}
          >
            <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{item.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function DirectoryContents({ parentPath, onSelect, selectedPath }: { parentPath: string; onSelect: (path: string) => void; selectedPath: string | null }) {
  const [items, setItems] = useState<SpecsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchSpecs(parentPath).then(data => {
      if (cancelled) return
      if (data.type === 'directory') setItems(data.items)
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => { cancelled = true }
  }, [parentPath])

  if (loading) return <div className="pl-6 text-muted-foreground text-[10px]">...</div>
  return (
    <div className="pl-4">
      <FileTree items={items} onSelect={onSelect} selectedPath={selectedPath} />
    </div>
  )
}

export function PromptPanel() {
  const location = useLocation()
  const navigate = useNavigate()
  // Extract sub-path from /specs/* — everything after /specs/
  const routeFilePath = location.pathname.replace(/^\/specs\/?/, '') || null

  const [root, setRoot] = useState<SpecsResponse | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(routeFilePath)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpecs()
      .then(data => { setRoot(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Load file from route on mount if route has a path
  useEffect(() => {
    if (routeFilePath && root?.type === 'directory') {
      loadFile(routeFilePath)
    }
  }, [root]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFile = useCallback(async (filePath: string) => {
    setSelectedPath(filePath)
    navigate(`/specs/${filePath}`, { replace: true })
    try {
      const data = await fetchSpecs(filePath)
      if (data.type === 'file') setFileContent(data.content)
    } catch {
      setFileContent('Erro ao carregar arquivo')
    }
  }, [navigate])

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Carregando specs...</div>
  }

  if (!root) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Specs não encontrados</div>
  }

  // Single file
  if (root.type === 'file') {
    return <FileViewer content={root.content} />
  }

  // Directory
  return (
    <div className="flex h-full">
      {/* Tree */}
      <div className="w-[240px] shrink-0 border-r border-border overflow-auto p-2 bg-card">
        <FileTree items={root.items} onSelect={loadFile} selectedPath={selectedPath} />
      </div>

      {/* Viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        {fileContent != null ? (
          <>
            <div className="px-4 py-2 border-b border-border bg-card text-xs text-muted-foreground font-mono">
              {selectedPath}
            </div>
            <FileViewer content={fileContent} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Selecione um arquivo
          </div>
        )}
      </div>
    </div>
  )
}
