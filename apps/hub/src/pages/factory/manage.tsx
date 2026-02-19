/**
 * Factory ManagePanel — wizard de 3 fases para setup de run.
 * Portado de sneak-peek-hub/src/panels/ManagePanel.tsx
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '@/hooks/use-workspace';
import {
  fetchRunStatus, fetchConfig, fetchHarnessSessions,
  switchHarnessSession, createStream, initializeStream,
  startLoop, stopLoop,
} from '@/lib/factory-api';
import { StreamLog } from '@/components/factory/stream-log';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StreamEvent, HarnessSessionInfo, RunPhase } from '@/lib/factory-types';
import { Play, Square, ChevronDown } from 'lucide-react';

interface RunStatus {
  exists: boolean;
  slug: string;
  workspace?: string;
  workspace_exists?: boolean;
  has_harness?: boolean;
  phase?: RunPhase;
  features_count?: number;
  features_passing?: number;
}

export function FactoryManagePage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const { state, alive, pid, refreshState } = useWorkspace();
  const slug = routeSlug ?? null;

  const [status, setStatus] = useState<RunStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Session selector
  const [sessions, setSessions] = useState<HarnessSessionInfo[]>([]);
  const [activeSession, setActiveSession] = useState<string>('');
  const [switchingSession, setSwitchingSession] = useState(false);

  // Create section
  const [createLogs, setCreateLogs] = useState<StreamEvent[]>([]);
  const [creating, setCreating] = useState(false);
  const closeCreateRef = useRef<(() => void) | null>(null);

  // Initialize section
  const [initLogs, setInitLogs] = useState<StreamEvent[]>([]);
  const [initializing, setInitializing] = useState(false);
  const [confirmInit, setConfirmInit] = useState(false);
  const closeInitRef = useRef<(() => void) | null>(null);

  // Execute section
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [stopError, setStopError] = useState<string | null>(null);

  // Loop overrides
  const [maxTurns, setMaxTurns] = useState(0);
  const [maxTurnsUnlimited, setMaxTurnsUnlimited] = useState(true);
  const [maxIterations, setMaxIterations] = useState(0);
  const [maxIterationsUnlimited, setMaxIterationsUnlimited] = useState(true);
  const [maxFeatures, setMaxFeatures] = useState(0);
  const [maxFeaturesUnlimited, setMaxFeaturesUnlimited] = useState(true);

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const loadStatus = useCallback(async () => {
    if (!slug) return;
    try {
      const s = await fetchRunStatus(slug);
      setStatus(s);
    } catch { /* silent */ }
    setLoadingStatus(false);
  }, [slug]);

  const loadSessions = useCallback(async () => {
    if (!slug) return;
    try {
      const data = await fetchHarnessSessions(slug);
      setSessions(data.sessions);
      setActiveSession(data.active);
    } catch { /* silent */ }
  }, [slug]);

  const loadConfig = useCallback(async () => {
    if (!slug) return;
    try {
      const { config } = await fetchConfig(slug);
      const agent = config?.agent;
      if (agent) {
        const turns = agent.max_turns ?? 0;
        setMaxTurns(turns);
        setMaxTurnsUnlimited(!turns);
        const iters = agent.max_iterations ?? 0;
        setMaxIterations(iters);
        setMaxIterationsUnlimited(!iters);
      }
    } catch { /* silent */ }
  }, [slug]);

  useEffect(() => { loadStatus(); loadSessions(); loadConfig(); }, [loadStatus, loadSessions, loadConfig]);

  // Poll while creating/initializing
  useEffect(() => {
    if (!creating && !initializing) return;
    const id = setInterval(() => { loadStatus(); loadSessions(); }, 3000);
    return () => clearInterval(id);
  }, [creating, initializing, loadStatus, loadSessions]);

  // Poll sessions periodically
  useEffect(() => {
    const id = setInterval(loadSessions, 10_000);
    return () => clearInterval(id);
  }, [loadSessions]);

  const handleSwitchSession = useCallback(async (session: string) => {
    if (!slug || session === activeSession) return;
    setSwitchingSession(true);
    try {
      await switchHarnessSession(slug, session);
      setActiveSession(session);
      loadStatus();
      refreshState();
    } catch { /* silent */ }
    setSwitchingSession(false);
  }, [slug, activeSession, loadStatus, refreshState]);

  const handleCreate = useCallback(() => {
    if (!slug) return;
    setCreating(true);
    setCreateLogs([]);
    const close = createStream(slug, (ev) => {
      setCreateLogs(prev => [...prev, ev]);
      if (ev.type === 'done' || ev.type === 'error') {
        setCreating(false);
        loadStatus();
        loadSessions();
      }
    });
    closeCreateRef.current = close;
  }, [slug, loadStatus, loadSessions]);

  const handleInitialize = useCallback(() => {
    if (!slug) return;
    setInitializing(true);
    setInitLogs([]);
    const close = initializeStream(slug, (ev) => {
      setInitLogs(prev => [...prev, ev]);
      if (ev.type === 'done' || ev.type === 'error') {
        setInitializing(false);
        loadStatus();
        loadSessions();
      }
    });
    closeInitRef.current = close;
  }, [slug, loadStatus, loadSessions]);

  const handleStart = useCallback(async () => {
    if (!slug) return;
    setStarting(true);
    setStartError(null);
    try {
      await startLoop(slug, {
        max_turns: maxTurnsUnlimited ? 0 : maxTurns,
        max_iterations: maxIterationsUnlimited ? 0 : maxIterations,
        max_features: maxFeaturesUnlimited ? 0 : maxFeatures,
      });
      setTimeout(refreshState, 500);
      setTimeout(refreshState, 2000);
    } catch (e: any) {
      setStartError(e.message || 'Erro ao iniciar');
    }
    setStarting(false);
  }, [slug, refreshState, maxTurns, maxTurnsUnlimited, maxIterations, maxIterationsUnlimited, maxFeatures, maxFeaturesUnlimited]);

  const handleStop = useCallback(async () => {
    if (!slug) return;
    setStopping(true);
    setStopError(null);
    try {
      await stopLoop(slug);
      setTimeout(refreshState, 500);
      setTimeout(refreshState, 2000);
    } catch (e: any) {
      setStopError(e.message || 'Erro ao parar');
    }
    setStopping(false);
  }, [slug, refreshState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeCreateRef.current?.();
      closeInitRef.current?.();
    };
  }, []);

  const phase = status?.phase || 'pending';
  const phaseIdx = ['pending', 'created', 'initialized', 'executed'].indexOf(phase);

  useEffect(() => {
    setOpenSections({
      1: phaseIdx < 1 || creating,
      2: (phaseIdx >= 1 && phaseIdx < 2) || initializing,
      3: phaseIdx >= 2,
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!slug) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Nenhum slug selecionado
      </div>
    );
  }

  if (loadingStatus) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Carregando...
      </div>
    );
  }

  const phaseLabels = ['Pendente', 'Criado', 'Inicializado', 'Executado'];
  const toggleSection = (n: number) => setOpenSections(prev => ({ ...prev, [n]: !prev[n] }));

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">
          Gerenciar: <span className="font-mono text-primary">{slug}</span>
        </h1>

        {/* Phase stepper */}
        <div className="flex items-center gap-1.5">
          {phaseLabels.map((label, i) => {
            const isDone = i <= phaseIdx;
            const isCurrent = i === phaseIdx;
            return (
              <div key={label} className="flex items-center gap-1.5">
                {i > 0 && <div className={`w-6 h-px ${isDone ? 'bg-primary' : 'bg-border'}`} />}
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  isCurrent ? 'bg-primary text-primary-foreground' :
                  isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Session Selector */}
        {sessions.length > 0 && (
          <section className="rounded-lg border p-4 space-y-3">
            <h2 className="text-sm font-semibold">Session ativa</h2>
            <div className="flex items-center gap-2">
              <select
                value={activeSession}
                onChange={(e) => handleSwitchSession(e.target.value)}
                disabled={switchingSession}
                className="px-3 py-1.5 rounded-md border bg-card text-sm font-mono disabled:opacity-50"
              >
                {sessions.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.featuresPassingCount}/{s.featuresCount})
                  </option>
                ))}
              </select>
              {switchingSession && <span className="text-xs text-muted-foreground">Trocando...</span>}
            </div>
          </section>
        )}

        {/* 1. Criar harness */}
        <CollapsibleSection
          number={1}
          title="Criar"
          done={phaseIdx >= 1}
          open={openSections[1] ?? false}
          onToggle={() => toggleSection(1)}
          highlight={phaseIdx < 1}
        >
          <p className="text-xs text-muted-foreground">
            Cria o .harness/ no workspace do milestone com scripts e config.
          </p>
          <Button onClick={handleCreate} disabled={creating} size="sm">
            {creating ? 'Criando...' : phaseIdx >= 1 ? 'Recriar' : 'Criar'}
          </Button>
          <StreamLog events={createLogs} />
        </CollapsibleSection>

        {/* 2. Inicializar */}
        <CollapsibleSection
          number={2}
          title="Inicializar"
          done={phaseIdx >= 2}
          doneLabel={status?.features_count != null ? `${status.features_count} features` : undefined}
          open={openSections[2] ?? false}
          onToggle={() => toggleSection(2)}
          highlight={phaseIdx === 1}
          disabled={phaseIdx < 1}
        >
          <p className="text-xs text-muted-foreground">
            Executa o inicializador para gerar features.json a partir dos PRPs.
          </p>
          <Button
            onClick={phaseIdx >= 2 ? () => setConfirmInit(true) : handleInitialize}
            disabled={initializing || phaseIdx < 1}
            size="sm"
            variant={phaseIdx >= 2 ? 'destructive' : 'default'}
          >
            {initializing ? 'Inicializando...' : phaseIdx >= 2 ? 'Reinicializar' : 'Inicializar'}
          </Button>
          <StreamLog events={initLogs} />
        </CollapsibleSection>

        {/* Confirm reinitialize */}
        {confirmInit && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-card border rounded-lg p-6 max-w-sm space-y-4">
              <h3 className="font-semibold">Reinicializar</h3>
              <p className="text-sm text-muted-foreground">
                Isso regenera o features.json e reseta o progresso da session ativa. Continuar?
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setConfirmInit(false)}>Cancelar</Button>
                <Button variant="destructive" size="sm" onClick={() => { setConfirmInit(false); handleInitialize(); }}>
                  Reinicializar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Executar */}
        <CollapsibleSection
          number={3}
          title="Executar"
          open={openSections[3] ?? false}
          onToggle={() => toggleSection(3)}
          disabled={phaseIdx < 2}
          extra={
            <div className="flex items-center gap-2">
              {alive && pid && <span className="text-xs font-mono text-muted-foreground">PID {pid}</span>}
              {alive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
              <span className={cn('text-xs font-medium', alive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>
                {alive ? (state === 'stopping' ? 'Parando...' : 'Rodando') : phaseIdx >= 3 ? 'Parado' : ''}
              </span>
            </div>
          }
        >
          <p className="text-xs text-muted-foreground">
            Inicia ou para o loop autônomo.
            {alive ? ' O processo roda em background — feche a aba sem medo.' : ''}
          </p>

          {status?.features_count != null && status.features_count > 0 && (
            <div className="text-xs text-muted-foreground">
              Progresso: {status.features_passing ?? 0}/{status.features_count} features
            </div>
          )}

          {/* Limites editáveis — só quando não rodando */}
          {!alive && phaseIdx >= 2 && (
            <div className="grid grid-cols-3 gap-3 p-3 rounded-md border bg-card">
              <LimitInput label="Turns/sessão" value={maxTurns} onChange={setMaxTurns} unlimited={maxTurnsUnlimited} onToggle={setMaxTurnsUnlimited} placeholder="200" />
              <LimitInput label="Iterações" value={maxIterations} onChange={setMaxIterations} unlimited={maxIterationsUnlimited} onToggle={setMaxIterationsUnlimited} placeholder="50" />
              <LimitInput label="Max features" value={maxFeatures} onChange={setMaxFeatures} unlimited={maxFeaturesUnlimited} onToggle={setMaxFeaturesUnlimited} placeholder="10" />
            </div>
          )}

          {/* Resumo dos limites quando rodando */}
          {alive && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>Turns: {maxTurnsUnlimited ? '∞' : maxTurns}</span>
              <span>Iterações: {maxIterationsUnlimited ? '∞' : maxIterations}</span>
              <span>Features: {maxFeaturesUnlimited ? '∞' : maxFeatures}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleStart} disabled={starting || alive || phaseIdx < 2} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Play className="h-3.5 w-3.5 mr-1" />
              {starting ? 'Iniciando...' : 'Iniciar'}
            </Button>
            <Button onClick={handleStop} disabled={stopping || !alive} size="sm" variant="destructive">
              <Square className="h-3.5 w-3.5 mr-1" />
              {stopping ? 'Parando...' : 'Parar'}
            </Button>
          </div>

          {startError && <div className="text-xs text-red-500 bg-red-500/10 rounded px-2 py-1.5">{startError}</div>}
          {stopError && <div className="text-xs text-red-500 bg-red-500/10 rounded px-2 py-1.5">{stopError}</div>}
        </CollapsibleSection>
      </div>
    </div>
  );
}

// --- Helpers ---

function CollapsibleSection({
  number, title, done, doneLabel, open, onToggle, highlight, disabled, extra, children,
}: {
  number: number;
  title: string;
  done?: boolean;
  doneLabel?: string;
  open: boolean;
  onToggle: () => void;
  highlight?: boolean;
  disabled?: boolean;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(
      'rounded-lg border',
      highlight ? 'border-primary/50' : 'border-border',
      disabled && !open && 'opacity-50',
    )}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 cursor-pointer select-none"
      >
        <h2 className="text-sm font-semibold">{number}. {title}</h2>
        <div className="flex items-center gap-2">
          {extra}
          {done && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {doneLabel ?? 'Concluído'}
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </section>
  );
}

function LimitInput({ label, value, onChange, unlimited, onToggle, placeholder }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unlimited: boolean;
  onToggle: (v: boolean) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={() => onToggle(!unlimited)}
          className={cn(
            'text-[10px] px-1.5 py-px rounded-full border transition-colors',
            unlimited
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'text-muted-foreground border-border hover:bg-muted',
          )}
        >
          {unlimited ? '∞' : '#'}
        </button>
      </div>
      {unlimited ? (
        <div className="text-xs text-primary font-medium">sem limite</div>
      ) : (
        <input
          type="number"
          min={1}
          value={value || ''}
          onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
          placeholder={placeholder}
          className="w-full px-2 py-1 rounded border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </div>
  );
}
