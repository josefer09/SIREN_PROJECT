import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { authApi } from '../auth.api';
import { useAuthStore } from '@/store/auth.store';

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/projects');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { loginMutation };
};
