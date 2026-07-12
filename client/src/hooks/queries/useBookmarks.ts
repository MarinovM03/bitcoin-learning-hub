import { useQuery } from '@tanstack/react-query';
import * as bookmarkService from '../../services/bookmarkService';
import { queryKeys } from '../../lib/queryKeys';

export const useMyBookmarks = (enabled = true) => useQuery({
    queryKey: queryKeys.bookmarks.list,
    queryFn: bookmarkService.getMyBookmarks,
    enabled,
});
