import { httpClient } from '@/adapters/http.adapter';
import type {
  Selector,
  CreateSelectorPayload,
  UpdateSelectorPayload,
  SetSelectorValuePayload,
} from '@/types';

export const selectorApi = {
  getByPage: async (pageId: string): Promise<Selector[]> => {
    const { data } = await httpClient.get<Selector[]>(`/selectors/by-page/${pageId}`);
    return data;
  },

  getOne: async (id: string): Promise<Selector> => {
    const { data } = await httpClient.get<Selector>(`/selectors/${id}`);
    return data;
  },

  create: async (payload: CreateSelectorPayload): Promise<Selector> => {
    const { data } = await httpClient.post<Selector>('/selectors', payload);
    return data;
  },

  update: async (id: string, payload: UpdateSelectorPayload): Promise<Selector> => {
    const { data } = await httpClient.patch<Selector>(`/selectors/${id}`, payload);
    return data;
  },

  setValue: async (id: string, payload: SetSelectorValuePayload): Promise<Selector> => {
    const { data } = await httpClient.patch<Selector>(`/selectors/${id}/set-value`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/selectors/${id}`);
  },

  checkDuplicate: async (pageId: string, name: string): Promise<{ isDuplicate: boolean }> => {
    const { data } = await httpClient.get<{ isDuplicate: boolean }>(
      `/selectors/check-duplicate?pageId=${pageId}&name=${name}`,
    );
    return data;
  },
};
