import { httpClient } from '@/adapters/http.adapter';
import type { Project, CreateProjectPayload, UpdateProjectPayload, PageExport } from '@/types';

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await httpClient.get<Project[]>('/projects');
    return data;
  },

  getOne: async (id: string): Promise<Project> => {
    const { data } = await httpClient.get<Project>(`/projects/${id}`);
    return data;
  },

  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await httpClient.post<Project>('/projects', payload);
    return data;
  },

  update: async (id: string, payload: UpdateProjectPayload): Promise<Project> => {
    const { data } = await httpClient.patch<Project>(`/projects/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/projects/${id}`);
  },

  exportProject: async (id: string): Promise<PageExport[]> => {
    const { data } = await httpClient.get<PageExport[]>(`/projects/${id}/export`);
    return data;
  },

  exportProjectTypescript: async (id: string): Promise<{ files: { className: string; content: string }[] }> => {
    const { data } = await httpClient.get<{ files: { className: string; content: string }[] }>(
      `/projects/${id}/export/typescript`,
    );
    return data;
  },

  exportPageJson: async (pageId: string): Promise<PageExport> => {
    const { data } = await httpClient.get<PageExport>(`/projects/export/page/${pageId}/json`);
    return data;
  },

  exportPageTypescript: async (pageId: string): Promise<string> => {
    const { data } = await httpClient.get<string>(
      `/projects/export/page/${pageId}/typescript`,
      { responseType: 'text' as never },
    );
    return data;
  },

  updateFile: async (pageId: string): Promise<{ filePath: string; created: boolean }> => {
    const { data } = await httpClient.post<{ filePath: string; created: boolean }>(
      `/projects/export/page/${pageId}/update-file`,
    );
    return data;
  },
};
