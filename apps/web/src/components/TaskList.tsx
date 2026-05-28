import type { Task } from '../api/tasks';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';

export interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState title="No tasks yet" description="Create your first task to get started." />;
  }
  return (
    <div data-testid="task-list">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
      ))}
    </div>
  );
}
