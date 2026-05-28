import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, SidebarLink } from './components/Sidebar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Dashboard } from './pages/Dashboard';
import { ProjectView } from './pages/ProjectView';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import type { User } from './api/auth';

type Route = 'dashboard' | 'board' | 'reports' | 'settings';

export function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="auth">
        <LoadingSpinner />
      </div>
    );
  }
  if (!user) {
    return <Login onSuccess={() => window.location.reload()} />;
  }
  return <Workspace user={user} onSignOut={signOut} />;
}

// Authenticated shell. Mounted only once we have a user, so none of the data
// hooks below ever fire while logged out.
function Workspace({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const { data: projects, loading, error } = useProjects();
  const [route, setRoute] = useState<Route>('dashboard');
  const [projectId, setProjectId] = useState<number | null>(null);

  // Default to the first project once they load.
  useEffect(() => {
    if (projectId === null && projects && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const links: SidebarLink[] = [
    { label: 'Dashboard', href: '#dashboard', active: route === 'dashboard' },
    { label: 'Board', href: '#board', active: route === 'board' },
    { label: 'Reports', href: '#reports', active: route === 'reports' },
    { label: 'Settings', href: '#settings', active: route === 'settings' },
  ];

  const activeProject = projects?.find((p) => p.id === projectId) ?? null;

  return (
    <div className="app-shell">
      <Header userName={user.name} onSignOut={onSignOut} />
      <div className="app-body">
        <div
          className="nav-rail"
          onClick={(e) => {
            const target = e.target as HTMLAnchorElement;
            if (target.tagName === 'A') {
              e.preventDefault();
              const next = target.getAttribute('href')?.slice(1) as Route | undefined;
              if (next) setRoute(next);
            }
          }}
        >
          <Sidebar links={links} />
        </div>
        <main className="app-main">
          <div className="app-content">
            {projects && projects.length > 1 && (
              <div className="picker">
                <label htmlFor="project-picker">Project</label>
                <select
                  id="project-picker"
                  data-testid="project-picker"
                  className="input"
                  value={projectId ?? ''}
                  onChange={(e) => setProjectId(Number(e.target.value))}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading && <LoadingSpinner />}
            {error && (
              <div role="alert" className="alert">
                Could not load projects: {error.message}
              </div>
            )}

            {projectId !== null && (
              <>
                {route === 'dashboard' && <Dashboard projectId={projectId} />}
                {route === 'board' && (
                  <ProjectView projectId={projectId} projectName={activeProject?.name ?? 'Project'} />
                )}
                {route === 'reports' && <ReportsForProject projectId={projectId} />}
                {route === 'settings' && <Settings initialEmail={user.email} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Reports reads a task list; fetch it for the active project and hand it over.
function ReportsForProject({ projectId }: { projectId: number }) {
  const { data, loading, error } = useTasks(projectId);
  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div role="alert" className="alert">
        Could not load reports: {error.message}
      </div>
    );
  }
  return <Reports tasks={data ?? []} />;
}
