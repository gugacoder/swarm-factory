import { useLocation, Link } from 'react-router-dom';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projetos',
  create: 'Criar Projeto',
  kai: 'Kai',
  settings: 'Configurações',
  features: 'Features',
  sessions: 'Sessões',
  logs: 'Logs',
};

export function BreadcrumbBar() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = ROUTE_LABELS[seg] || seg;
    const isLast = i === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-6 py-3">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
