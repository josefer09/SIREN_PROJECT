import { httpClient } from '@/adapters/http.adapter';
import type { User, UpdateProfilePayload, ChangePasswordPayload } from '@/types';

export const profileApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await httpClient.get<User>('/profile');
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await httpClient.patch<User>('/profile', payload);
    return data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await httpClient.patch('/profile/password', payload);
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await httpClient.post<User>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
