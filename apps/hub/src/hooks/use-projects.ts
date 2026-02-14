import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useSSE } from './use-sse';

export interface ProjectSummary {
  slug: string;
  name: string;
  harness: string;
  format: string;
  workspace?: string;
  state?: string;
  progress?: number;
  features?: {
    pending: number;
    in_progress: number;
    failing: number;
    blocked: number;
    skipped: number;
    passing: number;
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await api.get<ProjectSummary[]>('/api/projects');
      setProjects(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // SSE updates
  useSSE('/api/events', useCallback((event) => {
    if (['feature:status', 'loop:start', 'loop:stop', 'project:created'].includes(event.type)) {
      fetchProjects();
    }
  }, [fetchProjects]));

  return { projects, loading, error, refetch: fetchProjects };
}
