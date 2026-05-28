import { listProjects, Project } from '../api/projects';
import { useFetch } from './useFetch';

export function useProjects() {
  return useFetch<Project[]>(() => listProjects(), []);
}
