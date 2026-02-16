import { useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { WorkspaceContext, useWorkspaceProvider } from '@/hooks/useWorkspace'
import { StatusBar } from '@/components/StatusBar'
import { FeaturesPanel } from '@/panels/FeaturesPanel'
import { SessionsPanel } from '@/panels/SessionsPanel'
import { ConsolePanel } from '@/panels/ConsolePanel'
import { PromptPanel } from '@/panels/PromptPanel'
import { ProgressPanel } from '@/panels/ProgressPanel'
import { CreateHarnessPanel } from '@/panels/CreateHarnessPanel'
import { cn } from '@/lib/utils'

type Tab = 'features' | 'sessions' | 'console' | 'specs' | 'progress'

const TABS: { id: Tab; path: string; label: string; icon: JSX.Element }[] = [
  {
    id: 'features',
    path: '/features',
    label: 'Features',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'sessions',
    path: '/sessions',
    label: 'Sessions',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'console',
    path: '/console',
    label: 'Console',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'specs',
    path: '/specs',
    label: 'Specs',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'progress',
    path: '/progress',
    label: 'Progress',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
]

function activeTabFromPath(pathname: string): Tab | null {
  if (pathname.startsWith('/sessions')) return 'sessions'
  if (pathname.startsWith('/console')) return 'console'
  if (pathname.startsWith('/specs')) return 'specs'
  if (pathname.startsWith('/progress')) return 'progress'
  if (pathname.startsWith('/create')) return null
  return 'features'
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const workspace = useWorkspaceProvider(refreshKey)
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = activeTabFromPath(location.pathname)

  const handleWorkspaceChange = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className="h-screen flex flex-col overflow-hidden">
        <StatusBar onWorkspaceChange={handleWorkspaceChange} />

        {/* Tab bar */}
        <div className="flex items-center border-b border-border bg-card px-2 overflow-x-auto shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Panel content — key forces remount on workspace change */}
        <div className="flex-1 min-h-0 overflow-hidden relative" key={refreshKey}>
          <Routes>
            <Route path="/features" element={<FeaturesPanel />} />
            <Route path="/sessions/:sid?" element={<SessionsPanel />} />
            <Route path="/console" element={<ConsolePanel />} />
            <Route path="/specs/*" element={<PromptPanel />} />
            <Route path="/progress" element={<ProgressPanel />} />
            <Route path="/create" element={<CreateHarnessPanel onWorkspaceChange={handleWorkspaceChange} />} />
            <Route path="*" element={<Navigate to="/features" replace />} />
          </Routes>
        </div>
      </div>
    </WorkspaceContext.Provider>
  )
}
