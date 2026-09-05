import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as articleService from '../../services/articleService';
import type { ArticleWriteData } from '../../services/articleService';
import { queryKeys } from '../../lib/queryKeys';

export const useCreateArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ArticleWriteData) => articleService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
        },
    });
};

export const useUpdateArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ articleId, data }: { articleId: string; data: ArticleWriteData }) =>
            articleService.edit(articleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
        },
    });
};

export const useDeleteArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId: string) => articleService.remove(articleId),
        onSuccess: (_data, articleId) => {
            queryClient.removeQueries({ queryKey: queryKeys.articles.detail(articleId) });
            queryClient.removeQueries({ queryKey: queryKeys.articles.related(articleId) });
            queryClient.removeQueries({ queryKey: queryKeys.articles.series(articleId) });
            queryClient.removeQueries({ queryKey: queryKeys.comments.forArticle(articleId) });
            queryClient.removeQueries({ queryKey: queryKeys.likes.forArticle(articleId) });

            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
        },
    });
};

export const useMarkRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId: string) => articleService.markRead(articleId),
        onSuccess: (_data, articleId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(articleId) });
        },
    });
};

export const useMarkUnread = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId: string) => articleService.markUnread(articleId),
        onSuccess: (_data, articleId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(articleId) });
        },
    });
};
