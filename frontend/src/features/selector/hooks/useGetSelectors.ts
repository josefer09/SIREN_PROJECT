import { useQuery } from '@tanstack/react-query';

import { selectorApi } from '../selector.api';

export const useGetSelectors = (pageId: string) => {
  const getSelectors = useQuery({
    queryKey: ['selectors', pageId],
    queryFn: () => selectorApi.getByPage(pageId),
    enabled: !!pageId,
  });

  return { getSelectors };
};
