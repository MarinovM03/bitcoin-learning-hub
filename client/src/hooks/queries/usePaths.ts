import { useQuery } from '@tanstack/react-query';
import * as learningPathService from '../../services/learningPathService';
import { queryKeys } from '../../lib/queryKeys';
import type { PathListOptions } from '../../services/learningPathService';

export const usePaths = (filters: PathListOptions) => useQuery({
    queryKey: queryKeys.paths.list(filters),
    queryFn: () => learningPathService.getAll(filters),
    placeholderData: (previous) => previous,
});

export const useMyPaths = () => useQuery({
    queryKey: queryKeys.paths.mine,
    queryFn: learningPathService.getMyPaths,
});

export const usePath = (pathId?: string) => useQuery({
    queryKey: queryKeys.paths.detail(pathId),
    queryFn: () => learningPathService.getOne(pathId!),
    enabled: !!pathId,
});
