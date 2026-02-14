import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { BreadcrumbBar } from './breadcrumb-bar';
import { NotificationBell } from './notification-bell';

interface AppShellProps {
  user: { name: string; email: string } | null;
}

export function AppShell({ user }: AppShellProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="flex h-screen bg-background text-foreground">
      {isDesktop && <Sidebar user={user} />}

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b">
          <BreadcrumbBar />
          <div className="pr-4">
            <NotificationBell />
          </div>
        </div>
        <div className={`flex-1 overflow-auto ${!isDesktop ? 'pb-16' : ''}`}>
          <Outlet />
        </div>
      </main>

      {!isDesktop && <BottomNav />}
    </div>
  );
}
