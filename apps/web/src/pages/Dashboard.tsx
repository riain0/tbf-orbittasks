import { useTasks } from '../hooks/useTasks';
import { TaskList } from '../components/TaskList';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Dashboard({ projectId = 1 }: { projectId?: number }) {
  const { data, loading, error } = useTasks(projectId);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div data-testid="dashboard-error" role="alert" className="alert">
        Could not load tasks: {error.message}
      </div>
    );
  }

  const tasks = data ?? [];
  const open = tasks.filter((t) => t.status !== 'done').length;
  const completed = tasks.filter((t) => t.status === 'done').length;

  return (
    <main data-testid="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">An overview of this project's tasks.</p>
      <section className="stat-grid">
        <Stat label="Open" value={open} accent />
        <Stat label="Completed" value={completed} />
        <Stat label="Total" value={tasks.length} />
      </section>
      <TaskList tasks={tasks} />
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div data-testid={`stat-${label.toLowerCase()}`} className={`stat${accent ? ' stat--accent' : ''}`}>
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}
