import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useSSE } from './use-sse';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get<Notification[]>('/api/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch { /* ignora */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // SSE → toasts
  useSSE('/api/events', useCallback((event) => {
    if (event.type === 'feature:status') {
      const { featureId, newStatus } = event.data;
      if (newStatus === 'passing') {
        toast.success(`Feature ${featureId} passou!`);
      } else if (newStatus === 'failing') {
        toast.warning(`Feature ${featureId} falhou`);
      }
    } else if (event.type === 'loop:start') {
      toast.info(`Loop iniciado: ${event.data.slug}`);
    } else if (event.type === 'loop:stop') {
      toast.info(`Loop parado: ${event.data.slug}`);
    }
    fetchNotifications();
  }, [fetchNotifications]));

  const markAsRead = useCallback(async (id: string) => {
    await api.patch(`/api/notifications/${id}/read`);
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    await api.patch('/api/notifications/read-all');
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
