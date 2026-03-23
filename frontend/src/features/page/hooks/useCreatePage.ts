import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { pageApi } from '../page.api';
import type { CreatePagePayload } from '@/types';

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreatePagePayload) => pageApi.create(payload),
    onSuccess: (_data, variables) => {
      toast.success('Page created!');
      queryClient.invalidateQueries({ queryKey: ['pages', variables.projectId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { createMutation };
};
