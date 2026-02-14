import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';
import { toast } from 'sonner';

export function ProjectCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [specs, setSpecs] = useState('');
  const [harness, setHarness] = useState('claude-code');
  const [scaffold, setScaffold] = useState('null');
  const [model, setModel] = useState('');
  const [maxTurns, setMaxTurns] = useState(50);
  const [maxIterations, setMaxIterations] = useState(0);
  const [maxFeatures, setMaxFeatures] = useState(0);
  const [maxRetries, setMaxRetries] = useState(5);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validação slug kebab-case
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      setError('Slug deve ser kebab-case (ex: meu-projeto)');
      return;
    }
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/projects', {
        slug,
        name,
        workspace,
        specs,
        harness,
        scaffold: scaffold === 'null' ? null : scaffold,
        model: model || undefined,
        max_turns: maxTurns,
        max_iterations: maxIterations || undefined,
        max_features: maxFeatures || undefined,
        max_retries: maxRetries,
      });
      toast.success('Projeto criado com sucesso');
      navigate(`/projects/${slug}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Slug já existe');
      } else {
        setError('Erro ao criar projeto');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Criar Projeto</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="meu-projeto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Meu Projeto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace (path absoluto)</Label>
              <Input id="workspace" value={workspace} onChange={(e) => setWorkspace(e.target.value)} placeholder="D:\projetos\meu-projeto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specs">Specs (path)</Label>
              <Input id="specs" value={specs} onChange={(e) => setSpecs(e.target.value)} placeholder="./milestones/01/03-prps" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harness</Label>
                <Select value={harness} onValueChange={setHarness}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-code">claude-code</SelectItem>
                    <SelectItem value="opencode">opencode</SelectItem>
                    <SelectItem value="codex">codex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scaffold</Label>
                <Select value={scaffold} onValueChange={setScaffold}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Nenhum</SelectItem>
                    <SelectItem value="postgres-n8n">postgres-n8n</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▼' : '▶'} Parâmetros Avançados
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 border rounded-md p-4">
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="claude-sonnet-4-5-20250929" />
                </div>
                <div className="space-y-2">
                  <Label>Max Turns</Label>
                  <Input type="number" value={maxTurns} onChange={(e) => setMaxTurns(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Max Iterations</Label>
                  <Input type="number" value={maxIterations} onChange={(e) => setMaxIterations(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Max Features</Label>
                  <Input type="number" value={maxFeatures} onChange={(e) => setMaxFeatures(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Max Retries</Label>
                  <Input type="number" value={maxRetries} onChange={(e) => setMaxRetries(Number(e.target.value))} />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
