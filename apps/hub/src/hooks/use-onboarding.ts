import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useOnboarding() {
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      const data = await api.get<{ steps: string[] }>('/api/onboarding/progress');
      setSteps(data.steps);
    } catch { /* ignora */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const completeStep = useCallback(async (step: string) => {
    await api.post('/api/onboarding/complete', { step });
    setSteps((prev) => [...prev, step]);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await api.post('/api/onboarding/reset');
    setSteps([]);
  }, []);

  const shouldShowTour = !loading && !steps.includes('welcome_tour');
  const shouldShowSetup = !loading && steps.includes('welcome_tour') && !steps.includes('setup_wizard');

  return { steps, loading, shouldShowTour, shouldShowSetup, completeStep, resetOnboarding };
}
