import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as bookmarkService from '../../services/bookmarkService';
import { queryKeys } from '../../lib/queryKeys';

export const useToggleBookmark = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId) => bookmarkService.toggle(articleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
        },
    });
};
