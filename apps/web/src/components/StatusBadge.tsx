import type { TaskStatus } from '../api/tasks';
import { formatStatusLabel } from '../lib/format';

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span data-testid="status-badge" className={`badge badge--${status}`}>
      {formatStatusLabel(status)}
    </span>
  );
}
