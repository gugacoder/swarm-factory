import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useParams, Outlet } from 'react-router-dom'
import { WorkspaceContext, useWorkspaceProvider } from '@/hooks/useWorkspace'
import { StatusBar } from '@/components/StatusBar'
import { FeaturesPanel } from '@/panels/FeaturesPanel'
import { SessionsPanel } from '@/panels/SessionsPanel'
import { ConsolePanel } from '@/panels/ConsolePanel'
import { PromptPanel } from '@/panels/PromptPanel'
import { ProgressPanel } from '@/panels/ProgressPanel'
import { ManagePanel } from '@/panels/ManagePanel'
import { CreateRunPanel } from '@/panels/CreateRunPanel'
import { fetchWorkspaces } from '@/lib/api'
import { cn } from '@/lib/utils'

type Tab = 'features' | 'sessions' | 'console' | 'specs' | 'progress' | 'manage'

const TABS: { id: Tab; pathFn: (slug: string) => string; label: string; icon: JSX.Element }[] = [
  {
    id: 'features',
    pathFn: (slug) => `/features/${slug}`,
    label: 'Features',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'sessions',
    pathFn: (slug) => `/sessions/${slug}`,
    label: 'Sessions',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'console',
    pathFn: (slug) => `/console/${slug}`,
    label: 'Console',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'specs',
    pathFn: (slug) => `/specs/${slug}`,
    label: 'Specs',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'progress',
    pathFn: (slug) => `/progress/${slug}`,
    label: 'Progress',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    id: 'manage',
    pathFn: (slug) => `/runs/${slug}/manage`,
    label: 'Gerenciar',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

function activeTabFromPath(pathname: string): Tab | null {
  if (pathname.startsWith('/sessions/')) return 'sessions'
  if (pathname.startsWith('/console/')) return 'console'
  if (pathname.startsWith('/specs/')) return 'specs'
  if (pathname.startsWith('/progress/')) return 'progress'
  if (pathname.match(/^\/runs\/[^/]+\/manage/)) return 'manage'
  if (pathname.startsWith('/runs/new')) return null
  if (pathname.startsWith('/features/')) return 'features'
  return null
}

function extractSlugFromPath(pathname: string): string | null {
  // /features/{slug}, /sessions/{slug}, /console/{slug}, /progress/{slug}
  const simpleMatch = pathname.match(/^\/(features|sessions|console|progress|specs)\/([^/]+)/)
  if (simpleMatch) return simpleMatch[2]
  // /runs/{slug}/manage
  const runsMatch = pathname.match(/^\/runs\/([^/]+)\/manage/)
  if (runsMatch) return runsMatch[1]
  return null
}

// --- SlugLayout: wraps slug-based routes with WorkspaceContext ---
function SlugLayout() {
  const { slug } = useParams<{ slug: string }>()
  const workspace = useWorkspaceProvider(slug ?? null)

  return (
    <WorkspaceContext.Provider value={workspace}>
      <Outlet />
    </WorkspaceContext.Provider>
  )
}

// --- ManageSlugLayout: for /runs/:slug/manage ---
function ManageSlugLayout() {
  const { slug } = useParams<{ slug: string }>()
  const workspace = useWorkspaceProvider(slug ?? null)

  return (
    <WorkspaceContext.Provider value={workspace}>
      <Outlet />
    </WorkspaceContext.Provider>
  )
}

// --- HomeRedirect: fetch workspaces and redirect to first slug ---
function HomeRedirect() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkspaces().then(data => {
      if (data.workspaces.length > 0) {
        navigate(`/features/${data.workspaces[0].slug}`, { replace: true })
      } else {
        navigate('/runs/new', { replace: true })
      }
      setLoading(false)
    }).catch(() => {
      navigate('/runs/new', { replace: true })
      setLoading(false)
    })
  }, [navigate])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground text-sm">
        Carregando workspaces...
      </div>
    )
  }
  return null
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = activeTabFromPath(location.pathname)
  const currentSlug = extractSlugFromPath(location.pathname)

  // Derive workspace context for the status bar from the current slug
  const statusBarWorkspace = useWorkspaceProvider(currentSlug)

  return (
    <WorkspaceContext.Provider value={statusBarWorkspace}>
      <div className="h-screen flex flex-col overflow-hidden">
        <StatusBar />

        {/* Tab bar — only shown when there's a slug */}
        {currentSlug && (
          <div className="flex items-center border-b border-border bg-card px-2 overflow-x-auto shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.pathFn(currentSlug))}
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
        )}

        {/* Panel content */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <Routes>
            {/* Home redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Create new run */}
            <Route path="/runs/new" element={<CreateRunPanel />} />

            {/* Manage page */}
            <Route path="/runs/:slug/manage" element={<ManageSlugLayout />}>
              <Route index element={<ManagePanel />} />
            </Route>

            {/* Slug-based panels */}
            <Route path="/features/:slug" element={<SlugLayout />}>
              <Route index element={<FeaturesPanel />} />
            </Route>
            <Route path="/sessions/:slug/:sid?" element={<SlugLayout />}>
              <Route index element={<SessionsPanel />} />
            </Route>
            <Route path="/console/:slug" element={<SlugLayout />}>
              <Route index element={<ConsolePanel />} />
            </Route>
            <Route path="/specs/:slug/*" element={<SlugLayout />}>
              <Route path="*" element={<PromptPanel />} />
            </Route>
            <Route path="/progress/:slug" element={<SlugLayout />}>
              <Route index element={<ProgressPanel />} />
            </Route>

            {/* Legacy routes redirect to home */}
            <Route path="/features" element={<Navigate to="/" replace />} />
            <Route path="/sessions" element={<Navigate to="/" replace />} />
            <Route path="/console" element={<Navigate to="/" replace />} />
            <Route path="/specs" element={<Navigate to="/" replace />} />
            <Route path="/progress" element={<Navigate to="/" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </WorkspaceContext.Provider>
  )
}
