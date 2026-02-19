/**
 * Factory Dashboard — runs agrupados por workspace com play/stop inline.
 * Portado de sneak-peek-hub/src/panels/DashboardPanel.tsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoopStateBadge } from '@/components/factory/loop-state-badge';
import { fetchWorkspaces, startLoop, stopLoop } from '@/lib/factory-api';
import type { WorkspaceInfo, LoopState } from '@/lib/factory-types';
import { toast } from 'sonner';
import {
  Play, Square, FolderKanban, CheckCircle, AlertCircle, TrendingUp,
  List, Terminal, Settings2, ChevronDown, ChevronRight,
} from 'lucide-react';

function isActive(state: LoopState | string) {
  return state === 'running' || state === 'between' || state === 'stopping';
}

export function FactoryDashboardPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const data = await fetchWorkspaces();
      setWorkspaces(data.workspaces);
    } catch { /* ok */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  // Agrupar por workspace
  const groups = new Map<string, WorkspaceInfo[]>();
  for (const w of workspaces) {
    const key = w.workspace;
    const list = groups.get(key) || [];
    list.push(w);
    groups.set(key, list);
  }

  // KPI
  const totalRuns = workspaces.length;
  const totalFeatures = workspaces.reduce((s, w) => s + w.features.total, 0);
  const totalPassing = workspaces.reduce((s, w) => s + w.features.passing, 0);
  const successRate = totalFeatures > 0 ? Math.round((totalPassing / totalFeatures) * 100) : 0;
  const runningCount = workspaces.filter(w => isActive(w.loop_state)).length;

  async function handleStart(slug: string) {
    try {
      await startLoop(slug);
      toast.success(`Loop iniciado: ${slug}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleStop(slug: string) {
    try {
      await stopLoop(slug);
      toast.success(`Stop solicitado: ${slug}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function toggleCollapse(key: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Factory</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-8 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Factory</h1>
        <Button size="sm" onClick={() => navigate('/factory/runs/new')}>Novo Run</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><FolderKanban className="h-4 w-4" /> Runs</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalRuns}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Features</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalFeatures}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Passing</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalPassing}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Sucesso</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{successRate}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Play className="h-4 w-4" /> Rodando</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{runningCount}</p></CardContent>
        </Card>
      </div>

      {/* Workspace Groups */}
      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Nenhum run com .harness/</h2>
            <p className="text-muted-foreground mb-4">Configure um run para começar a monitorar.</p>
            <Button onClick={() => navigate('/factory/runs/new')}>Criar Run</Button>
          </CardContent>
        </Card>
      ) : (
        Array.from(groups.entries()).map(([wsPath, runs]) => (
          <Card key={wsPath}>
            <CardHeader className="pb-2">
              <button
                className="flex items-center gap-2 w-full text-left"
                onClick={() => toggleCollapse(wsPath)}
              >
                {collapsed.has(wsPath) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="text-xs font-mono text-muted-foreground truncate">{wsPath}</span>
                <span className="text-xs text-muted-foreground">({runs.length})</span>
              </button>
            </CardHeader>
            {!collapsed.has(wsPath) && (
              <CardContent className="space-y-2">
                {runs.map(run => {
                  const pct = run.features.total > 0 ? Math.round((run.features.passing / run.features.total) * 100) : 0;
                  return (
                    <div key={run.slug} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50">
                      <LoopStateBadge state={run.loop_state} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{run.name}</span>
                          <span className="text-xs text-muted-foreground">{run.slug}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {run.features.passing}/{run.features.total}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive(run.loop_state) ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStop(run.slug)}>
                            <Square className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStart(run.slug)}>
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/factory/features/${run.slug}`)}>
                          <List className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/factory/console/${run.slug}`)}>
                          <Terminal className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/factory/runs/${run.slug}/manage`)}>
                          <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
