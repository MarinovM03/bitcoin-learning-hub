import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as articleService from '../../services/articleService';
import { queryKeys } from '../../lib/queryKeys';

export const useDeleteArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId) => articleService.remove(articleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
        },
    });
};

export const useMarkRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId) => articleService.markRead(articleId),
        onSuccess: (_data, articleId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(articleId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.paths.all });
        },
    });
};

export const useMarkUnread = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId) => articleService.markUnread(articleId),
        onSuccess: (_data, articleId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(articleId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.paths.all });
        },
    });
};
