import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-semibold text-sm">Notificações</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
              <Check className="h-3 w-3 mr-1" /> Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Sem notificações</p>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors',
                    !n.read && 'bg-primary/5',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(n.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
