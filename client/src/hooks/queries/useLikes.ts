import { useQuery } from '@tanstack/react-query';
import * as likeService from '../../services/likeService';
import { queryKeys } from '../../lib/queryKeys';

export const useLikeSummary = (articleId?: string) => useQuery({
    queryKey: queryKeys.likes.forArticle(articleId),
    queryFn: () => likeService.getSummary(articleId!),
    enabled: !!articleId,
});
