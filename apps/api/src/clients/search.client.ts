import { HttpClient, defaultBaseUrl } from './http';

export interface SearchDoc {
  id: string | number;
  [key: string]: unknown;
}

export interface IndexResult {
  taskID: number;
  objectIDs: string[];
}

export interface SearchHit {
  objectID: string;
  title: string;
}

export interface SearchResult {
  hits: SearchHit[];
  nbHits: number;
  processingTimeMS: number;
}

export class SearchClient {
  private readonly http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: defaultBaseUrl('') });
  }

  async index(indexName: string, docs: SearchDoc[]): Promise<IndexResult> {
    return this.http.post<IndexResult>(`/search/index/${indexName}`, { objects: docs });
  }

  async query(q: string): Promise<SearchResult> {
    return this.http.get<SearchResult>('/search/query', { q });
  }
}
