import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Reports } from '../../src/pages/Reports';
import type { Task } from '../../src/api/tasks';

const tasks: Task[] = [
  { id: 1, title: 'A', description: '', status: 'done', assigneeId: null, projectId: 1, dueDate: null },
  { id: 2, title: 'B', description: '', status: 'doing', assigneeId: null, projectId: 1, dueDate: null },
  { id: 3, title: 'C', description: '', status: 'todo', assigneeId: null, projectId: 1, dueDate: null },
];

describe('Reports page', () => {
  it('renders the KPI cards', () => {
    render(<Reports tasks={tasks} />);
    expect(screen.getByTestId('kpi-completion-rate')).toHaveTextContent('33%');
    expect(screen.getByTestId('kpi-in-progress')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-total-tasks')).toHaveTextContent('3');
  });

  it('renders a row per task', () => {
    render(<Reports tasks={tasks} />);
    const rows = screen.getAllByRole('row');
    // 1 header + 3 data rows
    expect(rows).toHaveLength(4);
  });

  it('handles empty tasks gracefully', () => {
    render(<Reports tasks={[]} />);
    expect(screen.getByTestId('kpi-completion-rate')).toHaveTextContent('0%');
  });
});
