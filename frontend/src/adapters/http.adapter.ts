import axios from 'axios';

import { useAuthStore } from '@/store/auth.store';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject auth token
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — unwrap NestJS response + handle 401
httpClient.interceptors.response.use(
  (response) => {
    // Unwrap { statusCode, message, data } → data
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if user WAS authenticated (had token)
      const hadToken = !!useAuthStore.getState().token;
      if (hadToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Extract error message
    const responseData = error.response?.data;
    let message = 'An unexpected error occurred';

    if (responseData?.message) {
      if (Array.isArray(responseData.message)) {
        message = responseData.message.join(', ');
      } else {
        message = responseData.message;
      }
    }

    return Promise.reject(new Error(message));
  },
);
