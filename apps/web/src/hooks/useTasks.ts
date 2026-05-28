import { listTasks, Task } from '../api/tasks';
import { useFetch } from './useFetch';

export function useTasks(projectId: number) {
  return useFetch<Task[]>(() => listTasks(projectId), [projectId]);
}
