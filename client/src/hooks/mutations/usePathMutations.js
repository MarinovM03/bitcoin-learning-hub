import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as learningPathService from '../../services/learningPathService';
import { queryKeys } from '../../lib/queryKeys';

export const useDeletePath = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pathId) => learningPathService.remove(pathId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.paths.all });
        },
    });
};
