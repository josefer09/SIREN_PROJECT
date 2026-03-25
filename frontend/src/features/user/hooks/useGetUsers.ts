import { useQuery } from '@tanstack/react-query';
import { userApi } from '../user.api';

export const useGetUsers = () => {
  const getUsersQuery = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  });
  return { getUsersQuery };
};
