import { useEffect, useState } from 'react';
import {
  listTasks,
  createTask,
  updateStatus,
  type Task,
  type TaskStatus,
} from '../api/tasks';
import { TaskCard } from '../components/TaskCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatStatusLabel } from '../lib/format';

const STATUSES: TaskStatus[] = ['todo', 'doing', 'done'];

export interface ProjectViewProps {
  projectId: number;
  projectName: string;
}

export function ProjectView({ projectId, projectName }: ProjectViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setTasks(await listTasks(projectId));
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function move(task: Task, status: TaskStatus) {
    // Optimistic: update locally, then persist. Reload to recover on failure.
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await updateStatus(task.id, status);
    } catch {
      void load();
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const created = await createTask({
        title: trimmed,
        description: '',
        status: 'todo',
        assigneeId: null,
        projectId,
        dueDate: null,
      });
      setTasks((ts) => [...ts, created]);
      setTitle('');
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div role="alert" data-testid="board-error" className="alert">
        Could not load board: {error.message}
      </div>
    );
  }

  return (
    <main data-testid="project-view">
      <h1 className="page-title">{projectName}</h1>
      <p className="page-sub">Drag work across the board as it progresses.</p>

      <form onSubmit={add} className="board-form">
        <input
          aria-label="new task title"
          data-testid="new-task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task and press Enter…"
          className="input"
        />
        <button type="submit" data-testid="new-task-submit" disabled={busy || !title.trim()} className="btn btn--primary">
          {busy ? 'Adding…' : 'Add task'}
        </button>
      </form>

      <div className="board">
        {STATUSES.map((status) => {
          const column = tasks.filter((t) => t.status === status);
          return (
            <section key={status} data-testid={`column-${status}`} className="board__col">
              <div className="col__head">
                {formatStatusLabel(status)}
                <span className="col__count">{column.length}</span>
              </div>
              {column.map((task) => (
                <div key={task.id} className="board__item">
                  <TaskCard task={task} />
                  <div className="task__moves">
                    {STATUSES.filter((s) => s !== status).map((s) => (
                      <button
                        key={s}
                        data-testid={`move-${task.id}-${s}`}
                        onClick={() => move(task, s)}
                        className="move-btn"
                      >
                        → {formatStatusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
