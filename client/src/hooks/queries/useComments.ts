import { useInfiniteQuery } from '@tanstack/react-query';
import * as commentService from '../../services/commentService';
import { queryKeys } from '../../lib/queryKeys';

export const useComments = (articleId?: string) => useInfiniteQuery({
    queryKey: queryKeys.comments.forArticle(articleId),
    queryFn: ({ pageParam }) => commentService.getPageForArticle(articleId!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
        (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: !!articleId,
});
