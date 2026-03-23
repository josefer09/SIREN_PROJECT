import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { projectApi } from '../project.api';
import type { CreateProjectPayload } from '@/types';

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectApi.create(payload),
    onSuccess: () => {
      toast.success('Project created!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { createMutation };
};
