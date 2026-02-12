import { BrowserRouter, Routes, Route } from 'react-router-dom';

function DashboardPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Dashboard</h1></div>;
}

function ProjectsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Projetos</h1></div>;
}

function KaiPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Kai</h1></div>;
}

function SettingsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1></div>;
}

function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Login</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/kai" element={<KaiPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
