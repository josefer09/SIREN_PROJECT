import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { selectorApi } from '../selector.api';
import type { SetSelectorValuePayload } from '@/types';

export const useSetSelectorValue = () => {
  const queryClient = useQueryClient();

  const setValueMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetSelectorValuePayload }) =>
      selectorApi.setValue(id, payload),
    onSuccess: () => {
      toast.success('Selector value saved!');
      queryClient.invalidateQueries({ queryKey: ['selectors'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { setValueMutation };
};
