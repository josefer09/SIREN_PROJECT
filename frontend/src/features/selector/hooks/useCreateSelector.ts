import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { selectorApi } from '../selector.api';
import type { CreateSelectorPayload } from '@/types';

export const useCreateSelector = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateSelectorPayload) => selectorApi.create(payload),
    onSuccess: (_data, variables) => {
      toast.success('Selector created!');
      queryClient.invalidateQueries({ queryKey: ['selectors', variables.pageId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { createMutation };
};
