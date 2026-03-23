import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { projectApi } from '../project.api';
import type { UpdateProjectPayload } from '@/types';

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      projectApi.update(id, payload),
    onSuccess: (_, variables) => {
      toast.success('Project updated!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { updateMutation };
};
