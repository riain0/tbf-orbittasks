import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../../src/components/TaskCard';
import type { Task } from '../../src/api/tasks';

const task: Task = {
  id: 1,
  title: 'Wire up auth',
  description: 'Implement login form and session storage',
  status: 'doing',
  assigneeId: 1,
  projectId: 1,
  dueDate: '2026-06-10',
};

describe('TaskCard', () => {
  it('renders the title', () => {
    render(<TaskCard task={task} />);
    expect(screen.getByText('Wire up auth')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<TaskCard task={task} />);
    expect(screen.getByText(/login form/)).toBeInTheDocument();
  });

  it('renders the status badge', () => {
    render(<TaskCard task={task} />);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('calls onClick with the task', () => {
    const onClick = vi.fn();
    render(<TaskCard task={task} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('task-card'));
    expect(onClick).toHaveBeenCalledWith(task);
  });

  it('omits due date footer when dueDate is null', () => {
    render(<TaskCard task={{ ...task, dueDate: null }} />);
    expect(screen.queryByText(/Due/)).not.toBeInTheDocument();
  });
});
