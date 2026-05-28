import { SearchClient } from '../clients/search.client';
import { db } from '../db/client';

export class SearchService {
  constructor(private readonly client: SearchClient = new SearchClient()) {}

  async reindexTasks(): Promise<number> {
    const tasks = db.list('tasks');
    const result = await this.client.index('tasks', tasks as Array<{ id: number | string }>);
    return result.objectIDs.length;
  }

  async reindexProjects(): Promise<number> {
    const projects = db.list('projects');
    const result = await this.client.index('projects', projects as Array<{ id: number | string }>);
    return result.objectIDs.length;
  }

  async searchTasks(query: string): Promise<string[]> {
    const out = await this.client.query(query);
    return out.hits.map((h) => h.objectID);
  }
}
