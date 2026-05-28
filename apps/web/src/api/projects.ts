import { request } from './client';

export interface Project {
  id: number;
  name: string;
  workspaceId: number;
  archived: boolean;
}

export async function listProjects(): Promise<Project[]> {
  return request<Project[]>('/projects');
}

export async function createProject(input: { name: string; workspaceId: number }): Promise<Project> {
  return request<Project>('/projects', { method: 'POST', body: input });
}
