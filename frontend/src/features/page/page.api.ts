import { httpClient } from '@/adapters/http.adapter';
import type { Page, CreatePagePayload, UpdatePagePayload } from '@/types';

export const pageApi = {
  getByProject: async (projectId: string): Promise<Page[]> => {
    const { data } = await httpClient.get<Page[]>(`/pages/by-project/${projectId}`);
    return data;
  },

  getOne: async (id: string): Promise<Page> => {
    const { data } = await httpClient.get<Page>(`/pages/${id}`);
    return data;
  },

  create: async (payload: CreatePagePayload): Promise<Page> => {
    const { data } = await httpClient.post<Page>('/pages', payload);
    return data;
  },

  update: async (id: string, payload: UpdatePagePayload): Promise<Page> => {
    const { data } = await httpClient.patch<Page>(`/pages/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/pages/${id}`);
  },
};
