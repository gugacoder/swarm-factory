import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProjects } from '@/hooks/use-projects';
import { FolderKanban, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const STATE_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  running: { label: 'Rodando', variant: 'default' },
  idle: { label: 'Idle', variant: 'secondary' },
  initialized: { label: 'Inicializado', variant: 'outline' },
  not_initialized: { label: 'Não Inicializado', variant: 'destructive' },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { projects, loading } = useProjects();

  // KPI
  const totalProjects = projects.length;
  const totalFeatures = projects.reduce(
    (sum, p) => sum + Object.values(p.features || {}).reduce((a, b) => a + b, 0),
    0,
  );
  const passingFeatures = projects.reduce((sum, p) => sum + (p.features?.passing || 0), 0);
  const successRate = totalFeatures > 0 ? Math.round((passingFeatures / totalFeatures) * 100) : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-8 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderKanban className="h-4 w-4" /> Projetos
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalProjects}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Features
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalFeatures}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Passing
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{passingFeatures}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Taxa Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{successRate}%</p></CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Nenhum projeto</h2>
            <p className="text-muted-foreground mb-4">Crie seu primeiro projeto para começar.</p>
            <Button onClick={() => navigate('/projects/create')}>Criar Projeto</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const badge = STATE_BADGES[p.state || 'not_initialized'] || STATE_BADGES.not_initialized;
            return (
              <Card
                key={p.slug}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/projects/${p.slug}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.slug} · {p.harness}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{p.progress ?? 0}%</span>
                    </div>
                    <Progress value={p.progress ?? 0} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
