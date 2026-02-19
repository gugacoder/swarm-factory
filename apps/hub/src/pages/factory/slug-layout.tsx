/**
 * SlugLayout — wrapper com WorkspaceContext e tab bar para rotas /factory/:slug/*.
 * Provê polling de config/state/features para todas as sub-páginas.
 */

import { useParams, Outlet, NavLink, useLocation } from 'react-router-dom';
import { WorkspaceContext, useWorkspaceProvider } from '@/hooks/use-workspace';
import { LoopStateBadge } from '@/components/factory/loop-state-badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { List, Terminal, FileText, Settings2, BarChart3 } from 'lucide-react';

interface TabDef {
  path: (slug: string) => string;
  match: string;
  label: string;
  icon: typeof List;
}

const tabs: TabDef[] = [
  { path: (s) => `/factory/features/${s}`, match: '/factory/features/', label: 'Features', icon: List },
  { path: (s) => `/factory/sessions/${s}`, match: '/factory/sessions/', label: 'Sessões', icon: BarChart3 },
  { path: (s) => `/factory/console/${s}`, match: '/factory/console/', label: 'Console', icon: Terminal },
  { path: (s) => `/factory/specs/${s}`, match: '/factory/specs/', label: 'Specs', icon: FileText },
  { path: (s) => `/factory/runs/${s}/manage`, match: '/factory/runs/', label: 'Gerenciar', icon: Settings2 },
];

export function FactorySlugLayout() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const workspace = useWorkspaceProvider(slug ?? null);

  const passing = workspace.summary.passing ?? 0;
  const pct = workspace.total > 0 ? Math.round((passing / workspace.total) * 100) : 0;

  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className="flex flex-col h-full">
        {/* Header with run info + tabs */}
        <div className="border-b bg-card">
          {/* Run info bar */}
          <div className="flex items-center gap-3 px-4 py-2">
            <LoopStateBadge state={workspace.state} />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm truncate">
                {workspace.config?.project ?? slug}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{slug}</span>
            </div>
            {workspace.total > 0 && (
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <Progress value={pct} className="h-1.5 w-24" />
                <span className="text-xs font-mono text-muted-foreground">
                  {passing}/{workspace.total}
                </span>
              </div>
            )}
          </div>

          {/* Tab bar */}
          <nav className="flex gap-0 px-4 overflow-x-auto">
            {tabs.map(tab => {
              const isActive = location.pathname.startsWith(tab.match);
              return (
                <NavLink
                  key={tab.label}
                  to={tab.path(slug!)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
