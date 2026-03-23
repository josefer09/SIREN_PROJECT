import { useQuery } from '@tanstack/react-query';

import { projectApi } from '../project.api';

export const useGetProjects = () => {
  const getProjects = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getAll,
  });

  return { getProjects };
};
