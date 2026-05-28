import { request } from './client';

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

export async function listTasks(projectId: number): Promise<Task[]> {
  return request<Task[]>(`/tasks?projectId=${projectId}`);
}

export async function createTask(input: Omit<Task, 'id'>): Promise<Task> {
  return request<Task>('/tasks', { method: 'POST', body: input });
}

export async function updateStatus(id: number, status: TaskStatus): Promise<Task> {
  return request<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: { status } });
}
