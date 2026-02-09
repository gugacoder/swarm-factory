import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useTheme } from '@/hooks/useTheme'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import BrandEditor from './tools/brand-editor'
import RunMonitor from './tools/run-monitor'
import SessionLive from './tools/session-live'

type ToolDef = { id: string; path: string; name: string; icon: JSX.Element }

const RALPH_TOOLS: ToolDef[] = [
  {
    id: 'run-monitor',
    path: '/run-monitor',
    name: 'Run Monitor',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'session-live',
    path: '/session-live',
    name: 'Session Live',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
]

const GENERAL_TOOLS: ToolDef[] = [
  {
    id: 'brand-editor',
    path: '/brand-editor',
    name: 'Brand Editor',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
]

// Icone Swarm Factory inline (de assets/icon.svg)
function ToolingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className}>
      <path
        d="m 331.7,225 c 28.3,0 54.9,11 74.9,31 l 19.4,19.4 c 15.8,-6.9 30.8,-16.5 43.8,-29.5 37.1,-37.1 49.7,-89.3 37.9,-136.7 -2.2,-9 -13.5,-12.1 -20.1,-5.5 L 413.2,178.1 345.3,166.8 334,98.9 408.4,24.5 C 415,17.9 411.8,6.6 402.7,4.3 355.3,-7.4 303.1,5.2 266.1,42.2 237.6,70.7 224.2,108.3 224.9,145.8 l 82.1,82.1 c 8.1,-1.9 16.5,-2.9 24.7,-2.9 z M 64,472 c -13.2,0 -24,-10.8 -24,-24 0,-13.3 10.7,-24 24,-24 13.3,0 24,10.7 24,24 0,13.2 -10.7,24 -24,24 z M 227.8,307 171.1,250.3 18.7,402.8 c -25,25 -25,65.5 0,90.5 25,25 65.5,25 90.5,0 L 232.8,369.7 c -7.6,-19.9 -9.9,-41.6 -5,-62.7 z"
        fill="#5a2ca0"
      />
      <path
        d="M 501.1,395.7 384,278.6 C 360.9,255.5 326.4,251 298.6,264.7 L 192,158.1 V 96 L 64,0 0,64 96,192 h 62.1 l 106.6,106.6 c -13.6,27.8 -9.2,62.3 13.9,85.4 l 117.1,117.1 c 14.6,14.6 38.2,14.6 52.7,0 l 52.7,-52.7 c 14.5,-14.6 14.5,-38.2 0,-52.7 z"
        fill="#ab37c8"
      />
    </svg>
  )
}

function MobileHeader() {
  const { toggle } = useSidebar()

  return (
    <div className="flex md:hidden items-center gap-3 px-3 py-2.5 border-b border-border bg-card shrink-0">
      <button
        onClick={toggle}
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <ToolingIcon className="w-5 h-5 shrink-0" />
      <span className="font-semibold text-sm">Swarm Factory</span>
    </div>
  )
}

function AppSidebarHeader() {
  const { open, toggle } = useSidebar()

  return (
    <SidebarHeader>
      <div className="flex items-center justify-between">
        {open ? (
          <>
            <div className="flex items-center gap-2">
              <ToolingIcon className="w-5 h-5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">Swarm Factory</span>
              </div>
            </div>
            <SidebarTrigger />
          </>
        ) : (
          <button
            onClick={toggle}
            className="group relative w-full flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors p-1.5"
            title="Expandir"
          >
            <ToolingIcon className="w-5 h-5 shrink-0 group-hover:opacity-0 transition-opacity" />
            <svg
              className="w-4 h-4 absolute opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </SidebarHeader>
  )
}

function AppSidebarFooter() {
  const { open } = useSidebar()
  const { theme, setTheme } = useTheme()

  return (
    <SidebarFooter>
      <div className="flex flex-col gap-2 items-center">
        <ThemeSwitcher theme={theme} onThemeChange={setTheme} vertical={!open} />
        {open && <span className="text-[10px] text-sidebar-foreground/60">v0.0.1</span>}
      </div>
    </SidebarFooter>
  )
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()

  // Resolve system theme for Toaster
  const resolvedTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <AppSidebarHeader />

        <SidebarContent>
          <SidebarGroup collapsible storageKey="vibe-tooling-group-ralph" defaultOpen={true}>
            <SidebarGroupLabel>Ralph Wiggum Loop</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {RALPH_TOOLS.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton
                      isActive={location.pathname.startsWith(tool.path)}
                      tooltip={tool.name}
                      onClick={() => navigate(tool.path)}
                    >
                      {tool.icon}
                      <span>{tool.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup collapsible storageKey="vibe-tooling-group-tools" defaultOpen={true}>
            <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {GENERAL_TOOLS.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton
                      isActive={location.pathname.startsWith(tool.path)}
                      tooltip={tool.name}
                      onClick={() => navigate(tool.path)}
                    >
                      {tool.icon}
                      <span>{tool.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <AppSidebarFooter />
      </Sidebar>

      <SidebarInset>
        <MobileHeader />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Routes>
            <Route path="/brand-editor" element={<BrandEditor />} />
            <Route path="/run-monitor/:runId?" element={<RunMonitor />} />
            <Route path="/session-live/:runId?/:sessionId?" element={<SessionLive />} />
            <Route path="*" element={<Navigate to="/run-monitor" replace />} />
          </Routes>
        </div>
      </SidebarInset>

      <Toaster
        theme={resolvedTheme}
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'bg-background border-border text-foreground',
            title: 'text-foreground',
            description: 'text-muted-foreground',
            success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400',
            error: 'bg-destructive/10 border-destructive/20 text-destructive',
          },
        }}
      />
    </SidebarProvider>
  )
}
