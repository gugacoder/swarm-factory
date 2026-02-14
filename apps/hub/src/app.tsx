import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from '@/components/layout/app-shell';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { ProjectListPage } from '@/pages/projects/list';
import { ProjectCreatePage } from '@/pages/projects/create';
import { ProjectDetailPage } from '@/pages/projects/detail';
import { KaiPage } from '@/pages/kai';
import { SettingsPage } from '@/pages/settings';
import { getUser, refresh, getAccessToken } from '@/lib/auth';
import { useDarkMode } from '@/hooks/use-dark-mode';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

function ProtectedRoute({ user, loading, children }: { user: User | null; loading: boolean; children: React.ReactNode }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useDarkMode();

  useEffect(() => {
    async function init() {
      const ok = await refresh();
      if (ok) {
        try {
          const u = await getUser();
          setUser(u);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    function handleLoginSuccess() {
      if (getAccessToken() && !user) {
        getUser().then(setUser).catch(() => {});
      }
    }
    const interval = setInterval(handleLoginSuccess, 1000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />

        <Route element={
          <ProtectedRoute user={user} loading={loading}>
            <AppShell user={user} />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/create" element={<ProjectCreatePage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/kai" element={<KaiPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
