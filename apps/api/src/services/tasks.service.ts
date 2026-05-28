import { db } from '../db/client';

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: number | null;
  projectId: number;
  dueDate: string | null;
}

export function createTask(input: Omit<Task, 'id'>): Task {
  return db.insert('tasks', input) as unknown as Task;
}

export function listTasks(projectId: number): Task[] {
  return db.list('tasks', (r) => r.projectId === projectId) as unknown as Task[];
}

export function findTask(id: number): Task | undefined {
  return db.find('tasks', (r) => r.id === id) as unknown as Task | undefined;
}

export function updateStatus(id: number, status: TaskStatus): Task {
  const t = findTask(id);
  if (!t) throw new Error('task not found');
  t.status = status;
  return t;
}
