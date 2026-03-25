import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { profileApi } from '../profile.api';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { updateMutation };
};
