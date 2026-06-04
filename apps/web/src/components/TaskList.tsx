import { useState } from 'react';
import type { Task } from '../api/tasks';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';

export interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  itemHeight?: number;
  height?: number;
  overscan?: number;
}

// W5 step 4: pure window math, extracted so it's unit-testable without a DOM.
// Given the scroll position and viewport, return the slice of indices that
// actually need to be in the DOM.
export function visibleRange(
  scrollTop: number,
  viewportHeight: number,
  itemHeight: number,
  count: number,
  overscan = 3,
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visible = Math.ceil(viewportHeight / itemHeight) + overscan * 2;
  const end = Math.min(count, start + visible);
  return { start, end };
}

// W5 step 4: window-based virtualization using only React built-ins (no deps).
// A long list used to render every card (500 DOM nodes in the slow test);
// now only the visible window plus a small overscan is mounted, and a spacer
// preserves the scrollbar geometry.
export function TaskList({
  tasks,
  onTaskClick,
  itemHeight = 72,
  height = 480,
  overscan = 3,
}: TaskListProps) {
  const [scrollTop, setScrollTop] = useState(0);

  if (tasks.length === 0) {
    return <EmptyState title="No tasks yet" description="Create your first task to get started." />;
  }

  const { start, end } = visibleRange(scrollTop, height, itemHeight, tasks.length, overscan);
  const visible = tasks.slice(start, end);

  return (
    <div
      data-testid="task-list"
      style={{ height, overflowY: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: tasks.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${start * itemHeight}px)` }}>
          {visible.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
