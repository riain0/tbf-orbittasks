import {
  createTask,
  listTasks,
  updateStatus,
  findTask,
} from '../src/services/tasks.service';
import { db } from '../src/db/client';

describe('tasks service', () => {
  beforeEach(() => {
    db.reset();
  });

  it('creates a task', () => {
    const t = createTask({
      title: 'Wire up auth',
      description: '',
      status: 'todo',
      assigneeId: null,
      projectId: 1,
      dueDate: null,
    });
    expect(t.id).toBe(1);
    expect(t.title).toBe('Wire up auth');
  });

  it('lists tasks for a project', () => {
    createTask({ title: 'A', description: '', status: 'todo', assigneeId: null, projectId: 1, dueDate: null });
    createTask({ title: 'B', description: '', status: 'todo', assigneeId: null, projectId: 2, dueDate: null });
    expect(listTasks(1)).toHaveLength(1);
    expect(listTasks(2)).toHaveLength(1);
  });

  it('returns empty list for unknown project', () => {
    expect(listTasks(999)).toEqual([]);
  });

  it('updates status', () => {
    const t = createTask({ title: 'C', description: '', status: 'todo', assigneeId: null, projectId: 1, dueDate: null });
    const updated = updateStatus(t.id, 'doing');
    expect(updated.status).toBe('doing');
  });

  it('throws on updateStatus when not found', () => {
    expect(() => updateStatus(999, 'doing')).toThrow('not found');
  });

  it('finds tasks by id', () => {
    const t = createTask({ title: 'D', description: '', status: 'todo', assigneeId: null, projectId: 1, dueDate: null });
    expect(findTask(t.id)).toBeDefined();
    expect(findTask(999)).toBeUndefined();
  });

  // ⚠️ FLAKY TEST (≈50% failure rate).
  //
  // Simulates a debounced "auto-save" that flushes the task after a
  // randomised 50–250 ms delay, and asserts the flush happened by a fixed
  // 150 ms deadline. The flush beats the deadline only about half the time,
  // so the test fails intermittently — the same timing-race shape as the
  // billing-events test in reports.test.ts, in a second file so students
  // see flakiness isn't isolated to one place.
  //
  // Workshop 2 students will identify this as a timing-dependent race:
  // asserting against a wall-clock deadline instead of awaiting the work.
  it('auto-saves a task within budget', async () => {
    const t = createTask({ title: 'E', description: '', status: 'todo', assigneeId: null, projectId: 1, dueDate: null });

    let flushed = false;
    setTimeout(() => {
      updateStatus(t.id, 'doing');
      flushed = true;
    }, 50 + Math.random() * 200);

    await new Promise((r) => setTimeout(r, 150));
    expect(flushed).toBe(true);
  });
});
