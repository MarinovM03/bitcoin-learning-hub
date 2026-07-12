import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as likeService from '../../services/likeService';
import { queryKeys } from '../../lib/queryKeys';
import type { LikeSummary } from '../../services/likeService';

export const useToggleLike = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId: string) => likeService.toggle(articleId),
        onSuccess: (data, articleId) => {
            queryClient.setQueryData<LikeSummary>(
                queryKeys.likes.forArticle(articleId),
                { totalLikes: data.totalLikes, likedByMe: data.liked },
            );
        },
    });
};
