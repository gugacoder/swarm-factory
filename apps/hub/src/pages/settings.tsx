import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

interface Settings {
  openrouter_api_key?: string;
  default_model?: string;
  runs_dir?: string;
}

export function SettingsPage() {
  const { dark, toggle } = useDarkMode();
  const [settings, setSettings] = useState<Settings>({});
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [defaultModel, setDefaultModel] = useState('google/gemini-2.0-flash-001');
  const [runsDir, setRunsDir] = useState('./runs');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Settings>('/api/settings').then((data) => {
      setSettings(data);
      if (data.openrouter_api_key) setApiKey(data.openrouter_api_key);
      if (data.default_model) setDefaultModel(data.default_model);
      if (data.runs_dir) setRunsDir(data.runs_dir);
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch('/api/settings', {
        openrouter_api_key: apiKey,
        default_model: defaultModel,
        runs_dir: runsDir,
      });
      toast.success('Configurações salvas');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTestStatus('testing');
    try {
      await api.post('/api/settings/test-openrouter', { apiKey });
      setTestStatus('ok');
    } catch {
      setTestStatus('error');
    }
  }

  const maskedKey = apiKey
    ? '•'.repeat(Math.max(0, apiKey.length - 4)) + apiKey.slice(-4)
    : '';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {/* API */}
      <Card>
        <CardHeader><CardTitle className="text-base">API OpenRouter</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={showKey ? apiKey : maskedKey}
                  onChange={(e) => { setApiKey(e.target.value); setShowKey(true); }}
                  onFocus={() => setShowKey(true)}
                  placeholder="sk-or-..."
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button variant="outline" onClick={handleTestConnection} disabled={testStatus === 'testing'}>
                {testStatus === 'testing' ? 'Testando...' : 'Testar'}
              </Button>
            </div>
            {testStatus === 'ok' && <Badge variant="default" className="bg-green-600">Conexão OK</Badge>}
            {testStatus === 'error' && <Badge variant="destructive">Erro de conexão</Badge>}
          </div>
          <div className="space-y-2">
            <Label>Modelo padrão</Label>
            <Select value={defaultModel} onValueChange={setDefaultModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</SelectItem>
                <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Diretório de Runs</Label>
            <Input value={runsDir} onChange={(e) => setRunsDir(e.target.value)} placeholder="./runs" />
          </div>
        </CardContent>
      </Card>

      {/* Aparência */}
      <Card>
        <CardHeader><CardTitle className="text-base">Aparência</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Modo escuro</Label>
            <Switch checked={dark} onCheckedChange={toggle} />
          </div>
        </CardContent>
      </Card>

      {/* Onboarding */}
      <Card>
        <CardHeader><CardTitle className="text-base">Onboarding</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => {
            localStorage.removeItem('onboarding-completed');
            toast.success('Tour será exibido no próximo acesso');
          }}>
            Rever Tour
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
}
