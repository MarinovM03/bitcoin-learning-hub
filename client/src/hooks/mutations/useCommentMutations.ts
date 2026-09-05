import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as commentService from '../../services/commentService';
import { queryKeys } from '../../lib/queryKeys';

const useThreadInvalidation = (articleId?: string) => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({
        queryKey: queryKeys.comments.forArticle(articleId),
    });
};

export const useCreateComment = (articleId?: string) => {
    const refreshThread = useThreadInvalidation(articleId);
    return useMutation({
        mutationFn: (text: string) => commentService.create(articleId!, text),
        onSuccess: refreshThread,
    });
};

export const useUpdateComment = (articleId?: string) => {
    const refreshThread = useThreadInvalidation(articleId);
    return useMutation({
        mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
            commentService.update(commentId, text),
        onSuccess: refreshThread,
    });
};

export const useDeleteComment = (articleId?: string) => {
    const refreshThread = useThreadInvalidation(articleId);
    return useMutation({
        mutationFn: (commentId: string) => commentService.remove(commentId),
        onSuccess: refreshThread,
    });
};
