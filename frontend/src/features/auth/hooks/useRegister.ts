import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { authApi } from '../auth.api';

export const useRegister = () => {
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: (payload: {
      email: string;
      password: string;
      confirmPassword: string;
      fullName: string;
    }) =>
      authApi.register(
        payload.email,
        payload.password,
        payload.confirmPassword,
        payload.fullName,
      ),
    onSuccess: () => {
      toast.success('Account created! You can now log in.');
      navigate('/login');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { registerMutation };
};
