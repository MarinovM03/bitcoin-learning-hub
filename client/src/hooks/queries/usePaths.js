import { useQuery } from '@tanstack/react-query';
import * as learningPathService from '../../services/learningPathService';
import { queryKeys } from '../../lib/queryKeys';

export const usePaths = (filters) => useQuery({
    queryKey: queryKeys.paths.list(filters),
    queryFn: () => learningPathService.getAll(filters),
    placeholderData: (previous) => previous,
});

export const useMyPaths = () => useQuery({
    queryKey: queryKeys.paths.mine,
    queryFn: learningPathService.getMyPaths,
});

export const usePath = (pathId) => useQuery({
    queryKey: queryKeys.paths.detail(pathId),
    queryFn: () => learningPathService.getOne(pathId),
    enabled: !!pathId,
});
