import { useQuery } from '@tanstack/react-query';
import * as followService from '../../services/followService';
import type { FollowTarget } from '../../services/followService';
import { queryKeys } from '../../lib/queryKeys';

export const useFollowSummary = (targetType: FollowTarget, targetId?: string) => useQuery({
    queryKey: queryKeys.follows.summary(targetType, targetId),
    queryFn: () => followService.getSummary(targetType, targetId!),
    enabled: !!targetId,
});

export const useFeed = (enabled = true) => useQuery({
    queryKey: queryKeys.follows.feed,
    queryFn: () => followService.getFeed(),
    enabled,
});
