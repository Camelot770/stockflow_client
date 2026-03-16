import apiClient from './client';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: 'products' | 'customers' | 'deals' | 'tasks' | 'suppliers' | 'orders';
  link: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export const searchApi = {
  globalSearch: (query: string, limit = 5): Promise<SearchResponse> =>
    apiClient.get('/search', { params: { q: query, limit } }).then((r) => r.data),
};
