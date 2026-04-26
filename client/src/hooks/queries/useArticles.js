import { useQuery } from '@tanstack/react-query';
import * as articleService from '../../services/articleService';
import { queryKeys } from '../../lib/queryKeys';

export const useArticles = (filters) => useQuery({
    queryKey: queryKeys.articles.list(filters),
    queryFn: () => articleService.getAll(filters),
    placeholderData: (previous) => previous,
});

export const useMyArticles = () => useQuery({
    queryKey: queryKeys.articles.mine,
    queryFn: articleService.getMyArticles,
});

export const useArticle = (articleId) => useQuery({
    queryKey: queryKeys.articles.detail(articleId),
    queryFn: () => articleService.getOne(articleId),
    enabled: !!articleId,
});

export const useRelatedArticles = (articleId) => useQuery({
    queryKey: queryKeys.articles.related(articleId),
    queryFn: () => articleService.getRelated(articleId),
    enabled: !!articleId,
});

export const useTrendingArticles = () => useQuery({
    queryKey: queryKeys.articles.trending,
    queryFn: articleService.getTrending,
});

export const useArticleSeries = (articleId) => useQuery({
    queryKey: queryKeys.articles.series(articleId),
    queryFn: () => articleService.getSeries(articleId),
    enabled: !!articleId,
});

export const usePublicProfile = (userId) => useQuery({
    queryKey: queryKeys.publicProfile(userId),
    queryFn: () => articleService.getPublicProfile(userId),
    enabled: !!userId,
});
