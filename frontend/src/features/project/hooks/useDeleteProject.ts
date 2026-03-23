import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { projectApi } from '../project.api';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectApi.remove(id),
    onSuccess: () => {
      toast.success('Project deleted!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { deleteMutation };
};
