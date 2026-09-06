import { useQuery } from '@tanstack/react-query';
import * as collectionService from '../../services/collectionService';
import { queryKeys } from '../../lib/queryKeys';

export const useCollections = () => useQuery({
    queryKey: queryKeys.collections.list,
    queryFn: collectionService.getAll,
});

export const useMyCollections = (enabled = true) => useQuery({
    queryKey: queryKeys.collections.mine,
    queryFn: collectionService.getMine,
    enabled,
});

export const useCollection = (slug?: string) => useQuery({
    queryKey: queryKeys.collections.detail(slug),
    queryFn: () => collectionService.getBySlug(slug!),
    enabled: !!slug,
});

export const useArticleCollections = (articleId?: string) => useQuery({
    queryKey: queryKeys.collections.forArticle(articleId),
    queryFn: () => collectionService.getForArticle(articleId!),
    enabled: !!articleId,
});
