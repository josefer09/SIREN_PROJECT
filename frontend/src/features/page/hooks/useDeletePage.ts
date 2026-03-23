import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { pageApi } from '../page.api';

export const useDeletePage = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pageApi.remove(id),
    onSuccess: () => {
      toast.success('Page deleted!');
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { deleteMutation };
};
