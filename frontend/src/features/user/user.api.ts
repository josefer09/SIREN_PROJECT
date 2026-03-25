import { httpClient } from '@/adapters/http.adapter';
import type { User } from '@/types';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const resp = await httpClient.get('/users');
    const payload = resp.data as { users: User[]; total: number };
    return payload.users;
  },

  block: async (id: string): Promise<User> => {
    const { data } = await httpClient.patch<User>(`/users/${id}/block`);
    return data;
  },

  unblock: async (id: string): Promise<User> => {
    const { data } = await httpClient.patch<User>(`/users/${id}/unblock`);
    return data;
  },
};
