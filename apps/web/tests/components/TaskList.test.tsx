import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from '../../src/components/TaskList';
import type { Task } from '../../src/api/tasks';

function makeTasks(n: number): Task[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    title: `Task ${i + 1}`,
    description: `Description for task ${i + 1}`,
    status: (['todo', 'doing', 'done'] as const)[i % 3],
    assigneeId: null,
    projectId: 1,
    dueDate: null,
  }));
}

describe('TaskList', () => {
  it('shows empty state when no tasks', () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders a task card for each task', () => {
    render(<TaskList tasks={makeTasks(3)} />);
    expect(screen.getAllByTestId('task-card')).toHaveLength(3);
  });

  it('preserves task order', () => {
    const tasks = makeTasks(3);
    render(<TaskList tasks={tasks} />);
    const cards = screen.getAllByTestId('task-card');
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-task-id', String(i + 1));
    });
  });

  // ⚠️ SLOW TEST.
  //
  // This test renders a TaskList with 500 entries. The React reconciler,
  // jsdom layout, and per-card test ID indexing all add up — the test
  // takes 1.5–3 seconds on a modern laptop, mostly in legitimate work.
  //
  // Workshop 2 students will identify this as a slow test.
  // Workshop 5 students will replace it with a smaller render plus a
  // unit test for the list-virtualization logic — once the component
  // is taught to virtualize its output.
  //
  // The remediation gets walked through together in Workshop 5's
  // live-demo, not as solo work.
  it('renders a long list of tasks', () => {
    render(<TaskList tasks={makeTasks(500)} />);
    expect(screen.getAllByTestId('task-card')).toHaveLength(500);
  });
});
