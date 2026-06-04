import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList, visibleRange } from '../../src/components/TaskList';
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

  // W5 step 4: the old test rendered 500 cards (~2s of legitimate DOM work).
  // Now the component virtualizes, so a long list mounts only a window. We
  // assert the window is small instead of forcing 500 nodes, and unit-test
  // the window math directly — same coverage, milliseconds instead of seconds.
  it('virtualizes a long list (renders a window, not every card)', () => {
    render(<TaskList tasks={makeTasks(500)} />);
    const cards = screen.getAllByTestId('task-card');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThan(500);
  });
});

describe('visibleRange', () => {
  it('returns a small window for a large list at the top', () => {
    const { start, end } = visibleRange(0, 480, 72, 500, 3);
    expect(start).toBe(0);
    expect(end).toBeLessThan(500);
    expect(end).toBeGreaterThan(0);
  });

  it('advances the window as the list scrolls', () => {
    const top = visibleRange(0, 480, 72, 500, 3);
    const scrolled = visibleRange(7200, 480, 72, 500, 3);
    expect(scrolled.start).toBeGreaterThan(top.start);
  });

  it('never runs past the end of the list', () => {
    const { end } = visibleRange(999999, 480, 72, 500, 3);
    expect(end).toBe(500);
  });
});
