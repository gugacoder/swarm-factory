import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Bot, Settings, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projetos' },
  { to: '/factory', icon: Factory, label: 'Factory' },
  { to: '/kai', icon: Bot, label: 'Kai' },
  { to: '/settings', icon: Settings, label: 'Config' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-11 h-11 rounded-md text-xs transition-colors',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground',
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="mt-0.5">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
