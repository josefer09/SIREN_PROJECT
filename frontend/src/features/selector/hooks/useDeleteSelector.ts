import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { selectorApi } from '../selector.api';

export const useDeleteSelector = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => selectorApi.remove(id),
    onSuccess: () => {
      toast.success('Selector deleted!');
      queryClient.invalidateQueries({ queryKey: ['selectors'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { deleteMutation };
};
