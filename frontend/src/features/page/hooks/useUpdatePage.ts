import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { pageApi } from '../page.api';
import type { UpdatePagePayload } from '@/types';

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePagePayload }) =>
      pageApi.update(id, payload),
    onSuccess: (_, variables) => {
      toast.success('Page updated!');
      queryClient.invalidateQueries({ queryKey: ['page', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { updateMutation };
};
