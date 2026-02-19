/**
 * Factory Specs Browser — file tree + content viewer.
 * Portado de sneak-peek-hub/src/panels/PromptPanel.tsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWorkspace } from '@/hooks/use-workspace';
import { fetchSpecs } from '@/lib/factory-api';
import { cn } from '@/lib/utils';
import { FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import type { SpecsResponse, SpecsItem } from '@/lib/factory-types';

export function FactorySpecsPage() {
  const { slug } = useParams<{ slug: string; '*': string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: wsSlug } = useWorkspace();
  const currentSlug = wsSlug ?? slug ?? null;

  // Extract sub-path from URL: /factory/specs/:slug/some/path
  const routeFilePath = (() => {
    const match = location.pathname.match(/^\/factory\/specs\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  })();

  const [root, setRoot] = useState<SpecsResponse | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(routeFilePath);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSlug) return;
    fetchSpecs(currentSlug)
      .then(data => { setRoot(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentSlug]);

  // Load file from route on mount
  useEffect(() => {
    if (routeFilePath && root?.type === 'directory') {
      loadFile(routeFilePath);
    }
  }, [root]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFile = useCallback(async (filePath: string) => {
    if (!currentSlug) return;
    setSelectedPath(filePath);
    navigate(`/factory/specs/${currentSlug}/${filePath}`, { replace: true });
    try {
      const data = await fetchSpecs(currentSlug, filePath);
      if (data.type === 'file') setFileContent(data.content);
    } catch {
      setFileContent('Erro ao carregar arquivo');
    }
  }, [navigate, currentSlug]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Carregando specs...</div>;
  }

  if (!root) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Specs não encontrados</div>;
  }

  if (root.type === 'file') {
    return (
      <pre className="flex-1 overflow-auto p-4 text-xs font-mono whitespace-pre-wrap break-words bg-card">
        {root.content}
      </pre>
    );
  }

  return (
    <div className="flex h-full">
      {/* Tree sidebar */}
      <div className="w-[240px] shrink-0 border-r overflow-auto p-2 bg-card">
        <FileTree
          items={root.items}
          onSelect={loadFile}
          selectedPath={selectedPath}
          slug={currentSlug}
        />
      </div>

      {/* Content viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        {fileContent != null ? (
          <>
            <div className="px-4 py-2 border-b bg-card text-xs text-muted-foreground font-mono">
              {selectedPath}
            </div>
            <pre className="flex-1 overflow-auto p-4 text-xs font-mono whitespace-pre-wrap break-words bg-card">
              {fileContent}
            </pre>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Selecione um arquivo
          </div>
        )}
      </div>
    </div>
  );
}

function FileTree({
  items, onSelect, selectedPath, slug,
}: {
  items: SpecsItem[];
  onSelect: (path: string) => void;
  selectedPath: string | null;
  slug: string | null;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleDir = (dirPath: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(dirPath) ? next.delete(dirPath) : next.add(dirPath);
      return next;
    });
  };

  return (
    <div className="space-y-0.5 text-xs">
      {items.map(item => {
        if (item.type === 'directory') {
          const isCollapsed = collapsed.has(item.path);
          return (
            <div key={item.path}>
              <button
                onClick={() => toggleDir(item.path)}
                className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-muted/50 rounded transition-colors text-left"
              >
                {isCollapsed ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-medium">{item.name}</span>
              </button>
              {!isCollapsed && (
                <DirectoryContents parentPath={item.path} onSelect={onSelect} selectedPath={selectedPath} slug={slug} />
              )}
            </div>
          );
        }
        return (
          <button
            key={item.path}
            onClick={() => onSelect(item.path)}
            className={cn(
              'flex items-center gap-1.5 w-full px-2 py-1 rounded transition-colors text-left',
              selectedPath === item.path ? 'bg-muted' : 'hover:bg-muted/50',
            )}
          >
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function DirectoryContents({
  parentPath, onSelect, selectedPath, slug,
}: {
  parentPath: string;
  onSelect: (path: string) => void;
  selectedPath: string | null;
  slug: string | null;
}) {
  const [items, setItems] = useState<SpecsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchSpecs(slug, parentPath).then(data => {
      if (cancelled) return;
      if (data.type === 'directory') setItems(data.items);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [parentPath, slug]);

  if (loading) return <div className="pl-6 text-muted-foreground text-[10px]">...</div>;
  return (
    <div className="pl-4">
      <FileTree items={items} onSelect={onSelect} selectedPath={selectedPath} slug={slug} />
    </div>
  );
}
