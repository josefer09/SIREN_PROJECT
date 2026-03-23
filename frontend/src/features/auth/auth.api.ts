import { httpClient } from '@/adapters/http.adapter';
import type { LoginResponse } from '@/types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  register: async (
    email: string,
    password: string,
    confirmPassword: string,
    fullName: string,
  ): Promise<{ id: string; email: string }> => {
    const { data } = await httpClient.post<{ id: string; email: string }>(
      '/auth/register',
      { email, password, confirmPassword, fullName },
    );
    return data;
  },
};
