import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { profileApi } from '../profile.api';

export const useChangePassword = () => {
  const changePasswordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { changePasswordMutation };
};
