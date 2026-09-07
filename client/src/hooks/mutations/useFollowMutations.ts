import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as followService from '../../services/followService';
import type { FollowTarget } from '../../services/followService';
import { queryKeys } from '../../lib/queryKeys';

export const useToggleFollow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ targetType, targetId }: { targetType: FollowTarget; targetId: string }) =>
            followService.toggle(targetType, targetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.follows.all });
        },
    });
};
