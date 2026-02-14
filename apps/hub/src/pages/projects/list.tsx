import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProjects } from '@/hooks/use-projects';
import { Plus } from 'lucide-react';

const STATE_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  running: { label: 'Rodando', variant: 'default' },
  idle: { label: 'Idle', variant: 'secondary' },
  initialized: { label: 'Inicializado', variant: 'outline' },
  not_initialized: { label: 'Não Inic.', variant: 'destructive' },
};

export function ProjectListPage() {
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [search, setSearch] = useState('');
  const [harnessFilter, setHarnessFilter] = useState('all');

  const harnesses = [...new Set(projects.map((p) => p.harness))];

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchHarness = harnessFilter === 'all' || p.harness === harnessFilter;
    return matchSearch && matchHarness;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <Button onClick={() => navigate('/projects/create')}>
          <Plus className="mr-2 h-4 w-4" /> Criar
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Buscar por nome ou slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={harnessFilter} onValueChange={setHarnessFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Harness" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {harnesses.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Harness</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Progresso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const badge = STATE_BADGES[p.state || 'not_initialized'] || STATE_BADGES.not_initialized;
                return (
                  <TableRow
                    key={p.slug}
                    className="cursor-pointer"
                    onClick={() => navigate(`/projects/${p.slug}`)}
                  >
                    <TableCell className="font-mono text-sm">{p.slug}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.harness}</TableCell>
                    <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                    <TableCell className="text-right">{p.progress ?? 0}%</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum projeto encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
