import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../profile.api';

export const useGetProfile = () => {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });
  return { profileQuery };
};
