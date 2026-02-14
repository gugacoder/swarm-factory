import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { useSSE } from '@/hooks/use-sse';
import { toast } from 'sonner';
import { Play, Square, Zap, Trash2, Settings, RotateCcw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  passing: 'bg-green-500',
  failing: 'bg-red-500',
  pending: 'bg-gray-400',
  blocked: 'bg-yellow-500',
  skipped: 'bg-orange-400',
  in_progress: 'bg-blue-500',
};

const STATE_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  running: { label: 'Rodando', variant: 'default' },
  idle: { label: 'Idle', variant: 'secondary' },
  initialized: { label: 'Inicializado', variant: 'outline' },
  not_initialized: { label: 'Não Inicializado', variant: 'destructive' },
};

interface ProjectStatus {
  slug: string;
  name: string;
  workspace: string;
  harness: string;
  state: string;
  loop: { pid: number | null; iteration: number; feature_id: string };
  features: Record<string, number>;
  progress: number;
}

interface Feature {
  id: string;
  title: string;
  status: string;
  priority: number;
  dependencies: string[];
  retries?: number;
}

interface Session {
  id: string;
  feature_id: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  has_output: boolean;
}

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectStatus | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [progressText, setProgressText] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Dialogs
  const [loopMaxTurns, setLoopMaxTurns] = useState(50);
  const [loopModel, setLoopModel] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const fetchAll = useCallback(async () => {
    if (!slug) return;
    try {
      const [status, feats, sess, prog] = await Promise.all([
        api.get<ProjectStatus>(`/api/projects/${slug}`),
        api.get<Feature[]>(`/api/projects/${slug}/features`).catch(() => []),
        api.get<Session[]>(`/api/projects/${slug}/sessions`).catch(() => []),
        api.get<string>(`/api/projects/${slug}/progress`).catch(() => ''),
      ]);
      setProject(status);
      setFeatures(feats);
      setSessions(sess);
      setProgressText(typeof prog === 'string' ? prog : '');
    } catch {
      toast.error('Erro ao carregar projeto');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useSSE('/api/events', useCallback((event) => {
    if (['feature:status', 'loop:start', 'loop:stop'].includes(event.type)) {
      fetchAll();
    }
  }, [fetchAll]));

  // Ações
  async function handleInit() {
    await api.post(`/api/projects/${slug}/init`);
    toast.success('Workspace inicializado');
    fetchAll();
  }

  async function handleStartLoop() {
    await api.post(`/api/projects/${slug}/loop/start`, {
      maxTurns: loopMaxTurns,
      model: loopModel || undefined,
    });
    toast.success('Loop iniciado');
    fetchAll();
  }

  async function handleStop(force = false) {
    await api.post(`/api/projects/${slug}/loop/stop`, { force });
    toast.success(force ? 'Loop forçado a parar' : 'Parada graceful solicitada');
    fetchAll();
  }

  async function handleDispatch() {
    await api.post(`/api/projects/${slug}/loop/start`, { maxTurns: loopMaxTurns });
    toast.success('Sessão despachada');
    fetchAll();
  }

  async function handleDelete() {
    await api.del(`/api/projects/${slug}`);
    toast.success('Projeto excluído');
    navigate('/projects');
  }

  async function handleRotate(featureId: string) {
    await api.post(`/api/projects/${slug}/features/${featureId}/rotate`);
    toast.success(`Contexto rotacionado: ${featureId}`);
    fetchAll();
  }

  if (loading || !project) {
    return <div className="p-6"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  const badge = STATE_BADGES[project.state] || STATE_BADGES.not_initialized;
  const statusCounts = project.features || {};
  const filteredFeatures = statusFilter
    ? features.filter((f) => f.status === statusFilter)
    : features;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.slug} · {project.harness}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={badge.variant}>{badge.label}</Badge>

          {project.state === 'not_initialized' && (
            <Button size="sm" onClick={handleInit}><Zap className="mr-1 h-4 w-4" /> Inicializar</Button>
          )}
          {project.state === 'idle' && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm"><Play className="mr-1 h-4 w-4" /> Iniciar Loop</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Iniciar Loop</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Max Turns</Label>
                      <Input type="number" value={loopMaxTurns} onChange={(e) => setLoopMaxTurns(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo (opcional)</Label>
                      <Input value={loopModel} onChange={(e) => setLoopModel(e.target.value)} placeholder="claude-sonnet-4-5-20250929" />
                    </div>
                    <Button onClick={handleStartLoop} className="w-full">Iniciar</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="outline" onClick={handleDispatch}>
                <Zap className="mr-1 h-4 w-4" /> Despachar Sessão
              </Button>
            </>
          )}
          {project.state === 'running' && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleStop(false)}>
                <Square className="mr-1 h-4 w-4" /> Parar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleStop(true)}>
                Forçar Parada
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Info</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Slug:</span> {project.slug}</p>
                <p><span className="text-muted-foreground">Workspace:</span> {project.workspace}</p>
                <p><span className="text-muted-foreground">Harness:</span> {project.harness}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Loop</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">PID:</span> {project.loop?.pid || 'N/A'}</p>
                <p><span className="text-muted-foreground">Iteração:</span> {project.loop?.iteration || 0}</p>
                <p><span className="text-muted-foreground">Feature:</span> {project.loop?.feature_id || 'N/A'}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Progresso</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Geral</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-1.5 text-xs">
                    <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status] || 'bg-gray-300'}`} />
                    <span>{status}: {count as number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm"><Trash2 className="mr-1 h-4 w-4" /> Excluir</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Digite <strong>{slug}</strong> para confirmar. Isso remove apenas a config, não o workspace.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={slug} />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction disabled={deleteConfirm !== slug} onClick={handleDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TabsContent>

        {/* Tab: Features (F-027) */}
        <TabsContent value="features" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              Todos ({features.length})
            </Button>
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              >
                <div className={`h-2 w-2 rounded-full mr-1.5 ${STATUS_COLORS[status] || 'bg-gray-300'}`} />
                {status} ({count as number})
              </Button>
            ))}
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Deps</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-sm">{f.id}</TableCell>
                    <TableCell>{f.title}</TableCell>
                    <TableCell>
                      <Badge variant={f.status === 'passing' ? 'default' : f.status === 'failing' ? 'destructive' : 'secondary'}>
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{f.priority}</TableCell>
                    <TableCell className="text-xs">{f.dependencies?.join(', ') || '-'}</TableCell>
                    <TableCell>
                      {f.status === 'failing' && (
                        <Button variant="ghost" size="sm" onClick={() => handleRotate(f.id)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab: Sessões (F-028) */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma sessão registrada.</p>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Output</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.feature_id}</TableCell>
                      <TableCell className="text-sm">
                        {s.started_at ? new Date(s.started_at).toLocaleString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.duration_ms ? `${Math.round(s.duration_ms / 1000)}s` : '-'}
                      </TableCell>
                      <TableCell>
                        {s.has_output ? <Badge variant="outline">Disponível</Badge> : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab: Logs */}
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">agent-progress.txt</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchAll}>Atualizar</Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <pre className="text-xs font-mono whitespace-pre-wrap">{progressText || 'Sem logs.'}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
