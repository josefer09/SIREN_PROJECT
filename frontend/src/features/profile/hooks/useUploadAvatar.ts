import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { profileApi } from '../profile.api';

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  const uploadAvatarMutation = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: () => {
      toast.success('Avatar updated');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { uploadAvatarMutation };
};
