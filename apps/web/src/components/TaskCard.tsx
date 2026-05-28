import type { Task } from '../api/tasks';
import { formatDate, formatRelativeDays, truncate } from '../lib/format';
import { StatusBadge } from './StatusBadge';

export interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <article
      data-testid="task-card"
      data-task-id={task.id}
      onClick={() => onClick?.(task)}
      className="task"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <header className="task__head">
        <h3 className="task__title">{truncate(task.title, 80)}</h3>
        <StatusBadge status={task.status} />
      </header>
      {task.description && <p className="task__desc">{truncate(task.description, 200)}</p>}
      {task.dueDate && (
        <footer className="task__meta">
          Due {formatDate(task.dueDate)} · {formatRelativeDays(task.dueDate)}
        </footer>
      )}
    </article>
  );
}
