import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userApi } from '../user.api';

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  const blockMutation = useMutation({
    mutationFn: userApi.block,
    onSuccess: () => {
      toast.success('User blocked');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const unblockMutation = useMutation({
    mutationFn: userApi.unblock,
    onSuccess: () => {
      toast.success('User unblocked');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { blockMutation, unblockMutation };
};
