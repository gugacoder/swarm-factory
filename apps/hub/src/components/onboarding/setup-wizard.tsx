import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');

  async function handleTest() {
    setStatus('testing');
    try {
      await api.post('/api/settings/test-openrouter', { apiKey });
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }

  async function handleFinish() {
    // Salvar API key nas settings
    await api.patch('/api/settings', { openrouter_api_key: apiKey });
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>Configuração Inicial</CardTitle>
          <p className="text-sm text-muted-foreground">Configure a API key do OpenRouter para ativar a Kai.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>OpenRouter API Key</Label>
            <Input
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setStatus('idle'); }}
              placeholder="sk-or-..."
              type="password"
            />
          </div>

          <Button variant="outline" onClick={handleTest} disabled={!apiKey || status === 'testing'} className="w-full">
            {status === 'testing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === 'testing' ? 'Testando...' : 'Testar Conexão'}
          </Button>

          {status === 'ok' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Conexão OK</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Falha na conexão — verifique a key</span>
            </div>
          )}

          <Button onClick={handleFinish} disabled={status !== 'ok'} className="w-full">
            Concluir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
