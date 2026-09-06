import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as collectionService from '../../services/collectionService';
import type { CollectionWriteData } from '../../services/collectionService';
import { queryKeys } from '../../lib/queryKeys';

const useCollectionRefresh = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
};

export const useCreateCollection = () => {
    const refresh = useCollectionRefresh();
    return useMutation({
        mutationFn: (data: CollectionWriteData) => collectionService.create(data),
        onSuccess: refresh,
    });
};

export const useUpdateCollection = () => {
    const refresh = useCollectionRefresh();
    return useMutation({
        mutationFn: ({ collectionId, data }: { collectionId: string; data: CollectionWriteData }) =>
            collectionService.update(collectionId, data),
        onSuccess: refresh,
    });
};

export const useDeleteCollection = () => {
    const refresh = useCollectionRefresh();
    return useMutation({
        mutationFn: (collectionId: string) => collectionService.remove(collectionId),
        onSuccess: refresh,
    });
};
