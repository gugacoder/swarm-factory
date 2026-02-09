import * as React from 'react'
import { cn } from '@/lib/utils'

const SIDEBAR_WIDTH = '14rem'
const SIDEBAR_WIDTH_COLLAPSED = '3rem'
const MOBILE_BREAKPOINT = '(min-width: 768px)'

type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => !window.matchMedia(MOBILE_BREAKPOINT).matches)

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT)
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isMobile
}

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
}

const STORAGE_KEY = 'vibe-tooling-sidebar'

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ defaultOpen = true, className, style, children, ...props }, ref) => {
    const isMobile = useIsMobile()

    const [open, setOpenState] = React.useState(() => {
      if (isMobile) return false
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored !== null ? stored === 'true' : defaultOpen
    })

    // Fechar sidebar quando muda para mobile
    React.useEffect(() => {
      if (isMobile) setOpenState(false)
    }, [isMobile])

    const setOpen = React.useCallback((value: boolean) => {
      setOpenState(value)
      if (!isMobile) {
        localStorage.setItem(STORAGE_KEY, String(value))
      }
    }, [isMobile])

    const toggle = React.useCallback(() => {
      setOpenState((o) => {
        const newValue = !o
        if (!isMobile) {
          localStorage.setItem(STORAGE_KEY, String(newValue))
        }
        return newValue
      })
    }, [isMobile])

    return (
      <SidebarContext.Provider value={{ open, setOpen, toggle, isMobile }}>
        <div
          ref={ref}
          data-sidebar-open={open}
          style={{
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-collapsed': SIDEBAR_WIDTH_COLLAPSED,
            ...style,
          } as React.CSSProperties}
          className={cn(
            'group/sidebar-wrapper flex h-svh w-full overflow-hidden',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = 'SidebarProvider'

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen, isMobile } = useSidebar()

  // Mobile: drawer com backdrop
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
        )}
        {/* Drawer */}
        <div
          ref={ref}
          data-open={open}
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-[--sidebar-width] transition-transform duration-200',
            open ? 'translate-x-0' : '-translate-x-full',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }

  // Desktop: inline como antes
  return (
    <div
      ref={ref}
      data-open={open}
      className={cn(
        'flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200',
        open ? 'w-[--sidebar-width]' : 'w-[--sidebar-width-collapsed]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Sidebar.displayName = 'Sidebar'

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-2 p-2 border-b border-sidebar-border', className)}
    {...props}
  />
))
SidebarHeader.displayName = 'SidebarHeader'

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2',
      className
    )}
    {...props}
  />
))
SidebarContent.displayName = 'SidebarContent'

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-2 p-3 border-t border-sidebar-border', className)}
    {...props}
  />
))
SidebarFooter.displayName = 'SidebarFooter'

type SidebarGroupContext = {
  collapsible: boolean
  groupOpen: boolean
  toggleGroup: () => void
}

const SidebarGroupContext = React.createContext<SidebarGroupContext>({
  collapsible: false,
  groupOpen: true,
  toggleGroup: () => {},
})

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean
  storageKey?: string
  defaultOpen?: boolean
}

const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, collapsible = false, storageKey, defaultOpen = true, ...props }, ref) => {
    const [groupOpen, setGroupOpen] = React.useState(() => {
      if (!collapsible || !storageKey) return true
      const stored = localStorage.getItem(storageKey)
      return stored !== null ? stored === 'true' : defaultOpen
    })

    const toggleGroup = React.useCallback(() => {
      setGroupOpen((prev) => {
        const next = !prev
        if (storageKey) localStorage.setItem(storageKey, String(next))
        return next
      })
    }, [storageKey])

    return (
      <SidebarGroupContext.Provider value={{ collapsible, groupOpen, toggleGroup }}>
        <div
          ref={ref}
          className={cn('flex flex-col gap-1', className)}
          {...props}
        />
      </SidebarGroupContext.Provider>
    )
  }
)
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar()
  const { collapsible, groupOpen, toggleGroup } = React.useContext(SidebarGroupContext)

  return (
    <div
      ref={ref}
      role={collapsible && open ? 'button' : undefined}
      onClick={collapsible && open ? toggleGroup : undefined}
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 truncate',
        !open && 'sr-only',
        collapsible && open && 'cursor-pointer select-none flex items-center justify-between hover:text-sidebar-foreground/90',
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {collapsible && open && (
        <svg
          className={cn(
            'w-3 h-3 shrink-0 text-sidebar-foreground/50 transition-transform duration-200',
            !groupOpen && '-rotate-90'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </div>
  )
})
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open: sidebarOpen } = useSidebar()
  const { collapsible, groupOpen } = React.useContext(SidebarGroupContext)
  const collapsed = collapsible && !groupOpen && sidebarOpen

  return (
    <div
      ref={ref}
      className={cn(
        collapsed && 'max-h-0 overflow-hidden',
        className
      )}
      {...props}
    />
  )
})
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-col gap-1', className)}
    {...props}
  />
))
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, tooltip, children, onClick, ...props }, ref) => {
    const { open, setOpen, isMobile } = useSidebar()

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      // Fechar sidebar ao clicar em item no mobile
      if (isMobile) setOpen(false)
    }, [onClick, isMobile, setOpen])

    return (
      <button
        ref={ref}
        title={!open ? tooltip : undefined}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
          !open && !isMobile && 'justify-center px-0',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          // First child is icon, show always
          if (index === 0) return child
          // Other children hidden when collapsed (desktop only)
          if (!open && !isMobile) return null
          return child
        })}
      </button>
    )
  }
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { open, toggle } = useSidebar()

  return (
    <button
      ref={ref}
      onClick={toggle}
      className={cn(
        'flex items-center justify-center rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
        className
      )}
      {...props}
    >
      <svg
        className={cn('w-4 h-4 transition-transform', !open && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    </button>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col flex-1 min-w-0 h-full overflow-hidden',
      className
    )}
    {...props}
  />
))
SidebarInset.displayName = 'SidebarInset'

export {
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
}
